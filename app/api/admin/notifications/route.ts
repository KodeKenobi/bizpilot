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

      // Parse query params
      const searchParams = request.nextUrl.searchParams;
      const category = searchParams.get("category") || "";
      const type = searchParams.get("type") || "";
      const isRead = searchParams.get("is_read");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query
      let query = "SELECT * FROM notifications WHERE 1=1";
      const values: any[] = [];
      let paramCount = 1;

      if (category) {
        query += ` AND category = $${paramCount}`;
        values.push(category);
        paramCount++;
      }

      if (type) {
        query += ` AND type = $${paramCount}`;
        values.push(type);
        paramCount++;
      }

      if (isRead !== null && isRead !== "") {
        query += ` AND is_read = $${paramCount}`;
        values.push(isRead === "true");
        paramCount++;
      }

      // Get total count
      const countRes = await client.query(query.replace("SELECT *", "SELECT COUNT(*)"), values);
      const total = parseInt(countRes.rows[0].count);

      // Order by creation date
      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(limit);
      values.push(offset);

      const result = await client.query(query, values);

      // Map result to the expected format
      const notifications = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        category: row.category,
        is_read: row.is_read,
        read_at: row.read_at ? row.read_at.toISOString() : null,
        read_by: row.read_by,
        metadata: row.notification_metadata,
        created_at: row.created_at ? row.created_at.toISOString() : null
      }));

      await client.end();

      return NextResponse.json({
        notifications,
        total,
        limit,
        offset
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notifications",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
