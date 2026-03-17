# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**VIN Decoding:**
- Internal API endpoint at `POST /api/admin/vehicles/decode-vin`
  - Implementation: `src/app/api/admin/vehicles/[id]/route.ts`
  - Purpose: Extract vehicle specs from VIN
  - Client: `src/lib/vin-decoder.ts`
  - No external VIN decoding service (local implementation)

**Contact Lead Submission:**
- Internal API endpoint at `POST /api/leads`
  - Implementation: `src/app/api/leads/route.ts`
  - Purpose: Accept contact form submissions from website
  - No external CRM or email service integration (broken Prisma reference)
  - Currently references non-existent `@/lib/db` (Prisma)

## Data Storage

**Primary Database:**
- Supabase PostgreSQL (hosted)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (env var)
  - Client: `@supabase/supabase-js` + `@supabase/ssr`
  - Server client: `src/lib/supabase/server.ts`
  - Browser client: `src/lib/supabase/client.ts`
  - Tables:
    - `vehicles` - Inventory management
    - `customers` - Customer records
    - `leads` - Contact form submissions
    - `deals` - Sales transactions
    - `follow_ups` - Lead follow-up tracking
    - `vehicle_images` - Image metadata
    - `vehicle_costs` - Purchase cost breakdown

**File Storage:**
- Supabase Storage (object storage)
  - Bucket: `vehicle-images`
  - Purpose: Store vehicle listing photos
  - Access: Public read (available vehicles), admin upload
  - RLS policies: `src/lib/supabase/` references

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (managed authentication service)
  - Implementation: Cookie-based with `@supabase/ssr`
  - Key files:
    - `src/lib/supabase/server.ts` - Server-side client
    - `src/lib/supabase/client.ts` - Browser client
    - `src/lib/supabase/middleware.ts` - Auth middleware
    - `src/middleware.ts` - Next.js middleware integration
  - Authentication flow:
    - Uses Supabase managed sessions
    - Cookies for session persistence
    - Enforced via middleware on `/admin/*` routes
  - Admin protection:
    - Unauthenticated users redirected to `/admin/login`
    - Session validation on every request to admin pages

**Authorization:**
- Supabase Row-Level Security (RLS)
  - Policies defined in `supabase/migrations/001_initial_schema.sql`
  - Public policies:
    - Can view available vehicles and images
    - Can submit leads via contact form
  - Admin policies:
    - Full access to all tables when authenticated
    - Can upload/delete vehicle images

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, DataDog, etc.)

**Logging:**
- console methods (basic)
- No structured logging service

**Analytics:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Likely Vercel (standard for Next.js, not explicitly configured)
- Requires Supabase cloud instance

**CI Pipeline:**
- None detected (no GitHub Actions, etc.)

**Version Control:**
- Git (`.git/` directory present)

## Environment Configuration

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., `https://[project].supabase.co`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase anon key

**Secrets Location:**
- `.env.local` - Local development (contains actual values, NOT committed)
- `.env.example` - Template with placeholder values (committed to git)
- Vercel deployment: Configure in project settings

**Configuration Files:**
- `.env.example` - Shows required env vars structure
- Runtime access via `process.env.*`

## Webhooks & Callbacks

**Incoming:**
- Contact form POST: `POST /api/leads` from `src/app/contact/contact-form.tsx`
  - Accepted from public website
  - No signature verification detected

**Outgoing:**
- None detected
- No email notifications
- No webhook callbacks to external services

## External Libraries (No Active Integration)

**Installed but Unused:**
- `@tanstack/react-form` (1.28.5) - Forms currently use React state
- `@tanstack/react-table` (8.21.3) - No data tables in use
- `zod` (4.3.6) - No schema validation in forms
- `recharts` (3.8.0) - No dashboards/charts
- `nuqs` (2.8.9) - No URL query state usage
- `sonner` (2.0.7) - Notifications use manual UI instead

These are available for future feature implementation.

## Data Flow Patterns

**Vehicle Image Upload:**
1. Admin uploads via `/admin/vehicles/[id]`
2. Form submission to `POST /api/admin/vehicles/[id]/images`
3. Sharp processes/optimizes image
4. Stored in Supabase Storage (`vehicle-images` bucket)
5. Image metadata saved to `vehicle_images` table
6. RLS policy controls public/admin access

**Lead Submission:**
1. Customer fills contact form at `/contact`
2. Form submitted to `POST /api/leads`
3. Lead record created in `leads` table
4. No downstream action (no email/notification)

**Admin Data Access:**
1. User logs in at `/admin/login`
2. Supabase auth sets secure cookie
3. Middleware validates session on protected routes
4. Supabase RLS grants full data access when authenticated
5. API routes query tables as authenticated user

## Critical Dependencies Status

**Working:**
- Supabase auth/db/storage integration (`@supabase/ssr`, `@supabase/supabase-js`)
- Next.js server/client components
- Image processing (Sharp)

**Broken (Requires Migration):**
- All API routes still reference `@/lib/db` (Prisma)
- `src/lib/db.ts` does NOT exist
- `prisma/` schema does NOT exist
- These routes need rewriting to use Supabase client instead:
  - `src/app/api/leads/route.ts`
  - `src/app/api/admin/customers/route.ts`
  - `src/app/api/admin/leads/route.ts`
  - `src/app/api/admin/deals/route.ts`
  - `src/app/api/admin/vehicles/route.ts`
  - And all `[id]` route variants

---

*Integration audit: 2026-03-17*
