# Phase 3: Admin Data & Dashboard - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can browse, sort, filter, and paginate all entity lists (vehicles, customers, leads, deals) in the admin using @tanstack/react-table with URL-synced filters via nuqs. Dashboard shows key business metrics in stats cards and Recharts visualizations.

Requirements: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DASH-01, DASH-02

</domain>

<decisions>
## Implementation Decisions

### Table Columns & Actions
- Essential columns only per entity:
  - Vehicles: stock#, year, make, model, selling price, status
  - Customers: name, email, phone
  - Leads: customer name, source, status, date
  - Deals: customer, vehicle, type (cash/finance/bhph), amount, status
- Inline action buttons (Edit, Delete) in last column — matches existing vehicle list pattern
- Row click navigates to edit page; action buttons for explicit operations
- Delete confirmation dialog before removing, with toast.promise feedback

### Dashboard Metrics & Layout
- 4-column stats card grid: total vehicles in inventory, active leads count, recent deals count, total revenue
- Keep existing quick links (Add Vehicle, Add Customer, Add Lead) with recent items tables below
- No auto-refresh — manual page reload, consistent with out-of-scope (no real-time)
- Time period selector for charts: Claude's Discretion on sensible defaults

### Chart Visualizations
- Two Recharts visualizations per DASH-02:
  1. Sales trend line chart (deals closed over time)
  2. Inventory status bar chart (vehicles grouped by status: available/pending/sold)
- Chart colors match design system tokens from globals.css (CSS variables)
- Tooltips on hover showing exact values — no click-to-drill-down
- Empty chart state: chart container with friendly message when no data

### Filter & Pagination UX
- nuqs useQueryState for each filter param — text search, status select, sort column/direction all encoded in URL
- Inline filters above table (search input + status dropdown) — matches existing vehicle page layout
- 300ms debounce on search input to avoid excessive re-fetches
- Page numbers with prev/next buttons below table — matches existing pagination pattern

### Claude's Discretion
- Exact table column widths and responsive breakpoints
- Chart date range defaults and granularity
- Loading skeleton design for tables and dashboard
- DataTable component abstraction level (shared vs per-entity)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing List Pages (to be rewritten)
- `src/app/admin/vehicles/page.tsx` — Current vehicle list (useState + manual fetch, status tabs, search, pagination)
- `src/app/admin/customers/page.tsx` — Current customer list
- `src/app/admin/leads/page.tsx` — Current leads list
- `src/app/admin/deals/page.tsx` — Current deals list

### Existing Dashboard
- `src/app/admin/page.tsx` — Current dashboard (stats cards + recent items, useState fetch)
- `src/app/api/admin/dashboard/route.ts` — Dashboard API returning stats and recent records

### Existing API Routes (data source for tables)
- `src/app/api/admin/vehicles/route.ts` — Vehicle list endpoint with pagination
- `src/app/api/admin/customers/route.ts` — Customer list endpoint
- `src/app/api/admin/leads/route.ts` — Lead list endpoint
- `src/app/api/admin/deals/route.ts` — Deal list endpoint

### Infrastructure (from Phase 1-2)
- `src/types/database.types.ts` — Generated Supabase types
- `src/lib/schemas.ts` — Shared Zod schemas (Phase 2)
- `src/components/ui/table.tsx` — shadcn Table component (basic HTML table wrapper)
- `src/components/ui/card.tsx` — Card component for stats display
- `src/components/ui/badge.tsx` — Badge for status display

### Design System
- `src/app/globals.css` — Design tokens, color palette for chart theming

### Project Context
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-05, DASH-01, DASH-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/table.tsx`: shadcn Table/TableHeader/TableBody/TableRow/TableHead/TableCell — base for @tanstack/react-table rendering
- `src/components/ui/card.tsx`: Card/CardHeader/CardTitle/CardContent — reuse for dashboard stats
- `src/components/ui/badge.tsx`: Badge — reuse for status columns in tables
- `src/components/ui/input.tsx`: Input — reuse for search filter
- `src/components/ui/select.tsx`: Select — reuse for status filter dropdown
- `src/components/ui/dialog.tsx`: Dialog — reuse for delete confirmation
- `src/lib/utils.ts`: cn(), camelKeys(), snakeKeys() — established data transform utilities

### Established Patterns
- API routes: `requireAuth()` guard -> query Supabase -> return NextResponse.json() with pagination
- Snake_case (DB) <-> camelCase (JS) via utility functions
- List pages fetch from `/api/admin/{entity}` with query params for page/search/status
- Toast feedback via `toast.promise()` for all async operations

### Integration Points
- Tables consume existing `/api/admin/{entity}` GET endpoints (already support pagination params)
- Dashboard consumes existing `/api/admin/dashboard` endpoint (may need chart-specific data additions)
- nuqs hooks replace useState for filter state — URL becomes source of truth
- @tanstack/react-table wraps existing shadcn Table components for sorting/filtering/pagination logic

</code_context>

<specifics>
## Specific Ideas

- Tables should be a full rewrite from useState to @tanstack/react-table, not a wrapper around existing code
- URL-synced filters are critical for DMS workflow — staff share filtered views via URL
- Dashboard charts should use design system colors, not Recharts defaults

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-admin-data-dashboard*
*Context gathered: 2026-03-18*
