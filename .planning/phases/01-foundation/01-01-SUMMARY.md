---
phase: 01-foundation
plan: 01
subsystem: database
tags: [supabase, typescript, rls, postgres, types]

# Dependency graph
requires: []
provides:
  - Generated TypeScript types from Supabase schema (Database type)
  - Type helper aliases (Tables, InsertTables, UpdateTables)
  - Typed Supabase clients (server, client, admin) with Database generic
  - Private schema RLS helper functions (is_admin, is_staff)
  - Per-user RLS policies on leads, deals, follow_ups
  - created_by column on deals table
affects: [01-02, 01-03, 02-sales-pipeline, 03-customer-facing]

# Tech tracking
tech-stack:
  added: [supabase-cli]
  patterns: [typed-supabase-clients, app-metadata-rls, private-schema-helpers]

key-files:
  created:
    - src/types/database.types.ts
    - src/types/helpers.ts
    - supabase/migrations/002_private_schema_helpers.sql
    - supabase/migrations/003_add_deal_columns.sql
    - supabase/migrations/004_rls_hardening.sql
  modified:
    - src/lib/supabase/server.ts
    - src/lib/supabase/client.ts
    - src/lib/supabase/admin.ts
    - src/app/api/admin/customers/route.ts
    - src/app/api/admin/deals/route.ts
    - src/app/api/admin/leads/[id]/followups/route.ts
    - src/app/api/admin/vehicles/[id]/costs/route.ts
    - src/app/api/admin/vehicles/route.ts
    - src/lib/inventory.ts

key-decisions:
  - "Applied initial schema migration (001) to remote Supabase before generating types"
  - "Used 'as never' cast for dynamic snakeKeys insert data to satisfy typed Supabase client"
  - "RLS helper functions placed in private schema (not exposed via PostgREST API)"
  - "Delete operations restricted to admin role only on vehicles and customers"

patterns-established:
  - "Pattern: All Supabase clients use Database generic -- createServerClient<Database>, createBrowserClient<Database>, createClient<Database>"
  - "Pattern: RLS uses private.is_admin() and private.is_staff() from app_metadata, never auth.role() = 'authenticated'"
  - "Pattern: Per-user tables (leads, deals, follow_ups) restrict staff to own rows via assigned_to/created_by = auth.uid()"

requirements-completed: [INFRA-03, INFRA-02]

# Metrics
duration: 7min
completed: 2026-03-18
---

# Phase 1 Plan 1: Supabase Types and RLS Hardening Summary

**Generated TypeScript types from Supabase schema, wired Database generic into all clients, and replaced permissive RLS with app_metadata role-based per-user policies**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-18T02:49:17Z
- **Completed:** 2026-03-18T02:56:26Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Generated database.types.ts from remote Supabase schema with all table types (vehicles, customers, leads, deals, follow_ups, vehicle_images, vehicle_costs)
- Created type helper aliases (Tables, InsertTables, UpdateTables) for convenient typed access
- Wired Database generic into all three Supabase client factories (server, browser, admin)
- Created private schema with is_admin() and is_staff() helper functions using app_metadata role checks
- Added created_by column to deals table and performance indexes for RLS subselects
- Replaced all 7 overly permissive "auth.role() = 'authenticated'" policies with role-based per-user restrictions
- Applied all migrations to remote Supabase project

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate TypeScript types and wire Database generic into all Supabase clients** - `78eabc5` (feat)
2. **Task 2: Create and apply RLS hardening migrations** - `c4e28a5` (feat)

## Files Created/Modified
- `src/types/database.types.ts` - Generated Supabase types with all table Row/Insert/Update types
- `src/types/helpers.ts` - Type helper aliases (Tables, InsertTables, UpdateTables)
- `src/lib/supabase/server.ts` - Added Database generic to createServerClient
- `src/lib/supabase/client.ts` - Added Database generic to createBrowserClient
- `src/lib/supabase/admin.ts` - Added Database generic to createClient
- `supabase/migrations/002_private_schema_helpers.sql` - private.is_admin() and private.is_staff() functions
- `supabase/migrations/003_add_deal_columns.sql` - deals.created_by column and performance indexes
- `supabase/migrations/004_rls_hardening.sql` - 26 new role-based RLS policies replacing 7 old permissive ones

## Decisions Made
- Applied initial schema migration (001) to remote Supabase project first, since it hadn't been run yet (types were generating with empty Tables)
- Used `as never` cast for dynamic snakeKeys insert data rather than refactoring all API routes to use typed insert objects (runtime validation unchanged, type safety added at client level)
- RLS helper functions placed in `private` schema to prevent exposure via PostgREST API
- Delete operations on vehicles and customers restricted to admin role only (staff can CRUD, but only admin can delete)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Applied initial migration to remote Supabase**
- **Found during:** Task 1 (type generation)
- **Issue:** Remote Supabase project had no tables -- gen types returned empty Tables
- **Fix:** Ran `supabase link` and `supabase db push` to apply 001_initial_schema.sql
- **Files modified:** supabase/config.toml (created by link), supabase/.temp/ (created by link)
- **Verification:** Type regeneration produced full table types
- **Committed in:** 78eabc5 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed type errors in API routes exposed by Database generic**
- **Found during:** Task 1 (tsc verification)
- **Issue:** 5 API routes used `Record<string, unknown>` from snakeKeys() for .insert() calls, which no longer matched typed Supabase client expectations. inventory.ts had sort_order typed as `number` but generated type is `number | null`.
- **Fix:** Cast dynamic insert data as `never` in API routes. Changed sort_order comparisons to use nullish coalescing `(a.sort_order ?? 0)`.
- **Files modified:** 5 API route files, src/lib/inventory.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 78eabc5 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for task completion. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - migrations were applied directly to the remote Supabase project via `supabase db push`.

## Next Phase Readiness
- All Supabase clients are now fully typed with the Database generic
- RLS policies are hardened with app_metadata role checks
- Type helpers are available for import in future features
- Ready for Plan 02 (auth middleware) and Plan 03 (notification setup)

## Self-Check: PASSED

- All 8 created files verified on disk
- Commits 78eabc5 and c4e28a5 confirmed by gsd-tools
- TypeScript compilation passed (npx tsc --noEmit)
- All acceptance criteria verified via grep

---
*Phase: 01-foundation*
*Completed: 2026-03-18*
