# Phase 1: Foundation - Research

**Researched:** 2026-03-17
**Domain:** Supabase infrastructure (types, RLS, seeding), Sonner toasts, Next.js auth flows
**Confidence:** HIGH

## Summary

Phase 1 establishes the infrastructure layer: generated TypeScript types for type-safe Supabase queries, hardened RLS policies with per-user restrictions on leads/deals, a seed script with realistic data and uploaded images, staff logout, and toast notifications via Sonner. All five requirements (INFRA-01, INFRA-02, INFRA-03, AUTH-03, NOTF-01) build on existing code -- the Supabase clients, auth-guard, schema, and admin layout are already in place.

The primary technical risks are: (1) the existing RLS policies use `auth.role() = 'authenticated'` which is overly permissive -- they must be replaced with `app_metadata`-based role checks using `(select auth.uid())` performance pattern; (2) the `deals` table lacks `created_by`/`assigned_to` columns needed for per-user restrictions; (3) the admin client in `admin.ts` needs the `Database` generic added after type generation. The seed script is straightforward but must handle image uploads to Supabase Storage, which requires the service_role key.

**Primary recommendation:** Start with type generation (INFRA-03) since every subsequent task benefits from typed queries, then RLS policy hardening (INFRA-02), then seed script (INFRA-01), then toast setup (NOTF-01) and logout fix (AUTH-03) in parallel.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Seed data: ~20 vehicles, ~15 customers, ~25 leads, ~10 deals with follow-ups
- Upload actual sample car images to Supabase Storage bucket during seeding
- TypeScript script at `scripts/seed.ts` using Supabase admin client (service_role key)
- Run with `bun run scripts/seed.ts` or `npx tsx scripts/seed.ts`
- Vehicle images should be real car photos (can source from public domain / placeholder services)
- RLS: per-user restrictions on leads and deals (staff sees only their own)
- Admin role bypasses per-user restrictions (sees everything)
- Vehicles and customers are shared -- all authenticated staff can read/write
- Public access: anon role can SELECT from vehicles and vehicle_images
- Deploy RLS incrementally per table (not one big migration)
- Tables need `created_by` or `assigned_to` column for leads and deals
- RLS check pattern: `auth.uid() = created_by OR (auth.jwt()->'app_metadata'->>'role')::text = 'admin'`
- Toast position: bottom-right
- Use Sonner's `toast.promise()` for all async CRUD operations
- Theme toasts to match existing design system tokens from globals.css
- Auto-dismiss after default duration with dismiss button
- Logout: no confirmation dialog, immediate signOut on click
- Redirect to `/` (public homepage) after logout
- Call `router.refresh()` after signOut to clear cached server data
- Logout button already exists in admin sidebar layout (line 38)

### Claude's Discretion
- Exact seed data content (vehicle makes/models, customer names, etc.)
- Toast animation and styling details beyond position
- TypeScript type generation approach (CLI command vs Supabase MCP)
- Order of RLS policy deployment across tables

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Supabase database has seed data for development | Seed script patterns, Storage upload API, admin client usage |
| INFRA-02 | RLS policies enforce row-level security | RLS hardening patterns, `private.is_staff()`/`private.is_admin()` helper functions, per-user policy with `(select auth.uid())` performance optimization, schema migration for `assigned_to`/`created_by` columns |
| INFRA-03 | Generated TypeScript types from Supabase schema for type-safe queries | `supabase gen types typescript` CLI, `Database` generic on createClient, helper type aliases |
| AUTH-03 | Staff can log out from any page | Existing signOut code in admin layout needs redirect changed from `/admin/login` to `/` |
| NOTF-01 | All CRUD operations show toast feedback via Sonner | `<Toaster>` in root layout, `toast.promise()` pattern, position/theme configuration |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.99.2 (installed) | Database client, auth, storage | Already installed; provides typed queries with `Database` generic |
| @supabase/ssr | 0.9.0 (installed) | Server/browser client with cookie auth | Already installed; `getAll`/`setAll` pattern |
| sonner | 2.0.7 (installed) | Toast notifications | Already installed; shadcn/ui default toast library |
| supabase CLI | 2.81.2 (installed) | Type generation, migrations | Already available; `supabase gen types typescript` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 (installed) | Schema validation | Already installed; used for seed data validation if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase CLI type gen | Supabase MCP type gen | CLI is simpler, MCP requires setup; CLI recommended |
| Sonner | react-hot-toast | Sonner already installed, shadcn/ui default, `toast.promise()` built-in |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
  seed.ts                          # Seed script (new)
src/
  types/
    database.types.ts              # Generated types (new)
  lib/
    supabase/
      admin.ts                     # Existing -- add Database generic
      server.ts                    # Existing -- add Database generic
      client.ts                    # Existing -- add Database generic
      middleware.ts                # Existing -- no changes
      auth-guard.ts                # Existing -- no changes
  app/
    layout.tsx                     # Add <Toaster /> (modify)
    admin/
      layout.tsx                   # Fix logout redirect (modify)
