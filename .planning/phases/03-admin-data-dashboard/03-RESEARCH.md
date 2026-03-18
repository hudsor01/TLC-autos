# Phase 3: Admin Data & Dashboard - Research

**Researched:** 2026-03-18
**Domain:** Data tables (@tanstack/react-table), URL state (nuqs), charting (Recharts), dashboard metrics
**Confidence:** HIGH

## Summary

This phase replaces four existing useState-based list pages (vehicles, customers, leads, deals) with @tanstack/react-table-powered data tables that support sorting, filtering, and pagination, with all filter state synced to the URL via nuqs. It also enhances the existing dashboard with stats cards (already partially built) and two Recharts visualizations.

All three core libraries (@tanstack/react-table 8.21.3, nuqs 2.8.9, recharts 3.8.0) are already installed in the project but not yet used in any component. The existing API routes already support pagination (page/limit params) and search/status filtering, but do not support server-side sorting -- sort params need to be added. The existing list pages are full rewrites (not incremental upgrades) per the CONTEXT.md decision.

**Primary recommendation:** Build a single reusable `DataTable<T>` component that wraps @tanstack/react-table with shadcn Table rendering, accepts column definitions per entity, and integrates nuqs for URL-synced filters. Each entity page becomes a thin wrapper: column defs + fetch function + DataTable.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Essential columns only per entity:
  - Vehicles: stock#, year, make, model, selling price, status
  - Customers: name, email, phone
  - Leads: customer name, source, status, date
  - Deals: customer, vehicle, type (cash/finance/bhph), amount, status
- Inline action buttons (Edit, Delete) in last column -- matches existing vehicle list pattern
- Row click navigates to edit page; action buttons for explicit operations
- Delete confirmation dialog before removing, with toast.promise feedback
- 4-column stats card grid: total vehicles in inventory, active leads count, recent deals count, total revenue
- Keep existing quick links (Add Vehicle, Add Customer, Add Lead) with recent items tables below
- No auto-refresh -- manual page reload, consistent with out-of-scope (no real-time)
- Two Recharts visualizations: (1) Sales trend line chart, (2) Inventory status bar chart
- Chart colors match design system tokens from globals.css
- Tooltips on hover showing exact values -- no click-to-drill-down
- Empty chart state: chart container with friendly message when no data
- nuqs useQueryState for each filter param -- text search, status select, sort column/direction all encoded in URL
- Inline filters above table (search input + status dropdown)
- 300ms debounce on search input to avoid excessive re-fetches
- Page numbers with prev/next buttons below table
- Tables are a full rewrite from useState to @tanstack/react-table, not a wrapper around existing code

### Claude's Discretion
- Exact table column widths and responsive breakpoints
- Chart date range defaults and granularity
- Loading skeleton design for tables and dashboard
- DataTable component abstraction level (shared vs per-entity)
- Time period selector for charts: sensible defaults

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Vehicles list uses @tanstack/react-table with sorting, filtering, pagination | DataTable component + vehicle column defs + vehicle API sort param |
| DATA-02 | Customers list uses @tanstack/react-table with sorting, filtering, pagination | DataTable component + customer column defs + customer API sort param |
| DATA-03 | Leads list uses @tanstack/react-table with sorting, filtering, pagination | DataTable component + lead column defs + lead API sort param |
| DATA-04 | Deals list uses @tanstack/react-table with sorting, filtering, pagination | DataTable component + deal column defs + deal API sort param |
| DATA-05 | Table filters sync to URL via nuqs (shareable/bookmarkable) | nuqs useQueryState hooks integrated into DataTable |
| DASH-01 | Dashboard shows key metrics (total vehicles, active leads, recent deals, revenue) | Enhance existing dashboard API to include revenue; update stats cards |
| DASH-02 | Dashboard has analytics charts via Recharts (sales trends, inventory status) | New chart API endpoint + Recharts LineChart and BarChart components |

</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | 8.21.3 | Headless table logic (sorting, filtering, pagination) | Industry standard headless table; already in package.json |
| nuqs | 2.8.9 | Type-safe URL query state management | Replaces useState for filter/sort/page state; already in package.json |
| recharts | 3.8.0 | Declarative chart components | React-native charting with composable API; already in package.json |

