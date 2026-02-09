import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

const STOP_TIMEOUT_MS = 20000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const token = request.headers.get("Authorization")?.split(" ")[1];

    const backendUrl = getApiUrl(`/api/campaigns/${campaignId}/stop`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STOP_TIMEOUT_MS);
    const response = await fetch(backendUrl, {
      method: "POST",
      signal: controller.signal,
      headers: token
        ? getAuthHeaders(token)
        : {
            "Content-Type": "application/json",
          },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to stop campaign" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Stop Campaign] Error:", error);
    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isAbort
          ? "Request timed out. Stop was sent; campaign may stop after the current company finishes."
          : error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
