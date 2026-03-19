# Architecture Patterns

**Domain:** Public site UI redesign — light-only premium theme for used car dealership
**Researched:** 2026-03-18
**Confidence:** HIGH — based on direct codebase analysis, no external dependencies

## Current Architecture Overview

The site uses Next.js App Router with a clean separation:

```
src/app/layout.tsx          <- Root layout: Header + Footer wrap ALL routes
  src/app/(public pages)    <- 6 pages rendered inside root layout
  src/app/admin/layout.tsx  <- Admin layout overrides with sidebar (hides Header/Footer via its own full-screen flex)
```

**Key structural fact:** The admin layout (`src/app/admin/layout.tsx`) creates its own `h-screen` flex container, which effectively hides the root layout's Header/Footer visually. The admin sidebar uses `bg-primary` with `text-primary-foreground` — these tokens must remain stable because the admin is NOT being redesigned.

## Dark Mode Removal Strategy

### What Exists

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in `globals.css` (lines 127-169). It overrides every CSS variable: surfaces, brand colors, borders, shadows. There is no class-based toggle — it is purely OS-preference driven.

### Removal Plan

**Step 1: Delete the dark mode media query block.** Remove lines 122-169 of `globals.css` (the entire `@media (prefers-color-scheme: dark) { :root { ... } }` block). This is the only location where dark mode tokens are defined.

**Step 2: No other files reference dark mode.** The codebase uses semantic tokens (`bg-primary`, `text-foreground`, `bg-card`, etc.) everywhere. No component has `dark:` Tailwind prefixes. No theme toggle component exists. Removing the CSS block is a complete, clean removal.

**Step 3: Preserve intentionally-dark surfaces.** `--hero` and `--sidebar` tokens are dark navy backgrounds by design — they stay as-is in `:root`. The admin sidebar uses `bg-primary`/`text-primary-foreground` which maps to navy/white — stable.

**Step 4: Add `color-scheme: light` to html element.** Prevents browser chrome (scrollbars, form controls) from flipping to dark mode on OS dark preference. Add in `globals.css` on the `html` rule or as a meta tag in layout.

**Step 5: Evolve light mode tokens.** With dark mode gone, the `:root` block becomes the sole token source. Adjust values to be optimized purely for light backgrounds (currently they already are well-designed — changes will be refinements, not overhauls).

**Risk: NONE.** No component logic depends on dark mode. No conditional rendering. No theme context. This is a CSS-only change.

### Admin Impact Assessment

The admin layout uses these token-based classes:
- Sidebar: `bg-primary text-primary-foreground` (navy background, white text)
- Sidebar border: `border-primary-foreground/20`
- Content area: `bg-muted/30`, `bg-background`
- Header: `border-border bg-background`

All of these resolve through the same `:root` CSS variables. As long as `--primary`, `--primary-foreground`, `--muted`, `--background`, and `--border` remain stable (or improve), the admin is unaffected. The redesign should preserve these semantic meanings even if exact hex values shift slightly.

## Component Architecture for Redesign

### Components That Need Modification (Existing)

| Component | File | What Changes | Why |
|-----------|------|-------------|-----|
| Header | `src/components/header.tsx` | Visual redesign — refined styling, smoother mobile menu with animation | Premium feel, currently uses hard show/hide for mobile |
| Footer | `src/components/footer.tsx` | Visual redesign — refined typography, spacing, possibly layout adjustment | Match new design language |
| ImageGallery | `src/app/inventory/[id]/image-gallery.tsx` | Gallery-first layout with larger hero image, improved lightbox transitions | Current is functional but basic |
| VehicleCard | `src/app/inventory/inventory-client.tsx` (inline) | Extract to own file, redesign card with hover effects, better image treatment | Currently defined inline (~70 lines inside inventory-client), needs to be a standalone component |
| ContactForm | `src/app/contact/contact-form.tsx` | Visual polish only — refined spacing, input styling, success state | Premium form aesthetic |

