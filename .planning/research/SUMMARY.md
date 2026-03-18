# Project Research Summary

**Project:** TLC Autos v1.1 — Premium Light UI Redesign
**Domain:** Public site UI redesign for independent used car dealership (Next.js + Tailwind v4 + shadcn/ui)
**Researched:** 2026-03-18
**Confidence:** HIGH

## Executive Summary

TLC Autos v1.1 is a visual redesign of an existing, fully functional Next.js dealership site — not a greenfield build. The codebase already ships all core features (inventory filtering, vehicle detail pages, contact form, admin dashboard). The goal is to elevate the public-facing aesthetic to premium light-only, replacing a dark hero and dark subpage banners with a refined, bright design system. Research across all four domains converges on a single clear recommendation: treat this as a CSS and component extraction exercise, not a functional rebuild.

The recommended approach is a three-stage build ordered by dependency: (1) lock the design system first — remove dark mode and evolve the CSS token palette before a single page is touched; (2) create shared components (PageHero, VehicleCard, AnimatedSection, SectionHeader) that all pages will consume; (3) redesign pages in dependency order starting with the homepage. The stack additions are minimal and justified — `motion`, `embla-carousel-react`, `yet-another-react-lightbox`, and `tw-animate-css` add roughly 25–30KB gzipped and cover all animation, carousel, and gallery needs. Critically, ARCHITECTURE.md identifies that the scroll-reveal animation requirement can be met with a pure CSS + IntersectionObserver component, avoiding the `motion` library for that use case — that is a meaningful bundle decision the roadmap should encode explicitly.

The primary risk is scope contamination: the admin dashboard shares `globals.css` with the public site, so removing the dark mode media query affects admin users on dark-OS systems. PITFALLS.md provides the exact recovery path (it is a LOW-cost fix if it surfaces), but it must be the very first thing verified in Phase 1. Secondary risks are animation performance (only `transform`/`opacity` must be animated) and breaking existing functionality during component extraction — both are avoidable with the strategies documented in PITFALLS.md.

## Key Findings

### Recommended Stack

The existing stack (Next.js 16.1.6, React 19.2.4, Tailwind v4, shadcn/ui, Supabase, TypeScript 5) requires no structural changes. Four libraries fill specific gaps: `motion@^12.37` for scroll-triggered animations with React 19 support; `embla-carousel-react@^8.6.0` via the shadcn carousel component for the hero and featured vehicle sliders; `yet-another-react-lightbox@^3.29` for the vehicle photo gallery (React 19 compatible, MIT licensed, 7KB gzipped); and `tw-animate-css@^1.4.0` as the official shadcn/ui Tailwind v4 replacement for deprecated `tailwindcss-animate`.

**Core technologies:**
- `motion` (^12.37): Scroll-reveal, gesture, layout animations — 30M+ monthly downloads, full React 19 support, ~18KB gzipped core
- `embla-carousel-react` (^8.6.0): Hero/inventory carousel — already embedded in shadcn's carousel component, zero additional API surface
- `yet-another-react-lightbox` (^3.29): Vehicle photo lightbox — best-maintained React 19–compatible option, plugin system for Zoom
- `tw-animate-css` (^1.4.0): shadcn component enter/exit animations — pure CSS, Tailwind v4 native, pin to ^1.4.0 (v2.0 has breaking changes)

**What NOT to add:** `framer-motion` (legacy package name), `tailwindcss-animate` (deprecated for Tailwind v4), GSAP (overkill + commercial license), AOS (jQuery-era), `react-slick` (unmaintained).

### Expected Features

The site already ships the majority of table-stakes features. The redesign surface is primarily visual polish plus a handful of missing UX improvements.

**Must have (table stakes — already exist, need visual polish):**
- Split-layout hero with vehicle photo — current hero is text-only on dark bg, the single biggest trust signal gap
- Inventory card grid with large images and hover effects — functional but visually basic
- Vehicle detail gallery-first layout — functional but current 2-column layout buries photos
- Consistent premium subpage headers — all four subpages use identical dark `bg-primary` banners
- Sticky header with phone number — exists, needs light theme restyle
- Contact page Google Maps embed — placeholder exists but is not implemented

