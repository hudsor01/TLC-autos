# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-18
**Phases:** 4 | **Plans:** 12

### What Was Built
- Infrastructure layer: typed Supabase queries, RLS policies, seed script, toast system
- Admin forms for vehicles, customers, leads, deals with Zod validation and field-level errors
- Vehicle image management (upload, reorder, delete, primary selection)
- Data tables with sorting, filtering, pagination, and URL-synced state
- Dashboard with stats cards and Recharts visualizations
- Public inventory with server-side filtering, vehicle detail with gallery/lightbox, contact form

### What Worked
- Wave-based parallel execution: independent plans ran simultaneously (03-02 + 03-03)
- Auto-advance chain eliminated manual transitions between phases
- Schema-first Zod validation shared between client forms and server routes reduced duplication
- Column factory pattern made adding new entity tables trivial
- Phase branching kept work isolated without merge conflicts

### What Was Inefficient
- FORM-02/03/04 requirement checkboxes not auto-updated when forms were built — caused confusion during audit
- Phase 3/4 plan checkboxes in ROADMAP.md not fully updated by CLI tooling
- Contact form built with inline Zod rather than TanStack Form — inconsistent with admin forms pattern

### Patterns Established
- `validateRequest` discriminated union for API route validation
- `useTableFilters` hook bridging nuqs state to tanstack-table
- `getXxxColumns` factory with `onDelete` callback for entity table columns
- `ALLOWED_SORT` allowlist for sort injection prevention
- `fetchXxxById` query functions for single-entity pages
- `toast.promise` for async operation feedback

### Key Lessons
1. Track requirement completion at the moment code ships, not retroactively during audit
2. Auto-advance from discuss→plan→execute works well for coarse-grained phases
3. CSS variable theming for chart libraries keeps dark mode consistent with zero extra work

### Cost Observations
- Model mix: 100% quality profile (opus)
- Sessions: ~3 sessions across 3 days
- Notable: 12 plans completed with average ~4 min each

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | Auto-advance chain, wave-based parallel execution |

### Top Lessons (Verified Across Milestones)

1. Schema-first validation with shared Zod schemas eliminates client/server drift
2. URL-synced state (nuqs) should be planned from the start, not retrofitted