### Supporting (Already Available)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Table | n/a | HTML table rendering primitives | DataTable renders through these components |
| shadcn/ui Card | n/a | Stats cards, chart containers | Dashboard layout |
| shadcn/ui Badge | n/a | Status column display | Entity status rendering in tables |
| shadcn/ui Select | n/a | Status filter dropdown | Filter UI above tables |
| shadcn/ui Dialog | n/a | Delete confirmation | Already used in vehicle list |
| sonner | 2.0.7 | Toast notifications | Delete feedback via toast.promise |
| lucide-react | 0.577.0 | Icons | Sort indicators, action buttons |

### Missing (Need to Add)

| Component | Source | Purpose |
|-----------|--------|---------|
| Skeleton | shadcn/ui | Loading states for tables and dashboard |

**Installation:**
```bash
npx shadcn@latest add skeleton
```

No npm installs needed -- all three core libraries are already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    admin/
      data-table.tsx           # Shared DataTable<T> component
      data-table-pagination.tsx # Pagination controls
      data-table-toolbar.tsx    # Search + filter bar
      columns/
        vehicle-columns.tsx     # Vehicle column definitions
        customer-columns.tsx    # Customer column definitions
        lead-columns.tsx        # Lead column definitions
        deal-columns.tsx        # Deal column definitions
    dashboard/
      stats-cards.tsx           # 4-column stats grid
      sales-chart.tsx           # Line chart component
      inventory-chart.tsx       # Bar chart component
  app/
    admin/
      page.tsx                  # Dashboard (rewrite)
      vehicles/page.tsx         # Vehicle list (rewrite)
      customers/page.tsx        # Customer list (rewrite)
      leads/page.tsx            # Lead list (rewrite)
      deals/page.tsx            # Deal list (rewrite)
    api/admin/
      dashboard/route.ts        # Enhanced with revenue + chart data
      vehicles/route.ts         # Add sort param support
      customers/route.ts        # Add sort param support
      leads/route.ts            # Add sort param support
      deals/route.ts            # Add sort param support
```

### Pattern 1: Shared DataTable with Headless @tanstack/react-table

**What:** A generic `DataTable<TData>` component that accepts column definitions, data, pagination state, and renders through shadcn Table primitives. Server-side sorting/filtering/pagination (not client-side) because the data is fetched from API routes.

**When to use:** All four entity list pages.

**Key design decisions:**
- Server-side pagination: the API handles sorting/filtering/pagination, table just manages state
- `manualPagination: true`, `manualSorting: true`, `manualFiltering: true` on useReactTable
- Column definitions are per-entity, DataTable is generic
- DataTable accepts `data`, `columns`, `pageCount`, `isLoading` props

**Example:**
```typescript
// data-table.tsx
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageCount: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({ columns, data, pageCount, ... }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { sorting, pagination },
    onSortingChange: (updater) => { /* sync to nuqs */ },
    onPaginationChange: (updater) => { /* sync to nuqs */ },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });
  // Render with shadcn Table/TableHeader/TableBody/TableRow/TableCell
}
```

### Pattern 2: nuqs URL State for Filters

**What:** Each filter parameter (search, status, sort column, sort direction, page) stored in URL query params via nuqs `useQueryState` or `useQueryStates`.

**When to use:** All list pages -- URL becomes the single source of truth for table state.

**Key design:**
```typescript
// Use useQueryStates for multiple params in one hook
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

const [filters, setFilters] = useQueryStates({
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("created_at"),
  order: parseAsString.withDefault("desc"),
  page: parseAsInteger.withDefault(1),
});
```

**Important nuqs considerations:**
- nuqs requires a `NuqsAdapter` provider for Next.js App Router -- must wrap in layout or use `createSerializer`
- Use `shallow: false` to trigger re-render on URL change (needed for server-side fetch)
- 300ms debounce on search: use `useQueryState` with `{ throttleMs: 300 }` option (nuqs built-in)

### Pattern 3: Recharts with Design System Colors

**What:** Chart components consume CSS variables from globals.css for consistent theming.

**When to use:** Both dashboard charts.

**Key design:**
```typescript
// Access CSS variables for chart colors
const chartColors = {
  primary: "hsl(var(--primary))",    // Navy
  secondary: "hsl(var(--secondary))", // Crimson
  success: "hsl(var(--success))",     // Green
  warning: "hsl(var(--warning))",     // Amber
  muted: "hsl(var(--muted))",
};

