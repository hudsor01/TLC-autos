# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- TypeScript 5.x - All source code, strict mode enabled (`src/**/*.ts`, `src/**/*.tsx`)

**Supplementary:**
- JavaScript - ESLint config, PostCSS config (`.mjs` files)
- SQL - Supabase schema and migrations (`supabase/migrations/`)

## Runtime & Environment

**Environment:**
- Node.js (version from `.node-version` or inferred from Next.js 16)
- Bun - Package manager (see `bun.lock` presence and `db:seed` script)

**Package Manager:**
- Bun
- Lockfile: `bun.lock` (present)

## Frameworks

**Core Web Framework:**
- Next.js 16.1.6 - Full-stack React framework
  - App Router (using `src/app/` directory)
  - Server Components and Client Components mixed
  - API Routes at `src/app/api/`

**UI Framework:**
- React 19.2.4 - Core UI library
- React DOM 19.2.4 - DOM rendering

**Styling:**
- Tailwind CSS v4 - Utility-first CSS framework
  - Config: `tailwindcss.config.ts` (not visible, using defaults)
  - PostCSS integration: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
  - Global styles: `src/app/globals.css`

**Component Libraries:**
- Shadcn/UI (implied) - UI components from `src/components/ui/`
  - Custom built components using Tailwind + Radix UI primitives
  - Button, Input, Select, Textarea, Label, Dialog, etc.

**Styling Utilities:**
- Tailwind Merge (3.5.0) - Merge conflicting Tailwind classes
- Class Variance Authority (0.7.1) - Component variant patterns
- clsx (2.1.1) - Conditional class names

**Form & Data:**
- @tanstack/react-form (1.28.5) - Form state management
  - Installed but NOT currently in use in forms
  - Vehicle and contact forms use plain React state instead

- @tanstack/react-table (8.21.3) - Data table component library
  - Installed but usage not detected in codebase

- Zod (4.3.6) - TypeScript-first schema validation
  - Installed but not currently in use for form validation

**Charting & Visualization:**
- Recharts (3.8.0) - React charting library
  - Installed but usage not detected in current pages

**Routing & Navigation:**
- Nuqs (2.8.9) - Next.js URL query state management
  - Installed but not detected in current usage

**Notifications & Feedback:**
- Sonner (2.0.7) - Toast notification library
  - Installed but not currently in use; forms use manual success states

**Image Processing:**
- Sharp (0.34.5) - Image processing and transformation
  - Used for vehicle image handling in `src/app/api/admin/vehicles/[id]/images/route.ts`
  - Likely for thumbnail generation and format conversion

**Icons:**
- Lucide React (0.577.0) - Icon library
  - Installed for UI icons

## Authentication & Authorization

**Provider:**
- Supabase Auth - Managed authentication service
  - Client library: `@supabase/supabase-js` (2.99.2)
  - SSR utilities: `@supabase/ssr` (0.9.0)
  - Implementation: Cookie-based auth with `getAll`/`setAll` pattern (no deprecated `get`/`set`/`remove`)
  - Server client: `src/lib/supabase/server.ts`
  - Browser client: `src/lib/supabase/client.ts`
  - Middleware: `src/lib/supabase/middleware.ts` (protects `/admin/*` routes)

## Database

**Primary Database:**
- PostgreSQL (via Supabase)
  - Hosted on Supabase platform
  - Migration-based schema: `supabase/migrations/001_initial_schema.sql`
  - Tables: vehicles, customers, leads, deals, follow_ups, vehicle_images, vehicle_costs
  - Row-Level Security (RLS) policies enabled
  - Auto-update triggers for timestamps

**Storage:**
- Supabase Storage - Object storage for vehicle images
  - Bucket: `vehicle-images` (public read access)
  - RLS policies for authenticated admin upload/delete

## Configuration

**TypeScript Configuration:**
- `tsconfig.json`
  - Strict mode enabled
  - Target: ES2017
  - Path alias: `@/*` → `./src/*`
  - Incremental compilation enabled

**Build Configuration:**
- `next.config.ts` - Minimal Next.js config (default settings)

**CSS Configuration:**
- `postcss.config.mjs` - PostCSS with Tailwind CSS v4 plugin

**Linting & Code Quality:**
- ESLint (^10) - JavaScript/TypeScript linting
  - Config: `eslint.config.mjs` (flat config format)
  - Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`

**Pre-commit Hooks:**
- Lefthook (2.1.4) - Git hooks manager
  - Installed via `postinstall` script
  - Config file: `.lefthook.yml` (not visible)

**Environment Variables:**
- `.env.local` - Local environment secrets (runtime)
- `.env.example` - Template for required env vars (committed to git)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase anon key (public)

**Type Definitions:**
- `@types/node` (^25)
- `@types/react` (^19)
- `@types/react-dom` (^19)

## Scripts

**Development:**
```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database (uses Bun to run scripts/seed.ts)
```

**Project Metadata:**
- Name: `tlc-autos`
- Version: 0.1.0
- Private: true

## Platform Requirements

**Development:**
- Node.js with Bun package manager
- TypeScript 5
- Supabase project (cloud or self-hosted)

**Production:**
- Node.js LTS
- Supabase instance (required for auth, database, storage)
- Environment variables for Supabase URL and key

**Deployment Target:**
- Vercel (implied for Next.js, not explicitly configured)
- Requires Supabase cloud instance for database/auth/storage

---

*Stack analysis: 2026-03-17*
