import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseServiceEnv } from "./env";

/**
 * Service-role Supabase client for admin operations (user management).
 * Bypasses RLS — only use in server-side admin API routes.
 */
export function createAdminClient() {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseServiceEnv();
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