**Should have (differentiators):**
- Scroll-reveal entrance animations — most independent dealer sites are fully static; this elevates perceived quality
- Vehicle card hover lift + overlay effects — CSS transitions only, high-impact low-cost
- Featured/recent vehicles on homepage — pulling real inventory replaces generic category links
- Photo count badge on inventory cards — small trust signal, low complexity
- Sticky mobile CTA bar on VDP — "Call" / "Inquire" always reachable on mobile

**Defer (v2+):**
- Payment estimator on VDP — adds client-side complexity, not trust-critical for launch
- Similar vehicles section on VDP — requires additional API query logic
- Vehicle inquiry form on VDP — form logic integration; core redesign ships first
- Animated stats counters — pure polish, lowest priority

**Anti-features (never build):** Gated pricing, aggressive popups, auto-play video with sound, rotating hero carousel, dark mode toggle, online checkout, buyer login, heavy parallax everywhere.

### Architecture Approach

The redesign follows a strict dependency-aware build order with no data flow changes — all API routes, hooks, and state management stay unchanged. The core architectural moves are: (1) delete the `@media (prefers-color-scheme: dark)` block from `globals.css` (single location, zero component logic depends on it); (2) extract four shared components that are currently either duplicated or inlined (VehicleCard from `inventory-client.tsx`, SectionHeader from 8+ page sections, PageHero from 4 identical subpage headers, AnimatedSection as a new scroll-reveal wrapper); (3) redesign pages in-place without route changes.

**Major components:**
1. `globals.css` — Remove dark mode block, evolve light-mode tokens, add `color-scheme: light`, add animation utilities; foundation everything else depends on
2. `PageHero` / `SectionHeader` / `VehicleCard` / `AnimatedSection` — Shared components extracted/created before any page redesign begins; eliminates duplication across 4–8 locations
3. Page rewrites (Homepage, Inventory, VDP, Contact, About, Financing) — Consume shared components; no new routes, no API changes

