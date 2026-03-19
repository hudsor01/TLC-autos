---
phase: 02-admin-forms
plan: 04
subsystem: ui
tags: [tanstack-form, zod, searchable-select, deal-calculations, api-validation]

# Dependency graph
requires:
  - phase: 02-admin-forms/01
    provides: "Shared form infrastructure (FormField, SearchableSelect, api-validation, schemas)"
provides:
  - "DealForm component with searchable customer/vehicle selectors and live pricing"
  - "Zod validation on deal API POST/PUT routes"
affects: [03-public-features, 04-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["form.Subscribe for reactive calculated fields", "validateRequest guard on mutation routes"]

key-files:
  created:
    - src/components/admin/deal-form.tsx
  modified:
    - src/app/admin/deals/new/page.tsx
    - src/app/admin/deals/[id]/page.tsx
    - src/app/api/admin/deals/route.ts
    - src/app/api/admin/deals/[id]/route.ts

key-decisions:
  - "Used form.Subscribe instead of form.useStore for reactive values (useStore not available in TanStack Form v1.28)"
  - "PUT route validates with dealSchema only for full form updates, skips for status-only transitions"

patterns-established:
  - "form.Subscribe selector pattern: wrap calculated/conditional UI in form.Subscribe for reactive re-renders"
  - "Status-only PUT guard: check Object.keys(body).length === 1 to skip full validation on partial updates"

requirements-completed: [FORM-04, FORM-05]

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 02 Plan 04: Deal Form Summary

**DealForm with TanStack Form + Zod, searchable customer/vehicle selectors, live pricing calculations, and validated API routes**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-18T00:10:00Z
- **Completed:** 2026-03-18T00:18:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- DealForm component with SearchableSelect for customer and vehicle pickers (fetched from API)
- Live-calculated pricing fields (net trade, tax amount, total fees, total price, amount financed, monthly payment) using calculateDeal
- Finance-specific fields (APR, term) conditionally shown for finance/bhph sale types
- Zod validation on deal API POST and PUT routes with structured field-level errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Build DealForm with searchable selectors and live calculations** - `TBD` (feat)
2. **Task 2: Add Zod validation to deal API routes** - `TBD` (feat)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `src/components/admin/deal-form.tsx` - DealForm with TanStack Form, SearchableSelect, live calculateDeal, toast.promise, beforeunload
- `src/app/admin/deals/new/page.tsx` - Simplified to render DealForm
- `src/app/admin/deals/[id]/page.tsx` - Edit page fetching deal data and passing to DealForm
- `src/app/api/admin/deals/route.ts` - Added validateRequest(dealSchema) to POST handler
- `src/app/api/admin/deals/[id]/route.ts` - Added validateRequest(dealSchema) to PUT handler (skipped for status-only updates)

## Decisions Made
- Used `form.Subscribe` render prop instead of `form.useStore` hook (useStore does not exist on TanStack Form v1.28 React API)
- PUT route on deals/[id] validates with dealSchema only for full form updates; status-only transitions (e.g., marking complete/voided) bypass schema validation since they contain only a status field

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used form.Subscribe instead of form.useStore**
- **Found during:** Task 1 (DealForm implementation)
- **Issue:** Plan specified `form.useStore(state => state.values)` but TanStack Form v1.28 does not expose useStore on the React form API
- **Fix:** Wrapped reactive sections (calculated fields, finance conditionals) in `form.Subscribe selector={(state) => state.values}` render prop
- **Files modified:** src/components/admin/deal-form.tsx
- **Verification:** TypeScript compiles clean, tests pass

**2. [Rule 2 - Missing Critical] Added status-only update guard on PUT validation**
- **Found during:** Task 2 (API validation)
- **Issue:** Existing PUT handler serves both full deal edits and status-only transitions (complete/void). Applying dealSchema to status-only requests would reject them (missing required fields)
- **Fix:** Check if body has only a `status` key; skip dealSchema validation for status-only updates
- **Files modified:** src/app/api/admin/deals/[id]/route.ts
- **Verification:** TypeScript compiles clean

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four admin form plans (vehicle, customer, lead, deal) now complete
- Forms use consistent patterns: TanStack Form + Zod, FormField wrapper, SearchableSelect, toast.promise
- API routes validated with Zod dealSchema returning structured field errors

---
*Phase: 02-admin-forms*
*Completed: 2026-03-18*
