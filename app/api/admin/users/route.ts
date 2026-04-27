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

    // Connect to Supabase and fetch users
    const SUPABASE_CONNECTION_STRING = "postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
    
    const client = new Client({
      connectionString: SUPABASE_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();

      // Parse query params
      const searchParams = request.nextUrl.searchParams;
      const search = searchParams.get("search") || "";
      const isActive = searchParams.get("is_active");
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "20");
      const roles = searchParams.getAll("role");
      const tiers = searchParams.getAll("subscription_tier");

      // Build query
      let query = `SELECT id, email, role, is_active, subscription_tier, 
                         monthly_call_limit, monthly_used, created_at, last_login
                  FROM users WHERE 1=1`;
      const values: any[] = [];
      let paramCount = 1;

      if (search) {
        query += ` AND email ILIKE $${paramCount}`;
        values.push(`%${search}%`);
        paramCount++;
      }

      if (isActive !== null && isActive !== "") {
        query += ` AND is_active = $${paramCount}`;
        values.push(isActive === "true");
        paramCount++;
      }

      if (roles.length > 0) {
        query += ` AND role = ANY($${paramCount})`;
        values.push(roles);
        paramCount++;
      }

      if (tiers.length > 0) {
        query += ` AND subscription_tier = ANY($${paramCount})`;
        values.push(tiers);
        paramCount++;
      }

      // Count total for pagination
      const countResult = await client.query(query.replace(/SELECT .* FROM/, "SELECT COUNT(*) FROM"), values);
      const total = parseInt(countResult.rows[0].count);

      // Order and Paginate
      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(perPage);
      values.push((page - 1) * perPage);

      const result = await client.query(query, values);

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
        pagination: {
          total,
          page,
          per_page: perPage,
          pages: Math.ceil(total / perPage)
        }
      });
    } catch (dbError: any) {
      await client.end().catch(() => {});
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