**Key constraint:** The `--primary` (navy #1e3a5f) and `--secondary` (crimson #c8102e) tokens must not change name or value — the admin sidebar uses them directly and the admin is explicitly out of scope.

### Critical Pitfalls

1. **Dark mode removal breaks admin dashboard** — Removing the dark media query affects admin users on dark-OS systems (chart strokes, sidebar, data tables). Mitigation: remove it and accept admin is also light-only (admin sidebar uses `--sidebar` tokens hardcoded to dark navy regardless). Verify admin immediately after the globals.css change. LOW recovery cost.

2. **Animation jank from wrong CSS properties** — Only animate `transform` and `opacity` (GPU-composited). Never animate `margin`, `height`, `width`, `top`, or `left`. Use a single shared `IntersectionObserver` instance, not one per section. Keep durations 300–500ms, translation 10–20px max. Respect existing `prefers-reduced-motion` block in globals.css.

3. **Breaking existing functionality during component extraction** — `InventoryClient` is 509 lines mixing filter state, fetch logic, pagination, and card rendering. Extract VehicleCard with identical data shapes; do not restructure the surrounding component tree. Strategy: preserve all existing `onClick` handlers, URL state (nuqs), and Zod validation logic.

4. **Color contrast failures on light backgrounds** — Premium light aesthetics trend toward low-contrast, which can fail WCAG 2.1 AA (4.5:1 for body text). The current `--muted-foreground: #64748b` barely passes at 4.63:1 — darken to `#475569` (slate-600, 7:1 ratio) if background lightens. Audit with Lighthouse Accessibility >= 95 before any page ships.

5. **Image gallery performance regression** — Gallery-first VDP layout risks 16+ simultaneous image loads. Fix: `priority` prop only on the first hero image, `loading="lazy"` on all thumbnails, `sizes="100px"` for thumbnails, lazy-load lightbox images until lightbox opens.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Design System Foundation
**Rationale:** Every component and page depends on the CSS token palette and the `globals.css` architecture. Dark mode removal must happen first and be verified before any page is touched. Animation utilities must be defined here so page phases apply them consistently.
**Delivers:** Light-only token palette, dark mode removed, `color-scheme: light` set, animation utility classes defined, admin verified as unaffected, new library installations
**Addresses:** Global styling baseline required by all subsequent phases; color contrast validated before any page uses the palette
**Avoids:** Pitfall 1 (dark mode breaks admin — catch it here), Pitfall 4 (color contrast — lock valid palette here), typography inconsistency

### Phase 2: Shared Components
**Rationale:** Pages cannot be redesigned until the shared components they consume exist. Extracting VehicleCard before the inventory/homepage phases prevents duplication. Header and Footer belong here because once redesigned, every page screenshot looks "new."
**Delivers:** `SectionHeader`, `PageHero`, `AnimatedSection` (CSS + IntersectionObserver), extracted `VehicleCard`, redesigned `Header`, redesigned `Footer`
**Uses:** CSS-only AnimatedSection for scroll reveals (avoid `motion` bundle cost for simple fade-in-up); only add `motion` if carousel or VDP gallery transitions specifically require it
**Implements:** Component extraction pattern from ARCHITECTURE.md; eliminates 8+ duplicated SectionHeader instances and 4 identical PageHero blocks

### Phase 3: Homepage Redesign
**Rationale:** Homepage exercises the most new components (hero, VehicleCard, AnimatedSection, SectionHeader, stats bar) and surfaces integration issues earliest. Highest-visibility page — proves the new design language before applying it to secondary pages.
**Delivers:** Split-layout hero with vehicle photo, featured/recent vehicles section pulling real inventory, redesigned stats bar, scroll-reveal sections, all hardcoded hex colors replaced with CSS variables
**Avoids:** Pitfall 2 (animation performance — establish correct animation patterns here as the template for all other pages)

### Phase 4: Inventory Page
**Rationale:** Depends on extracted VehicleCard from Phase 2. Filter UI refinement is low-risk (nuqs state management unchanged). Inventory is the highest-traffic functional page — must be verified thoroughly.
**Delivers:** Refined filter bar, premium card grid with hover effects, photo count badge, skeleton states verified, empty state confirmed
**Avoids:** Pitfall 3 (URL-synced filter state must survive redesign — verify nuqs integration after refactor)

### Phase 5: Vehicle Detail Page
**Rationale:** Gallery-first layout is the biggest UX improvement on the highest-conversion page. Image performance optimization is most critical here (16+ images risk). Follows inventory since card component is already proven.
**Delivers:** Gallery-first layout, improved lightbox transitions, sticky mobile CTA bar, refined specs grid and feature badges
**Avoids:** Pitfall 5 (image gallery performance — `priority`, `loading="lazy"`, correct `sizes` props)

### Phase 6: Secondary Pages (Contact, About, Financing)
**Rationale:** Least complex and most self-contained. All consume PageHero from Phase 2. Contact adds the Google Maps embed. Can be executed in close sequence.
**Delivers:** Contact page with real Google Maps embed, About page brand story layout, Financing page refined step cards, consistent premium headers across all interior pages
**Avoids:** Pitfall 3 (contact form Zod validation must survive layout refactor — test on-blur validation after redesign)

### Phase Ordering Rationale

- Foundation before everything: CSS tokens propagate through the entire component tree via CSS variables. Changing them after pages are redesigned would require visual re-verification of every page.
- Shared components before pages: Pages that import `VehicleCard` or `PageHero` cannot be completed until those components exist. Building first also eliminates temptation to re-inline during page work.
- Homepage before secondary pages: Highest visibility, exercises the most new components, surfaces integration issues while the cost of iteration is lowest.
- VDP after inventory: VDP depends on the same VehicleCard extraction; inventory redesign surfaces any card-related issues first.
- Secondary pages last: Lowest risk, all depend on shared components already proven in earlier phases.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Homepage):** Featured vehicles section requires fetching from the inventory API server-side or client-side — the RSC vs. client-fetch pattern for the homepage teaser should be clarified before planning.
- **Phase 5 (VDP):** Gallery-first layout restructuring is the most significant JSX change in the project; the exact image loading strategy (which images get `priority`, how many thumbnails render eagerly) warrants a specific implementation plan.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Design System):** CSS variable evolution and dark mode removal are well-understood; the exact changes are already documented in ARCHITECTURE.md.
- **Phase 2 (Shared Components):** All four components have implementation sketches in ARCHITECTURE.md; standard extraction patterns apply.
- **Phase 6 (Secondary Pages):** PageHero + token inheritance covers the majority of work; only the Google Maps embed is novel and that is a standard iframe.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All additions verified against React 19 / Next.js 16 / Tailwind v4. Version pinning noted for tw-animate-css (^1.4.0, v2.0 has breaking changes). |
| Features | HIGH | Based on 8+ automotive industry sources from 2025–2026. Table stakes and differentiators are well-established for this domain. |
| Architecture | HIGH | Based on direct codebase analysis — file paths, line numbers, and component structures are concrete, not inferred. |
| Pitfalls | HIGH | Based on direct code analysis of globals.css, admin layout, InventoryClient, ImageGallery. Contrast ratios computed against WCAG 2.1 AA. |

