---
phase: 04-public-site
plan: 01
subsystem: ui, api
tags: [nuqs, next.js, supabase, url-state, pagination, server-side-filtering]

requires:
  - phase: 03-admin-data-dashboard
    provides: NuqsAdapter pattern, useTableFilters hook, DataTable with nuqs state
provides:
  - Public inventory API with server-side filtering and pagination
  - NuqsAdapter wrapping all routes via Providers component
  - useInventoryFilters hook for URL-synced filter state
  - Rewritten inventory page with API fetch, skeletons, and pagination
affects: [04-public-site]

tech-stack:
  added: []
  patterns: [public API route with ALLOWED_SORT whitelist, nuqs URL-synced filters for public pages, Suspense wrapping for nuqs SSG compatibility]

key-files:
  created:
    - src/app/providers.tsx
    - src/hooks/use-inventory-filters.ts
  modified:
    - src/app/layout.tsx
    - src/app/api/inventory/route.ts
    - src/app/inventory/page.tsx
    - src/app/inventory/inventory-client.tsx

key-decisions:
  - "NuqsAdapter moved to root Providers component so public and admin routes both have nuqs support"
  - "Public API returns filterOptions (makes, models, yearRange, priceRange) alongside vehicles to populate dynamic filter dropdowns"
  - "Price filter uses composite min-max select values rather than separate inputs for simpler UX"

patterns-established:
  - "Public API routes: no auth, .eq('status', 'available') filter always applied"
  - "Providers wrapper pattern: root layout stays server component, client providers extracted to providers.tsx"

requirements-completed: [PUB-01, PUB-04]

duration: 3min
completed: 2026-03-18
---

# Phase 4 Plan 1: Public Inventory API & URL-Synced Filters Summary

**Public inventory API with server-side filtering/pagination and nuqs URL-synced filter state for shareable inventory links**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T14:42:28Z
- **Completed:** 2026-03-18T14:45:28Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Public inventory API with server-side filtering by make, model, year range, price range, search, and sort
- All filter state synced to URL via nuqs -- shareable links restore exact filter state
- Skeleton loading grid shown during API fetch, pagination controls for browsing results
- NuqsAdapter now wraps all routes (public + admin) via Providers component

## Task Commits

Each task was committed atomically:

1. **Task 1: NuqsAdapter provider, inventory filters hook, and public API route** - `ee052e9` (feat)
2. **Task 2: Rewrite inventory page with nuqs filters, fetch from API, pagination and skeletons** - `cc37139` (feat)

## Files Created/Modified
- `src/app/providers.tsx` - Client component wrapping children with NuqsAdapter
- `src/app/layout.tsx` - Root layout updated to wrap children in Providers
- `src/hooks/use-inventory-filters.ts` - nuqs hook for inventory filter URL state
- `src/app/api/inventory/route.ts` - Public inventory API with server-side filtering, pagination, and filter options
- `src/app/inventory/page.tsx` - Simplified server component with Suspense wrapping
- `src/app/inventory/inventory-client.tsx` - Complete rewrite with nuqs filters, API fetch, pagination, and skeletons

## Decisions Made
- NuqsAdapter moved to root Providers component so both public and admin routes have nuqs support (admin layout still has its own NuqsAdapter but they nest safely)
- Public API returns filterOptions alongside vehicles so filter dropdowns populate dynamically from database
- Price filter uses composite min-max select values for simpler UX (e.g., "15000-25000") rather than separate min/max inputs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Public inventory page complete with server-side filtering and URL-synced state
- Ready for vehicle detail page (plan 04-02)
- Filter options dynamically populated from database

---
*Phase: 04-public-site*
*Completed: 2026-03-18*
