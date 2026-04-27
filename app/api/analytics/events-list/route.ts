import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

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
    const range = searchParams.get("range") || "24h";
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "50";
    const eventType = searchParams.get("event_type") || "";

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
        console.error("Error getting token:", error);
      }
    }

    // Fetch events list from backend API
    try {
      const backendUrl = getApiUrl("/api/analytics/events/list");
      const authHeaders = token ? getAuthHeaders(token) : {};

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const queryParams = new URLSearchParams({
        range,
        page,
        per_page: perPage,
      });
      if (eventType) {
        queryParams.append("event_type", eventType);
      }

      const response = await fetch(`${backendUrl}?${queryParams.toString()}`, {
        headers: authHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        return NextResponse.json(
          {
            events: [],
            total: 0,
            page: 1,
            per_page: 50,
            total_pages: 0,
            event_types: [],
          },
          { status: response.status }
        );
      }
    } catch (backendError) {
      console.error("Backend error:", backendError);
      return NextResponse.json({
        events: [],
        total: 0,
        page: 1,
        per_page: 50,
        total_pages: 0,
        event_types: [],
      });
    }
  } catch (error) {
    console.error("Error in events-list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

