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

    // Fetch comprehensive stats
    const { data: campaignData, error: campaignError } = await supabase
      .from("campaigns")
      .select(`
        id, 
        status, 
        created_at, 
        total_companies, 
        success_count, 
        processed_count,
        user:users(email, subscription_tier)
      `);

    if (campaignError) throw campaignError;

    const stats = {
      total: campaignData.length,
      active: campaignData.filter(c => c.status === "processing").length,
      completed: campaignData.filter(c => c.status === "completed").length,
      failed: campaignData.filter(c => c.status === "failed").length,
      draft: campaignData.filter(c => c.status === "draft").length,
      createdToday: campaignData.filter(c => {
        const today = new Date().toISOString().split('T')[0];
        return c.created_at && c.created_at.startsWith(today);
      }).length,
      processedToday: campaignData.reduce((acc, c) => acc + (c.processed_count || 0), 0), // Simplification: total processed
      successRate: 0,
      totalProcessed: campaignData.reduce((acc, c) => acc + (c.processed_count || 0), 0),
      totalSuccess: campaignData.reduce((acc, c) => acc + (c.success_count || 0), 0),
      byTier: {} as Record<string, number>,
      topUsers: [] as any[]
    };

    // Calculate success rate
    if (stats.totalProcessed > 0) {
      stats.successRate = Math.round((stats.totalSuccess / stats.totalProcessed) * 100);
    }

    // Aggregate by tier and top users
    const userStats: Record<string, { email: string, tier: string, count: number }> = {};
    campaignData.forEach(c => {
      const user = (c as any).user;
      const tier = user?.subscription_tier || "guest";
      const email = user?.email || "Guest";
      
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
      
      if (!userStats[email]) {
        userStats[email] = { email, tier, count: 0 };
      }
      userStats[email].count += 1;
    });

    stats.topUsers = Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(u => ({
        email: u.email,
        tier: u.tier,
        campaign_count: u.count
      }));

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("[Admin Campaign Stats GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign stats" },
      { status: 500 }
    );
  }
}
