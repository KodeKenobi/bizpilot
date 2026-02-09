import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionIdByStableId } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GUEST_STABLE_ID_COOKIE = 'guest_stable_id';

/**
 * GET /api/campaigns/usage
 * Returns daily_limit, daily_used, daily_remaining for the current user or guest.
 * Guest: pass session_id in query, or we recover from cookie + Supabase.
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
    const authHeader = request.headers.get('Authorization');
    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get('session_id');

    if (!authHeader && !sessionId) {
      const cookieStore = await cookies();
      const stableId = cookieStore.get(GUEST_STABLE_ID_COOKIE)?.value;
      if (stableId) {
        const recovered = await getSessionIdByStableId(stableId);
        if (recovered) sessionId = recovered;
      }
    }

    let url = `${backendUrl}/api/campaigns/usage`;
    if (!authHeader && sessionId) {
      url += `?session_id=${encodeURIComponent(sessionId)}`;
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(url, { headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Campaigns usage] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
