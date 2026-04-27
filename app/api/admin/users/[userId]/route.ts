import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
const { Client } = require("pg");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
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

    // Connect to Supabase
    const SUPABASE_CONNECTION_STRING = "postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
    
    const client = new Client({
      connectionString: SUPABASE_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();

      // Get basic user info
      const userRes = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
      );

      if (userRes.rows.length === 0) {
        await client.end();
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = userRes.rows[0];

      // Get API keys count
      const keysRes = await client.query(
        `SELECT COUNT(*) FROM api_keys WHERE user_id = $1`,
        [userId]
      );

      // Construct a response that matches what the frontend expects
      const responseData = {
        ...user,
        api_keys_count: parseInt(keysRes.rows[0].count),
        stats: {
          total_calls: user.total_calls || 0,
          recent_calls: 0,
          success_calls: user.total_calls || 0,
          error_calls: 0,
          success_rate: 100,
          popular_endpoints: []
        },
        monthly_usage: {
          used: user.monthly_used || 0,
          limit: user.monthly_call_limit || 5,
          remaining: (user.monthly_call_limit || 5) - (user.monthly_used || 0),
          percentage: user.monthly_call_limit > 0 ? (user.monthly_used / user.monthly_call_limit) * 100 : 0
        }
      };

      await client.end();
      return NextResponse.json(responseData);
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching user detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
