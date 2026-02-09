import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();

    // Get session for user_id (optional - allows anonymous tracking)
    const headersList = await headers();
    const session = await getServerSession({
      ...authOptions,
      req: {
        headers: headersList,
      } as any,
    });

    // Extract IP address from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress =
      forwarded?.split(",")[0]?.trim() ||
      realIp ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Add IP address to session data if not already present
    const enrichedSessionData = {
      ...sessionData,
      ip_address: sessionData.ip_address || ipAddress,
    };

    // Forward to backend API
    const backendUrl = getApiUrl("/api/analytics/session");
    const token = (session as any)?.accessToken || null;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? getAuthHeaders(token) : {}),
        // Forward IP address in headers for backend geolocation
        "X-Forwarded-For": ipAddress,
      },
      body: JSON.stringify(enrichedSessionData),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json(result);
    } else {
      const error = await response.text();

      return NextResponse.json(
        { error: "Failed to store analytics data" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
