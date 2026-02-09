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

    // Proxy to backend /api/admin/system/health for system alerts
    const backendUrl = getApiUrl("/api/admin/system/health");
    const authHeaders = getAuthHeaders(token);

    const response = await fetch(backendUrl, {
      headers: authHeaders,
    });

    if (response.ok) {
      const data = await response.json();

      // Transform health data to alerts format
      const alerts: any[] = [];

      // Check for system issues
      if (data.status !== "healthy") {
        alerts.push({
          id: 1,
          type: "warning",
          message: `System status: ${data.status}`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      // Check memory usage
      if (data.memory_usage && data.memory_usage > 80) {
        alerts.push({
          id: 2,
          type: "warning",
          message: `High memory usage: ${data.memory_usage}%`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      // Check CPU usage
      if (data.cpu_usage && data.cpu_usage > 80) {
        alerts.push({
          id: 3,
          type: "warning",
          message: `High CPU usage: ${data.cpu_usage}%`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      return NextResponse.json(alerts);
    } else {
      // Return empty alerts if health endpoint doesn't exist
      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json([]);
  }
}
