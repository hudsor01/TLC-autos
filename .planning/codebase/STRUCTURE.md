# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
tlc-autos/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout (header, footer, metadata)
│   │   ├── globals.css               # Global styles
│   │   ├── (public pages)
│   │   │   ├── about/page.tsx
│   │   │   ├── financing/page.tsx
│   │   │   ├── contact/
│   │   │   │   ├── page.tsx
│   │   │   │   └── contact-form.tsx  # Form component
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx          # Server-side inventory list
│   │   │   │   ├── inventory-client.tsx # Client-side filtered view
│   │   │   │   └── [id]/page.tsx     # Vehicle detail page
│   │   ├── admin/                    # DMS (requires Supabase auth)
│   │   │   ├── layout.tsx            # Admin sidebar + header layout
│   │   │   ├── page.tsx              # Admin dashboard (KPIs, recent data)
│   │   │   ├── login/page.tsx        # Auth entry point
│   │   │   ├── vehicles/
│   │   │   │   ├── page.tsx          # Vehicle list with search/filters
│   │   │   │   ├── new/page.tsx      # Create vehicle form
│   │   │   │   └── [id]/page.tsx     # Vehicle detail/edit form
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # Customer list
│   │   │   │   ├── new/page.tsx      # Create customer
│   │   │   │   └── [id]/page.tsx     # Customer detail/edit
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx          # Leads list (website submissions + manual)
│   │   │   │   └── [id]/page.tsx     # Lead detail with followup history
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx          # Sales deals list
│   │   │   │   ├── new/page.tsx      # Create deal
│   │   │   │   └── [id]/page.tsx     # Deal detail/edit
│   │   │   ├── users/page.tsx        # DMS user management
│   │   │   └── settings/page.tsx     # Admin settings
│   │   └── api/                      # API routes (RESTful endpoints)
│   │       ├── leads/route.ts        # POST leads (public contact form endpoint)
│   │       ├── inventory/route.ts    # GET vehicles (public, may mirror /inventory)
│   │       └── admin/                # Admin CRUD endpoints (require auth via middleware)
│   │           ├── dashboard/route.ts # GET dashboard stats
│   │           ├── vehicles/
│   │           │   ├── route.ts      # GET list, POST create
│   │           │   ├── decode-vin/route.ts # VIN decoding utility
│   │           │   └── [id]/
│   │           │       ├── route.ts  # GET, PUT, DELETE vehicle
│   │           │       ├── images/route.ts # Vehicle image upload/management
│   │           │       └── costs/route.ts  # Vehicle cost items
│   │           ├── customers/
│   │           │   ├── route.ts      # GET list, POST create
│   │           │   └── [id]/route.ts # GET, PUT, DELETE customer
│   │           ├── leads/
│   │           │   ├── route.ts      # GET list, POST create
│   │           │   └── [id]/
│   │           │       ├── route.ts  # GET, PUT, DELETE lead
│   │           │       └── followups/route.ts # Lead followup history
│   │           ├── deals/
│   │           │   ├── route.ts      # GET list, POST create
│   │           │   └── [id]/route.ts # GET, PUT, DELETE deal
│   │           └── users/
│   │               ├── route.ts      # GET list, POST create user
│   │               └── [id]/route.ts # GET, PUT, DELETE user
│   ├── components/
│   │   ├── header.tsx                # Global navigation header
│   │   ├── footer.tsx                # Global footer
│   │   ├── ui/                       # shadcn/ui primitive components (reusable)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── [other UI components]
│   │   └── admin/
│   │       └── vehicle-form.tsx      # Reusable vehicle form (create/edit)
│   ├── lib/
│   │   ├── constants.ts              # Site config (SITE_NAME, NAV_LINKS, CONTACT)
│   │   ├── inventory.ts              # Data layer for vehicle queries (fetchInventory, fetchVehicleById)
│   │   ├── vin-decoder.ts            # VIN parsing/decoding utilities
│   │   ├── utils.ts                  # General utilities (cn for className merge)
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client (createBrowserClient)
│   │       ├── server.ts             # Server Supabase client with cookie handling
│   │       └── middleware.ts         # Auth middleware (updateSession, route protection)
│   └── middleware.ts                 # Next.js middleware entry point
├── supabase/
│   └── migrations/                   # Database migration files
├── public/                           # Static assets (images, favicon)
├── .planning/
│   ├── codebase/                     # GSD codebase analysis documents
│   └── research/
├── tsconfig.json                     # TypeScript config with @ alias
├── package.json                      # Dependencies, scripts
├── next.config.ts                    # Next.js config
└── tailwind.config.ts                # Tailwind CSS config
```

## Directory Purposes

**`src/app/`**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components (public and admin), route handlers
- Key distinction: `/admin/*` pages are protected by middleware, all others public

**`src/app/admin/`**
- Purpose: Dealer Management System (DMS)
- Contains: Dashboard, vehicle/customer/lead/deal management CRUD pages
- Note: Layout includes responsive sidebar navigation with active state tracking
- Auth: Protected by Supabase middleware in `src/middleware.ts`

**`src/app/api/`**
- Purpose: RESTful API endpoints for frontend and external integrations
- Contains: Route handlers returning JSON responses
- Patterns: List (GET), Create (POST), Get Detail (GET /id), Update (PUT /id), Delete (DELETE /id)
- Auth: Admin endpoints inherit Supabase session from middleware context

**`src/components/ui/`**
- Purpose: Shadcn/ui component library (design system)
- Contains: Primitive reusable components with Tailwind styling
- Usage: Imported in all pages and custom components
- Management: Components maintained as individual .tsx files, no barrel export file

**`src/components/admin/`**
- Purpose: Domain-specific admin components
- Contains: Reusable form components (e.g., vehicle-form.tsx)
- Note: Currently only vehicle-form.tsx, others may be inlined in page components

**`src/lib/supabase/`**
- Purpose: Supabase authentication and session management
- Contents:
  - `client.ts`: Browser-side Supabase client for SSR pattern
  - `server.ts`: Server-side Supabase client with Next.js cookie handling
  - `middleware.ts`: Authentication middleware that runs on all `/admin` requests

**`src/lib/`**
- Purpose: Shared utilities and data layers
- Key exports:
  - `inventory.ts`: Vehicle data fetching and transformation for public pages
  - `constants.ts`: Application-wide constants (site name, contact info, navigation)
  - `vin-decoder.ts`: VIN parsing utilities
  - `utils.ts`: Lightweight utilities (class name merging)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Home page, rendered at `/`
- `src/app/admin/page.tsx`: Admin dashboard, rendered at `/admin` (auth required)
- `src/app/admin/login/page.tsx`: Login page, rendered at `/admin/login` (public)
- `src/middleware.ts`: Middleware that protects `/admin/*` routes

**Configuration:**
- `src/app/layout.tsx`: Root layout (header, footer, metadata)
- `src/lib/constants.ts`: Site configuration (company name, contact, nav links)
- `tsconfig.json`: TypeScript path aliases (`@/*` → `./src/*`)

**Core Logic:**
- `src/lib/inventory.ts`: Vehicle data layer (queries and transformations)
- `src/lib/supabase/middleware.ts`: Session validation and route guards
- `src/app/api/admin/vehicles/route.ts`: Vehicle CRUD operations (example of admin API pattern)

**Testing:**
- Not detected; no test files found in codebase

## Naming Conventions

**Files:**
- Page components: `page.tsx` (Next.js convention)
- Route handlers: `route.ts` (Next.js convention)
- Layout components: `layout.tsx` (Next.js convention)
- Regular components: kebab-case with `.tsx` extension (e.g., `vehicle-form.tsx`, `contact-form.tsx`)
- Library files: lowercase, descriptive names (e.g., `inventory.ts`, `vin-decoder.ts`)

**Directories:**
- Dynamic routes: Square brackets for segments (e.g., `[id]` for vehicle ID)
- Feature grouping: Feature names in lowercase (vehicles, customers, leads, deals)
- Shared code: `lib/`, `components/`

**Components:**
- React components: PascalCase (e.g., `VehicleForm`, `InventoryClient`, `StatCard`)
- Type definitions: PascalCase (e.g., `Vehicle`, `Customer`, `DashboardData`)

## Where to Add New Code

**New Admin Feature (e.g., Service Records):**
- Page: `src/app/admin/service-records/page.tsx`
- Create form: `src/app/admin/service-records/new/page.tsx`
- Detail/edit: `src/app/admin/service-records/[id]/page.tsx`
- API list/create: `src/app/api/admin/service-records/route.ts`
- API detail/edit/delete: `src/app/api/admin/service-records/[id]/route.ts`
- Add nav item to sidebar: `src/app/admin/layout.tsx` (NAV_ITEMS array)

**New Public Page (e.g., Blog):**
- Page: `src/app/blog/page.tsx`
- Server-side data: Fetch from Prisma or API in page.tsx or create lib function
- Add nav link: `src/lib/constants.ts` (NAV_LINKS array)
- Styling: Use existing Tailwind classes and shadcn components from `src/components/ui/`

**New Utility/Helper:**
- Shared across multiple files: `src/lib/{feature-name}.ts`
- Single use: Inline in the component/page file
- Example: New vehicle query pattern → add to `src/lib/inventory.ts`

**Database Schema Changes:**
- Create migration file in `supabase/migrations/`
- Update Prisma schema (location: `@/lib/db`, not in repo)
- Run migration against dev/prod database

**UI Component:**
- Reusable across pages: `src/components/ui/{component-name}.tsx` (for primitives) or `src/components/{component-name}.tsx` (for domain-specific)
- Single-use in a page: Keep inline in page.tsx or move to page's own folder if complex

## Special Directories

**`supabase/migrations/`**
- Purpose: Database schema version control
- Generated: Via Supabase CLI or manual SQL
- Committed: Yes, part of version control

**`.next/`**
- Purpose: Next.js build output (ignored in git)
- Generated: Yes, via `npm run build`
- Committed: No

**`public/`**
- Purpose: Static assets (images, icons, favicon)
- Served: At root URL (e.g., `/logo.png`)
- Committed: Yes

**`node_modules/`**
- Purpose: NPM dependencies
- Committed: No (managed via package-lock.json)

**`.planning/codebase/`**
- Purpose: GSD (Guided Semantic Development) analysis documents
- Generated: Via `/gsd:map-codebase` command
- Committed: Yes, for team reference

---

*Structure analysis: 2026-03-17*
