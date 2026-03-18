# TLC Autos

## What This Is

A used car dealership website with a built-in admin Dealer Management System (DMS). The public site lets customers browse inventory, view vehicle details, and submit contact/lead forms. The admin DMS lets dealership staff manage vehicles, customers, leads, deals, and costs behind authenticated routes.

## Core Value

Customers can browse available vehicles and contact the dealership, while staff can manage the entire sales pipeline from a single admin dashboard.

## Requirements

### Validated

- Public homepage with dealership branding and navigation — existing
- Public inventory page with vehicle listing and filtering — existing
- Public vehicle detail pages with images and specs — existing
- Public contact form that submits leads — existing (structure only, broken import)
- Public about and financing info pages — existing
- Admin route protection via Supabase middleware — existing
- Admin dashboard layout with sidebar navigation — existing
- Admin pages for vehicles, customers, leads, deals, users, settings — existing (UI shells)
- Supabase client utilities (server, browser, middleware) — existing
- Database schema with RLS policies — existing (migration SQL written, not yet applied)
- UI component library (shadcn/ui pattern) — existing
- Design system in globals.css with light/dark mode — existing
- Pre-commit hooks via Lefthook — existing

### Validated

- Integrate Zod validation across API routes and forms — Phase 2
- Integrate @tanstack/react-form for all admin forms — Phase 2
- Integrate Sonner toast notifications for user feedback — Phase 1 (setup), Phase 2 (usage)
- Vehicle image upload/management UI via Supabase Storage — Phase 2 (ImageManager component)

### Active

- [ ] Integrate @tanstack/react-table for admin data tables
- [ ] Integrate Recharts for dashboard analytics
- [ ] Integrate nuqs for URL-synced filters and pagination
- [ ] Create seed script for Supabase

### Out of Scope

- Mobile app — web-first, responsive design covers mobile
- Real-time chat — not needed for dealership workflow
- Payment processing — deals are tracked, not processed online
- Multi-dealership support — single dealership operation
- OAuth/social login — email/password via Supabase Auth is sufficient
- Frazer DMS integration — removed legacy import system

## Context

**Migration state:** The project was originally built with Prisma/SQLite/NextAuth. A decision was made to migrate to Supabase for auth, database, and storage — replacing three separate tools with one SDK. The Supabase client utilities and database schema SQL are in place, but 17 API route files and the login page still import from removed packages (`@/lib/db`, `@/lib/auth`, `bcryptjs`, `next-auth/react`). The build is broken until these are rewritten.

**Tech stack:** Next.js 16.1.6, React 19.2.4, Supabase (auth + PostgreSQL + storage), Tailwind CSS v4, TypeScript strict mode. Several packages are installed but not yet integrated: @tanstack/react-form, @tanstack/react-table, Zod, Sonner, Recharts, nuqs.

**Deployment:** GitHub repo → Vercel. Lefthook pre-commit hooks handle lint, typecheck, and build checks locally. No CI/CD pipeline — GitHub is a vessel to Vercel/prod.

**Supabase project:** `ychvjgynekceffeqqymf.supabase.co`. Service role key not yet configured in `.env.local`.

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
| Supabase over Neon | One SDK for auth + DB + storage vs Neon needing separate auth/storage integrations | -- Pending |
| Remove Prisma entirely | Supabase JS client replaces ORM — direct PostgreSQL queries via Supabase SDK | -- Pending |
| Remove NextAuth | Supabase Auth handles all auth flows — no separate auth library needed | -- Pending |
| Bun over npm | Faster installs, native TS execution for scripts | Good |
| Lefthook over CI/CD | Pre-commit catches issues before push — GitHub is just a vessel to Vercel | Good |
| Coarse phase granularity | 3-5 broad phases for faster delivery | -- Pending |
| Zod 4 schema-first validation | Shared schemas between client forms and server API routes | Good — Phase 2 |
| TanStack Form + Standard Schema | Form state management with Zod integration via Standard Schema protocol | Good — Phase 2 |
| FormField render-prop pattern | Consistent label + input + error display across all forms | Good — Phase 2 |
| SearchableSelect (Popover + Command) | Reusable filtered dropdown for entity selectors | Good — Phase 2 |

---
*Last updated: 2026-03-18 after Phase 2*
