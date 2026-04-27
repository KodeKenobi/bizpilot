import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

/**
 * Get time range in milliseconds
 */
function getTimeRangeMs(range: string): number {
  const now = Date.now();
  switch (range) {
    case "1h":
      return 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    case "90d":
      return 90 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000; // Default to 24h
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can access analytics
    const headersList = await headers();
    const session = await getServerSession({
      ...authOptions,
      req: {
        headers: headersList,
      } as any,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or super_admin
    const userRole = (session.user as any).role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const value = searchParams.get("value");
    const range = searchParams.get("range") || "24h";
    const startTimeParam = searchParams.get("start_time");

    if (!type || !value) {
      return NextResponse.json(
        { error: "type and value parameters are required" },
        { status: 400 }
      );
    }

    // Calculate time range
    const now = new Date();
    const startTime = startTimeParam
      ? new Date(startTimeParam)
      : new Date(now.getTime() - getTimeRangeMs(range));

    // Get auth token from session
    let token = (session as any).accessToken || null;

    if (!token) {
      // Try to get token from backend using email
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://web-production-737b.up.railway.app"
            : "http://localhost:5000");

        const tokenResponse = await fetch(
          `${apiBaseUrl}/auth/get-token-from-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session.user.email,
              role: userRole,
            }),
          }
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.access_token;
        }
      } catch (error) {
        // Ignore token fetch errors
      }
    }

    // Fetch detailed metrics from backend API
    try {
      const backendUrl = getApiUrl("/api/analytics/details");
      const authHeaders = token ? getAuthHeaders(token) : {};

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      let response;
      try {
        const url = new URL(backendUrl);
        url.searchParams.set("type", type);
        url.searchParams.set("value", value);
        url.searchParams.set("range", range);
        url.searchParams.set("start_time", startTime.toISOString());

        response = await fetch(url.toString(), {
          headers: authHeaders,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw fetchError;
      }

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const errorText = await response.text();
        return NextResponse.json(
          { error: errorText || "Failed to fetch detailed metrics" },
          { status: response.status }
        );
      }
    } catch (backendError: any) {
      console.error("Error fetching detailed metrics:", backendError);
      return NextResponse.json(
        { error: backendError.message || "Backend unavailable" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in details route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