### New Components Needed

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| SectionHeader | `src/components/ui/section-header.tsx` | Reusable caption + headline + description pattern (currently copy-pasted across 8+ page sections) | Low |
| PageHero | `src/components/page-hero.tsx` | Replaces the identical `bg-primary py-12` header block on inventory, contact, about, financing pages | Low |
| VehicleCard | `src/components/vehicle-card.tsx` | Extracted from inventory-client.tsx — standalone, importable from homepage teasers too | Low |
| AnimatedSection | `src/components/animated-section.tsx` | Scroll-reveal wrapper using IntersectionObserver + CSS transitions for subtle entrance effects | Medium |

### Components That Stay Unchanged

| Component | Why |
|-----------|-----|
| All `src/components/admin/*` | Admin not being redesigned |
| All `src/components/dashboard/*` | Admin dashboard charts not in scope |
| `src/components/ui/button.tsx` | shadcn primitive; styling comes from CVA variants + CSS vars |
| `src/components/ui/card.tsx` | shadcn primitive; inherits from tokens |
| `src/components/ui/skeleton.tsx` | Loading state primitive |
| All other `src/components/ui/*` | shadcn primitives styled by tokens — all benefit automatically from token evolution |

## Recommended Architecture

### Component Boundaries

```
src/components/
  header.tsx              <- MODIFY: premium nav, animated mobile menu
  footer.tsx              <- MODIFY: refined layout and typography
  page-hero.tsx           <- NEW: shared premium hero banner for subpages
  vehicle-card.tsx        <- NEW: extracted from inventory-client
  animated-section.tsx    <- NEW: scroll-reveal wrapper
  ui/
    section-header.tsx    <- NEW: caption + headline + body pattern
    button.tsx            <- Possibly add "premium" variant or refine existing
    (all others unchanged)
```

### Page Restructuring

Each page gets redesigned in-place. No route changes. No layout changes. No new routes.

```
src/app/
  page.tsx                <- REWRITE: split-layout hero, use extracted components, remove hardcoded hex colors
  inventory/
    page.tsx              <- MINOR: swap to PageHero, adjust skeleton grid
    inventory-client.tsx  <- MODERATE: use extracted VehicleCard, refine filter bar UI
    [id]/
      page.tsx            <- MODERATE: gallery-first layout, refined sidebar card
      image-gallery.tsx   <- MODERATE: larger hero image, smoother lightbox transitions
  contact/
    page.tsx              <- MODERATE: new layout with PageHero, refined info card grid
    contact-form.tsx      <- LIGHT: visual polish only, keep existing Zod validation
  about/
    page.tsx              <- REWRITE: brand story layout, refined values section
  financing/
    page.tsx              <- MODERATE: refined step cards, better CTA sections
  globals.css             <- MODIFY: remove dark mode block, evolve tokens, add animation utilities
  layout.tsx              <- MINIMAL: possibly add color-scheme: light meta
```

### Data Flow

**No data flow changes.** The redesign is purely presentational. All existing patterns remain:

- Public API (`/api/inventory`) continues serving vehicle data
- `useInventoryFilters` hook (nuqs) continues managing URL state
- Contact form continues submitting to `/api/leads`
- Vehicle detail page continues using `fetchVehicleById` server-side
- No new API routes, no new data fetching, no new state management

## Patterns to Follow

### Pattern 1: Extract Inline Components to Shared Files

**What:** Components currently inlined in page files (VehicleCard, testimonial markup, feature cards, stat bars) get extracted to `src/components/`.

**Why:** The homepage alone has 4 inline component patterns across ~300 lines. The VehicleCard in `inventory-client.tsx` is ~70 lines inline. Extracting makes them independently styleable and reusable.

**Current duplication to eliminate:**
- Section header pattern: duplicated 8+ times across pages (caption + headline + body text)
- Page hero pattern: identical structure on 4 subpages
- VehicleCard: defined inline in inventory-client, but also conceptually duplicated in homepage category cards

**Example:**
```typescript
// src/components/ui/section-header.tsx
interface SectionHeaderProps {
  caption?: string;
  title: string;
  description?: string;
}

export function SectionHeader({ caption, title, description }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {caption && <p className="text-caption text-secondary">{caption}</p>}
      <h2 className="text-headline mt-3">{title}</h2>
      {description && (
        <p className="mt-4 text-body-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
```

