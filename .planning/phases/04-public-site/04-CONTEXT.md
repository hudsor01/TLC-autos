# Phase 4: Public Site - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Customers can browse the full vehicle inventory with filters, view detailed vehicle pages with all images, and submit contact inquiries -- all with shareable URLs via nuqs.

Requirements: PUB-01, PUB-02, PUB-03, PUB-04

</domain>

<decisions>
## Implementation Decisions

### Inventory Filter Presentation
- Inline dropdowns above the vehicle grid (make, model, year range, price range, sort)
- Collapsible filter row on mobile with toggle button (existing `showFilters` pattern)
- Keep existing sort options: newest, price low-to-high, price high-to-low, mileage
- Show results count above grid with active filter summary
- Migrate all filter state from useState to nuqs for URL-synced shareable filters (PUB-04)

### Vehicle Image Gallery
- Large hero image with thumbnail strip below on detail page
- Clicking hero image opens full-screen lightbox with prev/next navigation
- Single primary image per inventory card (first from sorted vehicle_images)
- Placeholder with "No photos available" text when vehicle has no images

### Contact Form Validation
- Zod validation only (no TanStack Form) -- public form is 4 fields, TanStack Form overhead not justified
- Submit to existing /api/leads endpoint with Zod server-side validation (FORM-06 already complete)
- Inline field-level errors on blur and submit
- Keep existing success message with "Send Another Message" button

### Data Fetching Strategy
- Server-side filtering via dedicated public API route (no auth required, separate from admin endpoints)
- nuqs URL params for filter state -- replaces current useState approach
- Paginated results with page numbers (consistent with admin, better for SEO than infinite scroll)
- Skeleton card grid as loading state

### Claude's Discretion
- Exact filter dropdown styling and responsive breakpoints
- Lightbox implementation approach (CSS-only vs library)
- Skeleton card design
- Vehicle detail page layout and spec grouping
- SEO metadata for filtered inventory pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Public Pages (to be rewritten/enhanced)
- `src/app/inventory/page.tsx` -- Server component, fetches all vehicles via fetchInventory()
- `src/app/inventory/inventory-client.tsx` -- Client component with useState filters (make, body, year, price, sort, search)
- `src/app/inventory/[id]/page.tsx` -- Vehicle detail page with single image display
- `src/app/contact/page.tsx` -- Contact page with info cards + form
- `src/app/contact/contact-form.tsx` -- Basic useState form, submits to /api/leads

### Data Layer
- `src/lib/inventory.ts` -- fetchInventory() and fetchVehicleById() via Supabase, Vehicle type definition
- `src/app/api/leads/route.ts` -- Public leads API with Zod validation (FORM-06)

### Reusable Infrastructure (from Phase 1-3)
- `src/hooks/use-table-filters.ts` -- nuqs useQueryStates pattern (adapt for public filters)
- `src/lib/schemas.ts` -- Shared Zod schemas including lead schema
- `src/types/database.types.ts` -- Generated Supabase types
- `src/components/ui/` -- shadcn components (Card, Badge, Button, Input, Select, Dialog)
- `src/components/header.tsx` -- Public site header/navigation
- `src/components/footer.tsx` -- Public site footer

### Design System
- `src/app/globals.css` -- Design tokens, color palette
- `src/lib/constants.ts` -- SITE_NAME, CONTACT info

### Project Context
- `.planning/REQUIREMENTS.md` -- PUB-01 through PUB-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/inventory.ts`: fetchInventory() already queries Supabase with vehicle_images join -- needs server-side filter params added
- `src/hooks/use-table-filters.ts`: nuqs pattern with buildApiParams -- adapt for public inventory filters
- `src/lib/schemas.ts`: Lead Zod schema already exists for server validation
- `src/components/ui/card.tsx`: Card component for vehicle cards in grid
- `src/components/ui/badge.tsx`: Badge for status/feature display
- `src/app/admin/layout.tsx`: NuqsAdapter already in admin -- needs adding to public layout or root layout

### Established Patterns
- nuqs useQueryStates with 300ms throttle for URL-synced filters (Phase 3)
- Zod server-side validation via validateRequest helper (Phase 2)
- toast.promise for async feedback (Phase 1-2)
- Snake_case (DB) to camelCase (JS) via camelKeys/snakeKeys utilities
- Suspense boundaries required for nuqs/useSearchParams (Phase 3 discovery)

### Integration Points
- Public inventory filters connect to new public API route (or enhanced fetchInventory with params)
- Contact form submits to existing /api/leads POST endpoint
- NuqsAdapter needs to wrap public routes (currently only in admin layout)
- Vehicle detail page links from inventory cards via /inventory/[id]

</code_context>

<specifics>
## Specific Ideas

- Inventory page is a rewrite from useState to nuqs, not just an overlay -- URL becomes the source of truth for all filter state
- Contact form keeps its simplicity -- Zod validation added but no heavy form library
- Vehicle detail page should feel like a real car listing -- specs, features, images, and a clear CTA to contact

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 04-public-site*
*Context gathered: 2026-03-18*
