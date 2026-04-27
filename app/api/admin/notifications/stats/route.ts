import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
const { Client } = require("pg");

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

    // Connect to Supabase
    const SUPABASE_CONNECTION_STRING = "postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
    
    const client = new Client({
      connectionString: SUPABASE_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();

      // Get basic stats
      const totalRes = await client.query("SELECT COUNT(*) FROM notifications");
      const unreadRes = await client.query("SELECT COUNT(*) FROM notifications WHERE is_read = false");
      
      const total = parseInt(totalRes.rows[0].count);
      const unread = parseInt(unreadRes.rows[0].count);

      // Get counts by type
      const byTypeRes = await client.query("SELECT type, COUNT(*) FROM notifications GROUP BY type");
      const byType: Record<string, number> = {
        info: 0,
        warning: 0,
        error: 0,
        success: 0,
        payment: 0,
        subscription: 0
      };
      byTypeRes.rows.forEach((row: any) => {
        byType[row.type] = parseInt(row.count);
      });

      // Get counts by category
      const byCategoryRes = await client.query("SELECT category, COUNT(*) FROM notifications GROUP BY category");
      const byCategory: Record<string, number> = {
        system: 0,
        payment: 0,
        subscription: 0,
        user: 0,
        api: 0
      };
      byCategoryRes.rows.forEach((row: any) => {
        byCategory[row.category] = parseInt(row.count);
      });

      await client.end();

      return NextResponse.json({
        total,
        unread,
        read: total - unread,
        by_type: byType,
        by_category: byCategory
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching notification stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
