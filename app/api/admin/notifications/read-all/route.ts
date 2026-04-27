import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
const { Client } = require("pg");

export async function POST(request: NextRequest) {
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
    const user = session.user as any;
    const userRole = user?.role;
    const userId = user?.id;

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

      // Get count of unread notifications
      const countRes = await client.query("SELECT COUNT(*) FROM notifications WHERE is_read = false");
      const unreadCount = parseInt(countRes.rows[0].count);

      if (unreadCount > 0) {
        // Update all unread notifications
        const now = new Date();
        await client.query(
          "UPDATE notifications SET is_read = true, read_at = $1, read_by = $2 WHERE is_read = false",
          [now, userId]
        );
      }

      await client.end();

      return NextResponse.json({
        success: true,
        message: `Marked ${unreadCount} notifications as read`
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      {
        error: "Failed to update notifications",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