supabase/
  migrations/
    001_initial_schema.sql         # Existing initial schema
    002_rls_hardening.sql          # New: private schema, helper functions, per-user policies
    003_add_assigned_columns.sql   # New: add created_by/assigned_to to deals
```

### Pattern 1: Type-Safe Supabase Client
**What:** Pass `Database` generic to all `createClient` calls for autocomplete and type checking
**When to use:** Every Supabase client creation
**Example:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```
Source: [Supabase TypeScript Support docs](https://supabase.com/docs/reference/javascript/typescript-support)

### Pattern 2: RLS with Performance-Optimized Helper Functions
**What:** Use `(select auth.uid())` pattern and `SECURITY DEFINER` helper functions to avoid per-row function calls
**When to use:** All RLS policies
**Example:**
```sql
-- Create in private schema (not exposed via API)
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

-- Per-user policy on leads (staff sees own, admin sees all)
CREATE POLICY "Staff read own leads" ON leads
  FOR SELECT TO authenticated
  USING (
    (select private.is_admin()) OR assigned_to = (select auth.uid())
  );
```
Source: [Supabase RLS Performance docs](https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations), project skill `security-rls-performance.md`

### Pattern 3: Toast Promise for CRUD Operations
**What:** Wrap async operations in `toast.promise()` for automatic loading/success/error states
**When to use:** Every CRUD operation in admin UI
**Example:**
```typescript
import { toast } from "sonner";

async function handleDelete(id: string) {
  toast.promise(
    fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" }).then(res => {
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    }),
    {
      loading: "Deleting vehicle...",
      success: "Vehicle deleted",
      error: "Failed to delete vehicle",
    }
  );
}
```
Source: [Sonner toast.promise docs](https://sonner.emilkowal.ski/toast)

### Pattern 4: Seed Script with Admin Client
**What:** Use `createAdminClient()` (service_role key) to bypass RLS during seeding
**When to use:** Seed script only
**Example:**
```typescript
// scripts/seed.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Insert vehicles
const { data: vehicles, error } = await supabase
  .from("vehicles")
  .insert(vehicleData)
  .select();

// Upload images to storage
for (const vehicle of vehicles!) {
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  await supabase.storage
    .from("vehicle-images")
    .upload(
      `vehicles/${vehicle.id}/${filename}`,
      imageBuffer,
      { contentType: "image/jpeg" }
    );
}
```

### Anti-Patterns to Avoid
- **Using `auth.role() = 'authenticated'` as sole RLS check:** Any logged-in user gets full access. Always check `app_metadata` role.
- **`auth.uid()` without `(select ...)` wrapper:** Called per-row instead of once. Wrap in subselect for 100x+ performance on large tables.
- **Storing roles in `user_metadata`:** Users can self-modify via Supabase Auth API. Only `app_metadata` is secure (service_role only).
- **Importing admin client in client components:** Exposes service_role key to browser bundle.
- **Using `get`/`set`/`remove` cookie methods:** Must use `getAll`/`setAll` only per `@supabase/ssr` requirements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript types for DB | Manual type definitions | `supabase gen types typescript` | Auto-generated from schema, stays in sync |
| Toast notifications | Custom toast system | Sonner `toast.promise()` | Handles loading/success/error states, animations, accessibility |
| RLS role checks | Application-level role filtering | `private.is_staff()`/`private.is_admin()` SQL functions | Database-enforced, cannot be bypassed by API callers |
| Auth state management | Custom cookie handling | `@supabase/ssr` with `getAll`/`setAll` | Handles token refresh, cookie chunking, SSR hydration |

**Key insight:** This phase is about wiring existing tools correctly, not building custom solutions. The Supabase CLI generates types, Sonner provides toasts, and SQL helper functions enforce RLS. The risk is incorrect wiring, not missing features.

## Common Pitfalls

### Pitfall 1: Forgetting `WITH CHECK` on INSERT/UPDATE RLS Policies
**What goes wrong:** Policies with only `USING` clause on INSERT/UPDATE silently fail or allow unauthorized writes
**Why it happens:** `USING` controls which rows can be seen, `WITH CHECK` controls which rows can be written
**How to avoid:** Every INSERT policy needs `WITH CHECK`, every UPDATE policy needs both `USING` and `WITH CHECK`
**Warning signs:** Users can read but not write; or writes succeed for data they shouldn't own

### Pitfall 2: RLS Enabled But No Policies = No Data
**What goes wrong:** Enabling RLS on a table without adding any policies blocks ALL access (returns empty results)
**Why it happens:** RLS defaults to deny-all when enabled with no policies
**How to avoid:** Always add at least one policy immediately after enabling RLS
**Warning signs:** Queries return empty arrays with no errors

### Pitfall 3: Seed Script Fails Without Service Role Key
**What goes wrong:** Seed script using anon key gets blocked by RLS policies
**Why it happens:** RLS applies to all non-superuser connections; anon key has minimal permissions
**How to avoid:** Use service_role key (`SUPABASE_SECRET_KEY`) in the seed script; it bypasses RLS
**Warning signs:** STATE.md notes "Service role key not yet configured in .env.local" -- must be set before seeding

### Pitfall 4: Type Generation After Schema Changes
**What goes wrong:** TypeScript types become stale after adding columns (e.g., `assigned_to` on deals)
**Why it happens:** Types are a point-in-time snapshot from `supabase gen types`
**How to avoid:** Re-run type generation after every schema migration
**Warning signs:** TypeScript errors on new columns, `any` casts creeping in

### Pitfall 5: Toaster Not Rendering in Admin Layout
**What goes wrong:** `toast()` calls execute but no toasts appear on screen
**Why it happens:** `<Toaster />` must be in the component tree above where `toast()` is called. Admin layout is a separate layout from root.
**How to avoid:** Place `<Toaster />` in root layout (`src/app/layout.tsx`) so it covers both public and admin pages
**Warning signs:** Console shows no errors, but toasts are invisible

### Pitfall 6: Logout Redirects to Login Instead of Homepage
**What goes wrong:** Current code redirects to `/admin/login` after signOut
**Why it happens:** The existing `handleSignOut` in `admin/layout.tsx` (line 42) does `router.push("/admin/login")`
**How to avoid:** Change to `router.push("/")` per user decision -- staff lands on customer-facing homepage
**Warning signs:** Staff sees login page instead of public homepage after logout

### Pitfall 7: `deals` Table Missing `assigned_to`/`created_by` Column
**What goes wrong:** Cannot create per-user RLS policies for deals
**Why it happens:** The initial schema (`001_initial_schema.sql`) has `salesperson TEXT` but no UUID reference to `auth.users`
**How to avoid:** Add migration to add `assigned_to UUID REFERENCES auth.users(id)` or `created_by UUID REFERENCES auth.users(id)` to deals
**Warning signs:** RLS policy SQL fails with "column does not exist"

## Code Examples

### Type Generation Command
```bash
# Generate types from remote Supabase project
npx supabase gen types --lang=typescript --project-id ychvjgynekceffeqqymf > src/types/database.types.ts
```
Source: [Supabase CLI docs](https://supabase.com/docs/guides/api/rest/generating-types)

### Helper Type Aliases
```typescript
// src/types/database.types.ts (append after generation, or create a separate helpers file)
import type { Database } from "./database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Usage: Tables<"vehicles"> gives you the full row type
```
Source: [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

### Toaster Setup in Root Layout
```typescript
// src/app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="bottom-right" closeButton richColors />
      </body>
    </html>
  );
}
```
Source: [Sonner docs](https://sonner.emilkowal.ski), [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/radix/sonner)

### Fixed Logout Handler
```typescript
// In src/app/admin/layout.tsx -- change line 42
async function handleSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push("/");       // Changed from "/admin/login" to "/"
  router.refresh();
}
```

### RLS Migration: Add Columns and Hardened Policies
```sql
-- Migration: Add assigned_to/created_by columns
ALTER TABLE deals ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE follow_ups ADD COLUMN assigned_to UUID REFERENCES auth.users(id);

-- Index for RLS performance
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_deals_created_by ON deals(created_by);
CREATE INDEX idx_follow_ups_created_by ON follow_ups(created_by);

-- Replace overly permissive policies
DROP POLICY "Admin full access leads" ON leads;
DROP POLICY "Admin full access deals" ON deals;
DROP POLICY "Admin full access follow_ups" ON follow_ups;

-- Leads: staff sees own assigned, admin sees all
CREATE POLICY "Staff read leads" ON leads FOR SELECT TO authenticated
  USING ((select private.is_admin()) OR assigned_to = (select auth.uid()));
CREATE POLICY "Staff insert leads" ON leads FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update own leads" ON leads FOR UPDATE TO authenticated
  USING ((select private.is_admin()) OR assigned_to = (select auth.uid()))
  WITH CHECK ((select private.is_admin()) OR assigned_to = (select auth.uid()));
CREATE POLICY "Admin delete leads" ON leads FOR DELETE TO authenticated
  USING ((select private.is_admin()));

-- Deals: staff sees own created, admin sees all
CREATE POLICY "Staff read deals" ON deals FOR SELECT TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Staff insert deals" ON deals FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update own deals" ON deals FOR UPDATE TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()))
  WITH CHECK ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Admin delete deals" ON deals FOR DELETE TO authenticated
  USING ((select private.is_admin()));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `auth.role() = 'authenticated'` RLS | `app_metadata` role checks via helper functions | Supabase best practices 2024-2025 | Prevents privilege escalation from any authenticated user |
| `auth.uid()` in policies | `(select auth.uid())` wrapped in subselect | Documented in Supabase RLS perf guide | 100x+ faster on large tables -- called once instead of per-row |
| Manual TypeScript types | `supabase gen types typescript` | Available since Supabase CLI v1.8.1 | Eliminates manual type maintenance, catches schema drift |
| Custom toast implementations | Sonner `toast.promise()` | Sonner 1.0+ (2023) | Handles loading/success/error lifecycle automatically |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`. Never import from the old package.
- `get`/`set`/`remove` cookie methods: Replaced by `getAll`/`setAll` in `@supabase/ssr`.
- `user_metadata` for roles: Insecure -- users can self-modify. Use `app_metadata` only.

## Open Questions

1. **Service role key availability**
   - What we know: STATE.md flags "Supabase service role key not yet configured in .env.local"
   - What's unclear: Whether the user has access to the Supabase dashboard to retrieve it
   - Recommendation: First task should include instructions to retrieve and set `SUPABASE_SECRET_KEY` in `.env.local`

2. **Schema migration already applied?**
   - What we know: `001_initial_schema.sql` exists in `supabase/migrations/` but PROJECT.md says "migration SQL written, not yet applied"
   - What's unclear: Whether the schema has been applied to the remote Supabase project since that note was written
   - Recommendation: Plan should check if tables exist before running migrations; use `IF NOT EXISTS` patterns

3. **Image sourcing for seed data**
   - What we know: User wants "real car photos" from public domain / placeholder services
   - What's unclear: Best source for royalty-free car images that can be fetched programmatically
   - Recommendation: Use picsum.photos or similar placeholder service for development; alternatively embed a small set of public domain car images in the repo (< 5MB total)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test files, no test config, no test scripts in package.json |
| Config file | None -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Seed script populates DB with realistic data | manual-only | `bun run scripts/seed.ts` (verify output) | N/A -- seed script IS the test |
| INFRA-02 | RLS blocks unauthenticated, restricts per-user | manual-only | SQL queries in Supabase SQL Editor with different roles | N/A -- RLS audit query |
| INFRA-03 | All queries use generated types, no `any` casts | smoke | `npx tsc --noEmit` (typecheck catches untyped queries) | Existing via lefthook |
| AUTH-03 | Logout redirects to homepage | manual-only | Click logout in browser, verify redirect to `/` | N/A |
| NOTF-01 | Toast appears on CRUD success/error | manual-only | Trigger CRUD in browser, verify toast renders | N/A |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (existing lefthook typecheck catches type regressions)
- **Per wave merge:** Full lefthook suite (lint + typecheck + build)
- **Phase gate:** Manual verification of all 5 success criteria

### Wave 0 Gaps
- No automated test framework is set up. Phase 1 requirements are primarily infrastructure (SQL migrations, type generation, seed scripts) and UI wiring (toast, logout) -- these are best verified via manual testing and the existing typecheck/build pipeline.
- The existing lefthook pre-commit hooks (lint + typecheck + build) serve as the primary automated validation for this phase.
- Formal test framework setup (vitest/playwright) should be deferred to a phase with testable business logic (Phase 2+).

## Sources

### Primary (HIGH confidence)
- Existing project code: `src/lib/supabase/server.ts`, `admin.ts`, `client.ts`, `auth-guard.ts`, `admin/layout.tsx`
- Existing schema: `supabase/migrations/001_initial_schema.sql`
- Project research: `.planning/research/supabase-patterns.md`, `.planning/research/supabase-hardening.md`
- Project skill: `.claude/skills/supabase-postgres-best-practices/references/security-rls-performance.md`
- [Supabase TypeScript Generation docs](https://supabase.com/docs/guides/api/rest/generating-types)
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

### Secondary (MEDIUM confidence)
- [Sonner docs](https://sonner.emilkowal.ski/toast) -- toast.promise API verified via official site
- [shadcn/ui Sonner component](https://ui.shadcn.com/docs/components/radix/sonner) -- integration pattern
- [Supabase CLI reference](https://supabase.com/docs/reference/cli/v0/supabase-gen-types-typescript)

### Tertiary (LOW confidence)
- Image sourcing for seed data -- no authoritative source; placeholder services are common practice but no verified programmatic API for real car photos

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions verified against npm registry
- Architecture: HIGH -- patterns derived from existing project code and official Supabase docs
- Pitfalls: HIGH -- identified from existing project research (supabase-hardening.md), skill references, and schema analysis
- Seed script: MEDIUM -- patterns are standard but image sourcing approach needs validation

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable infrastructure, no fast-moving dependencies)