### Pattern 2: PageHero Consolidates Repeated Subpage Headers

**What:** Four subpages (inventory, contact, about, financing) all have this identical structure:
```tsx
<section className="bg-primary py-12 text-primary-foreground">
  <div className="container mx-auto px-4">
    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Title</h1>
    <p className="mt-2 text-primary-foreground/70">Description</p>
  </div>
</section>
```

**Replace with:**
```typescript
// src/components/page-hero.tsx
interface PageHeroProps {
  title: string;
  description: string;
}

export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="bg-primary py-16 text-primary-foreground md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-display text-primary-foreground">{title}</h1>
        <p className="mt-3 max-w-xl text-body-lg text-primary-foreground/70">
          {description}
        </p>
      </div>
    </section>
  );
}
```

### Pattern 3: Scroll-Reveal via IntersectionObserver (No New Dependencies)

**What:** Lightweight entrance animations triggered by scroll position.

**Why:** The project requests "subtle motion." CSS transitions + IntersectionObserver are the right weight. No Framer Motion needed (adds ~32KB gzipped). The project already has `prefers-reduced-motion` support in globals.css — the animation approach must respect it.

**Implementation:**
```typescript
// src/components/animated-section.tsx
"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

The existing `prefers-reduced-motion` rule in globals.css (line 248-257) already sets `transition-duration: 0.01ms !important`, so this component automatically respects reduced motion without additional logic.

### Pattern 4: CSS Variable Evolution (Not Revolution)

**What:** Adjust token values in `:root` without changing token names or the `@theme inline` Tailwind bridge.

**Why:** All components use semantic tokens. Changing `--background: #fafafa` to `--background: #fefefe` updates every component instantly. No component code changes needed for color shifts.

**What to evolve:**
- Shadows: make card shadows slightly more elevated for premium feel
- Accent: consider warming the accent color slightly
- Borders: possibly soften border color for lighter feel
- Add new tokens if needed (e.g., `--gradient-start`, `--gradient-end` for premium gradients) via both `:root` and `@theme inline`

