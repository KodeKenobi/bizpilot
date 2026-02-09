import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
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
    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Connect to Supabase and fetch users
    const { Client } = require("pg");

    const SUPABASE_URL =
      "postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

    const client = new Client({
      connectionString: SUPABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();

      const result = await client.query(
        `SELECT id, email, role, is_active, subscription_tier, 
                monthly_call_limit, monthly_used, created_at, last_login
         FROM users
         ORDER BY created_at DESC`
      );

      const users = result.rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        is_active: row.is_active,
        subscription_tier: row.subscription_tier,
        monthly_call_limit: row.monthly_call_limit,
        monthly_used: row.monthly_used || 0,
        created_at: row.created_at,
        last_login: row.last_login,
      }));

      await client.end();

      return NextResponse.json({
        success: true,
        users,
        count: users.length,
        superAdmins: users.filter((u: any) => u.role === "super_admin").length,
        admins: users.filter((u: any) => u.role === "admin").length,
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error testing Supabase users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Supabase users",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
