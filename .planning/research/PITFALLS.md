# Domain Pitfalls

**Domain:** Used car dealership website + admin DMS
**Researched:** 2026-03-16

## Critical Pitfalls

Mistakes that cause data corruption, security issues, or major rewrites.

### Pitfall 1: Zero API Input Validation
**What goes wrong:** The POST handler in `/api/admin/vehicles/route.ts` does `const body = await req.json()` and passes it directly to `prisma.vehicle.create({ data: body })`. Any malformed, extra, or malicious fields go straight to the database.
**Why it happens:** Moving fast without validation. "It works in testing" because the developer controls the inputs.
**Consequences:** A malformed request can crash the app (Prisma type error), corrupt data (wrong types in fields), or in the worst case allow injection via crafted JSON if Prisma has a vulnerability.
**Prevention:** Add Zod `.safeParse()` to every API route before touching Prisma. This is the single most important improvement.
**Detection:** Any API route that does `req.json()` without validation is vulnerable. All 15 routes in this project have this issue.

### Pitfall 2: Unoptimized Vehicle Images Killing Performance
**What goes wrong:** The `uploadImage()` function in `storage.ts` saves raw uploaded files. Phone photos are typically 3-8MB JPEG files at 4000x3000 resolution. A vehicle listing with 15 photos = 45-120MB of unoptimized images.
**Why it happens:** "Just save the file" is the simplest implementation.
**Consequences:** Public inventory pages load extremely slowly. Mobile users on cellular connections may not wait. SEO suffers (Core Web Vitals). Server storage fills up fast.
**Prevention:** Process images through sharp on upload: resize to max 1200px wide, convert to WebP, generate 400px thumbnails. Store both sizes.
**Detection:** Check file sizes in `public/uploads/vehicles/`. If any image exceeds 500KB, it is unoptimized.

### Pitfall 3: All Admin Pages are Client Components with useEffect Data Fetching
**What goes wrong:** Every admin page (dashboard, vehicles, leads, customers, deals) is a `"use client"` component that fetches data in `useEffect`. This means: no SSR, no SEO (not relevant for admin but indicates a pattern), a loading spinner on every navigation, and no data available until JavaScript hydrates.
**Why it happens:** Client-side fetching is familiar from SPA-era React. The developer may not have considered server components for admin pages.
**Consequences:** Every admin page shows "Loading..." for 200-500ms on every navigation. No data is available during initial render. If the API call fails, the entire page is broken.
**Prevention:** For admin list pages, consider using server components that fetch data directly (like the public inventory page already does). Use client components only for interactive parts (search, filters, modals). Alternatively, accept the current pattern but add proper loading states with Suspense.
**Detection:** Any file that starts with `"use client"` and has `useEffect(() => { fetch(...) })` in the first 20 lines.

## Moderate Pitfalls

### Pitfall 4: No Error Boundary or Global Error Handling
**What goes wrong:** API errors are caught per-component with `try/catch` and displayed as inline text. There is no global error boundary, no centralized error logging.
**Prevention:** Add a global error boundary in the admin layout. Add sonner toast notifications for operation feedback. Consider a simple error logging utility.

### Pitfall 5: Vehicle Form Re-render Performance
**What goes wrong:** The vehicle form has 25+ fields in a single `useState` object. Every keystroke calls `setForm()` which re-renders the entire form (all 25+ inputs).
**Prevention:** react-hook-form uses uncontrolled inputs by default, so each keystroke only touches the specific input -- no full form re-render. This is the primary performance reason to adopt it.

### Pitfall 6: SQLite Concurrent Write Limitations
**What goes wrong:** SQLite supports only one writer at a time. If two admin users try to save vehicles simultaneously, one write will fail or queue.
**Prevention:** For a 1-3 user DMS, this is unlikely to be a problem. But if the app grows, the architecture should be ready to swap to PostgreSQL. Prisma makes this relatively easy (change the provider in schema.prisma), but the better-sqlite3 adapter code in `db.ts` would need to change.
**Detection:** "SQLITE_BUSY" errors in production logs.

### Pitfall 7: Features Stored as JSON String
**What goes wrong:** Vehicle features are stored as `JSON.parse(v.features)` which means they are a JSON string in the database column. This is fragile -- if someone saves a plain string instead of a JSON array, `JSON.parse` throws at runtime.
**Prevention:** Add Zod validation that ensures features is either a string array or a comma-separated string that gets normalized before storage. Use a Zod transform: `z.string().transform(s => s.split(",").map(f => f.trim()).filter(Boolean))`.

## Minor Pitfalls

### Pitfall 8: No Debounced Search in Admin
**What goes wrong:** The leads page has a manual debounce with `setTimeout`. The vehicles page has no debounce at all -- typing in search triggers a form submission.
**Prevention:** Use a consistent debounced search pattern across all admin pages. nuqs has built-in debounce support for URL params.

### Pitfall 9: Inconsistent ID Fields
**What goes wrong:** Leads page references `lead._id` (MongoDB-style) while vehicles use `vehicle.id`. This suggests the leads code may have been copied from a different project and not fully adapted.
**Prevention:** Audit all pages for consistent field naming matching the Prisma schema.

### Pitfall 10: No Image Deletion Cascade
**What goes wrong:** When a vehicle is deleted, the database record is removed but the image files on disk may remain as orphans in `public/uploads/vehicles/`.
**Prevention:** Ensure the vehicle delete API route calls `deleteImage()` for all associated images before deleting the vehicle record, or add a Prisma middleware/hook.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Adding Zod schemas | Existing forms send strings for numbers (e.g., "25000" for price). Zod will reject unless you use `z.coerce.number()`. | Always use `z.coerce` for form fields that come from HTML inputs |
| react-hook-form migration | Default values must match the Zod schema exactly or validation errors appear on load | Use `zodResolver` and ensure `defaultValues` passes validation |
| @tanstack/react-table | Easy to build the table but forget server-side pagination integration | Keep the existing API pagination, pass page/sort params to the API |
| recharts | Dashboard API endpoint does not exist yet for analytics data | Need to create `/api/admin/analytics` with date-range queries |
| sharp on Vercel/hosting | sharp requires native binaries. Some hosting platforms need special configuration. | SQLite + local file storage already limits hosting to VPS/dedicated -- sharp works fine there |
| nuqs with admin pages | Admin pages are client components that manage their own state. nuqs needs to replace that state, not layer on top. | Replace `useState` for search/filter/page with nuqs `useQueryState` |

## Sources

- Direct code analysis of all API routes, admin pages, and utility files in TLC Autos
- Pitfalls based on common patterns observed in similar Next.js + Prisma projects
