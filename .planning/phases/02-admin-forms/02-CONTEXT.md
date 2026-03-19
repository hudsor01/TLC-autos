# Phase 2: Admin Forms - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can create and edit all entities (vehicles, customers, leads, deals) through validated forms with field-level error messages, and manage vehicle images (upload, reorder, delete, set primary). Forms use @tanstack/react-form with Zod validation. All admin API routes validate input with Zod schemas.

Requirements: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, MEDIA-02, MEDIA-03

</domain>

<decisions>
## Implementation Decisions

### Form Architecture
- Full rewrite of existing useState forms to @tanstack/react-form + Zod (not a wrap of existing code)
- Shared form helpers: create reusable hooks/utilities for common patterns (field rendering, error display, submission handling) that all 4 entity forms compose
- Shared Zod schemas in `src/lib/schemas.ts` — single source of truth for both client-side forms and server-side API validation
- Dual-mode forms: one component handles both create and edit (receives optional initialData prop, matching existing VehicleForm pattern)
- Vehicle form uses sections with Card components (Vehicle Info, Pricing/Costs, Description/Features, Images) — single scrollable page, not tabs. Should feel professional enough to replace Fraiser DMS someday.
- Deal form: extract pricing calculations (monthly payments, total cost, margins) to `src/lib/deal-calculations.ts` for testability and reuse
- Deal form includes searchable customer and vehicle selectors (link deal to existing records) — core DMS workflow
- Lead form vehicle selector: Claude's Discretion (decide based on existing schema relationships)

### Image Management UX
- Image management lives as a section within the vehicle form (an "Images" Card at the bottom)
- Reorder via up/down arrow buttons on each image thumbnail (drag-to-reorder is v2 per MEDIA-V2-02)
- Delete via X/trash icon with confirmation dialog before removing
- Primary image selection: Claude's Discretion (star icon, radio button, or first-in-order — pick the most intuitive approach)
- Images uploaded to Supabase Storage `vehicle-images` bucket (already set up in Phase 1)

### Field-Level Error Display
- Validation errors appear on submit, then re-validate on blur as user fixes fields (not before first submit attempt)
- Visual: red/destructive border on invalid field + error message text below the field in small red text
- No error summary banner at top of form — field-level errors only, scroll to first error on submit
- Server-side Zod validation errors returned as structured field paths — client maps them back to individual form fields for seamless inline display

### Form Submission Flow
- After successful create: redirect to entity list page (e.g., `/admin/vehicles`) with success toast via Sonner
- After successful edit: redirect to entity list page (same as create — consistent behavior)
- Submit button: disabled + loading spinner during submission, text changes to "Saving..."
- Unsaved changes: browser `beforeunload` warning if form has dirty fields
- All submissions use Sonner `toast.promise()` for loading/success/error feedback (carrying forward from Phase 1)

### API Validation
- All admin API routes validate request body with Zod schemas imported from `src/lib/schemas.ts`
- Malformed JSON returns structured Zod validation error response (field paths + messages), not a 500
- Error response format must be parseable by client to map errors back to form fields

### Claude's Discretion
- Exact field grouping within vehicle form sections
- Lead form vehicle selector approach (dropdown vs text)
- Primary image selection UI pattern (star vs radio vs position-based)
- Loading skeleton design for edit forms fetching data
- Exact @tanstack/react-form configuration and adapter setup

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Forms (to be rewritten)
- `src/components/admin/vehicle-form.tsx` — Current vehicle form (494 lines, useState, 24 fields, dual-mode create/edit pattern to preserve)
- `src/app/admin/customers/new/page.tsx` — Current customer form (202 lines, inline useState)
- `src/app/admin/deals/new/page.tsx` — Current deal form (559 lines, inline financial calculations to extract)
- `src/app/admin/leads/[id]/page.tsx` — Current lead detail/edit (440 lines)

### Existing API Routes (need Zod validation added)
- `src/app/api/admin/vehicles/route.ts` — Vehicle CRUD (pattern for all entity routes)
- `src/app/api/admin/vehicles/[id]/images/route.ts` — Image upload/management endpoint
- `src/app/api/admin/customers/route.ts` — Customer CRUD
- `src/app/api/admin/deals/route.ts` — Deal CRUD
- `src/app/api/admin/leads/route.ts` — Lead CRUD

### Infrastructure (from Phase 1)
- `src/types/database.types.ts` — Generated Supabase types (schemas must align)
- `src/types/helpers.ts` — Tables, InsertTables, UpdateTables type aliases
- `src/lib/supabase/server.ts` — Server client with Database generic
- `src/lib/supabase/client.ts` — Browser client with Database generic

### Design System
- `src/components/ui/` — shadcn/ui primitives (Button, Card, Input, Label, Select, Textarea, Dialog)
- `src/app/globals.css` — Design tokens, color palette, typography scale

### Project Context
- `.planning/REQUIREMENTS.md` — FORM-01 through FORM-05, MEDIA-02, MEDIA-03
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, import order, form patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/` — Full shadcn/ui primitive set (Button, Card, Input, Label, Select, Textarea, Dialog) ready for form composition
- `src/components/admin/vehicle-form.tsx` — Existing dual-mode pattern (initialData prop) worth preserving in rewrite
- `src/lib/utils.ts` — `cn()` utility for conditional class merging, `sanitizeSearch`, `camelKeys`, `snakeKeys`
- `src/lib/supabase/auth-guard.ts` — `requireAuth()`/`requireAdmin()` used by all API routes
- Sonner `toast.promise()` — Already wired in root layout from Phase 1

### Established Patterns
- API routes: `requireAuth()` guard → parse params → query Supabase → return `NextResponse.json()`
- Snake_case (DB) ↔ camelCase (JS) conversion via `camelKeys`/`snakeKeys` utilities
- Form state: currently `useState` with `handleChange` pattern (to be replaced by @tanstack/react-form)
- Component location: admin-specific in `src/components/admin/`, UI primitives in `src/components/ui/`

### Integration Points
- Forms submit to existing `/api/admin/{entity}` routes (POST create, PUT update)
- Image uploads go to `/api/admin/vehicles/[id]/images` route + Supabase Storage
- All routes already have `requireAuth()` middleware
- Generated types ensure form data aligns with database schema

</code_context>

<specifics>
## Specific Ideas

- Vehicle form should feel professional enough to eventually replace Fraiser DMS — organized, comprehensive, not a toy
- Deal form searchable selectors are core DMS workflow — staff should never manually type customer/vehicle info that already exists in the system
- Shared Zod schemas as single source of truth prevents client/server validation drift

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-admin-forms*
*Context gathered: 2026-03-17*
