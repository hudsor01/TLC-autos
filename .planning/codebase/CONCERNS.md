# Codebase Concerns

**Analysis Date:** 2026-03-17

## Critical: Broken Build — Partial Prisma/NextAuth Migration

**Issue:** Stack migration from Prisma/SQLite/NextAuth to Supabase is incomplete. The codebase imports from packages that no longer exist in `package.json`, causing the entire build to fail.

**Files with broken imports:**
- `src/app/api/admin/users/route.ts` - imports `prisma`, `@/lib/auth`, `bcryptjs`
- `src/app/api/admin/users/[id]/route.ts` - imports `prisma`, `bcryptjs`
- `src/app/api/admin/leads/route.ts` - imports `prisma`
- `src/app/api/admin/leads/[id]/route.ts` - imports `prisma`
- `src/app/api/admin/leads/[id]/followups/route.ts` - imports `prisma`
- `src/app/api/admin/customers/route.ts` - imports `prisma`
- `src/app/api/admin/customers/[id]/route.ts` - imports `prisma`
- `src/app/api/admin/deals/route.ts` - imports `prisma`
- `src/app/api/admin/deals/[id]/route.ts` - imports `prisma`
- `src/app/api/admin/vehicles/route.ts` - imports `prisma`
- `src/app/api/admin/vehicles/[id]/route.ts` - imports `prisma`
- `src/app/api/admin/vehicles/[id]/costs/route.ts` - imports `prisma`
- `src/app/api/admin/vehicles/[id]/images/route.ts` - imports `prisma`
- `src/app/api/admin/dashboard/route.ts` - imports `prisma`
- `src/app/leads/route.ts` - imports `prisma`
- `src/app/api/inventory/route.ts` - imports `prisma`
- `src/lib/inventory.ts` - imports `prisma`
- `src/app/admin/login/page.tsx` - imports `next-auth/react`

**Impact:** Application cannot build. All 17 API routes and login page are non-functional.

**Root causes:**
1. `@/lib/db.ts` does not exist — only `src/lib/supabase/` utilities exist
2. `@/lib/auth.ts` does not exist — authentication system removed but not replaced
3. Missing Supabase user management system — `bcryptjs` was used for password hashing, now handled by Supabase Auth
4. Missing password hashing implementation for Supabase

**Fix approach:**
1. Rewrite all 17 API route files to use Supabase client (`src/lib/supabase/server.ts`)
2. Replace password hashing with Supabase Auth service (no client-side bcryptjs)
3. Create middleware or utility for authentication checks using Supabase session
4. Rewrite login page to use Supabase Auth signIn instead of NextAuth
5. Update `src/lib/inventory.ts` to use Supabase queries instead of Prisma
6. Run migration: `supabase/migrations/001_initial_schema.sql` (currently not applied)

**Priority:** CRITICAL — blocks all API functionality

---

## Infrastructure: Database Migration Not Applied

**Issue:** The Supabase migration file exists but has not been run against the database.

**Files:** `supabase/migrations/001_initial_schema.sql`

**Impact:** Database schema is missing. All Supabase queries will fail with "table does not exist" errors.

**Current state:**
- Migration SQL is defined and complete (tables, indexes, RLS policies, storage bucket)
- Supabase client utilities are in place and ready to use
- Environment variable `SUPABASE_SECRET_KEY` is empty

**Fix approach:**
1. Ensure `SUPABASE_SECRET_KEY` is set in `.env.local`
2. Run migration in Supabase SQL Editor or via CLI: `supabase db push`
3. Verify all tables created successfully before deploying API rewrites

**Priority:** CRITICAL — must be done before API rewrites are functional

---

## Auth System: Complete Removal Without Replacement

**Issue:** NextAuth was removed but no Supabase Auth implementation exists. Login pages and protected endpoints have no way to authenticate users.

**Files affected:**
- `src/app/admin/login/page.tsx` - calls `signIn("credentials", ...)` from removed `next-auth/react`
- `src/app/api/admin/users/route.ts` - calls `auth()` from removed `@/lib/auth`
- `src/app/api/admin/users/[id]/route.ts` - calls `auth()` from removed `@/lib/auth`

**What's missing:**
- Supabase Auth session retrieval on server and client
- Login/signup endpoints using Supabase Auth
- Role-based access control (RLS policies are defined in schema, but no implementation to enforce them)
- Password reset flow
- User creation flow that uses Supabase Auth instead of custom password hashing

**Current Supabase setup:**
- `src/lib/supabase/server.ts` - server-side client (ready to use)
- `src/lib/supabase/client.ts` - browser-side client (ready to use)
- `src/lib/supabase/middleware.ts` - exists but may need verification
- Schema includes `auth.users` references (Supabase built-in)
- RLS policies reference `auth.role()` and `auth.users(id)`

