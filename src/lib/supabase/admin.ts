import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for admin operations (user management).
 * Bypasses RLS — only use in server-side admin API routes.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