// NOTE: globals.css uses hex values directly (not hsl), so use:
const chartColors = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  success: "var(--success)",
  warning: "var(--warning)",
};
```

**Recharts 3.x note:** Recharts 3.x uses the same component API as v2 (LineChart, BarChart, XAxis, YAxis, Tooltip, etc.). The composable pattern remains the standard.

### Anti-Patterns to Avoid
- **Client-side sorting/filtering with full dataset:** The project explicitly avoids React Query and has server-side pagination. Never fetch all records and sort client-side.
- **Separate useState for each filter:** Use nuqs for all filter state. No useState for search/status/sort/page.
- **Hardcoded chart colors:** Always reference CSS variables from globals.css. Never use raw hex values in chart components.
- **Custom table rendering without @tanstack/react-table:** The point of this phase is to use the headless table library. Don't rebuild sorting/pagination logic manually.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/pagination state | Manual sort/page state machine | @tanstack/react-table with manualSorting/manualPagination | Edge cases: multi-column sort, sort direction toggle, page boundary handling |
| URL query state sync | Manual URLSearchParams + useEffect | nuqs useQueryStates | Handles serialization, defaults, browser history, shallow routing |
| Chart rendering | Canvas/SVG chart drawing | Recharts composable components | Responsive, accessible, tooltip handling, animation |
| Debounced search | Custom setTimeout/clearTimeout | nuqs `throttleMs` option | Built-in, handles race conditions, integrates with URL state |
| Loading skeletons | Custom animated divs | shadcn Skeleton component | Consistent with design system, accessible |

**Key insight:** All three core libraries are headless/composable -- they handle the complex logic while you control the rendering. Don't fight this pattern by reimplementing logic.

## Common Pitfalls

### Pitfall 1: nuqs NuqsAdapter Missing
**What goes wrong:** nuqs hooks throw runtime error "No adapter found"
**Why it happens:** Next.js App Router requires wrapping the app with `NuqsAdapter` from `nuqs/adapters/next/app`
**How to avoid:** Add `<NuqsAdapter>` to the root layout or the admin layout
**Warning signs:** "No adapter found" error on first page load

### Pitfall 2: Server-Side vs Client-Side Table Operations
**What goes wrong:** Sorting/filtering happens client-side on the current page of data only, not the full dataset
**Why it happens:** Using getCoreRowModel + getSortedRowModel instead of manualSorting
**How to avoid:** Set `manualSorting: true`, `manualPagination: true` on useReactTable. All filtering/sorting/pagination hits the API.
**Warning signs:** Sorting only rearranges visible rows, not the full dataset

### Pitfall 3: API Routes Missing Sort Params
**What goes wrong:** Tables can't sort because the API ignores sort_by/order params
**Why it happens:** Existing API routes have hardcoded `.order("date_added", { ascending: false })`
**How to avoid:** Add `sort` and `order` query params to all four GET endpoints, with validation against allowed column names
**Warning signs:** Sort column headers click but nothing changes

### Pitfall 4: Recharts CSS Variable Resolution
**What goes wrong:** Chart colors render as transparent/invisible
**Why it happens:** CSS variables like `var(--primary)` may not resolve in SVG fill/stroke depending on context
**How to avoid:** Read computed styles with `getComputedStyle(document.documentElement).getPropertyValue('--primary')` at component mount, or define chart color constants that match the CSS variables
**Warning signs:** Charts render with correct shape but no visible color

### Pitfall 5: nuqs Shallow Routing Not Triggering Fetch
**What goes wrong:** URL updates but data doesn't refresh
**Why it happens:** nuqs defaults to shallow routing (no server navigation). The fetch effect needs to watch the filter state.
**How to avoid:** Use the nuqs state values as useEffect dependencies for the fetch call. The URL update + state change will trigger re-fetch.
**Warning signs:** URL bar shows new params but table shows old data

### Pitfall 6: Pagination Off-By-One
**What goes wrong:** @tanstack/react-table uses 0-based page index, but existing API uses 1-based page numbers
**Why it happens:** Library convention mismatch
**How to avoid:** Convert between the two: `apiPage = tablePageIndex + 1`
**Warning signs:** First page shows correctly but clicking "next" skips or repeats data

### Pitfall 7: Delete State After Refetch
**What goes wrong:** After deleting a row, the table briefly shows stale data or the wrong page
**Why it happens:** Page count changes but page number stays the same
**How to avoid:** After successful delete, if current page > new total pages, navigate to last page. Use toast.promise for feedback.
**Warning signs:** Empty last page after deletion

## Code Examples

### DataTable Column Definition (Vehicle)
```typescript
// columns/vehicle-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

