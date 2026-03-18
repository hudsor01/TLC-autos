# Requirements: TLC Autos

**Defined:** 2026-03-17
**Core Value:** Customers can browse available vehicles and contact the dealership, while staff can manage the entire sales pipeline from a single admin dashboard.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication (AUTH)

- [x] **AUTH-01**: Staff can log in with email/password via Supabase Auth
- [x] **AUTH-02**: Staff session persists across browser refresh via @supabase/ssr cookies
- [x] **AUTH-03**: Staff can log out from any page
- [x] **AUTH-04**: Admin can create/edit/delete staff accounts via admin API
- [x] **AUTH-05**: Role-based access (admin vs staff) enforced via app_metadata + middleware + route guards

### Forms & Validation (FORM)

- [x] **FORM-01**: Vehicle form uses @tanstack/react-form with Zod validation and field-level errors
- [ ] **FORM-02**: Customer form uses @tanstack/react-form with Zod validation
- [ ] **FORM-03**: Lead form uses @tanstack/react-form with Zod validation
- [ ] **FORM-04**: Deal form uses @tanstack/react-form with Zod validation
- [x] **FORM-05**: All admin API routes validate input with Zod schemas
- [x] **FORM-06**: Public leads API route validates input with Zod schema

### Data Tables (DATA)

- [ ] **DATA-01**: Vehicles list uses @tanstack/react-table with sorting, filtering, pagination
- [ ] **DATA-02**: Customers list uses @tanstack/react-table with sorting, filtering, pagination
- [ ] **DATA-03**: Leads list uses @tanstack/react-table with sorting, filtering, pagination
- [ ] **DATA-04**: Deals list uses @tanstack/react-table with sorting, filtering, pagination
- [x] **DATA-05**: Table filters sync to URL via nuqs (shareable/bookmarkable)

### Dashboard (DASH)

- [x] **DASH-01**: Dashboard shows key metrics (total vehicles, active leads, recent deals, revenue)
- [x] **DASH-02**: Dashboard has analytics charts via Recharts (sales trends, inventory aging, lead funnel)

### Notifications (NOTF)

- [x] **NOTF-01**: All CRUD operations show toast feedback via Sonner (success, error, loading)

### Media (MEDIA)

- [x] **MEDIA-01**: Vehicle images upload to Supabase Storage with MIME/size/extension validation
- [x] **MEDIA-02**: Vehicle images can be reordered and deleted in admin
- [x] **MEDIA-03**: Primary image selection for vehicle listings

### Public Site (PUB)

- [ ] **PUB-01**: Public inventory page filters vehicles by make/model/year/price
- [ ] **PUB-02**: Public vehicle detail page shows all images and specs
- [ ] **PUB-03**: Contact form submits leads to database with validation
- [ ] **PUB-04**: Inventory URL filters shareable via nuqs

### Infrastructure (INFRA)

- [x] **INFRA-01**: Supabase database has seed data for development
- [x] **INFRA-02**: RLS policies enforce row-level security
- [x] **INFRA-03**: Generated TypeScript types from Supabase schema for type-safe queries
- [x] **INFRA-04**: PostgREST filter injection prevented via sanitizeSearch utility
- [x] **INFRA-05**: Pre-commit hooks enforce lint + typecheck + build via Lefthook

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Media Optimization

- **MEDIA-V2-01**: Server-side image optimization with sharp (resize, WebP conversion, thumbnails)
- **MEDIA-V2-02**: Image drag-to-reorder via @dnd-kit

### UI Polish

- **UI-V2-01**: Page transitions with motion/framer-motion
- **UI-V2-02**: Skeleton loading states for all admin pages

### Data Export

- **DATA-V2-01**: CSV/PDF export from data tables
- **DATA-V2-02**: Bulk operations on tables (select multiple, batch actions)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time updates (WebSockets) | Single-user DMS, no concurrent editing conflicts |
| Payment processing | Financing handled externally by dealership |
| Inventory syndication (AutoTrader, Cars.com) | Complex API integrations, build core DMS first |
| Rich text editor | Vehicle descriptions are simple text |
| Mobile app | Responsive web covers mobile |
| OAuth/social login | Email/password via Supabase Auth sufficient |
| Multi-dealership support | Single location operation |
| Client-side cache (React Query) | 1-2 admin users, small dataset, unnecessary complexity |
| GraphQL | Supabase JS client provides equivalent query capability |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | -- | Complete |
| AUTH-02 | -- | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | -- | Complete |
| AUTH-05 | -- | Complete |
| FORM-01 | Phase 2 | Complete |
| FORM-02 | Phase 2 | Pending |
| FORM-03 | Phase 2 | Pending |
| FORM-04 | Phase 2 | Pending |
| FORM-05 | Phase 2 | Complete |
| FORM-06 | -- | Complete |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 3 | Complete |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| NOTF-01 | Phase 1 | Complete |
| MEDIA-01 | -- | Complete |
| MEDIA-02 | Phase 2 | Complete |
| MEDIA-03 | Phase 2 | Complete |
| PUB-01 | Phase 4 | Pending |
| PUB-02 | Phase 4 | Pending |
| PUB-03 | Phase 4 | Pending |
| PUB-04 | Phase 4 | Pending |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | -- | Complete |
| INFRA-05 | -- | Complete |

**Coverage:**
- v1 requirements: 31 total
- Already complete: 9
- Remaining: 22
- Mapped to phases: 22/22

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after roadmap creation*
