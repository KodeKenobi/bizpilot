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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "50");
    const status = searchParams.get("status") || "";
    const userId = searchParams.get("user_id") || "";

    // Build query
    let query = supabase
      .from("campaigns")
      .select(`
        *,
        user:users(email, subscription_tier)
      `, { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedCampaigns = (data || []).map((c: any) => ({
      ...c,
      user_email: c.user?.email || "Guest",
      user_tier: c.user?.subscription_tier || "guest"
    }));

    return NextResponse.json({
      campaigns: transformedCampaigns,
      pagination: {
        total: count || 0,
        page,
        per_page: perPage,
        pages: Math.ceil((count || 0) / perPage)
      }
    });

  } catch (error: any) {
    console.error("[Admin Campaigns GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