interface VehicleRow {
  id: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  sellingPrice: number;
  status: string;
}

export const vehicleColumns: ColumnDef<VehicleRow, unknown>[] = [
  {
    accessorKey: "stockNumber",
    header: "Stock #",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("stockNumber")}</span>
    ),
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Year
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
  },
  {
    accessorKey: "make",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Make
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
  },
  // ... model, sellingPrice, status columns
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicle = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/admin/vehicles/${vehicle.id}`}>
              <Pencil className="h-4 w-4" />
            </a>
          </Button>
          {/* Delete button triggers dialog */}
        </div>
      );
    },
  },
];
```

### nuqs Filter State Hook
```typescript
// hooks/use-table-filters.ts
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function useTableFilters(defaults?: {
  sort?: string;
  order?: string;
}) {
  return useQueryStates({
    search: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    sort: parseAsString.withDefault(defaults?.sort ?? "created_at"),
    order: parseAsString.withDefault(defaults?.order ?? "desc"),
    page: parseAsInteger.withDefault(1),
  }, {
    throttleMs: 300, // Built-in debounce for search
  });
}
```

### API Route Sort Support
```typescript
// Pattern for adding sort to existing GET endpoints
const sortBy = searchParams.get("sort") || "date_added";
const sortOrder = searchParams.get("order") || "desc";

// Validate sort column against allowlist to prevent injection
const ALLOWED_SORT_COLUMNS = ["date_added", "year", "make", "selling_price", "status", "stock_number"];
const validSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : "date_added";

const { data, count, error } = await query
  .order(validSort, { ascending: sortOrder === "asc" })
  .range(from, to);
```

### Recharts Sales Trend Chart
```typescript
// dashboard/sales-chart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesData {
  month: string;
  deals: number;
  revenue: number;
}

export function SalesChart({ data }: { data: SalesData[] }) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No sales data available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--card-foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="deals"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Dashboard API Enhancement
```typescript
// Add to existing dashboard/route.ts
// New queries for chart data:
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

// Sales trend: deals grouped by month
const { data: salesTrend } = await supabase
  .from("deals")
  .select("sale_date, total_price, status")
  .eq("status", "completed")
  .gte("sale_date", sixMonthsAgo.toISOString());

// Revenue: sum of completed deals
const { data: revenueData } = await supabase
  .from("deals")
  .select("total_price")
  .eq("status", "completed");

