# TLC Autos

## What This Is

A used car dealership website with a built-in admin Dealer Management System (DMS). The public site lets customers browse inventory with filters, view vehicle details with image galleries, and submit contact/lead forms. The admin DMS lets dealership staff manage vehicles, customers, leads, deals, and costs behind authenticated routes with validated forms, sortable data tables, and a dashboard with business analytics.

## Core Value

Customers can browse available vehicles and contact the dealership, while staff can manage the entire sales pipeline from a single admin dashboard.

## Requirements

### Validated

- ✓ Public homepage with dealership branding and navigation — existing
- ✓ Public inventory page with vehicle listing and filtering — v1.0
- ✓ Public vehicle detail pages with images and specs — v1.0
- ✓ Public contact form that submits leads — v1.0
- ✓ Public about and financing info pages — existing
- ✓ Admin route protection via Supabase middleware — existing
- ✓ Admin dashboard layout with sidebar navigation — existing
- ✓ Admin pages for vehicles, customers, leads, deals, users, settings — v1.0
- ✓ Supabase client utilities (server, browser, middleware) — existing
- ✓ Database schema with RLS policies — v1.0
- ✓ UI component library (shadcn/ui pattern) — existing
- ✓ Design system in globals.css with light/dark mode — existing
- ✓ Pre-commit hooks via Lefthook — existing
- ✓ Zod validation across API routes and forms — v1.0
- ✓ @tanstack/react-form for all admin forms — v1.0
- ✓ Sonner toast notifications for user feedback — v1.0
- ✓ Vehicle image upload/management UI via Supabase Storage — v1.0
- ✓ @tanstack/react-table for admin data tables — v1.0
- ✓ Recharts for dashboard analytics — v1.0
- ✓ nuqs for URL-synced filters and pagination — v1.0
- ✓ Seed script for Supabase — v1.0

### Active

- [ ] Light-only premium design system — remove dark mode, evolve navy/crimson palette for light backgrounds
- [ ] Homepage redesign — split layout hero, stats bar, feature cards, testimonials, CTA
- [ ] Inventory page redesign — card grid with lightbox, refined filters
- [ ] Vehicle detail page redesign — gallery-first layout with large hero images
- [ ] Contact page redesign — premium form layout with validation
- [ ] About page redesign — brand story, team, dealership values
- [ ] Financing page redesign — clear options layout, CTA-driven
- [ ] Subtle motion — smooth hover states, gentle transitions, scroll reveals

### Out of Scope

- Mobile app — web-first, responsive design covers mobile
- Real-time chat — not needed for dealership workflow
- Payment processing — deals are tracked, not processed online
- Multi-dealership support — single dealership operation
- OAuth/social login — email/password via Supabase Auth is sufficient
- Frazer DMS integration — removed legacy import system
- Real-time updates (WebSockets) — single-user DMS, no concurrent editing
- Client-side cache (React Query) — 1-2 admin users, small dataset
- GraphQL — Supabase JS client provides equivalent query capability

## Context

**Current state:** v1.0 MVP shipped 2026-03-18. 93 commits, 230 files, ~39k LOC TypeScript.

**Tech stack:** Next.js 16.1.6, React 19.2.4, Supabase (auth + PostgreSQL + storage), Tailwind CSS v4, TypeScript strict mode. Integrated packages: @tanstack/react-form, @tanstack/react-table, Zod 4, Sonner, Recharts, nuqs.

**Deployment:** GitHub repo → Vercel. Lefthook pre-commit hooks handle lint, typecheck, and build checks locally.

**Supabase project:** `ychvjgynekceffeqqymf.supabase.co`.

**Known tech debt:**
- Dead code: `fetchInventory` in `src/lib/supabase/queries.ts` (replaced by public API route)
- Contact form has no duplicate-submission guard (race condition on rapid clicks)
- `SUPABASE_SERVICE_ROLE_KEY` env var naming is non-standard (should be `NEXT_PUBLIC_` prefixed or server-only)

## Constraints

- **Tech stack**: Supabase only (no Prisma, no NextAuth, no SQLite) — one SDK replaces three
- **Package manager**: Bun for installs and script execution
- **Auth pattern**: `@supabase/ssr` with `getAll`/`setAll` cookie methods only — never `get`/`set`/`remove`
- **Git workflow**: All changes via PRs with branch protection — never push directly to main
- **Pre-commit**: Lefthook must pass (lint + typecheck + build) before commits land
- **Design system**: `globals.css` is the single source of truth for UI tokens

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over Neon | One SDK for auth + DB + storage vs Neon needing separate auth/storage integrations | ✓ Good |
| Remove Prisma entirely | Supabase JS client replaces ORM — direct PostgreSQL queries via Supabase SDK | ✓ Good |
| Remove NextAuth | Supabase Auth handles all auth flows — no separate auth library needed | ✓ Good |
| Bun over npm | Faster installs, native TS execution for scripts | ✓ Good |
| Lefthook over CI/CD | Pre-commit catches issues before push — GitHub is just a vessel to Vercel | ✓ Good |
| Coarse phase granularity | 3-5 broad phases for faster delivery | ✓ Good — 4 phases, 12 plans |
| Zod 4 schema-first validation | Shared schemas between client forms and server API routes | ✓ Good |
| TanStack Form + Standard Schema | Form state management with Zod integration via Standard Schema protocol | ✓ Good |
| FormField render-prop pattern | Consistent label + input + error display across all forms | ✓ Good |
| SearchableSelect (Popover + Command) | Reusable filtered dropdown for entity selectors | ✓ Good |
| DataTable + nuqs URL state | Generic tanstack-table with manual sorting/pagination, nuqs URL-synced filters | ✓ Good |
| ALLOWED_SORT allowlist | Validate sort columns against explicit array to prevent sort injection | ✓ Good |
| Column factory pattern | getXxxColumns({ onDelete }) returns typed ColumnDef[] per entity | ✓ Good |
| CSS variable chart theming | Recharts colors via CSS variables for dark mode and design system consistency | ✓ Good |
| NuqsAdapter in root Providers | Moved from admin layout to root so public and admin routes both have nuqs support | ✓ Good |
| Public API with filterOptions | API returns available filter values alongside vehicles for dynamic dropdowns | ✓ Good |
| Inline Zod validation (no form lib) | Contact form uses validateField on blur — simpler than TanStack Form for public forms | ✓ Good |
| toast.promise for async feedback | Wraps fetch for loading/success/error states without manual state management | ✓ Good |

## Current Milestone: v1.1 UI Polish

**Goal:** Redesign all public-facing pages with a light-only, premium aesthetic — evolved brand palette, refined typography, gallery-first vehicle detail, and subtle motion throughout.

**Target features:**
- Light-only design system (remove dark mode entirely)
- Evolved navy/crimson palette optimized for light backgrounds
- All 6 public pages fully redesigned (homepage, inventory, vehicle detail, contact, about, financing)
- Split layout homepage hero
- Card grid inventory with lightbox
- Gallery-first vehicle detail
- Subtle, refined animations and micro-interactions

---
*Last updated: 2026-03-18 after v1.1 milestone start*
