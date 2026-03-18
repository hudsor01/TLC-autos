# Roadmap: TLC Autos

## Overview

TLC Autos is a brownfield project with a working Next.js shell, Supabase migration complete, auth guards in place, and packages installed but not yet integrated. The roadmap covers 22 remaining v1 requirements across 4 phases: lock down the infrastructure foundation, build validated admin forms, wire up data tables and dashboard analytics, then polish the public-facing site. Each phase delivers a coherent, verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Infrastructure, types, seed data, RLS, logout, and toast system (completed 2026-03-18)
- [x] **Phase 2: Admin Forms** - Validated CRUD forms for all entities with image management (completed 2026-03-18)
- [ ] **Phase 3: Admin Data & Dashboard** - Data tables, URL-synced filters, and analytics charts
- [ ] **Phase 4: Public Site** - Customer-facing inventory browsing, vehicle details, and contact form

## Phase Details

### Phase 1: Foundation
**Goal**: The infrastructure layer is production-ready -- typed queries, enforced RLS, seed data for development, staff can log out, and toast notifications provide feedback across the app
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, AUTH-03, NOTF-01
**Success Criteria** (what must be TRUE):
  1. Running the seed script populates the database with realistic test data (vehicles, customers, leads, deals)
  2. RLS policies block unauthenticated access and restrict staff to their permitted rows when querying Supabase directly
  3. All Supabase queries use generated TypeScript types -- no `any` casts on database responses
  4. Staff can log out from the admin sidebar and are redirected to the login page
  5. A toast notification appears on screen when any CRUD operation succeeds or fails
**Plans:** 3/3 plans complete

Plans:
- [ ] 01-01-PLAN.md -- Generate TypeScript types, wire Database generic, harden RLS policies
- [ ] 01-02-PLAN.md -- Create seed script with realistic dealership data and image uploads
- [ ] 01-03-PLAN.md -- Add Sonner toast system and fix admin logout redirect

### Phase 2: Admin Forms
**Goal**: Staff can create and edit all entities (vehicles, customers, leads, deals) through validated forms with field-level error messages, and manage vehicle images
**Depends on**: Phase 1
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, MEDIA-02, MEDIA-03
**Success Criteria** (what must be TRUE):
  1. Staff can create a vehicle with all required fields -- submitting with invalid data shows inline field errors without a page reload
  2. Staff can create customers, leads, and deals through forms that validate input and show field-level errors
  3. Submitting any form to an admin API route with malformed JSON returns a structured Zod validation error (not a 500)
  4. Staff can reorder vehicle images via the admin form and select which image appears as the primary listing photo
  5. Staff can delete individual vehicle images from the admin form
**Plans:** 4/4 plans complete

Plans:
- [ ] 02-01-PLAN.md -- TDD shared infrastructure: Zod schemas, API validation helper, deal calculations, FormField + SearchableSelect components, vitest setup
- [ ] 02-02-PLAN.md -- Vehicle form rewrite with Card sections, ImageManager component, vehicle API Zod validation + image PATCH endpoint
- [ ] 02-03-PLAN.md -- Customer and lead forms with TanStack Form + Zod, customer/lead API Zod validation
- [ ] 02-04-PLAN.md -- Deal form with searchable selectors, live pricing calculations, deal API Zod validation

### Phase 3: Admin Data & Dashboard
**Goal**: Staff can browse, sort, filter, and paginate all entity lists in the admin, with URL-synced filters and a dashboard showing business metrics and charts
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. Staff can sort any column, filter by text/status, and paginate through the vehicles, customers, leads, and deals tables
  2. Applying a filter on any admin table updates the URL -- copying that URL into a new tab restores the exact filter state
  3. Dashboard displays key metrics: total vehicles in inventory, active leads count, recent deals count, and total revenue
  4. Dashboard shows at least two Recharts visualizations (sales trend over time, and one of: inventory aging, lead funnel, or deals by status)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Public Site
**Goal**: Customers can browse the full vehicle inventory with filters, view detailed vehicle pages with all images, and submit contact inquiries -- all with shareable URLs
**Depends on**: Phase 3
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04
**Success Criteria** (what must be TRUE):
  1. A customer can filter vehicles by make, model, year range, and price range on the public inventory page
  2. A customer can click a vehicle and see all uploaded images plus full specs on the detail page
  3. A customer can submit a contact form that validates input client-side and creates a lead record in the database
  4. Inventory page filter state is encoded in the URL -- sharing the link preserves the active filters
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-03-18 |
| 2. Admin Forms | 4/4 | Complete   | 2026-03-18 |
| 3. Admin Data & Dashboard | 0/TBD | Not started | - |
| 4. Public Site | 0/TBD | Not started | - |
