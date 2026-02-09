import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
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

    const userRole = (session.user as any).role;

    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let token = (session as any).accessToken || null;
    if (!token) {
      // Try to get token from backend using email (no password required)
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
        } else {
        }
      } catch (error) {}

      if (!token) {
        return NextResponse.json(
          { error: "No backend token" },
          { status: 401 }
        );
      }
    }

    // Proxy to backend /api/admin/usage/stats and transform to stats format
    const backendUrl = getApiUrl("/api/admin/usage/stats");
    const authHeaders = getAuthHeaders(token);

    const response = await fetch(backendUrl, {
      headers: authHeaders,
    });

    if (response.ok) {
      const data = await response.json();
      const summary = data.summary || {};

      // Transform to stats format expected by frontend
      return NextResponse.json({
        totalUsers: summary.total_users || 0,
        activeUsers: summary.active_users || 0,
        totalApiCalls: summary.total_calls || 0,
        monthlyCalls: summary.monthly_calls || 0,
        successRate: summary.success_rate || 0,
        usersByTier: summary.users_by_tier || {},
      });
    } else {
      const errorText = await response.text();

      // Return empty stats on error
      return NextResponse.json({
        totalUsers: 0,
        activeUsers: 0,
        totalApiCalls: 0,
        monthlyCalls: 0,
        successRate: 0,
        usersByTier: {},
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        totalUsers: 0,
        activeUsers: 0,
        totalApiCalls: 0,
        monthlyCalls: 0,
        successRate: 0,
        usersByTier: {},
      },
      { status: 200 }
    );
  }
}
