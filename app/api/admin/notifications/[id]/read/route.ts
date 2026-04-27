import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
const { Client } = require("pg");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

      // Update notification
      const now = new Date();
      const result = await client.query(
        "UPDATE notifications SET is_read = true, read_at = $1, read_by = $2 WHERE id = $3 RETURNING *",
        [now, userId, id]
      );

      if (result.rows.length === 0) {
        await client.end();
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      await client.end();

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
        notification: result.rows[0]
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      {
        error: "Failed to update notification",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
