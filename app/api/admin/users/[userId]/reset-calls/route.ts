import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
const { Client } = require("pg");

export async function POST(
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

      // Reset user calls
      const result = await client.query(
        `UPDATE users SET monthly_used = 0, total_calls = 0 WHERE id = $1 RETURNING id`,
        [userId]
      );

      if (result.rows.length === 0) {
        await client.end();
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await client.end();
      return NextResponse.json({
        success: true,
        message: "API calls reset successfully"
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error resetting user calls:", error);
    return NextResponse.json(
      { error: "Failed to reset API calls" },
      { status: 500 }
    );
  }
}
