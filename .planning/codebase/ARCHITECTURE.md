# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Next.js 16 App Router with dual-purpose full-stack application

**Key Characteristics:**
- Public-facing car dealership website and authenticated admin DMS (Dealer Management System)
- Supabase authentication via Next.js middleware for admin route protection
- Prisma ORM for database operations with SQLite/PostgreSQL backend
- Client-server separation using API routes for data operations
- Server-side data fetching for public pages, client-side for admin dashboard
- RESTful API routes under `/api/` with CRUD operations

## Layers

**Public Pages Layer:**
- Purpose: Customer-facing content and inventory browsing
- Location: `src/app/(public)/` — home, inventory, about, financing, contact pages
- Contains: Server-side rendered pages, metadata configuration, form submissions
- Depends on: `@/lib/inventory` for data fetching, Supabase client for leads
- Used by: End users visiting the dealership website

**Admin Dashboard Layer:**
- Purpose: Dealership management system behind authentication
- Location: `src/app/admin/`
- Contains: Dashboard, inventory management, customer/lead/deal management, user settings
- Depends on: API routes, Supabase auth via middleware
- Used by: Dealership staff and admins
- Note: All routes protected by middleware except `/admin/login`

**API Routes Layer:**
- Purpose: RESTful endpoints for data operations
- Location: `src/app/api/`
- Contains: Public endpoints (`/api/leads`, `/api/inventory`) and admin endpoints (`/api/admin/*`)
- Depends on: Prisma database client at `@/lib/db`
- Used by: Frontend pages and client components via fetch

**Authentication Layer:**
- Purpose: Session management and route protection
- Location: `src/middleware.ts` → `src/lib/supabase/middleware.ts`
- Contains: Supabase server client initialization, admin route guards
- Depends on: `@supabase/ssr` for session cookies
- Used by: All admin routes, API endpoints (auth state available via request context)

**Database Layer:**
- Purpose: Data persistence and access
- Location: Prisma client imported from `@/lib/db` (not co-located in repo)
- Contains: Database schema and ORM queries
- Depends on: SQLite (development) or PostgreSQL (production)
- Used by: All API routes and server-side functions

**UI Component Library:**
- Purpose: Reusable design system components
- Location: `src/components/ui/` — shadcn/ui components (button, card, table, dialog, etc.)
- Contains: Primitive UI components with Tailwind styling
- Depends on: React, class-variance-authority, clsx
- Used by: All pages and admin panels

**Shared Utilities:**
- Purpose: Cross-cutting concerns and data transformations
- Location: `src/lib/`
- Contains: Inventory data layer, VIN decoder, constants, utilities
- Examples: `@/lib/inventory.ts` (vehicle data transformation), `@/lib/constants.ts` (site config)

## Data Flow

**Public Vehicle Browsing:**

1. User visits `/inventory` page
2. Server-side `src/app/inventory/page.tsx` calls `fetchInventory()` from `@/lib/inventory`
3. `fetchInventory()` queries Prisma for vehicles with status="available"
4. Data transformed to public `Vehicle` type and passed to client component `InventoryClient`
5. Client renders filtered/sorted results with client-side form state (nuqs for URL params)

**Admin Dashboard:**

1. Middleware (`src/middleware.ts`) intercepts request to `/admin/*`
2. `updateSession()` in `src/lib/supabase/middleware.ts` validates Supabase auth
3. If no user session, redirects to `/admin/login`
4. If authenticated, renders admin layout with sidebar navigation
5. Dashboard page fetches from `/api/admin/dashboard` via client-side useEffect
6. API route queries Prisma for stats and recent items, returns JSON
7. Dashboard renders stat cards and recent data tables

**Admin CRUD Operations:**

1. User submits form (e.g., new vehicle via `/admin/vehicles/new`)
2. Form data POSTs to `/api/admin/vehicles` (or specific resource endpoint)
3. API route validates input, performs database operation via Prisma
4. Response returned as JSON with 201 (created) or error status
5. Client updates local state and navigates to detail page

**Public Lead Submission:**

1. User fills contact form on `/contact` page (public, no auth)
2. Form POSTs to `/api/leads` endpoint
3. API creates lead record via Prisma with source="website" and status="new"
4. Returns 201 with success message
5. Lead appears in admin `/admin/leads` after refresh

**State Management:**