**Overall confidence:** HIGH

### Gaps to Address

- **Homepage featured vehicles data fetching:** FEATURES.md recommends fetching 3–6 real inventory items for the homepage teaser. The current homepage is fully static. The pattern for this fetch (server component using `fetchVehicles`? client component via `/api/inventory`?) is not defined in the research. Resolve in Phase 3 planning.
- **Animation library scope decision:** STACK.md recommends installing `motion` for scroll reveals. ARCHITECTURE.md recommends CSS + IntersectionObserver to avoid the 18KB bundle cost. Both are valid. Definitive choice: use CSS-only `AnimatedSection` for scroll reveals; only add `motion` if carousel or VDP gallery transitions specifically require JS orchestration beyond what embla + YARL provide natively.
- **Google Maps embed key vs. free URL:** Contact page needs a real Google Maps embed. Whether this requires a Maps API key (paid) or uses the free embed URL (`maps.google.com/maps?q=...`) is not clarified. Verify before Phase 6 planning.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis — `src/app/globals.css`, `src/app/layout.tsx`, `src/app/admin/layout.tsx`, all 6 public page files, `src/components/header.tsx`, `src/components/footer.tsx`, `src/app/inventory/inventory-client.tsx`, `src/app/inventory/[id]/page.tsx`, `src/app/inventory/[id]/image-gallery.tsx`, `src/app/contact/contact-form.tsx`
- [Motion official docs](https://motion.dev/) — React 19 support, Tailwind v4 integration
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) — v3.29 React 19 compatibility confirmed
- [shadcn/ui Carousel docs](https://ui.shadcn.com/docs/components/radix/carousel) — Embla integration
- [tw-animate-css npm](https://www.npmjs.com/package/tw-animate-css) — official shadcn/ui Tailwind v4 replacement

### Secondary (MEDIUM confidence)
- [INSIDEA: Website Design Ideas for Car Dealerships 2026](https://insidea.com/blog/marketing/car-dealerships/website-design-ideas-for-automotive-industry/) — table stakes features
- [Dealer Specialties: Ultimate VDP](https://www.dealerspecialties.com/ultimate-vdp) — VDP layout best practices
- [DealerOn: Design a Good VDP](https://www.dealeron.com/blog/design-a-good-vehicle-details-page/) — gallery-first rationale
- [Fyresite: Car Dealership Website UX](https://www.fyresite.com/car-dealership-website-design-must-have-features-ux-best-practices/) — conversion patterns
- [Space Auto: Lessons from Carvana](https://space.auto/building-the-best-dealership-website-lessons-from-carvana-digital-strategies/) — differentiator features

### Tertiary (LOW confidence)
- [Azuro Digital: Best Automotive Website Designs 2026](https://azurodigital.com/automotive-website-examples/) — visual inspiration, not implementation guidance

---
*Research completed: 2026-03-18*
*Ready for roadmap: yes*