**What NOT to change:**
- `--primary` (navy #1e3a5f) — brand color, used heavily in admin sidebar
- `--secondary` (crimson #c8102e) — brand color, CTA buttons
- `--primary-foreground` (white) — text on navy surfaces
- Token names — everything downstream depends on them

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoded Hex Colors in Components
**What:** Using `bg-[#c8102e]` instead of `bg-secondary`.
**Current offenders:** Homepage hero has 8+ instances of hardcoded hex colors (`#c8102e`, `#a80d26`, `#ef4444`, `#0f2744`). These bypass the design system.
**Why bad:** When token values change during the redesign, hardcoded colors stay static and create visual inconsistency.
**Instead:** Map all colors to CSS variables. If new shades are needed (e.g., a darker secondary for hover), add `--secondary-hover` to `:root` and `@theme inline`.

### Anti-Pattern 2: Inline Component Definitions in Page Files
**What:** `VehicleCard` (~70 lines) defined inside `inventory-client.tsx`. `SpecItem` defined inside `[id]/page.tsx`. Stat/feature/testimonial arrays and markup all inside `page.tsx`.
**Why bad:** Cannot reuse across pages, page files become bloated, harder to style in isolation.
**Instead:** Extract components to `src/components/`. Extract data arrays to constants or keep co-located but separated.

### Anti-Pattern 3: Adding Framer Motion or Heavy Animation Libraries
**What:** Installing `framer-motion` for subtle hover/entrance effects.
**Why bad:** The requested "subtle motion" is achievable with CSS transitions (hover states) and IntersectionObserver (scroll reveals). Adding ~32KB gzipped for simple fade-in-up animations is unjustified.
**Instead:** CSS `transition-*` utilities for hover/focus states. `AnimatedSection` wrapper for scroll reveals. Both respect `prefers-reduced-motion` via existing globals.css rule.

### Anti-Pattern 4: Changing Component APIs During Visual Redesign
**What:** Restructuring props, data shapes, or state management while restyling components.
**Why bad:** Introduces bugs in working features. The inventory filter system, contact form submission, and vehicle detail page all work correctly.
**Instead:** Keep all existing interfaces stable. Extract components with the same data shapes. Visual-only changes.

### Anti-Pattern 5: Redesigning Admin Components
**What:** Updating admin sidebar, data tables, or dashboard charts to match the new public theme.
**Why bad:** Admin is out of scope. The admin sidebar is intentionally dark (navy). Admin uses the same token system but its visual context is separate.
**Instead:** Verify admin still looks correct after token evolution. Do not modify any file in `src/components/admin/` or `src/components/dashboard/` or `src/app/admin/`.

## Build Order (Dependency-Aware)

### Phase A: Foundation (do first, blocks everything else)
1. **globals.css** — Remove dark mode block, evolve light tokens, add `color-scheme: light`, add animation utility classes if needed
2. **Verify admin** — After token changes, visually confirm admin sidebar/layout still looks correct

### Phase B: Shared Components (do second, blocks page work)
3. **SectionHeader** — Used by almost every page section
4. **PageHero** — Used by 4 subpages
5. **AnimatedSection** — Scroll-reveal wrapper for all pages
6. **VehicleCard extraction** — Needed before inventory page redesign
7. **Header redesign** — Appears on every page; once done, all pages benefit
8. **Footer redesign** — Same reasoning as header

### Phase C: Pages (do third, can be parallelized)
9. **Homepage** — Largest rewrite, exercises most new components, surfaces issues early
10. **Inventory page** — Filter UI refinement + extracted VehicleCard
11. **Vehicle detail page** — Gallery-first layout + ImageGallery improvements
12. **Contact page** — PageHero + refined form layout
13. **About page** — Full content rewrite with new section layout
14. **Financing page** — Refined step cards + CTA sections

### Rationale
- Foundation first because every component and page depends on CSS tokens
- Admin verification immediately after token changes to catch issues early
- Shared components second because pages consume them
- Header/Footer in shared phase because they appear on every page — redesigning them first means screenshots of any page look "new"
- Pages can be done in parallel once foundation + shared components are stable
- Homepage first among pages because it exercises the most new components and surfaces integration issues early

## Integration Points

### Root Layout (`src/app/layout.tsx`)
- **Minimal change.** Header and Footer are already cleanly imported. The `flex min-h-screen flex-col` wrapper is correct. Font variables stay.
- Possibly add `<html lang="en" style={{ colorScheme: "light" }}>` or handle via globals.css.

### Admin Layout (`src/app/admin/layout.tsx`)
- **Zero changes.** Admin creates its own visual context. Uses same tokens but its dark sidebar is intentionally styled via `bg-primary` (navy). The `NuqsAdapter` wrapper inside admin layout is independent of the public `Providers`.

### Providers (`src/app/providers.tsx`)
- **No changes.** NuqsAdapter stays. No new providers needed for visual redesign.

### API Routes
- **No changes.** `/api/inventory` and `/api/leads` are backend-only.

### Hooks (`src/hooks/use-inventory-filters.ts`)
- **No changes.** URL state management is unrelated to visual presentation.

### Constants (`src/lib/constants.ts`)
- **No changes.** `NAV_LINKS`, `CONTACT`, and `SITE_NAME` are consumed by redesigned components but their values do not change.

## Sources

- Direct codebase analysis: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/admin/layout.tsx`, all 6 public page files, `src/components/header.tsx`, `src/components/footer.tsx`, `src/app/inventory/inventory-client.tsx`, `src/app/inventory/[id]/page.tsx`, `src/app/inventory/[id]/image-gallery.tsx`, `src/app/contact/contact-form.tsx`
- Next.js App Router layout nesting behavior (established pattern, HIGH confidence)
- CSS custom properties cascade behavior (W3C spec, HIGH confidence)
- IntersectionObserver API (widely supported, HIGH confidence)
