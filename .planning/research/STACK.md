# Technology Stack

**Project:** TLC Autos
**Researched:** 2026-03-16

## Current Stack (Already Installed)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Framework |
| React | 19.2.4 | UI library |
| Prisma | 7.5 | ORM (SQLite via better-sqlite3) |
| Tailwind CSS | 4 | Styling |
| NextAuth | 5.0.0-beta.30 | Authentication |
| lucide-react | 0.577.0 | Icons |
| CVA + clsx + tailwind-merge | latest | Component variants (shadcn pattern) |

## Recommended Additions

### Validation (CRITICAL)

| Technology | Purpose | Why |
|------------|---------|-----|
| zod | Schema validation | The project has ZERO validation. API routes accept raw `req.json()` and pass it directly to Prisma. Zod provides runtime type checking, coercion (string-to-number for form fields), and generates TypeScript types from schemas. Used by every major Next.js project. Works on both client and server. |

**Confidence:** HIGH -- Zod is the de facto standard for TypeScript validation. No known React 19/Next.js 16 incompatibilities.

### Form Handling (CRITICAL)

| Technology | Purpose | Why |
|------------|---------|-----|
| react-hook-form | Form state management | The vehicle form (and all admin forms) use manual `useState` + `handleChange` for every field -- 30+ fields managed by a single `setForm` call with no validation, no dirty tracking, no field-level errors. react-hook-form eliminates all that boilerplate with uncontrolled inputs (better performance), integrates with Zod via `@hookform/resolvers`, and supports React 19. |
| @hookform/resolvers | Zod integration for react-hook-form | Bridges react-hook-form and Zod so form validation uses the same schemas as API validation. |

**Confidence:** HIGH -- react-hook-form v7+ has React 19 support. The `@hookform/resolvers` package is maintained by the same team.

### Toast Notifications (HIGH IMPACT)

| Technology | Purpose | Why |
|------------|---------|-----|
| sonner | Toast notifications | The project has no user feedback system. Successful saves, deletes, and errors all either set a local `error` state or silently succeed. Sonner is a single-component toast library (just add `<Toaster />` to layout), works with server actions, supports promise toasts (loading/success/error), and is the toast library used by shadcn/ui. Tiny bundle (~3KB). |

**Confidence:** HIGH -- Sonner is specifically designed for Next.js/React and is the shadcn/ui recommendation.

### Data Tables (HIGH IMPACT)

| Technology | Purpose | Why |
|------------|---------|-----|
| @tanstack/react-table | Headless data table | The admin has 4+ list pages (vehicles, customers, leads, deals) all using hand-rolled `<Table>` markup with no sorting, no column resizing, no column visibility toggles, no CSV export. TanStack Table provides all of this headlessly (no UI opinions -- works perfectly with the existing shadcn/ui Table components). Supports server-side pagination which the project already does via API. |

**Confidence:** MEDIUM -- TanStack Table v8 is stable and works with React 19. v9 may or may not be released yet. Use v8 if v9 is not available.

### Charts (HIGH IMPACT for DMS)

| Technology | Purpose | Why |
|------------|---------|-----|
| recharts | Dashboard charts | The admin dashboard shows stat cards but has zero visual analytics. A car dealership DMS needs: inventory age distribution, sales over time, lead conversion funnel, revenue trends. Recharts is React-native, composable, works with SSR, and is the charting library used by shadcn/ui's chart components. |

**Confidence:** MEDIUM -- Recharts v2 is well-established. Verify React 19 peer dependency status.

### Image Optimization (HIGH IMPACT)

| Technology | Purpose | Why |
|------------|---------|-----|
| sharp | Server-side image processing | The project saves uploaded vehicle images as raw files with no optimization -- a phone photo can be 5-10MB. Sharp enables automatic resizing, WebP/AVIF conversion, and thumbnail generation at upload time. Next.js also uses sharp as its image optimization backend (auto-detected when installed). |

**Confidence:** HIGH -- sharp is the official Next.js image optimization dependency. Native binary, but well-supported.

### URL State Management (MEDIUM IMPACT)

| Technology | Purpose | Why |
|------------|---------|-----|
| nuqs | Type-safe URL search params | The inventory page filters and admin list pages use local `useState` for search/filter/pagination. This means filters reset on refresh and URLs are not shareable. nuqs syncs state to URL search params with type safety, supports Next.js App Router, and eliminates the manual URLSearchParams building seen throughout the admin pages. |

**Confidence:** MEDIUM -- nuqs is designed specifically for Next.js App Router. Verify compatibility with Next.js 16 (was built for 14/15).

### Animation (LOWER PRIORITY)

| Technology | Purpose | Why |
|------------|---------|-----|
| motion | Page transitions, UI animations | The site has zero animation -- page loads feel abrupt, modals snap open, cards appear instantly. Motion (the framer-motion rebrand) provides layout animations, enter/exit transitions, and gesture support. Use sparingly: inventory card hover effects, page transitions, modal animations. |

**Confidence:** MEDIUM -- Motion/framer-motion has been adapting to React 19. Client components only (add "use client"). Verify latest API.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Validation | Zod | Valibot | Zod has 10x the ecosystem (hookform resolvers, tRPC, etc.). Valibot is smaller but less integrated. |
| Forms | react-hook-form | Conform | Conform is server-action-first, but this project uses API routes. RHF is more mature and versatile. |
| Tables | @tanstack/react-table | AG Grid | AG Grid is enterprise-grade overkill for a small DMS. TanStack is headless and free. |
| Charts | Recharts | Chart.js / Nivo | Recharts is React-native and composable. Chart.js needs a wrapper. Nivo is heavier. |
| Toasts | Sonner | react-hot-toast | Sonner is newer, supports promise pattern, better default styling, shadcn/ui recommended. |
| Animation | Motion | react-spring | Motion has better DX for common cases (layout animations, exit animations). |
| URL state | nuqs | Manual URLSearchParams | nuqs eliminates 20+ lines of manual param parsing per page and adds type safety. |

## Installation

```bash
# Critical (add first)
npm install zod react-hook-form @hookform/resolvers sonner

# High impact (add second)
npm install @tanstack/react-table recharts sharp

# Medium impact (add third)
npm install nuqs motion
```

## NOT Recommended

| Package | Why Skip |
|---------|----------|
| @tanstack/react-query | The project uses server components for public pages and simple fetch for admin. Adding a query cache layer is overkill for a small DMS with 1-2 concurrent users. The existing fetch + revalidation pattern is sufficient. |
| tRPC | Adds complexity for a project that already has working REST API routes. The team is one person. |
| Zustand/Jotai | No complex cross-component state. React context + URL state (nuqs) covers all needs. |
| next-intl | Single-language site (English, North Texas market). |
| Prisma Accelerate | SQLite is local, no network latency to optimize. |

## Sources

- Direct analysis of /Users/richard/Developer/tlc-autos codebase
- Package compatibility based on training data (May 2025 cutoff) -- MEDIUM confidence on exact version numbers
