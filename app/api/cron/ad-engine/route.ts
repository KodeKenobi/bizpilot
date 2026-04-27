import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if engine is running
    const { data: runningRow } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "ad_engine_running")
      .single();

    const isRunning = runningRow?.value === "True";
    if (!isRunning) {
      return NextResponse.json({ message: "Engine not running, skipping" });
    }

    // Count today's ad clicks
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { count: todayViews } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "ad_click")
      .gte("timestamp", today.toISOString())
      .or("page_url.is.null,page_url.eq.,page_url.not.like.%/admin/%");

    const dailyGoal = 12;
    const currentCount = todayViews || 0;
    const remaining = dailyGoal - currentCount;

    if (remaining <= 0) {
      return NextResponse.json({ message: "Daily goal already reached" });
    }

    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(23, 59, 59, 999);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const hoursUntilMidnight = msUntilMidnight / (1000 * 60 * 60);

    // Calculate probability of triggering this cycle
    // Assume cron runs every 10 minutes = 6 times per hour
    const cyclesPerHour = 6;
    const totalCyclesRemaining = Math.max(1, hoursUntilMidnight * cyclesPerHour);
    const probabilityToTrigger = remaining / totalCyclesRemaining;

    // Randomly decide whether to trigger
    const shouldTrigger = Math.random() < probabilityToTrigger;

    if (!shouldTrigger) {
      return NextResponse.json({ 
        message: "Skipping this cycle", 
        remaining, 
        hoursUntilMidnight: hoursUntilMidnight.toFixed(2),
        probability: (probabilityToTrigger * 100).toFixed(1) + "%"
      });
    }

    // Trigger an ad view
    const { error } = await supabase.from("analytics_events").insert({
      event_name: "ad_click",
      event_category: "monetization",
      page_url: "/",
      timestamp: new Date().toISOString(),
      event_data: JSON.stringify({ 
        source: "automated_engine", 
        context: "Automated Background View",
        triggered_by: "cron"
      }),
    });

    if (error) throw error;

    // Update last view time
    await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_last_view", value: new Date().toISOString() }, { onConflict: "key" });

    return NextResponse.json({
      success: true,
      message: "Ad view triggered",
      newCount: currentCount + 1,
      remaining: remaining - 1,
      hoursUntilMidnight: hoursUntilMidnight.toFixed(2),
    });
  } catch (error: any) {
    console.error("Cron ad trigger error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process cron job" },
      { status: 500 }
    );
  }
}
