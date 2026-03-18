# Pitfalls Research

**Domain:** UI redesign of existing Next.js + Tailwind + shadcn/ui car dealership site
**Researched:** 2026-03-18
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Dark Mode Removal Breaks Admin Sidebar and Charts

**What goes wrong:**
The current `globals.css` has a `@media (prefers-color-scheme: dark)` block that overrides every CSS variable. Removing this block changes the admin experience for any user whose OS is in dark mode. The admin sidebar uses `bg-primary` which resolves to `#1e3a5f` in light mode but `#3b82f6` in dark mode. The dashboard charts (Recharts) use inline CSS variable references like `stroke="var(--primary)"` and tooltip backgrounds of `var(--card)`. If dark mode tokens are removed, admin users on dark-mode OS get light-on-light colors where they previously had dark-on-dark -- the sidebar, charts, and data tables all lose visual coherence.

**Why it happens:**
The public site and admin share `globals.css` as the single source of truth. Removing the dark media query to achieve "light-only public pages" has global scope -- it hits admin too. The admin sidebar already uses a fixed dark palette via `--sidebar` tokens, but the content area (cards, tables, charts) consumes the same `--card`, `--border`, `--muted` variables that would lose their dark variants.

**How to avoid:**
Do NOT delete the `@media (prefers-color-scheme: dark)` block. Instead, force light mode only on public pages by adding `color-scheme: light` and `data-theme="light"` to the root layout or the public page wrapper. The admin layout can continue to respect system preference. Alternatively, scope the `:root` light-mode overrides to a `.light-theme` class applied only to the public layout wrapper.

The simplest correct approach: remove the dark media query entirely but accept that admin is also light-only. The admin sidebar already uses hardcoded `--sidebar: #152d4a` tokens that do not depend on dark mode. The admin content area (white cards, light borders) works fine in light mode. This is the cleanest path since the admin has no dark mode toggle -- it only responds to OS preference via the media query, which is incidental, not intentional.

**Warning signs:**
- Admin dashboard charts become unreadable (light strokes on light background)
- Admin data table borders vanish
- Test on a machine with OS dark mode enabled before and after the change

**Phase to address:**
Phase 1 (Design System) -- must be the first thing resolved before any page redesign begins.

---

### Pitfall 2: Layout Thrashing from Animation on Scroll

**What goes wrong:**
Adding scroll-reveal animations (fade-in, slide-up) to homepage sections causes layout shifts. Elements that animate from `opacity: 0; transform: translateY(20px)` to their final position cause the browser to recalculate layout for every frame if the animated property triggers reflow. Worse, if the animation changes `height`, `width`, `margin`, or `padding` instead of `transform` and `opacity`, every frame triggers a full layout recalculation. On the homepage with 7+ sections (hero, stats, features, inventory, testimonials, CTA, trust badges), stacking scroll observers creates cumulative jank.

**Why it happens:**
Developers add `IntersectionObserver` per section, each toggling CSS classes. If the animation CSS uses properties beyond `transform` and `opacity` (the only two GPU-composited properties), the browser cannot optimize. Common mistake: animating `margin-top` or `max-height` for reveal effects.

**How to avoid:**
- Only animate `transform` and `opacity` -- never `margin`, `padding`, `height`, `width`, `top`, `left`
- Use `will-change: transform, opacity` on elements that will animate (but remove after animation completes)
- Use a single `IntersectionObserver` instance with multiple entries, not one observer per section
- Respect `prefers-reduced-motion` -- the existing `globals.css` already has this media query, so animation classes should use it
- Use CSS `@starting-style` or `transition` rather than JavaScript-driven animation where possible
- Keep animations subtle: 300-500ms duration, `ease-out` timing, 10-20px translation max

**Warning signs:**
- Chrome DevTools Performance tab shows long "Layout" bars during scroll
- FPS drops below 50 during scroll on mobile
- Cumulative Layout Shift (CLS) score degrades in Lighthouse

**Phase to address:**
Phase 2+ (Page redesigns) -- establish animation utility classes in Phase 1 (Design System), enforce them during page work.

---

### Pitfall 3: Breaking Existing Functionality During Visual Redesign

**What goes wrong:**
Redesigning page markup to achieve a new visual layout accidentally removes or breaks functional elements. Common casualties: the inventory client's URL-synced filters (`useInventoryFilters` + `nuqs`), the contact form's inline Zod validation, the image gallery's lightbox dialog, pagination state, and the header's mobile menu toggle. Restructuring JSX to match a new design often means rewriting component trees, and functional behavior gets lost in the process.

