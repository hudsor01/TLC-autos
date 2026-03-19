# Phase 5: Design System Foundation - Research

**Researched:** 2026-03-18
**Domain:** CSS design system evolution, dark mode removal, animation utilities
**Confidence:** HIGH

## Summary

Phase 5 is a CSS-focused foundation phase that modifies `globals.css` to remove dark mode, evolve the token palette to warm whites with a richer burgundy crimson, define animation utility classes, install four new libraries, and verify admin dashboard functionality. No page redesigns occur here -- this phase establishes the visual foundation that all subsequent phases (6-10) build on.

The work is contained almost entirely within `globals.css` and `src/app/page.tsx` (which has two inline references to `var(--hero)` that must be updated when the `--hero` variable is removed). The admin dashboard charts use CSS variables for strokes and fills (`var(--primary)`, `var(--success)`, `var(--warning)`) that will resolve to the same or similar light-mode values, so chart readability on light backgrounds needs visual verification but no code changes.

**Primary recommendation:** Execute in strict order: (1) remove dark mode block + add `color-scheme: light`, (2) evolve token values, (3) fix homepage `--hero` references, (4) add animation utility classes, (5) install libraries + import tw-animate-css, (6) verify admin dashboard + charts, (7) verify full build passes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Shift to warm whites: background becomes creamy off-white (#faf9f7 range), muted surfaces warm-toned (#f5f3f0 range), borders warm (#e8e4df range)
- Crimson shifts slightly deeper/richer -- more burgundy (#a81225 range) for upscale feel on light surfaces
- Navy primary (#1e3a5f) stays as-is -- admin sidebar depends on it, and it reads well on warm whites
- Muted-foreground darkens from #64748b to #475569 (slate-600, 7:1 contrast ratio) for WCAG AA compliance
- Accent color: warm blue tint (#e8f0fa range) with navy foreground -- on-brand, differentiates from destructive states
- No gradients anywhere -- flat, clean surfaces only
- Scroll-reveal: fade-up pattern (opacity 0 to 1 + translateY 10-20px to 0)
- Timing: quick and snappy -- 300-400ms max, ease-out easing
- Hover transitions: fast, 150-200ms ease-out for cards, buttons, interactive elements
- Staggered reveals: yes, subtle 50-75ms delay between items in groups
- Only animate transform and opacity (GPU-composited properties)
- Respect existing prefers-reduced-motion block in globals.css
- ALL LIGHT -- no dark navy hero or CTA sections
- Remove --hero and --hero-foreground CSS variables entirely
- Hero sections use the same light palette as the rest of the site
- No gradients -- the vehicle imagery and typography do the visual work
- Accept light admin -- content areas become light, sidebar stays dark navy via --sidebar tokens
- Verify admin Recharts chart colors render well on light backgrounds in this phase
- No admin-specific dark scope or isolation -- admin is 1-2 users, light is fine

### Claude's Discretion
- Exact hex values for warm white palette (within the warm direction established above)
- Exact crimson hex value (within the deeper/richer direction, ~#a81225 area)
- How hero section differentiates from body content without dark bg or gradients
- Animation utility class naming conventions
- tw-animate-css integration specifics
- Whether to add color-scheme: light to html or :root

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSYS-01 | Site renders with light-only color scheme -- no dark mode media query, `color-scheme: light` set | Dark mode removal strategy fully documented in ARCHITECTURE.md; single `@media (prefers-color-scheme: dark)` block at lines 127-169 of globals.css to delete; add `color-scheme: light` to html rule |
| DSYS-02 | CSS token palette evolved for light backgrounds -- navy/crimson palette refined for premium aesthetic | Contrast ratios computed for all proposed colors on warm white backgrounds; all text colors pass WCAG AA 4.5:1; exact token values documented below |
| DSYS-03 | Animation utility classes defined in globals.css for scroll-reveal and hover transitions | CSS utility class patterns documented with exact timing, easing, and transform values per user decisions |
| DSYS-04 | Libraries installed -- motion, embla-carousel-react, yet-another-react-lightbox, tw-animate-css | Versions verified on npm registry; installation commands documented; tw-animate-css CSS import documented |
| DSYS-05 | Admin dashboard remains functional after dark mode removal | Chart components analyzed -- use `var(--primary)`, `var(--success)`, `var(--warning)` for strokes; tooltip backgrounds use `var(--card)`; all resolve correctly in light mode; sidebar uses `bg-primary` which stays navy |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Relevance to Phase |
|---------|---------|---------|-------------------|
| Tailwind CSS | v4 | CSS framework | `@theme inline` bridge is how CSS vars become Tailwind utilities; must add new vars to bridge |
| Next.js | 16.1.6 | App framework | `layout.tsx` needs `color-scheme: light` on html element |
| Recharts | 3.8.0 | Admin charts | Charts use CSS var references that must remain valid after palette evolution |

### New Installations (This Phase)
| Library | Version (verified 2026-03-18) | Purpose | Why Standard |
|---------|-------------------------------|---------|--------------|
| tw-animate-css | 1.4.0 | shadcn/ui enter/exit animation utilities | Official shadcn/ui Tailwind v4 replacement for deprecated tailwindcss-animate. Pure CSS, zero JS. Pin to ^1.4.0 (v2.0 has breaking changes) |
| motion | 12.38.0 | Scroll reveals, gesture animations (later phases) | Standard React animation library. Not used directly in this phase but installed per DSYS-04 |
| embla-carousel-react | 8.6.0 | Carousel engine (later phases) | shadcn/ui carousel is built on Embla. Installed now per DSYS-04 |
| yet-another-react-lightbox | 3.29.1 | Image lightbox (later phases) | Best React 19-compatible lightbox. Installed now per DSYS-04 |

### Supporting (Installed Alongside)
| Library | Version | Purpose |
|---------|---------|---------|
| embla-carousel | 8.6.0 | Core engine, peer dependency of embla-carousel-react |
| embla-carousel-autoplay | 8.6.0 | Auto-advancing slides for hero carousel (later phases) |

**Installation:**
```bash
# All four required libraries plus supporting deps
bun add motion tw-animate-css embla-carousel-react embla-carousel embla-carousel-autoplay yet-another-react-lightbox
```

**tw-animate-css CSS import** (add to top of globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";
```

## Architecture Patterns

### Pattern 1: Dark Mode Removal (DSYS-01)

**What:** Delete the entire `@media (prefers-color-scheme: dark) { :root { ... } }` block (lines 122-169 of globals.css). Add `color-scheme: light` to the `html` rule.

**Why it is safe:**
- No component in the codebase uses `dark:` Tailwind prefixes (verified via grep)
- No theme toggle exists
- No JS logic depends on color scheme detection
- The admin sidebar is styled via `bg-primary text-primary-foreground` which resolves to navy/white in light mode -- intentionally dark regardless

**Exact change to html rule:**
```css
html {
  color-scheme: light;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
}
```

**Why `html` not `:root`:** `color-scheme` is a CSS property that affects browser chrome (scrollbars, form controls, color picker). Setting it on `html` (which is `:root` in HTML) is equivalent, but placing it in the `html {}` rule block keeps it with other html-level styles. Either works; `html` is cleaner.

### Pattern 2: Token Palette Evolution (DSYS-02)

**What:** Modify CSS variable values in the `:root` block. Token names stay identical -- only values change.

**Contrast Ratios Computed (on #faf9f7 background):**

| Token | Current Value | Proposed Value | Contrast on #faf9f7 | WCAG AA |
|-------|--------------|----------------|---------------------|---------|
| --background | #fafafa | #faf9f7 | N/A (is bg) | -- |
| --foreground | #0f172a | #0f172a (no change) | 16.97:1 | PASS |
| --card | #ffffff | #ffffff (no change) | -- | -- |
| --muted | #f1f5f9 | #f5f3f0 | N/A (is surface) | -- |
| --muted-foreground | #64748b | #475569 | 7.20:1 | PASS |
| --primary | #1e3a5f | #1e3a5f (no change) | 10.93:1 | PASS |
| --secondary | #c8102e | #a81225 | 7.18:1 | PASS |
| --accent | #dbeafe | #e8f0fa | N/A (is bg) | -- |
| --border | #e2e8f0 | #e8e4df | N/A (decorative) | -- |
| --destructive | #dc2626 | #dc2626 (no change) | 4.59:1 | PASS |
| --success | #16a34a | #16a34a (no change) | 3.13:1 | Large only |
| --warning | #d97706 | #d97706 (no change) | 3.03:1 | Large only |

**Key contrast notes:**
- `--muted-foreground` upgrade from #64748b (4.52:1, barely AA) to #475569 (7.20:1, comfortably AA) is critical
- `--secondary` shift from #c8102e (5.59:1) to #a81225 (7.18:1) improves contrast significantly
- `--success` and `--warning` only pass for large text (3:1) -- they are used as chart bar fills and badge backgrounds, not body text, so this is acceptable. If used as text, darken: success to #15803d, warning to #b45309

**Token changes summary:**

```css
:root {
  /* Surfaces -- warm shift */
  --background: #faf9f7;        /* was #fafafa -- warm off-white */
  --card: #ffffff;               /* unchanged */
  --muted: #f5f3f0;             /* was #f1f5f9 -- warm muted surface */
  --muted-foreground: #475569;  /* was #64748b -- darkened for contrast */

  /* Brand -- secondary evolves */
  --secondary: #a81225;          /* was #c8102e -- richer burgundy */

  /* Accent -- warm blue tint */
  --accent: #e8f0fa;             /* was #dbeafe -- warmer blue tint */

  /* Borders -- warm shift */
  --border: #e8e4df;             /* was #e2e8f0 -- warm border */
  --input: #e8e4df;              /* was #e2e8f0 -- match border */

  /* Shadows -- slightly warmer */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05);

  /* REMOVED: --hero, --hero-foreground */
}
```

**Tokens that MUST NOT change name or value:**
- `--primary: #1e3a5f` -- admin sidebar depends on it
- `--primary-foreground: #ffffff` -- admin sidebar text
- `--sidebar: #152d4a` -- admin sidebar dark background
- `--sidebar-foreground: #e2e8f0` -- admin sidebar text
- `--sidebar-accent: rgba(255, 255, 255, 0.12)` -- admin sidebar hover

### Pattern 3: Homepage --hero Fix (Immediate)

**What:** `src/app/page.tsx` references `var(--hero)` at lines 93 and 323 for hero and CTA section backgrounds. When `--hero` is removed, these must be updated.

**Decision:** ALL LIGHT hero/CTA. Replace dark navy backgrounds with the light palette.

**Current (line 93):**
```tsx
style={{ backgroundColor: "var(--hero)" }}
```

**Replace with light treatment:**
```tsx
className="bg-muted" // or bg-background, depending on desired warmth
```

**Hardcoded hex colors in page.tsx that must be cleaned up:**
- `#c8102e` (6 occurrences) -- replace with `text-secondary` / `bg-secondary`
- `#ef4444` (3 occurrences) -- replace with `text-secondary` (was using red-500 instead of brand crimson)
- `#a80d26` (2 occurrences) -- replace with a hover variant or `hover:bg-secondary/90`
- Gradient lines (`bg-gradient-to-r from-transparent via-[#c8102e] to-transparent`) -- remove per "no gradients" decision

**Important scope note:** Phase 7 (Homepage Redesign) will fully redesign the homepage. This phase only needs to make the homepage *not break* after removing `--hero`. The minimum viable fix is:
1. Replace `style={{ backgroundColor: "var(--hero)" }}` with a light bg class
2. Update `text-white` references in hero/CTA to `text-foreground`
3. Remove gradient accent lines
4. Hardcoded hex colors can be cleaned up here or deferred to Phase 7 -- doing it here is cleaner since we are already touching the file

### Pattern 4: Animation Utility Classes (DSYS-03)

**What:** CSS utility classes in globals.css for scroll-reveal and hover transitions. These are pure CSS -- the AnimatedSection React component (Phase 6) will apply them.

**Naming convention recommendation:** Use `.animate-` prefix for entrance animations, keep transition utilities inline via Tailwind.

```css
/* ────────────────────────────────────────────────────────────────
   ANIMATION UTILITIES
   Scroll-reveal entrance animations and hover transition helpers.
   All animations use transform + opacity only (GPU-composited).
   Reduced motion support via Section 6 prefers-reduced-motion block.
   ──────────────────────────────────────────────────────────────── */

/* Fade up entrance -- default scroll-reveal */
.animate-fade-up {
  animation: fade-up 400ms ease-out both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in (no translation) */
.animate-fade-in {
  animation: fade-in 400ms ease-out both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up from further (for hero elements) */
.animate-slide-up {
  animation: slide-up 500ms ease-out both;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger delay utilities for groups */
.delay-75 { animation-delay: 75ms; }
.delay-150 { animation-delay: 150ms; }
.delay-225 { animation-delay: 225ms; }
.delay-300 { animation-delay: 300ms; }

/* Hover transition base -- apply to cards, buttons, interactive elements */
.hover-lift {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

**Key design decisions:**
- 400ms for entrance animations (within 300-400ms "snappy" range)
- 150ms for hover transitions (within 150-200ms fast range)
- `ease-out` easing throughout (decelerating motion feels natural)
- `translateY(12px)` for standard fade-up (subtle, not dramatic)
- `both` fill mode so elements stay in final state
- Stagger delays at 75ms intervals (matching 50-75ms user decision)
- All animations only use `transform` and `opacity`
- The existing `prefers-reduced-motion` block (lines 248-257) already kills all transition and animation durations, so these utilities automatically respect reduced motion

### Pattern 5: tw-animate-css Integration

**What:** Import tw-animate-css after tailwindcss in globals.css. This provides `animate-in`, `animate-out`, `fade-in`, `fade-out`, `slide-in-from-*`, `zoom-in`, etc. for shadcn/ui Dialog, Popover, Command components.

**Change to globals.css top:**
```css
@import "tailwindcss";
@import "tw-animate-css";
```

**No component changes needed.** Existing shadcn Dialog/Popover/Command components already have animation class names in their code -- they just need the CSS definitions that tw-animate-css provides. Adding the import makes them animate automatically.

### Anti-Patterns to Avoid

- **Do not create a `.dark-theme` class or scope** -- the decision is ALL LIGHT, no scoping
- **Do not add CSS custom properties to @theme inline for animation** -- animation utilities are regular CSS classes, not Tailwind theme tokens
- **Do not modify any file in `src/components/admin/` or `src/components/dashboard/`** -- admin is out of scope; verify visually only
- **Do not change `--primary` or `--primary-foreground` values** -- admin sidebar depends on them
- **Do not add `@apply` directives in animation classes** -- use standard CSS for clarity and performance

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| shadcn/ui component enter/exit animations | Custom @keyframes for Dialog/Popover | tw-animate-css import | Already has all the animation classes shadcn components expect |
| Color contrast checking | Manual hex comparison | Browser DevTools / Lighthouse accessibility audit | Automated catches edge cases human review misses |
| Dark mode removal scoping | Complex CSS class-based theme system | Simple delete of media query block + `color-scheme: light` | No component uses dark: prefixes; scoping adds unneeded complexity |

## Common Pitfalls

### Pitfall 1: Removing --hero Breaks Homepage

**What goes wrong:** Deleting `--hero` and `--hero-foreground` from `:root` without updating `src/app/page.tsx` lines 93 and 323 causes the hero and CTA sections to render with transparent backgrounds and invisible white text.
**Why it happens:** The homepage uses `style={{ backgroundColor: "var(--hero)" }}` inline, which silently falls back to `transparent` when the variable is undefined.
**How to avoid:** Update `page.tsx` in the same task as removing the CSS variables. Replace both `style={{ backgroundColor: "var(--hero)" }}` references with appropriate light background classes. Update `text-white` to `text-foreground`.
**Warning signs:** Hero section becomes invisible (white text on white background).

### Pitfall 2: Admin Charts Unreadable After Palette Evolution

**What goes wrong:** Chart strokes using `var(--primary)` (navy #1e3a5f) are fine on light backgrounds. But `var(--warning)` (#d97706) and `var(--success)` (#16a34a) may appear too light on the new warm white card backgrounds.
**Why it happens:** Warm white cards (#ffffff) have slightly different perceived contrast than cool white.
**How to avoid:** Visually verify admin dashboard charts after token changes. The computed contrast ratios show success at 3.13:1 and warning at 3.03:1 on #faf9f7 -- both pass for graphical objects (3:1 minimum per WCAG 1.4.11). But verify they "look readable" in context.
**Warning signs:** Chart bars or lines feel washed out.

### Pitfall 3: tw-animate-css Import Order

**What goes wrong:** Placing `@import "tw-animate-css"` before `@import "tailwindcss"` breaks Tailwind's CSS layer ordering. Animation classes may not apply or may be overridden.
**Why it happens:** Tailwind v4 uses CSS `@layer` for ordering. Imports before tailwindcss end up in the wrong layer.
**How to avoid:** Always import tw-animate-css AFTER tailwindcss:
```css
@import "tailwindcss";
@import "tw-animate-css";
```

### Pitfall 4: Forgetting to Update @theme inline for New/Changed Tokens

**What goes wrong:** Changing `--accent` value in `:root` but not verifying it is mapped in `@theme inline` means Tailwind classes like `bg-accent` do not update.
**Why it happens:** The `@theme inline` block maps CSS vars to Tailwind utilities. If a new token is added to `:root` but not bridged, it is invisible to Tailwind.
**How to avoid:** The current `@theme inline` already maps all tokens that are changing (`--color-accent`, `--color-muted`, `--color-border`, etc.). Since we are only changing VALUES not adding new token NAMES, no `@theme inline` changes are needed. Only if new tokens are added (e.g., `--secondary-hover`) must they be bridged.

### Pitfall 5: Homepage Gradients Left Behind

**What goes wrong:** The homepage has gradient accent lines (`bg-gradient-to-r from-transparent via-[#c8102e] to-transparent`) at lines 110 and 328. These violate the "no gradients anywhere" decision.
**Why it happens:** Easy to focus on `--hero` removal and miss decorative gradient dividers.
**How to avoid:** Search for all gradient references in `page.tsx` and remove them. Replace with a simple border or nothing.

## Code Examples

### Complete globals.css :root Block (Post-Evolution)

```css
:root {
  /* -- Surfaces -- */
  --background: #faf9f7;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --muted: #f5f3f0;
  --muted-foreground: #475569;

  /* -- Brand: Primary (Navy) -- */
  --primary: #1e3a5f;
  --primary-foreground: #ffffff;

  /* -- Brand: Secondary (Burgundy) -- */
  --secondary: #a81225;
  --secondary-foreground: #ffffff;

  /* -- Interactive accents -- */
  --accent: #e8f0fa;
  --accent-foreground: #1e3a5f;

  /* -- Borders & inputs -- */
  --border: #e8e4df;
  --input: #e8e4df;
  --ring: #1e3a5f;

  /* -- Semantic: Destructive -- */
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;

  /* -- Semantic: Success -- */
  --success: #16a34a;
  --success-foreground: #ffffff;

  /* -- Semantic: Warning -- */
  --warning: #d97706;
  --warning-foreground: #ffffff;

  /* -- Admin sidebar -- */
  --sidebar: #152d4a;
  --sidebar-foreground: #e2e8f0;
  --sidebar-accent: rgba(255, 255, 255, 0.12);

  /* -- Radius -- */
  --radius: 0.625rem;

  /* -- Shadows -- */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  --shadow-dialog: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
```

### Homepage --hero Replacement (Minimal Fix)

```tsx
{/* Hero -- light treatment */}
<section className="relative overflow-hidden bg-muted">
  {/* Remove all gradient overlays */}
  <div className="container relative mx-auto px-4 pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-36 lg:pb-44">
    <div className="max-w-3xl">
      <p className="text-caption mb-5 text-secondary tracking-[0.2em]">
        Family-Owned Dealership in North Texas
      </p>
      <h1 className="text-display">
        Find Your Perfect <br className="hidden sm:block" />
        Ride in <span className="text-secondary">North Texas</span>
      </h1>
      {/* text-foreground/60 replaces text-white/60 */}
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
        ...
      </p>
      {/* Buttons use semantic classes instead of hardcoded hex */}
      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
        ...
      </Button>
    </div>
  </div>
</section>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwindcss-animate (JS plugin) | tw-animate-css (CSS import) | March 2025 (shadcn/ui Tailwind v4 migration) | Must use tw-animate-css ^1.4.0; tailwindcss-animate is incompatible with Tailwind v4 |
| framer-motion package name | motion package name | 2024 (Framer Motion rebrand) | Import from `motion/react`, not `framer-motion` |
| Dark mode via class toggle | OS-preference only via media query | N/A (this project) | Project removes dark mode entirely; simpler than scoping |

## Open Questions

1. **Homepage cleanup scope in this phase vs Phase 7**
   - What we know: Removing `--hero` requires touching `page.tsx`. The file also has 8+ hardcoded hex colors and 2 gradient accent lines.
   - What's unclear: Should all hardcoded colors be cleaned up now, or only the minimum to prevent breakage?
   - Recommendation: Clean up all hardcoded colors and remove gradients in this phase. The file is already being modified, and leaving broken hex references creates visual inconsistency before Phase 7 gets to it. The full layout redesign is Phase 7's job, but color/gradient cleanup belongs here.

2. **Secondary hover variant for burgundy**
   - What we know: Current hover uses `#a80d26` (hardcoded). New secondary is `#a81225`. Need a hover state.
   - What's unclear: Whether to add `--secondary-hover` token or use Tailwind opacity (`hover:bg-secondary/90`).
   - Recommendation: Use `hover:bg-secondary/90` -- avoids adding a new token. The darker shade from 90% opacity on #a81225 provides sufficient visual feedback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists, minimal config) |
| Quick run command | `bunx vitest run` |
| Full suite command | `bunx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSYS-01 | No dark media query in globals.css, color-scheme: light present | unit | `bunx vitest run tests/design-system.test.ts -t "dark mode removed"` | Wave 0 |
| DSYS-02 | Token values match spec, contrast ratios valid | unit | `bunx vitest run tests/design-system.test.ts -t "palette"` | Wave 0 |
| DSYS-03 | Animation utility classes exist in globals.css | unit | `bunx vitest run tests/design-system.test.ts -t "animation"` | Wave 0 |
| DSYS-04 | Libraries importable | unit | `bunx vitest run tests/design-system.test.ts -t "libraries"` | Wave 0 |
| DSYS-05 | Admin dashboard functional | manual-only | Visual verification: load admin dashboard with OS in dark mode, verify sidebar/charts/tables render correctly | N/A (visual) |

### Sampling Rate
- **Per task commit:** `bun run build` (catches CSS and TypeScript errors)
- **Per wave merge:** `bun run build && bunx vitest run`
- **Phase gate:** Full build + visual admin verification

### Wave 0 Gaps
- [ ] `tests/design-system.test.ts` -- covers DSYS-01 through DSYS-04 (file-based assertions on globals.css content + library imports)
- [ ] No test framework config changes needed -- vitest.config.ts exists with path aliases

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `globals.css` (all 337 lines), `layout.tsx`, `admin/layout.tsx`, `page.tsx` (all 389 lines), `sales-chart.tsx`, `inventory-chart.tsx`
- npm registry: tw-animate-css@1.4.0, motion@12.38.0, embla-carousel-react@8.6.0, yet-another-react-lightbox@3.29.1 (verified 2026-03-18)
- WCAG 2.1 contrast ratios computed for all proposed color combinations
- `.planning/research/ARCHITECTURE.md` -- dark mode removal strategy
- `.planning/research/PITFALLS.md` -- admin impact, contrast failures, animation jank
- `.planning/research/STACK.md` -- library versions and compatibility

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` -- overall architecture approach

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- versions verified on npm registry, compatibility confirmed via STACK.md
- Architecture: HIGH -- based on direct line-by-line analysis of globals.css, admin layout, chart components, and page.tsx
- Pitfalls: HIGH -- based on direct code analysis; contrast ratios mathematically computed; admin chart color references traced to exact CSS variables

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable domain, CSS fundamentals)
