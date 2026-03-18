# Roadmap: TLC Autos

## Milestones

- v1.0 MVP — Phases 1-4 (shipped 2026-03-18)
- **v1.1 UI Polish** — Phases 5-10 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-18</summary>

- [x] Phase 1: Foundation (3/3 plans) — completed 2026-03-18
- [x] Phase 2: Admin Forms (4/4 plans) — completed 2026-03-18
- [x] Phase 3: Admin Data & Dashboard (3/3 plans) — completed 2026-03-18
- [x] Phase 4: Public Site (2/2 plans) — completed 2026-03-18

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### v1.1 UI Polish

**Milestone Goal:** Redesign all public-facing pages with a light-only, premium aesthetic — evolved brand palette, refined typography, gallery-first vehicle detail, and subtle motion throughout.

- [ ] **Phase 5: Design System Foundation** - Remove dark mode, evolve CSS token palette, install animation libraries
- [ ] **Phase 6: Shared Components** - Extract and create reusable components consumed by all page redesigns
- [ ] **Phase 7: Homepage Redesign** - Split-layout hero, featured vehicles, scroll-reveal animations
- [ ] **Phase 8: Inventory Page** - Premium card grid with hover effects and refined filters
- [ ] **Phase 9: Vehicle Detail Page** - Gallery-first layout with sticky mobile CTA
- [ ] **Phase 10: Secondary Pages** - Contact, About, and Financing page redesigns

## Phase Details

### Phase 5: Design System Foundation
**Goal**: The site renders exclusively in a refined light-only color scheme with animation utilities ready for all subsequent phases
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05
**Success Criteria** (what must be TRUE):
  1. Every page on the site renders with a light color scheme — no dark backgrounds appear on any OS dark mode setting
  2. The evolved navy/crimson palette produces text with at least 4.5:1 contrast ratio against all light backgrounds
  3. Admin dashboard pages (sidebar, tables, charts, forms) remain fully usable after dark mode removal
  4. Animation utility classes (fade-in, slide-up, hover transitions) can be applied to any element via CSS class names
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Shared Components
**Goal**: Reusable components exist that all page redesigns will consume, eliminating duplication and establishing the visual language
**Depends on**: Phase 5
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06
**Success Criteria** (what must be TRUE):
  1. A consistent section header pattern is used site-wide — no inline/duplicated header markup remains
  2. All subpages display a premium hero banner from one shared component
  3. Sections animate into view on scroll with a smooth fade/slide entrance
  4. The site header is sticky, shows the dealership phone number, and renders correctly on the light background
  5. The site footer matches the premium light aesthetic and appears consistently on every page
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Homepage Redesign
**Goal**: The homepage makes a strong first impression with a split-layout hero, real inventory teasers, and scroll-reveal polish
**Depends on**: Phase 6
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. The homepage hero displays a vehicle image alongside headline text and CTAs in a split layout
  2. A featured vehicles section shows 3-6 real vehicles pulled from inventory data
  3. The stats/credibility bar renders with the evolved light palette — no hardcoded hex colors remain on the page
  4. Page sections animate into view as the user scrolls down
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Inventory Page
**Goal**: Customers browse inventory through a visually polished card grid with refined filtering
**Depends on**: Phase 6
**Requirements**: INV-01, INV-02, INV-03, INV-04
**Success Criteria** (what must be TRUE):
  1. Vehicles display in a card grid with large images and visible hover lift/shadow effects
  2. Each vehicle card shows a photo count badge indicating how many images are available
  3. The filter bar renders with the premium light aesthetic and all existing filter/sort/pagination URL state works identically to before
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Vehicle Detail Page
**Goal**: The highest-conversion page leads with a gallery-first layout and keeps CTAs always accessible on mobile
**Depends on**: Phase 6
**Requirements**: VDP-01, VDP-02, VDP-03, VDP-04, VDP-05
**Success Criteria** (what must be TRUE):
  1. The vehicle detail page opens with a large hero image dominating above the fold
  2. Users can browse all vehicle photos via a thumbnail strip without opening the lightbox
  3. On mobile screens, a sticky CTA bar with Call and Inquire buttons remains visible while scrolling
  4. Vehicle specs and feature badges render in a clean grid with the premium light aesthetic
  5. Only the hero image loads eagerly — thumbnails and lightbox images lazy-load
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Secondary Pages
**Goal**: Contact, About, and Financing pages complete the premium redesign with consistent visual language
**Depends on**: Phase 6
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. The contact page displays a real Google Maps embed showing the dealership location
  2. The contact form renders in a premium layout and all existing on-blur Zod validation continues to work
  3. The About page tells the brand story in a structured layout
  4. The Financing page presents options in clear step cards with prominent CTAs
  5. All three pages use the shared PageHero component for consistent premium headers
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases 5 and 6 are sequential (foundation, then components). Phases 7, 8, 9, 10 each depend on Phase 6 but are independent of each other.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-03-18 |
| 2. Admin Forms | v1.0 | 4/4 | Complete | 2026-03-18 |
| 3. Admin Data & Dashboard | v1.0 | 3/3 | Complete | 2026-03-18 |
| 4. Public Site | v1.0 | 2/2 | Complete | 2026-03-18 |
| 5. Design System Foundation | v1.1 | 0/0 | Not started | - |
| 6. Shared Components | v1.1 | 0/0 | Not started | - |
| 7. Homepage Redesign | v1.1 | 0/0 | Not started | - |
| 8. Inventory Page | v1.1 | 0/0 | Not started | - |
| 9. Vehicle Detail Page | v1.1 | 0/0 | Not started | - |
| 10. Secondary Pages | v1.1 | 0/0 | Not started | - |

---
*Roadmap created: 2026-03-18*
*Last updated: 2026-03-18*
