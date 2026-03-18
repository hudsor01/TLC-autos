# Feature Landscape

**Domain:** Used car dealership website + admin DMS
**Researched:** 2026-03-16

## Table Stakes

Features the project needs but currently lacks or has poorly implemented.

| Feature | Current State | What to Add | Package | Complexity |
|---------|---------------|-------------|---------|------------|
| Form validation | None -- raw state, no error messages per field | Zod schemas + react-hook-form with field-level errors | zod, react-hook-form | Medium |
| Toast notifications | None -- errors set local state, successes are silent | Global toast system for all CRUD operations | sonner | Low |
| API input validation | None -- `req.json()` passed directly to Prisma | Zod `.parse()` on every API route handler | zod | Medium |
| Sortable data tables | Hand-rolled static tables with no sorting | Column sorting, visibility toggles, search | @tanstack/react-table | Medium |
| Image optimization | Raw file upload, no resize, no WebP | Resize + WebP conversion on upload, thumbnails | sharp | Medium |
| Shareable filter URLs | Filters use local useState, lost on refresh | URL-synced filters for inventory + admin lists | nuqs | Low |

## Differentiators

Features that would elevate the DMS above a basic CRUD app.

| Feature | Value Proposition | Package | Complexity |
|---------|-------------------|---------|------------|
| Dashboard analytics charts | Visual sales trends, inventory aging, lead funnel -- makes the dashboard actually useful instead of just stat cards | recharts | Medium |
| Optimistic UI updates | Delete/status-change actions feel instant instead of waiting for API round-trip | Built-in (React 19 useOptimistic) | Low |
| Image gallery with drag reorder | Reorder vehicle photos by dragging instead of manual ordering | @dnd-kit/core (or similar) | Medium |
| Page transitions | Smooth transitions between pages make the site feel polished to customers | motion | Low |
| CSV/PDF export from tables | Export vehicle lists, deal reports, customer lists for accounting/reporting | @tanstack/react-table + custom | Medium |
| Bulk operations on tables | Select multiple vehicles to mark sold, delete, or export | @tanstack/react-table row selection | Low |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Client-side data caching (React Query) | Only 1-2 admin users, small dataset. Adding a cache layer adds complexity for negligible benefit with SQLite. | Use Next.js revalidation + simple fetch refetch patterns |
| Real-time updates (WebSockets) | Single-user DMS -- no concurrent editing conflicts to solve | Simple polling or manual refresh |
| Complex RBAC | Small team, likely 1-3 users. NextAuth roles (admin/user) are sufficient. | Keep the existing NextAuth role-based approach |
| Custom rich text editor | Vehicle descriptions are simple text. A WYSIWYG editor adds bundle size and complexity. | Keep the textarea, maybe add markdown support later |
| Payment processing | Dealership handles financing externally. Embedding Stripe adds PCI compliance burden. | Link to external financing partners |
| Inventory syndication (autotrader, cars.com) | Complex API integrations that change frequently. Build the core DMS first. | Defer to a future phase if needed |

## Feature Dependencies

```
Zod schemas --> react-hook-form validation (forms need schemas)
Zod schemas --> API route validation (APIs need schemas)
@tanstack/react-table --> nuqs (table filters benefit from URL state)
sharp --> Image upload API (optimization hooks into existing upload flow)
recharts --> Dashboard API (need to add analytics endpoints)
```

## MVP Recommendation

**Add immediately (Phase 1):**
1. zod -- affects every form and API route, foundational
2. react-hook-form + @hookform/resolvers -- vehicle form alone has 25+ fields of manual state
3. sonner -- single component, instant UX improvement across all operations

**Add next (Phase 2):**
4. @tanstack/react-table -- 4 admin list pages need proper tables
5. recharts -- dashboard is the admin landing page, needs to be useful
6. nuqs -- makes inventory filters and admin tables URL-bookmarkable

**Defer (Phase 3):**
7. sharp -- image optimization is important but not blocking
8. motion -- polish layer, add after functionality is complete

## Sources

- Direct code analysis of TLC Autos codebase (vehicle-form.tsx, vehicles/page.tsx, leads/page.tsx, admin/page.tsx, API routes)
