import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ad engine running state from system_settings
    const { data: runningRow } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "ad_engine_running")
      .single();

    const isRunning = runningRow?.value === "True";

    // Count total non-admin ad clicks (all time)
    const { count: totalViews } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "ad_click")
      .or("page_url.is.null,page_url.eq.,page_url.not.like.%/admin/%");

    // Count today's non-admin ad clicks
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { count: todayViews } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "ad_click")
      .gte("timestamp", today.toISOString())
      .or("page_url.is.null,page_url.eq.,page_url.not.like.%/admin/%");

    // Get the most recent ad click for "Last Activity"
    const { data: lastClick } = await supabase
      .from("analytics_events")
      .select("timestamp")
      .eq("event_name", "ad_click")
      .or("page_url.is.null,page_url.eq.,page_url.not.like.%/admin/%")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // Get recent ad click events for Service Master Log
    const { data: recentClicks } = await supabase
      .from("analytics_events")
      .select("timestamp, event_data, page_url")
      .eq("event_name", "ad_click")
      .or("page_url.is.null,page_url.eq.,page_url.not.like.%/admin/%")
      .order("timestamp", { ascending: false })
      .limit(10);

    const total = totalViews || 0;
    const todayCount = todayViews || 0;
    const dailyGoal = 12;

    // Build recent_history from actual DB events
    const recentHistory = (recentClicks || []).map((click: any) => {
      let context = "Automated View";
      let simulated = true;
      try {
        if (click.event_data) {
          const parsed = typeof click.event_data === "string" ? JSON.parse(click.event_data) : click.event_data;
          if (parsed.context) context = parsed.context;
          if (parsed.source === "manual_trigger") simulated = false;
        }
      } catch {}
      return {
        timestamp: click.timestamp,
        context,
        simulated,
      };
    });

    return NextResponse.json({
      status: {
        is_running: isRunning,
        total_views: total,
        today_views: todayCount,
        target_daily_views: dailyGoal,
        last_view_time: lastClick?.timestamp || null,
        recent_history: recentHistory,
        _version: "v6-full-stats",
      },
    });
  } catch (error: any) {
    console.error("Ad service status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get ad service status" },
      { status: 500 }
    );
  }
}