**Fix approach:**
1. Create authentication utility at `src/lib/auth.ts`:
   - Export function to get current session from Supabase
   - Export function to check if user is authenticated
   - Export function to get user role
2. Rewrite login page to call Supabase Auth signIn
3. Create user creation endpoint that uses Supabase Auth admin API
4. Update all protected API routes to verify session via new auth utility

**Priority:** CRITICAL — all admin features blocked

---

## Configuration: Disabled Git Hooks Still Reference Removed Packages

**Issue:** `lefthook.yml` has pre-commit hooks configured for Prisma operations that no longer exist.

**Files:** `lefthook.yml`

**Current problematic commands:**
```yaml
prisma-generate:
  glob: "prisma/schema.prisma"
  run: npx prisma generate

db-push:
  glob: "prisma/schema.prisma"
  run: npx prisma db push --skip-generate
```

**Impact:**
- Commits may fail if `prisma/schema.prisma` is accidentally committed
- Developers unfamiliar with the migration may try to run these commands

**Fix approach:**
1. Remove `prisma-generate` hook
2. Remove `db-push` hook
3. Add new hook for Supabase migrations if desired (optional)

**Priority:** MEDIUM — non-blocking but causes confusion

---

## Configuration: Dependabot Still Tracks Removed Prisma

**Issue:** `.github/dependabot.yml` has a dependency group for Prisma packages that are no longer in the project.

**Files:** `.github/dependabot.yml`

**Current problematic section:**
```yaml
prisma:
  patterns:
    - "prisma"
    - "@prisma/*"
```

**Impact:**
- Wasted CI runs checking for Prisma updates
- Potential confusion about project dependencies
- Unnecessary PRs if any old Prisma packages remain installed

**Fix approach:**
1. Remove the `prisma` group from `dependabot.yml`
2. Ensure `node_modules/.bin/prisma` is deleted or uninstalled
3. Verify `package.json` does not contain any `prisma` or `@prisma/*` dependencies

**Priority:** MEDIUM — cleanup only

---

## Code: Inventory Module Still Uses Removed Prisma

**Issue:** `src/lib/inventory.ts` is a complete rewrite from the original Frazer CRM integration, but it imports and uses Prisma which no longer exists.

**Files:** `src/lib/inventory.ts`

**Current code:**
```typescript
import { prisma } from "@/lib/db";

export async function fetchInventory(): Promise<Vehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "available" },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { dateAdded: "desc" },
  });
  // ... rest of implementation
}
```

**Impact:**
- Public inventory pages (`src/app/inventory/` and `src/app/page.tsx`) that call `fetchInventory()` will fail at runtime
- Any code importing from this module will fail to build

**Fix approach:**
1. Rewrite `fetchInventory()` to use Supabase client
2. Update query to use `supabase.from('vehicles')` syntax
3. Handle image relationships through Supabase joins
4. Match return type to existing `Vehicle` interface (no changes needed there)

**Priority:** CRITICAL — breaks public-facing pages

---

## Type Safety: Missing @/lib/db and @/lib/auth

**Issue:** Two critical utility modules are imported throughout the codebase but don't exist, causing TypeScript compilation errors.

**Files expected:**
- `src/lib/db.ts` - should export `prisma` instance
- `src/lib/auth.ts` - should export `auth()` function for session retrieval

**Impact:**
- 17 files have unresolvable imports
- TypeScript build cannot complete
- Type checking cannot run

**Fix approach:**
1. Remove all `src/lib/db.ts` imports from API routes
2. Replace with Supabase client imports from `src/lib/supabase/server.ts`
3. Create `src/lib/auth.ts` with Supabase-based authentication utility
4. Export a function that retrieves the current user session

**Priority:** CRITICAL — blocks type checking

---

## Passwords: No Hashing for Supabase User Creation

**Issue:** Two files try to import `bcryptjs` (removed from dependencies) to hash passwords for custom user creation.

**Files:**
- `src/app/api/admin/users/route.ts` - line 4 imports `hashSync` from `bcryptjs`
- `src/app/api/admin/users/[id]/route.ts` - line 4 imports `hashSync` from `bcryptjs`

**Impact:** User creation endpoints cannot hash passwords securely.

**Problem with the original approach:**
- Supabase Auth handles password hashing automatically
- Custom user creation with password hashing bypasses Supabase's security
- Passwords should never be hashed client-side or in custom code

**Fix approach:**
1. Remove `bcryptjs` usage entirely
2. Use Supabase Auth admin API to create users with email/password
3. Supabase handles password hashing, reset flows, and security
4. If custom metadata is needed (roles, etc.), store separately in `auth.users_metadata` or custom table

**Priority:** CRITICAL — security concern

