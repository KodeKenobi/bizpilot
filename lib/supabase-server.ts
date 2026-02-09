import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client with service role (for guest_sessions etc).
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

const GUEST_SESSIONS_TABLE = 'guest_sessions';

export async function getSessionIdByStableId(stableId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(GUEST_SESSIONS_TABLE)
    .select('session_id')
    .eq('stable_id', stableId)
    .single();
  if (error || !data) return null;
  return data.session_id as string;
}

export async function upsertGuestSession(stableId: string, sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase
    .from(GUEST_SESSIONS_TABLE)
    .upsert(
      { stable_id: stableId, session_id: sessionId, updated_at: new Date().toISOString() },
      { onConflict: 'stable_id' }
    );
}
