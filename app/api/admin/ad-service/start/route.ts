import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Set ad_engine_running = True in system_settings
    const { error } = await supabase
      .from("system_settings")
      .upsert({ key: "ad_engine_running", value: "True", description: "Whether the automated ad engine is active" }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Ad service started successfully",
    });
  } catch (error: any) {
    console.error("Ad service start error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start ad service" },
      { status: 500 }
    );
  }
}
