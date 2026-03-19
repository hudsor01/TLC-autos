function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getSupabaseServiceEnv() {
  const { supabaseUrl } = getSupabaseEnv();
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return { supabaseUrl, supabaseServiceKey };
}

export { getSupabaseEnv, getSupabaseServiceEnv };
