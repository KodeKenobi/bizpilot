import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionIdByStableId, upsertGuestSession } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GUEST_STABLE_ID_COOKIE = 'guest_stable_id';
const COOKIE_OPTIONS = { path: '/', maxAge: 31536000, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', httpOnly: true };

/**
 * GET /api/campaigns
 * Get all campaigns (public endpoint).
 * For guests: if session_id missing (e.g. localStorage cleared), recover from cookie + Supabase guest_sessions.
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get('session_id');
    const email = searchParams.get('email');
    const authHeader = request.headers.get('Authorization');

    // Guest: recover session_id from cookie + Supabase if not in query
    let recoveredSessionId: string | null = null;
    if (!authHeader && !sessionId) {
      const cookieStore = await cookies();
      const stableId = cookieStore.get(GUEST_STABLE_ID_COOKIE)?.value;
      if (stableId) {
        const recovered = await getSessionIdByStableId(stableId);
        if (recovered) {
          sessionId = recovered;
          recoveredSessionId = recovered;
        }
      }
    }
    // Guest with session_id: keep Supabase mapping up to date (optional, for next time)
    if (!authHeader && sessionId) {
      const cookieStore = await cookies();
      const stableId = cookieStore.get(GUEST_STABLE_ID_COOKIE)?.value;
      if (stableId) await upsertGuestSession(stableId, sessionId);
    }

    let queryParams = '';
    if (authHeader) {
      queryParams = '';
    } else if (sessionId) {
      queryParams = `?session_id=${encodeURIComponent(sessionId)}`;
    } else if (email) {
      queryParams = `?email=${encodeURIComponent(email)}`;
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${backendUrl}/api/campaigns${queryParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch campaigns' },
        { status: response.status }
      );
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn('[Campaigns GET] Empty response from backend');
      return NextResponse.json({ campaigns: [] });
    }

    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      if (recoveredSessionId && typeof data === 'object' && data !== null) {
        data.recovered_session_id = recoveredSessionId;
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('[Campaigns GET] JSON parse error:', parseError);
      console.error('[Campaigns GET] Response text:', text);
      return NextResponse.json(
        { error: 'Invalid response from backend', campaigns: [] },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Campaigns GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign.
 * For guests: set/update guest_stable_id cookie and Supabase guest_sessions mapping.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message_template, companies, email, session_id } = body;

    if (!name || !message_template || !companies || companies.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, message_template, companies' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    // Guest: ensure cookie + Supabase mapping so list can be recovered later
    let stableId: string | undefined;
    if (!authHeader && session_id) {
      const cookieStore = await cookies();
      stableId = cookieStore.get(GUEST_STABLE_ID_COOKIE)?.value;
      if (!stableId) {
        stableId = crypto.randomUUID();
        await upsertGuestSession(stableId, session_id);
      } else {
        await upsertGuestSession(stableId, session_id);
      }
    }

    const response = await fetch(`${backendUrl}/api/campaigns`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: email || 'demo@example.com',
        name,
        message_template,
        companies,
        session_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const res = NextResponse.json(
        { error: errorData.error || 'Failed to create campaign' },
        { status: response.status }
      );
      if (stableId) res.cookies.set(GUEST_STABLE_ID_COOKIE, stableId, COOKIE_OPTIONS);
      return res;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      const res = NextResponse.json(
        { error: 'Empty response from backend' },
        { status: 500 }
      );
      if (stableId) res.cookies.set(GUEST_STABLE_ID_COOKIE, stableId, COOKIE_OPTIONS);
      return res;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[Campaigns POST] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    const res = NextResponse.json(data);
    if (stableId) res.cookies.set(GUEST_STABLE_ID_COOKIE, stableId, COOKIE_OPTIONS);
    return res;
  } catch (error: any) {
    console.error('[Campaigns POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
