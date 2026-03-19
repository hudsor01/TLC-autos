# Phase 4: Public Site - Research

**Researched:** 2026-03-18
**Domain:** Next.js public pages, nuqs URL state, Zod client validation, image gallery
**Confidence:** HIGH

## Summary

Phase 4 is a rewrite of existing public pages (inventory, vehicle detail, contact form) to add server-side filtering with nuqs URL state, a proper image gallery with lightbox, and Zod client-side validation on the contact form. All the foundational code exists -- the inventory page, vehicle detail page, contact form, data layer, API patterns, and nuqs integration are already in place from prior phases. The work is enhancement and migration, not greenfield.

The primary technical challenge is migrating the inventory page from client-side useState filtering (with all vehicles fetched at once) to server-side filtered queries with nuqs URL params. The admin vehicles API route already demonstrates the exact pattern needed (Supabase query building with pagination, sort allowlisting, search sanitization). The contact form enhancement is straightforward -- add Zod client-side validation to the existing form that already posts to a working API endpoint.

**Primary recommendation:** Adapt the admin API pattern (server-side Supabase query + pagination + ALLOWED_SORT) for a new public inventory API route, replace useState filters with nuqs useQueryStates, and add NuqsAdapter to the root layout.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Inline dropdowns above the vehicle grid (make, model, year range, price range, sort)
- Collapsible filter row on mobile with toggle button (existing showFilters pattern)
- Keep existing sort options: newest, price low-to-high, price high-to-low, mileage
- Show results count above grid with active filter summary
- Migrate all filter state from useState to nuqs for URL-synced shareable filters (PUB-04)
- Large hero image with thumbnail strip below on detail page
- Clicking hero image opens full-screen lightbox with prev/next navigation
- Single primary image per inventory card (first from sorted vehicle_images)
- Placeholder with "No photos available" text when vehicle has no images
- Zod validation only (no TanStack Form) -- public form is 4 fields, TanStack Form overhead not justified
- Submit to existing /api/leads endpoint with Zod server-side validation (FORM-06 already complete)
- Inline field-level errors on blur and submit
- Keep existing success message with "Send Another Message" button
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUB-01 | Public inventory page filters vehicles by make/model/year/price | nuqs useQueryStates pattern from Phase 3, new public API route with server-side Supabase filtering |
| PUB-02 | Public vehicle detail page shows all images and specs | Existing fetchVehicleById + image gallery with lightbox using Radix Dialog |
| PUB-03 | Contact form submits leads to database with validation | Zod client-side schema + existing /api/leads endpoint with server-side validation |
| PUB-04 | Inventory URL filters shareable via nuqs | NuqsAdapter in root layout, parseAsString/parseAsInteger parsers, useQueryStates with throttle |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuqs | 2.8.9 | URL-synced filter state | Already used in admin (Phase 3), useQueryStates pattern established |
| zod | 4.3.6 | Client + server validation | Already used throughout project, Zod 4 syntax (z.email(), error:) |
| next | 16.1.6 | Framework | Project framework |
| @radix-ui/react-dialog | 1.1.15 | Lightbox overlay | Already installed, used for admin modals |
| lucide-react | 0.577.0 | Icons | Already used throughout |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast notifications | Contact form error/success feedback |
| sharp | 0.34.5 | Image optimization | Next.js Image component uses it automatically |

### No New Dependencies Needed
All required libraries are already installed. No new packages required for this phase.

## Architecture Patterns

### Recommended Changes to Existing Structure
```
src/
├── app/
│   ├── layout.tsx                    # ADD NuqsAdapter wrapping children
│   ├── inventory/
│   │   ├── page.tsx                  # REWRITE: server component fetching via public API
│   │   ├── inventory-client.tsx      # REWRITE: nuqs filters, paginated fetch, skeleton loading
│   │   └── [id]/
│   │       ├── page.tsx              # ENHANCE: use fetchVehicleById, add image gallery
│   │       └── image-gallery.tsx     # NEW: hero + thumbnails + lightbox client component
│   ├── contact/
│   │   └── contact-form.tsx          # ENHANCE: add Zod validation, field-level errors
│   └── api/
│       └── inventory/
│           └── route.ts              # NEW: public inventory API (no auth, server-side filtering)
├── hooks/
│   └── use-inventory-filters.ts      # NEW: nuqs useQueryStates for public inventory filters
└── lib/
    └── schemas.ts                    # ENHANCE: add public contact form client schema
```

