-- Private schema for RLS helper functions (not exposed via PostgREST API)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean AS $$
  SELECT coalesce(
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS boolean AS $$
  SELECT coalesce(
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'staff'),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;
