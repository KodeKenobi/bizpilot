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

    // Proxy to backend /api/admin/usage/stats and extract activity data
    const backendUrl = getApiUrl("/api/admin/usage/stats");
    const authHeaders = getAuthHeaders(token);

    const response = await fetch(backendUrl, {
      headers: authHeaders,
    });

    if (response.ok) {
      const data = await response.json();

      // Transform usage data to activity format
      const activities: any[] = [];

      // Add top users as activities
      if (data.top_users) {
        data.top_users.forEach((user: any, index: number) => {
          activities.push({
            id: index + 1,
            user: user.email,
            action: "API Usage",
            details: `${user.count} API calls`,
            timestamp: new Date().toISOString(),
          });
        });
      }

      // Add daily usage as activities
      if (data.daily_usage) {
        data.daily_usage.slice(-10).forEach((day: any, index: number) => {
          activities.push({
            id: 1000 + index,
            user: "System",
            action: "Daily Usage",
            details: `${day.count} calls on ${day.date}`,
            timestamp: new Date(day.date).toISOString(),
          });
        });
      }

      return NextResponse.json(activities);
    } else {
      const errorText = await response.text();

      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json([]);
  }
}