- Public pages: Server-side rendering with metadata. Client uses React hooks for form state and URL params (nuqs).
- Admin pages: Client-side rendering ("use client"). useState for local state, useEffect to fetch from API routes. No global state library (Redux, Context).
- URL params: nuqs library for query string serialization (search, pagination, filters)

## Key Abstractions

**Vehicle (Public Interface):**
- Purpose: Transforms database schema to public-facing data structure
- Location: `src/lib/inventory.ts` (type definition and transformers)
- Pattern: Mapper function transforms Prisma vehicle model to public Vehicle interface
- Example: `sellingPrice` in DB → `price` in public API, image URLs extracted from related records

**Admin API Patterns:**

- **List Endpoints** (`GET /api/admin/{resource}`): Pagination with skip/take, optional search filter via query params, returns `{ items, pagination }` structure
- **Detail Endpoints** (`GET /api/admin/{resource}/{id}`): Includes related records (images, costItems, deals, etc.), returns single item or 404
- **Create Endpoints** (`POST /api/admin/{resource}`): Accepts JSON body, auto-generates IDs/defaults (e.g., stock numbers), returns created item with 201
- **Update Endpoints** (`PUT /api/admin/{resource}/{id}`): Recalculates derived fields (e.g., totalCost), handles status transitions (e.g., marking sold), returns updated item
- **Delete Endpoints** (`DELETE /api/admin/{resource}/{id}`): Deletes record, returns `{ success: true }`

**Filter/Search Pattern:**
- Query params: `?search=query&status=available&page=1&limit=20`
- Prisma where clause built conditionally: `OR` for multi-field search, direct field matching for filters
- Example in `src/app/api/admin/vehicles/route.ts`: Searches make/model/stockNumber/VIN on "search", filters by status

## Entry Points

**Public Site Entry:**
- Location: `src/app/page.tsx` (home page)
- Triggers: User visits `/` or public routes
- Responsibilities: Render homepage with nav, featured vehicles, call-to-action

**Admin Entry:**
- Location: `src/app/admin/page.tsx` (dashboard)
- Triggers: Authenticated user visits `/admin`
- Responsibilities: Display KPIs (vehicle counts, customer counts, leads), recent activity tables, quick action buttons

**Auth Middleware:**
- Location: `src/middleware.ts` + `src/lib/supabase/middleware.ts`
- Triggers: Runs on every request matching `/admin/:path*`
- Responsibilities: Validate Supabase session, redirect to login if missing, persist session cookies

**API Entry Points:**
- Public: `POST /api/leads` (contact form submissions)
- Public: `GET /api/inventory` (currently mirrors `/inventory` page server data, may be unused)
- Admin: `GET /api/admin/dashboard` (stats and recent items)
- Admin: CRUD endpoints for vehicles, customers, leads, deals, users under `/api/admin/{resource}`

## Error Handling

**Strategy:** Try-catch in API routes with NextResponse.json error responses; client-side error state in useState; no global error boundary documented.

**Patterns:**

- **API Routes:** Try-catch wrapping Prisma operations, return `{ error: "message" }` with appropriate status code (404 for not found, 400 for bad input, 500 for server errors)
  - Example: `src/app/api/admin/vehicles/[id]/route.ts` returns 404 if vehicle not found
- **Client Components:** Try-catch around fetch calls, set error state, display error message in UI
  - Example: `src/app/admin/customers/page.tsx` catches fetch errors and displays "Failed to fetch customers"
- **Validation:** Input truncation/coercion (string slicing, parseInt)
  - Example: `src/app/api/leads/route.ts` slices firstName to 100 chars, coerces to string

## Cross-Cutting Concerns

**Logging:** Not configured. Console logs likely available in server logs and browser dev tools.

**Validation:** Form-level via React Form (TanStack React Form) and Zod schemas (imported in package.json but usage not fully traced). API-level via input coercion and Prisma schema constraints.

**Authentication:** Supabase session cookies managed by `@supabase/ssr`. Middleware handles admin route protection. Client-side: `next-auth` imported in login page but implementation details unclear (may be legacy or incomplete).

**CORS:** Not explicitly configured; API routes are same-origin only (no external fetch headers needed).

**Pagination:** Skip-take pattern in Prisma queries, calculation on client (skip = (page - 1) * limit). Total count queried separately for pagination metadata.

**File Uploads/Images:** Sharp library included in dependencies for image processing. Vehicle images stored in database with URL references, managed via `/api/admin/vehicles/[id]/images` endpoint (not fully reviewed).

---

*Architecture analysis: 2026-03-17*
