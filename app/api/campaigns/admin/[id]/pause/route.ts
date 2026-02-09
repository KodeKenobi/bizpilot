import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/campaigns/admin/[id]/pause
 * Pause a campaign (admin action)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const response = await fetch(
      `${backendUrl}/api/campaigns/admin/${id}/pause`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to pause campaign" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Admin Pause Campaign] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pause campaign" },
      { status: 500 }
    );
  }
}
