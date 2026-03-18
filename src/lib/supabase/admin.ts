import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client for admin operations (user management).
 * Bypasses RLS — only use in server-side admin API routes.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