**Why it happens:**
Visual redesign feels like "just CSS" but the existing components tightly couple layout markup with functional logic. The `InventoryClient` component is 509 lines mixing filter state, fetch logic, loading skeletons, pagination, and card rendering. Refactoring its visual layout means touching every line, and it is easy to disconnect the `onClick` handlers, break the `useCallback` dependency chain, or remove a conditional rendering branch.

**How to avoid:**
- Extract functional logic from visual components before redesigning. Move filter/fetch/pagination logic into custom hooks, then redesign the JSX freely.
- Maintain a manual test checklist per page: (1) filters work, (2) pagination works, (3) URL state persists on refresh, (4) loading skeleton appears, (5) empty state appears, (6) mobile responsive.
- Redesign incrementally: update one section at a time, verify functionality, then move to the next. Do not rewrite an entire 500-line component in one pass.
- The pre-commit hooks (Lefthook: lint + typecheck + build) will catch compilation errors but not runtime behavior regressions.

**Warning signs:**
- A page "looks right" but filter changes do not update the URL
- Contact form submits without validation feedback
- Image gallery thumbnails stop selecting the hero image
- Pagination buttons do nothing

**Phase to address:**
Every page redesign phase -- include a functional verification step in each phase plan.

---

### Pitfall 4: Color Contrast Failures on Light Backgrounds

**What goes wrong:**
The current palette was designed for both light and dark modes. On light backgrounds, some color combinations fail WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text). Specific risks in the current palette:

- `--muted-foreground: #64748b` on `--background: #fafafa` = 4.63:1 ratio -- barely passes AA for normal text, would fail if background gets any lighter
- `--warning: #d97706` on white = 3.16:1 -- fails AA for normal text (only passes for large text)
- `--accent: #dbeafe` as a background with text is fine, but `--accent` itself as text on white = 1.73:1 -- invisible
- Any use of `text-white/60` or `text-muted-foreground` on light cards needs verification

When evolving the palette for a "premium light" aesthetic, the temptation is lighter, more muted colors -- which makes contrast worse.

**Why it happens:**
Premium design trends favor subtle, low-contrast aesthetics (light gray text on white). This directly conflicts with accessibility requirements. Designers optimize for "looks elegant" without checking contrast ratios.

**How to avoid:**
- Run every color combination through a contrast checker before committing to the palette
- Set minimum contrast rules: body text >= 4.5:1, headings/large text >= 3:1, interactive elements >= 3:1
- The current `--muted-foreground: #64748b` is borderline -- if lightening the palette, darken muted-foreground to `#475569` (slate-600, 7:1 ratio) instead
- The current `--warning: #d97706` fails for inline text -- use `#b45309` (amber-700) for text usage, keep the brighter shade for badges/backgrounds only
- Test with browser accessibility audit (Chrome DevTools > Lighthouse > Accessibility)

**Warning signs:**
- Text feels "hard to read" on mobile in sunlight
- Lighthouse accessibility score drops below 95
- Users squint at muted labels

**Phase to address:**
Phase 1 (Design System) -- lock down contrast-valid palette before any page uses it.

---

### Pitfall 5: Image Gallery Performance Degradation

**What goes wrong:**
The vehicle detail page redesign calls for a "gallery-first layout with large hero images." The current `ImageGallery` component loads all images at full resolution via Next.js `<Image fill>` with `object-cover`. The thumbnail strip loads 5 additional full-resolution images. For a vehicle with 15 photos, this means 16 full-resolution image loads on page mount. Combined with the inventory grid (which loads the first image of every vehicle), image-heavy pages become extremely slow on mobile.

**Why it happens:**
Next.js `<Image>` provides automatic optimization, but only if properly configured with `sizes` prop and appropriate `quality` settings. The current implementation uses `sizes="(max-width: 1024px) 100vw, 66vw"` for the hero (reasonable) but `sizes="20vw"` for thumbnails (which are tiny -- the browser will still fetch a larger image than needed if the `deviceSizes` config does not include small enough breakpoints).

**How to avoid:**
- Thumbnails: use `sizes="100px"` (their actual rendered size) and add `loading="lazy"` to all except the first visible thumbnail row
- Hero image: preload only the initially selected image, lazy-load the rest
- Lightbox: load full-resolution images only when the lightbox opens, not on page mount
- Add `priority` prop only to the hero image (above the fold), remove it from everything else
- Consider `placeholder="blur"` with `blurDataURL` for perceived performance
- For the inventory grid with 12+ cards, only the first 4-8 images should load eagerly

