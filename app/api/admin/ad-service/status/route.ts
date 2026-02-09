import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // TODO: Implement your ad service status logic here
    return NextResponse.json({
      status: {
        is_running: false,
        total_views: 0,
        today_views: 0,
        target_daily_views: 12,
        last_view_time: null,
        recent_history: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get ad service status" },
      { status: 500 }
    );
  }
}