---

## RLS Policies: Defined But Not Implemented in Code

**Issue:** Supabase schema defines comprehensive Row Level Security policies, but no code checks roles or applies them.

**Files:**
- `supabase/migrations/001_initial_schema.sql` - contains RLS policies (lines 171–207)
- API routes that will need to respect RLS once migration is applied

**RLS policies defined:**
- Public: can view available vehicles only
- Public: can submit leads (contact form)
- Authenticated: full access (admin bypass)

**Current gap:**
- API routes don't check user role before querying
- All endpoints currently fail due to missing Prisma, not RLS
- Once rewritten, these will need session verification before operations

**Fix approach:**
1. After rewriting API routes to use Supabase
2. Verify that Supabase RLS policies are enforced (they are by default)
3. API should check `auth.role()` before making admin-only requests
4. Trust Supabase RLS to prevent unauthorized data access

**Priority:** HIGH — security-critical, but automatic once APIs are rewritten

---

## Data Loss Risk: No Backup or Export of Old Data

**Issue:** If old Prisma/SQLite database exists, migrating to Supabase will lose all historical data.

**Impact:**
- Any inventory, customer, lead, or deal data in the old SQLite DB will be lost
- No record of past transactions or leads

**Current state:**
- Migration SQL is defined but empty (will create schema only)
- No data migration script exists
- Old database file location not documented

**Fix approach:**
1. Before running migration, export any existing SQLite data:
   ```bash
   sqlite3 prisma/dev.db ".dump" > backup.sql
   ```
2. Create data migration script to convert SQLite schema → Supabase
3. Test migration in staging before applying to production

**Priority:** HIGH — data preservation

---

## Env Configuration: SUPABASE_SECRET_KEY Empty

**Issue:** Environment variable `SUPABASE_SECRET_KEY` is configured but not set.

**Impact:**
- Supabase admin operations (user creation, RLS enforcement) will fail
- Admin API calls will not authenticate

**What needs to be set:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - public/anon key
- `SUPABASE_SECRET_KEY` - service role secret (for server-side admin operations)

**Fix approach:**
1. Get credentials from Supabase dashboard → Project Settings → API
2. Copy values into `.env.local`
3. Ensure `.env.local` is in `.gitignore` (should be already)

**Priority:** CRITICAL — API will not connect without these

---

## Testing: No Tests for API Routes

**Issue:** 16 API route files exist with no corresponding test files (`.test.ts` or `.spec.ts`).

**Files:** All routes in `src/app/api/admin/` and `src/app/api/leads/`

**Impact:**
- No coverage for authentication, authorization, or business logic
- Breaking changes in rewrites could go unnoticed
- RLS policies cannot be verified without tests

**Current state:**
- No test setup or test runner configured
- No mock Supabase client for testing

**Fix approach:**
1. Set up test framework (Vitest or Jest)
2. Create test files for each API route after rewriting
3. Mock Supabase responses to test queries and RLS
4. Test auth flows (login, role checks, session validation)

**Priority:** MEDIUM — add as routes are rewritten

---

## Performance: No Database Indexes Documented

**Issue:** The Supabase migration defines indexes, but no query optimization or N+1 analysis exists in code.

**Files:** `supabase/migrations/001_initial_schema.sql` (lines 144–153 define indexes)

**Current indexes:**
- `vehicles(status)` - for filtering available vehicles
- `vehicles(make, model)` - for catalog searches
- `leads(status)` - for lead filtering
- `leads(customer_id)` - for customer lead lookups
- `deals(vehicle_id, customer_id, status)` - for deal lookups

**Potential issues:**
- API routes will perform lookups without using these indexes initially
- No query logging or monitoring to verify index usage
- Unknown N+1 query patterns in refactored code

**Fix approach:**
1. After rewriting API routes, monitor query performance
2. Verify indexes are being used via Supabase analytics
3. Add indexes for any frequently-filtered columns not covered

**Priority:** LOW — optimize after migration is complete

---

## Documentation: No Migration Runbook

**Issue:** The stack migration (Prisma → Supabase) is incomplete but no documentation guides developers on how to finish it.

**Impact:**
- New team members won't know what to do
- Risk of incomplete fixes that leave code in broken state
- No checklist to verify migration completeness

**What's needed:**
- Runbook for running the migration SQL
- Checklist for rewriting each API route
- Instructions for setting up environment variables
- Testing strategy for verifying the migration

**Fix approach:**
1. Create `.planning/MIGRATION.md` documenting:
   - What was removed (Prisma, NextAuth, bcryptjs)
   - What was added (Supabase SSR, RLS)
   - Steps to complete the migration
   - Verification checklist
2. Link from README

**Priority:** MEDIUM — helpful but not blocking

