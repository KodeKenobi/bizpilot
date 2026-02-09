import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/campaigns/:id
 * Get a specific campaign with details (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch campaign from backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      "https://web-production-737b.up.railway.app";
    const response = await fetch(`${backendUrl}/api/campaigns/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch campaign" },
        { status: response.status }
      );
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.error("[Campaign GET] Empty response from backend");
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[Campaign GET] JSON parse error:", parseError);
      console.error("[Campaign GET] Response text:", text);
      return NextResponse.json(
        { error: "Invalid response from backend" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Campaign GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/:id
 * Update a campaign (e.g., pause, resume, update message) (public endpoint)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update campaign in backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      "https://web-production-737b.up.railway.app";
    const response = await fetch(`${backendUrl}/api/campaigns/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to update campaign" },
        { status: response.status }
      );
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.error("[Campaign PATCH] Empty response from backend");
      return NextResponse.json({ success: true });
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[Campaign PATCH] JSON parse error:", parseError);
      console.error("[Campaign PATCH] Response text:", text);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("[Campaign PATCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

const DELETE_TIMEOUT_MS = 60000;

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign (public endpoint)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      "https://web-production-737b.up.railway.app";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DELETE_TIMEOUT_MS);
    const response = await fetch(`${backendUrl}/api/campaigns/${id}`, {
      method: "DELETE",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to delete campaign" },
        { status: response.status }
      );
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.warn(
        "[Campaign DELETE] Empty response from backend, assuming success"
      );
      return NextResponse.json({ success: true });
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[Campaign DELETE] JSON parse error:", parseError);
      console.error("[Campaign DELETE] Response text:", text);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("[Campaign DELETE] Error:", error);
    const isAbort = (error as { name?: string })?.name === "AbortError";
    return NextResponse.json(
      {
        error: isAbort
          ? "Delete timed out. Try again or delete from a stable connection."
          : error.message || "Failed to delete campaign",
      },
      { status: 500 }
    );
  }
}