**Warning signs:**
- Network tab shows 15+ image requests on vehicle detail page load
- Largest Contentful Paint (LCP) exceeds 2.5s
- Total page weight exceeds 5MB

**Phase to address:**
Vehicle detail page phase and inventory page phase -- image optimization strategy should be defined in Phase 1 (Design System) and applied during each page redesign.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hard-coding hex colors instead of using CSS variables | Faster iteration during design exploration | Every color change requires find-and-replace across files. Current homepage already has `#c8102e`, `#a80d26`, `#ef4444` hard-coded instead of `var(--secondary)` | Never in final code -- use during prototyping only, then refactor to variables |
| Inline `style={{ fontFamily: "var(--font-heading)" }}` | Works immediately | Inconsistent -- some components use the inline style, others use `.text-headline` class. Creates two systems for the same thing | Never -- always use typography utility classes from globals.css |
| Mixing `className` ad-hoc sizing with design system spacing | Quick layout adjustments | Inconsistent spacing rhythm across pages (some sections use `py-20 md:py-28`, others `py-8`) | Acceptable during prototyping, must normalize before merge |
| Skipping loading/skeleton states during redesign | Ship the visual design faster | Users see content flash or blank sections during data fetch | Never for public pages -- skeleton states are table stakes for perceived performance |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Storage images | Using raw storage URLs without Next.js Image optimization. Supabase URLs are not in `next.config.ts` `images.remotePatterns` | Ensure `ychvjgynekceffeqqymf.supabase.co` is in `remotePatterns`. Use Next.js `<Image>` component for all vehicle photos, never raw `<img>` tags |
| Next.js `<Image>` with new layouts | Switching from `fill` (current) to fixed `width`/`height` without updating the parent container. Or using `fill` without a positioned parent, causing the image to fill the viewport | Always wrap `<Image fill>` in a `relative` container with defined dimensions (e.g., `aspect-video`) |
| Sonner toast theming | Toasts use their own styling that may not match the redesigned palette. `richColors` mode picks its own green/red/yellow | Pass custom `toastOptions` with `className` or `style` to match the new design system |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| CSS `backdrop-blur` on scroll elements | Janky scrolling on mobile, high GPU usage | Use solid backgrounds instead of blur on frequently-scrolled elements. The current header uses `backdrop-blur` which is fine (it is fixed, not scrolled), but adding blur to card hover states or scroll sections will cause issues | Noticeable on any mobile device, immediate |
| Multiple IntersectionObservers for scroll animations | Memory usage grows, observer callbacks fire during rapid scroll creating frame drops | Use a single observer instance shared across all animated elements. Or use CSS `animation-timeline: scroll()` (modern browsers only) | > 10 observed elements on a single page |
| Large CSS file with unused dark mode tokens | Increased parse time, confusing developer experience | Remove dark mode block cleanly. Do not leave commented-out code | Not a perf issue but a maintenance trap |
| Font loading without `display: swap` | Text invisible until font loads (FOIT). Current setup uses `display: "swap"` correctly -- do not remove this when adding new font weights | Always verify `display: swap` is set when adding or changing fonts. Test with throttled network | Immediately visible on slow connections |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Removing visual affordances during "premium" redesign | Buttons that look like text, links that look like labels -- users do not know what is clickable | Maintain clear hover states, underlines on links, filled backgrounds on primary CTAs. Premium does not mean invisible interaction cues |
| Scroll-jacking or heavy parallax on vehicle pages | Users cannot scroll naturally, feel disoriented. Particularly bad on mobile where scroll momentum is expected | Use subtle parallax (if any) only on hero sections. Never override native scroll behavior. Use `scroll-behavior: smooth` only for anchor links |
| Card hover animations on mobile | Hover states do not exist on touch. Cards that rely on hover to show CTAs or information leave mobile users stranded | Ensure all information and CTAs are visible by default. Hover states should enhance, not reveal |
| Contact form redesign losing validation UX | Current contact form has inline Zod validation on blur. Redesigning the form layout may disconnect the `onBlur` handlers or change error message positioning | Preserve the validation-on-blur pattern. Test each field: blur out of empty required field, verify error appears, fill field, verify error clears |
| Inventory filter state lost during navigation | User applies filters, clicks a vehicle, hits back -- filters are gone | Current implementation uses `nuqs` for URL-synced state which handles this correctly. During redesign, ensure filters still use `useInventoryFilters()` hook, not local `useState` |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Homepage hero:** Looks great but CTA buttons do not have proper focus styles for keyboard navigation -- verify `focus-visible` ring appears on Tab
- [ ] **Inventory cards:** Images display but `alt` text is generic -- verify each card has `"[year] [make] [model]"` alt text for accessibility
- [ ] **Contact form:** Form looks styled but submit button does not disable during submission -- verify no double-submit (known tech debt: "Contact form has no duplicate-submission guard")
- [ ] **Mobile navigation:** Menu opens and closes but does not trap focus -- verify Tab key does not escape the mobile menu overlay
- [ ] **Vehicle detail gallery:** Lightbox opens but keyboard navigation (Left/Right arrows, Escape to close) may not work after redesign
- [ ] **Typography scale:** All headings use `text-headline` or `text-display` classes, but section body text defaults to browser `1rem` instead of `text-body-lg` -- verify consistent body text sizing
- [ ] **Page transitions:** New pages load but there is no loading indicator between route changes -- consider adding a top progress bar or skeleton
- [ ] **Footer links:** Footer is unchanged from v1.0 and may visually clash with redesigned pages -- verify footer uses the same updated palette

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dark mode removal breaks admin | LOW | Re-add the `@media (prefers-color-scheme: dark)` block to globals.css. Takes 5 minutes since the original tokens are in git history. Or scope light-mode to public pages only with a wrapper class |
| Animation jank on scroll | LOW | Replace JavaScript observers with CSS-only transitions using `@starting-style` or remove animations entirely. Subtle > broken |
| Broken inventory filters after redesign | MEDIUM | Revert to pre-redesign JSX for the filter section, then redesign incrementally. The logic is in `useInventoryFilters()` hook which should not have been modified |
| Color contrast failures | LOW | Swap failing colors with darker alternatives. Use Chrome DevTools color picker which shows contrast ratios inline. Automated fix: darken muted-foreground by one shade step |
| Image performance regression | MEDIUM | Add `loading="lazy"` to all below-fold images, add `priority` to hero only, reduce `quality` to 75 on `<Image>` components. Measurable improvement within 30 minutes |
| Hard-coded colors scattered across components | MEDIUM | Global find-and-replace for hex values. Map each hard-coded hex to its CSS variable equivalent. The homepage currently has 8+ hard-coded color values that need variable references |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Dark mode removal breaks admin | Phase 1: Design System | Test admin dashboard, charts, and sidebar with OS dark mode enabled after removing the media query |
| Animation performance | Phase 1: Design System (define utilities), Phase 2+: Page redesigns (apply them) | Chrome DevTools Performance tab during scroll, Lighthouse Performance score >= 90 |
| Breaking existing functionality | Every page phase | Manual test checklist: filters, pagination, form submission, URL state, mobile responsive |
| Color contrast failures | Phase 1: Design System | Lighthouse Accessibility score >= 95, manual check of every text/background combination in the new palette |
| Image gallery performance | Vehicle detail phase | Network tab: <= 3 image requests on initial load. LCP < 2.5s on throttled 4G |
| Hard-coded colors in homepage | Homepage redesign phase | `grep -r "#[0-9a-fA-F]\{6\}" src/app/page.tsx` returns zero matches after refactor |
| Typography inconsistency | Phase 1: Design System | All text uses design system classes (`text-display`, `text-headline`, `text-title`, `text-body-lg`, `text-caption`), no ad-hoc `text-lg font-semibold` combinations |
| Missing skeleton/loading states | Every page phase | Throttle network to Slow 3G, navigate to each page, verify skeleton appears instead of blank content |

## Sources

- Direct code analysis of TLC Autos codebase (`globals.css`, `layout.tsx`, `admin/layout.tsx`, `page.tsx`, `inventory-client.tsx`, `image-gallery.tsx`, `button.tsx`, `sales-chart.tsx`)
- Current CSS variable values and contrast ratios computed against WCAG 2.1 AA standards
- Known tech debt documented in PROJECT.md
- Tailwind CSS v4 dark mode behavior (uses `prefers-color-scheme` by default, no class-based toggle in this codebase)
- Next.js Image component optimization patterns from official documentation

---
*Pitfalls research for: UI redesign of existing Next.js + Tailwind + shadcn/ui car dealership site*
*Researched: 2026-03-18*
