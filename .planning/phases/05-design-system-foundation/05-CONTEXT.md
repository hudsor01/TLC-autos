# Phase 5: Design System Foundation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove dark mode entirely, evolve the CSS token palette to a premium light-only aesthetic with warm whites, define animation utility classes for scroll-reveal and hover transitions, and install the 4 new libraries. Verify admin dashboard remains functional. No page redesigns — this is the foundation everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Palette Evolution
- Shift to warm whites: background becomes creamy off-white (#faf9f7 range), muted surfaces warm-toned (#f5f3f0 range), borders warm (#e8e4df range)
- Crimson shifts slightly deeper/richer — more burgundy (#a81225 range) for upscale feel on light surfaces
- Navy primary (#1e3a5f) stays as-is — admin sidebar depends on it, and it reads well on warm whites
- Muted-foreground darkens from #64748b to #475569 (slate-600, 7:1 contrast ratio) for WCAG AA compliance
- Accent color: warm blue tint (#e8f0fa range) with navy foreground — on-brand, differentiates from destructive states
- No gradients anywhere — flat, clean surfaces only

### Animation Identity
- Scroll-reveal: fade-up pattern (opacity 0→1 + translateY 10-20px → 0)
- Timing: quick and snappy — 300-400ms max, ease-out easing. "Make it snap."
- Hover transitions: fast, 150-200ms ease-out for cards, buttons, interactive elements
- Staggered reveals: yes, subtle 50-75ms delay between items in groups (card grids, feature lists)
- Only animate transform and opacity (GPU-composited properties)
- Respect existing prefers-reduced-motion block in globals.css

### Hero/CTA Surface Treatment
- ALL LIGHT — no dark navy hero or CTA sections
- Remove --hero and --hero-foreground CSS variables entirely
- Hero sections use the same light palette as the rest of the site
- No gradients — the vehicle imagery and typography do the visual work
- Claude's discretion on subtle differentiation (tint, spacing, accent lines — but no gradients)

### Admin Impact
- Accept light admin — content areas become light, sidebar stays dark navy via --sidebar tokens
- Verify admin Recharts chart colors render well on light backgrounds in this phase
- No admin-specific dark scope or isolation — admin is 1-2 users, light is fine

### Claude's Discretion
- Exact hex values for warm white palette (within the warm direction established above)
- Exact crimson hex value (within the deeper/richer direction, ~#a81225 area)
- How hero section differentiates from body content without dark bg or gradients
- Animation utility class naming conventions
- tw-animate-css integration specifics
- Whether to add color-scheme: light to html or :root

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/research/ARCHITECTURE.md` — Dark mode removal strategy, component extraction plan, CSS variable architecture
- `.planning/research/PITFALLS.md` — Pitfall 1 (dark mode breaks admin), Pitfall 4 (color contrast), recovery strategies
- `.planning/research/STACK.md` — Library versions, installation commands, compatibility notes

### Current Implementation
- `src/app/globals.css` — Current design system with dark mode block at lines 127-169, all CSS tokens
- `src/app/layout.tsx` — Font loading (Outfit + Source Sans 3), body class structure
- `src/app/admin/layout.tsx` — Admin sidebar using bg-primary, content area using bg-background

### Project Decisions
- `.planning/PROJECT.md` — Constraints section (globals.css is single source of truth for UI tokens)
- `.planning/REQUIREMENTS.md` — DSYS-01 through DSYS-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `globals.css` Section 2 (lines 66-120): Complete light mode token set — evolve in-place, don't restructure
- `globals.css` Section 6 (lines 248-257): prefers-reduced-motion block — keep as-is, animation utilities must respect it
- `globals.css` Section 5 (lines 200-235): Typography scale classes — already use var(--font-heading), no changes needed

### Established Patterns
- CSS variables flow: :root defines tokens → @theme inline bridges to Tailwind → components use Tailwind classes
- Sidebar uses --sidebar/--sidebar-foreground/--sidebar-accent (not --primary for bg, despite bg-primary class — the bg-primary class resolves to --primary which is navy)
- Admin layout uses bg-muted/30 for page background, bg-background for header

### Integration Points
- `src/app/page.tsx` has hardcoded hex colors (#c8102e, #ef4444, #a80d26) and style={{ backgroundColor: "var(--hero)" }} — these MUST be updated when --hero is removed (Phase 7 handles the page redesign, but removing --hero variable here means the homepage will need a temporary fallback or simultaneous update)
- Homepage references --hero in two places: hero section (line 94) and CTA section (line 323)

</code_context>

<specifics>
## Specific Ideas

- "Make it snap" — animations should feel crisp and responsive, not floaty or slow
- All light, no gradients at all — clean flat surfaces, imagery does the heavy lifting
- Premium feel like certified pre-owned / Carvana clean — warm, inviting, not clinical
- Burgundy crimson shift for more upscale feel vs the current bright red

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-design-system-foundation*
*Context gathered: 2026-03-18*
