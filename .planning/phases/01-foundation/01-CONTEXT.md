# Phase 1: Foundation - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Infrastructure layer is production-ready: generated TypeScript types for type-safe Supabase queries, RLS policies enforced on all tables, seed script with realistic test data and uploaded images, staff can log out, and toast notifications provide feedback across the app.

Requirements: INFRA-01, INFRA-02, INFRA-03, AUTH-03, NOTF-01

</domain>

<decisions>
## Implementation Decisions

### Seed Data
- Realistic sample: ~20 vehicles, ~15 customers, ~25 leads, ~10 deals with follow-ups
- Upload actual sample car images to Supabase Storage bucket during seeding
- TypeScript script at `scripts/seed.ts` using Supabase admin client (service_role key)
- Run with `bun run scripts/seed.ts` or `npx tsx scripts/seed.ts`
- Vehicle images should be real car photos (can source from public domain / placeholder services)

### RLS Policy Strategy
- Per-user restrictions on leads and deals: staff sees only their own leads/deals
- Admin role bypasses per-user restrictions (sees everything)
- Vehicles and customers are shared — all authenticated staff can read/write
- Public access: anon role can SELECT from vehicles and vehicle_images (for public inventory page)
- Deploy incrementally per table (not one big migration)
- Tables need `created_by` or `assigned_to` column (uuid referencing auth.users) for leads and deals
- RLS check pattern: `auth.uid() = created_by OR (auth.jwt()->'app_metadata'->>'role')::text = 'admin'`

### Toast Notifications
- Position: bottom-right
- Use Sonner's `toast.promise()` for all async CRUD operations (loading → success/error)
- Theme toasts to match existing design system tokens from globals.css
- Auto-dismiss after default duration with dismiss button

### Logout Flow
- No confirmation dialog — immediate signOut on click
- Redirect to `/` (public homepage) after logout
- Call `router.refresh()` after signOut to clear cached server data
- Logout button already exists in admin sidebar layout (src/app/admin/layout.tsx line 38)

### Claude's Discretion
- Exact seed data content (vehicle makes/models, customer names, etc.)
- Toast animation and styling details beyond position
- TypeScript type generation approach (CLI command vs Supabase MCP)
- Order of RLS policy deployment across tables

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Supabase Patterns
- `.planning/research/supabase-patterns.md` — Auth setup, RLS policy SQL examples, Storage upload API, type generation command, environment variables
- `.planning/research/supabase-hardening.md` — Security hardening research: app_metadata for roles, PostgREST filter sanitization, RLS best practices

### Project Context
- `.planning/PROJECT.md` — Project constraints, key decisions, tech stack
- `.planning/REQUIREMENTS.md` — Full requirements with phase traceability
- `.planning/ROADMAP.md` — Phase 1 success criteria and dependencies

### Existing Auth Implementation
- `src/lib/supabase/server.ts` — Server client with getAll/setAll cookies
- `src/lib/supabase/client.ts` — Browser client
- `src/lib/supabase/middleware.ts` — Auth token refresh middleware
- `src/lib/supabase/admin.ts` — Admin client using service_role key
- `src/lib/supabase/auth-guard.ts` — requireAuth/requireAdmin helpers
- `src/app/admin/layout.tsx` — Admin layout with existing signOut (line 38)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/admin.ts`: Admin client (service_role) — reuse for seed script
- `src/lib/supabase/auth-guard.ts`: requireAuth/requireAdmin — already checks app_metadata.role
- `src/lib/utils.ts`: sanitizeSearch, camelKeys, snakeKeys — established data transform utilities
- `src/app/admin/layout.tsx`: signOut already called at line 38 — needs redirect to `/` and router.refresh()

### Established Patterns
- All API routes use `requireAuth()` or `requireAdmin()` guard pattern
- Snake_case ↔ camelCase conversion via utility functions
- Supabase JS client for all DB operations (no direct SQL from app code)
- Sonner package installed (v2.0.7) but not yet imported anywhere

### Integration Points
- Toast provider: needs to be added to root layout (`src/app/layout.tsx`)
- Type generation: output to `src/types/database.types.ts`, then pass `Database` generic to createClient calls
- RLS: applied via Supabase SQL Editor or migration files
- Seed script: new file at `scripts/seed.ts`

</code_context>

<specifics>
## Specific Ideas

- Staff should see only their own leads and deals, but admin sees everything — this is a key business rule
- Real car images uploaded to Storage during seeding (not just placeholder URLs)
- Logout goes to public homepage, not login page — staff land on the customer-facing site

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-17*
