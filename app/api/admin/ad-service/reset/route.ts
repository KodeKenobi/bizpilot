import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reset only the system_settings (running state, counters)
    // Do NOT delete analytics_events - those are for analytics history
    await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_running", value: "False" }, { onConflict: "key" });

    await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_total_views", value: "0" }, { onConflict: "key" });

    await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_last_view", value: "" }, { onConflict: "key" });

    return NextResponse.json({
      success: true,
      message: "Ad engine state reset successfully (analytics preserved)",
    });
  } catch (error: any) {
    console.error("Ad service reset error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset ad statistics" },
      { status: 500 }
    );
  }
}
