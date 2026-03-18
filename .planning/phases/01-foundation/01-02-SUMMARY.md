---
phase: 01-foundation
plan: 02
subsystem: database
tags: [supabase, seed, storage, typescript]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: database schema, types, storage bucket
provides:
  - Seed script populating all 6 tables with realistic dealership data
  - Vehicle image uploads to Supabase Storage
affects: [all feature phases requiring test data]

# Tech tracking
tech-stack:
  added: [picsum.photos (dev image source)]
  patterns: [standalone script with direct createClient, FK-safe cleanup ordering]

key-files:
  created:
    - scripts/seed.ts
    - scripts/seed-images/README.md
  modified: []

key-decisions:
  - "Direct createClient in seed script instead of importing admin.ts (path aliases unavailable in standalone scripts)"
  - "picsum.photos for placeholder vehicle images (800x600 random photos)"
  - "Round-robin assignment of auth.users to leads/deals for even distribution"

patterns-established:
  - "Seed cleanup order: follow_ups, deals, leads, vehicle_costs, vehicle_images, customers, vehicles (FK-safe)"
  - "Standalone scripts import types via relative path ../src/types/database.types"

requirements-completed: [INFRA-01]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 1 Plan 02: Seed Script Summary

**Seed script populating ~20 vehicles with Storage image uploads, ~15 customers, ~25 leads, ~10 deals, and ~15 follow-ups using typed Supabase admin client**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T00:00:00Z
- **Completed:** 2026-03-17T00:05:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created comprehensive seed script (656 lines) covering all 6 database tables
- Vehicle images fetched from picsum.photos and uploaded to Supabase Storage with proper vehicle_images records
- Leads assigned_to and deals created_by reference real auth.users via round-robin distribution
- Script is idempotent: cleans existing data in FK-safe order before re-seeding

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed script with realistic dealership data and image uploads** - `76e04f3` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `scripts/seed.ts` - Standalone seed script with typed Supabase client, seeding all tables and uploading images
- `scripts/seed-images/README.md` - Instructions for seed image directory

## Decisions Made
- Used direct `createClient<Database>` instead of importing from admin.ts since path aliases are unavailable in standalone scripts
- Used picsum.photos (800x600) for placeholder vehicle images -- acceptable for development seed data
- Round-robin distribution of auth.users across leads.assigned_to and deals.created_by for even coverage
- 100ms delay between image fetches to avoid rate-limiting picsum.photos

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Seed script ready for use once Supabase project is running with env vars set
- All tables can be populated with a single command: `bun run scripts/seed.ts`
- Foundation phase database tooling complete

---
*Phase: 01-foundation*
*Completed: 2026-03-17*
