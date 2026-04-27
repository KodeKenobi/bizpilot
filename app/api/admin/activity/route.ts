import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

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

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pqdxqvxyrahvongbhtdb.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!supabaseKey) {
      throw new Error("Supabase key is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent signups and logins
    const [
      { data: signups },
      { data: logins }
    ] = await Promise.all([
      supabase.from("users").select("id, email, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("users").select("id, email, last_login").not("last_login", "is", null).order("last_login", { ascending: false }).limit(5)
    ]);

    const activities: any[] = [];

    // Add signups
    if (signups) {
      signups.forEach((row: any) => {
        activities.push({
          id: `signup-${row.id}`,
          email: row.email,
          action: "New User Registered",
          timestamp: new Date(row.created_at).toLocaleString(),
          status: "success",
          ipAddress: "N/A"
        });
      });
    }

    // Add logins
    if (logins) {
      logins.forEach((row: any) => {
        activities.push({
          id: `login-${row.id}-${Date.now()}`,
          email: row.email,
          action: "User Login",
          timestamp: new Date(row.last_login).toLocaleString(),
          status: "success",
          ipAddress: "N/A"
        });
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json([]);
  }
}
