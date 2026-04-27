import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/campaigns/:id/companies
 * Get all companies for a specific campaign (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | null = null;
  try {
    const p = await params;
    id = p?.id ?? null;
    if (!id) {
      return NextResponse.json(
        { error: "Campaign id required", companies: [] },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error("[Companies GET] params error:", e);
    return NextResponse.json(
      { error: "Invalid request", companies: [] },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      "https://web-production-737b.up.railway.app";
    const url = status
      ? `${backendUrl}/api/campaigns/${id}/companies?status=${status}`
      : `${backendUrl}/api/campaigns/${id}/companies`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch companies", companies: [] },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Companies GET] Error:", error);
    return NextResponse.json(
      {
        error: String(error?.message || "Failed to fetch companies"),
        companies: [],
      },
      { status: 500 }
    );
  }
}
