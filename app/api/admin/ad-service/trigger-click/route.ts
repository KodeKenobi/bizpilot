import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Record an ad click event directly
    const { error } = await supabase.from("analytics_events").insert({
      event_name: "ad_click",
      event_category: "monetization",
      page_url: "/",
      timestamp: new Date().toISOString(),
      event_data: JSON.stringify({ source: "manual_trigger", context: "Admin Manual Trigger" }),
    });

    if (error) throw error;

    // Update system_settings with last view time
    await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_last_view", value: new Date().toISOString() }, { onConflict: "key" });

    return NextResponse.json({
      success: true,
      message: "Ad click triggered successfully",
    });
  } catch (error: any) {
    console.error("Ad service trigger error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger ad click" },
      { status: 500 }
    );
  }
}