### Pattern 1: Public Inventory API Route (adapting admin pattern)
**What:** A new `/api/inventory` GET route with server-side Supabase filtering, no auth required
**When to use:** Public inventory page fetches filtered, paginated results
**Example:**
```typescript
// src/app/api/inventory/route.ts
// Adapted from src/app/api/admin/vehicles/route.ts pattern
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch } from "@/lib/utils";

const ALLOWED_SORT = ["date_added", "selling_price", "mileage", "year"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = sanitizeSearch(searchParams.get("search") || "");
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const yearMin = parseInt(searchParams.get("yearMin") || "0");
  const yearMax = parseInt(searchParams.get("yearMax") || "9999");
  const priceMin = parseInt(searchParams.get("priceMin") || "0");
  const priceMax = parseInt(searchParams.get("priceMax") || "999999");
  const sort = searchParams.get("sort") || "date_added";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("*, vehicle_images(url, sort_order)", { count: "exact" })
    .eq("status", "available");

  if (make) query = query.eq("make", make);
  if (model) query = query.eq("model", model);
  if (yearMin > 0) query = query.gte("year", yearMin);
  if (yearMax < 9999) query = query.lte("year", yearMax);
  if (priceMin > 0) query = query.gte("selling_price", priceMin);
  if (priceMax < 999999) query = query.lte("selling_price", priceMax);
  if (search) {
    query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%`);
  }

  const validSort = ALLOWED_SORT.includes(sort) ? sort : "date_added";
  const from = (page - 1) * limit;

  const { data, count, error } = await query
    .order(validSort, { ascending: order === "asc" })
    .range(from, from + limit - 1);

  // Transform and return...
}
```

### Pattern 2: nuqs Inventory Filters (adapting admin useTableFilters)
**What:** URL-synced filter state for the public inventory page
**When to use:** All inventory filter dropdowns and pagination
**Example:**
```typescript
// src/hooks/use-inventory-filters.ts
"use client";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function useInventoryFilters() {
  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      yearMin: parseAsInteger,
      yearMax: parseAsInteger,
      priceMin: parseAsInteger,
      priceMax: parseAsInteger,
      sort: parseAsString.withDefault("newest"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 300 }
  );
}
```

### Pattern 3: NuqsAdapter in Root Layout
**What:** Move NuqsAdapter from admin layout to root layout so it wraps public pages too
**When to use:** Required for nuqs to work on public inventory page
**Critical detail:** NuqsAdapter is currently only in `src/app/admin/layout.tsx`. It needs to wrap public routes too. Options:
1. Add to root layout (simplest, recommended)
2. Add a public-specific layout

```typescript
// src/app/layout.tsx -- root layout needs NuqsAdapter
// Note: NuqsAdapter is a client component, so root layout becomes "use client"
// OR wrap just children in a client component that provides NuqsAdapter
```
**Important:** The root layout currently has `export const metadata` which requires a server component. NuqsAdapter is a client component. Solution: create a `Providers` wrapper client component that includes NuqsAdapter, keep root layout as server component.

### Pattern 4: Image Gallery with Lightbox
**What:** Hero image + thumbnail strip + full-screen lightbox using Radix Dialog
**When to use:** Vehicle detail page
**Example:**
```typescript
// src/app/inventory/[id]/image-gallery.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return <NoImagesPlaceholder />;
  }

  return (
    <>
      {/* Hero image -- click to open lightbox */}
      <div className="relative aspect-video cursor-pointer" onClick={() => setLightboxOpen(true)}>
        <Image src={images[selectedIndex]} alt="Vehicle" fill className="object-cover rounded-lg" />
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {images.map((img, i) => (
          <div key={i} className={cn("relative aspect-video cursor-pointer rounded-md overflow-hidden", i === selectedIndex && "ring-2 ring-primary")}
            onClick={() => setSelectedIndex(i)}>
            <Image src={img} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl">
          {/* Full-size image with prev/next buttons */}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Pattern 5: Zod Client-Side Contact Form Validation
**What:** Add inline field-level Zod validation to existing contact form without TanStack Form
**When to use:** Contact form submit and blur events
**Example:**
```typescript
// Client-side contact schema (stricter than server -- client shows friendly errors)
const contactFormSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Enter a valid email address" }),
  phone: z.string().optional(),
  subject: z.string().min(1, { error: "Please select a subject" }),
  message: z.string().min(10, { error: "Message must be at least 10 characters" }),
});

// On blur: validate single field
// On submit: validate all fields, show errors, then POST to /api/leads
```

### Anti-Patterns to Avoid
- **Fetching all vehicles client-side then filtering:** The current approach fetches everything and filters in useMemo. This must change to server-side filtering for PUB-01/PUB-04.
- **Using getFilterOptions with all vehicles:** Filter dropdown options should come from the API or be computed server-side, not derived from a full client-side dataset.
- **Importing NuqsAdapter in root layout directly:** Root layout must remain a server component for metadata export. Use a Providers wrapper.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL state management | Custom pushState/popState | nuqs useQueryStates | URL parsing, serialization, throttling, SSR compat -- all handled |
| Lightbox/modal overlay | Custom portal + scroll lock | Radix Dialog (already installed) | Focus trap, escape key, scroll lock, a11y all handled |
| Image optimization | Manual srcset, lazy loading | Next.js Image component | Automatic WebP, lazy loading, blur placeholder |
| Sort injection prevention | Manual allowlist | Reuse ALLOWED_SORT pattern from admin API | Consistent security pattern across admin and public |
| Search sanitization | Custom sanitizer | Reuse sanitizeSearch() from lib/utils | Already handles PostgREST filter injection (INFRA-04) |

## Common Pitfalls

### Pitfall 1: NuqsAdapter Scope
**What goes wrong:** nuqs hooks throw runtime errors because NuqsAdapter only wraps admin routes
**Why it happens:** NuqsAdapter is currently in `src/app/admin/layout.tsx`, not accessible to public pages
**How to avoid:** Add NuqsAdapter to root layout via a Providers client component wrapper
**Warning signs:** "No NuqsAdapter found" runtime error, or useQueryStates returning undefined

### Pitfall 2: Suspense Boundary for nuqs
**What goes wrong:** Build/SSG fails because useSearchParams (used internally by nuqs) needs Suspense boundary
**Why it happens:** Next.js 16 requires Suspense boundary around components using useSearchParams for SSG compatibility
**How to avoid:** Wrap inventory-client.tsx in Suspense with a skeleton fallback (same pattern as Phase 3 admin pages)
**Warning signs:** Build error mentioning useSearchParams and Suspense

### Pitfall 3: Root Layout Metadata + Client Component
**What goes wrong:** `export const metadata` fails because layout becomes "use client"
**Why it happens:** NuqsAdapter is a client component; if added directly to root layout, the layout becomes client-only
**How to avoid:** Create a `src/app/providers.tsx` client component that wraps children with NuqsAdapter. Root layout imports and uses Providers but stays a server component.
**Warning signs:** TypeScript error about metadata export in client component

### Pitfall 4: Page Number Reset on Filter Change
**What goes wrong:** User is on page 3, changes a filter, still shows page 3 of new results (which may not exist)
**Why it happens:** Filter change doesn't reset page to 1
**How to avoid:** When any filter changes, explicitly set page back to 1 in the same useQueryStates update
**Warning signs:** Empty results after filtering, "page X of Y" showing impossible values

### Pitfall 5: Vehicle Detail Page Fetches All Vehicles
**What goes wrong:** Detail page is slow because it fetches the entire inventory to find one vehicle
**Why it happens:** Current code calls `fetchInventory()` and then `.find()` by ID
**How to avoid:** Use the existing `fetchVehicleById(id)` function directly instead
**Warning signs:** Slow detail page loads, unnecessary database load

### Pitfall 6: Zod 4 Syntax
**What goes wrong:** Validation errors don't show because of wrong Zod syntax
**Why it happens:** Project uses Zod 4.3.6 which has different syntax from Zod 3
**How to avoid:** Use `z.email()` not `z.string().email()`. Use `{ error: "..." }` not `{ message: "..." }`.
**Warning signs:** Runtime errors on schema definition, missing error messages

## Code Examples

### Existing Admin API Pattern to Adapt (Source: src/app/api/admin/vehicles/route.ts)
```typescript
// Key patterns to reuse:
// 1. ALLOWED_SORT allowlist for sort injection prevention
// 2. sanitizeSearch() for search input
// 3. Supabase query building with .eq(), .or(), .range()
// 4. Pagination response format: { items, pagination: { page, limit, total, totalPages } }
```

### Providers Wrapper for NuqsAdapter
```typescript
// src/app/providers.tsx
"use client";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
```

### Filter Options from API
```typescript
// Public API should return filter options alongside results
// GET /api/inventory?... returns:
{
  vehicles: [...],
  pagination: { page, limit, total, totalPages },
  filterOptions: {
    makes: ["Chevrolet", "Ford", "Toyota"],
    models: ["Camry", "F-150", "Silverado"], // optionally filtered by selected make
    yearRange: { min: 2015, max: 2024 },
    priceRange: { min: 8000, max: 45000 }
  }
}
```

### Skeleton Loading Grid
```typescript
// Using existing Skeleton component from src/components/ui/skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

function VehicleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="pt-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-1/3" />
      </CardContent>
    </Card>
  );
}
```

## State of the Art

| Old Approach (current code) | New Approach (Phase 4) | Impact |
|----------------------------|------------------------|--------|
| useState for all filters | nuqs useQueryStates | Shareable URLs, browser back/forward works |
| Client-side filtering in useMemo | Server-side Supabase query | Scales with inventory size, proper pagination |
| fetchInventory() returns all vehicles | Public API route with filters + pagination | Reduced payload, faster initial load |
| Single image on detail page | Hero + thumbnails + lightbox | Full image browsing experience |
| No form validation (HTML required only) | Zod client-side + server-side | Inline field-level error messages |
| fetchInventory() on detail page | fetchVehicleById(id) | Single row query instead of full table scan |

## Open Questions

1. **Filter options source**
   - What we know: Current getFilterOptions() derives makes/years from the full vehicle array
   - What's unclear: Should the public API return available filter options, or should the inventory page fetch them separately?
   - Recommendation: Return filter options as part of the inventory API response (single request). Alternatively, use a separate lightweight endpoint. Claude's discretion per CONTEXT.md.

2. **Model filter dependency on make**
   - What we know: CONTEXT.md mentions make and model filters
   - What's unclear: Should model dropdown update when make is selected (cascading filters)?
   - Recommendation: Yes, filter models by selected make for better UX. Can be done client-side from the filter options data.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUB-01 | Inventory API filters by make/model/year/price | unit | `npx vitest run src/app/api/inventory/route.test.ts -x` | No -- Wave 0 |
| PUB-02 | Vehicle detail page renders specs and images | manual-only | Manual browser verification | N/A |
| PUB-03 | Contact form validates with Zod and submits lead | unit | `npx vitest run src/app/contact/contact-form.test.ts -x` | No -- Wave 0 |
| PUB-04 | URL filter state round-trips via nuqs | unit | `npx vitest run src/hooks/use-inventory-filters.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/app/api/inventory/route.test.ts` -- covers PUB-01 (API filtering, pagination, sort allowlist)
- [ ] `src/app/contact/contact-form.test.ts` -- covers PUB-03 (Zod validation schema)
- [ ] `src/hooks/use-inventory-filters.test.ts` -- covers PUB-04 (nuqs parser config)

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/app/inventory/`, `src/app/contact/`, `src/lib/inventory.ts`, `src/hooks/use-table-filters.ts`
- Project codebase: `src/app/api/admin/vehicles/route.ts` (server-side filtering pattern)
- Project codebase: `src/app/admin/layout.tsx` (NuqsAdapter placement)
- Project codebase: `package.json` (all dependencies already installed)
- nuqs 2.8.9 package exports (verified via node_modules)

### Secondary (MEDIUM confidence)
- Radix Dialog for lightbox -- based on project already having @radix-ui/react-dialog 1.1.15 installed and Dialog component available

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and used in prior phases
- Architecture: HIGH - patterns directly adapted from existing admin code
- Pitfalls: HIGH - based on actual issues encountered in Phase 3 (Suspense, NuqsAdapter scope)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- no new dependencies, all patterns proven in-project)
