import { NextResponse } from "next/server";
import { createClient } from "./server";

/**
 * Verify the request is from an authenticated user.
 * Returns the user on success, or a 401 NextResponse on failure.
 * Defense-in-depth: middleware also checks auth, but API routes should not rely on it alone.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, supabase, error: null };
}

/**
 * Verify the request is from a user with admin role.
 */
export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;

  if (result.user.user_metadata?.role !== "admin") {
    return { ...result, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return result;
}
