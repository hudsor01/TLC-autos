---
phase: 03-admin-data-dashboard
plan: 01
subsystem: ui
tags: [tanstack-table, nuqs, react, data-table, url-state, sorting, pagination]

requires:
  - phase: 02-admin-forms
    provides: Admin layout, API routes with GET handlers, shadcn UI components
provides:
  - Generic DataTable component with manual sorting and pagination
  - DataTablePagination with page navigation controls
  - DataTableToolbar with search and status filter
  - useTableFilters hook for URL-persisted filter state via nuqs
  - buildApiParams helper for converting filter state to API query params
  - Sort/order query param support on all 4 admin API routes with allowlist validation
affects: [03-02-entity-pages, 03-03-dashboard]

tech-stack:
  added: [nuqs (useQueryStates), @tanstack/react-table (useReactTable)]
  patterns: [manual sorting/pagination with server-side data, URL state management via nuqs, ALLOWED_SORT allowlist for sort injection prevention]

key-files:
  created:
    - src/components/admin/data-table.tsx
    - src/components/admin/data-table-pagination.tsx
    - src/components/admin/data-table-toolbar.tsx
    - src/hooks/use-table-filters.ts
  modified:
    - src/app/admin/layout.tsx
    - src/app/api/admin/vehicles/route.ts
    - src/app/api/admin/customers/route.ts
    - src/app/api/admin/leads/route.ts
    - src/app/api/admin/deals/route.ts

key-decisions:
  - "Used native HTML select element (existing shadcn Select) for status filter instead of Radix Select -- simpler, consistent with existing codebase"
  - "DataTable accepts SortingState/PaginationState from tanstack-table so consumers can bridge nuqs state to table state"
  - "300ms throttle on useQueryStates to debounce URL updates during typing"

patterns-established:
  - "ALLOWED_SORT allowlist pattern: validate sort column against explicit array, fallback to default"
  - "useTableFilters + buildApiParams: hook returns nuqs state, helper converts to URLSearchParams for fetch"
  - "DataTable generic component: pass ColumnDef<T>[], data, sorting/pagination state and callbacks"

requirements-completed: [DATA-05]

duration: 2min
completed: 2026-03-18
---

# Phase 03 Plan 01: Shared DataTable Infrastructure Summary

**Generic DataTable with tanstack-table manual sorting/pagination, nuqs URL state hook, and ALLOWED_SORT validation on all 4 admin API routes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T06:37:28Z
- **Completed:** 2026-03-18T06:40:09Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- DataTable component with sort indicators (ArrowUp/ArrowDown/ArrowUpDown), loading skeletons, empty state, and row click support
- DataTablePagination with first/prev/page-numbers/next/last navigation
- DataTableToolbar with search input (with icon) and optional status filter dropdown
- useTableFilters hook wrapping nuqs useQueryStates with 300ms throttle
- All 4 admin API GET routes (vehicles, customers, leads, deals) accept sort/order params with allowlist validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add NuqsAdapter to admin layout + create useTableFilters hook** - `6ceaffb` (feat)
2. **Task 2: Create DataTable component, pagination, toolbar, and add sort params to all 4 API routes** - `84d6e27` (feat)

## Files Created/Modified
- `src/components/admin/data-table.tsx` - Generic DataTable<TData> with manual sorting/pagination
- `src/components/admin/data-table-pagination.tsx` - Pagination controls with page number buttons
- `src/components/admin/data-table-toolbar.tsx` - Search input + status filter dropdown
- `src/hooks/use-table-filters.ts` - nuqs URL state hook with buildApiParams helper
- `src/app/admin/layout.tsx` - Added NuqsAdapter wrapping children
- `src/app/api/admin/vehicles/route.ts` - Added sort/order with ALLOWED_SORT validation
- `src/app/api/admin/customers/route.ts` - Added sort/order with ALLOWED_SORT validation
- `src/app/api/admin/leads/route.ts` - Added sort/order with ALLOWED_SORT validation
- `src/app/api/admin/deals/route.ts` - Added sort/order with ALLOWED_SORT validation

## Decisions Made
- Used native HTML select element (existing shadcn Select component) for toolbar status filter -- consistent with existing codebase pattern
- DataTable accepts tanstack-table SortingState/PaginationState so consumers can bridge nuqs state to table state
- 300ms throttle on useQueryStates to debounce URL updates during search typing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- DataTable infrastructure is ready for Plan 02 (entity list page rewrites)
- All API routes support dynamic sort/order for table column sorting
- useTableFilters + buildApiParams provide the consumer pattern for list pages

---
*Phase: 03-admin-data-dashboard*
*Completed: 2026-03-18*