const totalRevenue = (revenueData ?? []).reduce(
  (sum, d) => sum + (d.total_price || 0), 0
);
```

## State of the Art

| Old Approach (Current Code) | New Approach (Phase 3) | Impact |
|------------------------------|------------------------|--------|
| useState for search/filter/page | nuqs useQueryStates (URL state) | Shareable/bookmarkable filters, browser back/forward works |
| Manual Table JSX with map() | @tanstack/react-table + column defs | Sorting, type safety, reusable DataTable component |
| Hardcoded .order() in API | Dynamic sort param with column allowlist | User-controlled sorting |
| Stats cards only on dashboard | Stats cards + Recharts visualizations | Business intelligence at a glance |
| Per-page fetch with useEffect | Shared DataTable pattern with fetch | Consistent UX, less code duplication |

**Key observation:** The existing code structure is remarkably consistent across all four list pages (same useState/fetch pattern). This makes the rewrite straightforward -- extract the pattern once into DataTable, then each page is just column defs + entity-specific configuration.

## Open Questions

1. **Dashboard chart API: separate endpoint or extend existing?**
   - What we know: Current `/api/admin/dashboard` returns stats + recent records. Chart data (monthly aggregations) is different.
   - What's unclear: Whether to add chart data to existing endpoint or create `/api/admin/dashboard/charts`
   - Recommendation: Extend existing endpoint with a `charts` section. Single fetch for the whole dashboard. The data volume is small (6-12 months of monthly aggregates).

2. **nuqs NuqsAdapter placement**
   - What we know: Required for Next.js App Router
   - What's unclear: Whether it should go in root layout or admin layout
   - Recommendation: Admin layout (`src/app/admin/layout.tsx`) -- only admin pages use nuqs in this phase. Can be moved to root later when Phase 4 (public inventory filters) needs it.

3. **Revenue calculation: client or server?**
   - What we know: totalRevenue needs to sum deal.total_price for completed deals
   - Recommendation: Server-side (in dashboard API route) -- avoids exposing all deal amounts to the client.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Vehicle table renders columns, sorts, paginates | unit | `npx vitest run tests/data-table.test.ts -t "vehicle"` | No -- Wave 0 |
| DATA-02 | Customer table renders columns, sorts, paginates | unit | `npx vitest run tests/data-table.test.ts -t "customer"` | No -- Wave 0 |
| DATA-03 | Lead table renders columns, sorts, paginates | unit | `npx vitest run tests/data-table.test.ts -t "lead"` | No -- Wave 0 |
| DATA-04 | Deal table renders columns, sorts, paginates | unit | `npx vitest run tests/data-table.test.ts -t "deal"` | No -- Wave 0 |
| DATA-05 | Filter state syncs to URL params | unit | `npx vitest run tests/table-filters.test.ts` | No -- Wave 0 |
| DASH-01 | Dashboard API returns correct metrics including revenue | unit | `npx vitest run tests/dashboard-api.test.ts` | No -- Wave 0 |
| DASH-02 | Chart components render with data and handle empty state | unit | `npx vitest run tests/dashboard-charts.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/` directory -- does not exist yet, create it
- [ ] `tests/data-table.test.ts` -- covers DATA-01 through DATA-04 (column rendering, sort state, pagination state)
- [ ] `tests/table-filters.test.ts` -- covers DATA-05 (nuqs URL sync)
- [ ] `tests/dashboard-api.test.ts` -- covers DASH-01 (metrics calculation)
- [ ] `tests/dashboard-charts.test.ts` -- covers DASH-02 (chart rendering, empty state)
- [ ] Test environment may need `jsdom` for component tests (current vitest config uses `node`)

## Sources

### Primary (HIGH confidence)
- Project codebase: existing API routes (vehicles, customers, leads, deals), existing list pages, dashboard page
- package.json: confirmed @tanstack/react-table 8.21.3, nuqs 2.8.9, recharts 3.8.0 already installed
- npm registry: confirmed these are current versions (verified 2026-03-18)
- globals.css: design tokens for chart theming (hex values, not hsl)

### Secondary (MEDIUM confidence)
- @tanstack/react-table v8 API: manualSorting, manualPagination, getCoreRowModel pattern from training data, consistent with v8 stable API
- nuqs v2 API: useQueryStates, parseAsString, parseAsInteger, throttleMs from training data
- recharts v3 API: composable LineChart/BarChart/XAxis/YAxis/Tooltip pattern, stable across v2-v3

### Tertiary (LOW confidence)
- nuqs NuqsAdapter requirement for Next.js App Router -- need to verify exact import path at implementation time
- Recharts CSS variable support in SVG context -- may need runtime getComputedStyle fallback

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified against npm registry
- Architecture: HIGH -- existing code patterns are clear, rewrite path is well-defined
- Pitfalls: MEDIUM -- some CSS variable/SVG interactions and nuqs adapter specifics need implementation-time verification
- Code examples: MEDIUM -- based on stable v8 @tanstack/react-table and nuqs v2 APIs from training data

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable libraries, low churn)
