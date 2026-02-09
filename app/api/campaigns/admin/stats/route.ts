import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/campaigns/admin/stats
 * Get comprehensive campaign statistics for admin
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      "https://web-production-737b.up.railway.app";

    const response = await fetch(`${backendUrl}/api/campaigns/admin/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch campaign stats" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Admin Campaign Stats GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign stats" },
      { status: 500 }
    );
  }
}
