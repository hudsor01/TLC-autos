# Requirements: TLC Autos

**Defined:** 2026-03-18
**Core Value:** Customers can browse available vehicles and contact the dealership, while staff can manage the entire sales pipeline from a single admin dashboard.

## v1.1 Requirements

Requirements for the UI Polish milestone. Each maps to roadmap phases.

### Design System

- [x] **DSYS-01**: Site renders with light-only color scheme — no dark mode media query, `color-scheme: light` set
- [x] **DSYS-02**: CSS token palette evolved for light backgrounds — navy/crimson palette refined for premium aesthetic
- [x] **DSYS-03**: Animation utility classes defined in globals.css for scroll-reveal and hover transitions
- [x] **DSYS-04**: Libraries installed — motion, embla-carousel-react, yet-another-react-lightbox, tw-animate-css
- [x] **DSYS-05**: Admin dashboard remains functional after dark mode removal

### Shared Components

- [ ] **COMP-01**: SectionHeader component replaces 8+ duplicated section header patterns across pages
- [ ] **COMP-02**: PageHero component replaces 4 identical dark-bg subpage header blocks
- [ ] **COMP-03**: AnimatedSection component provides scroll-triggered fade/slide-in reveals via IntersectionObserver
- [ ] **COMP-04**: VehicleCard component extracted from InventoryClient with hover lift + shadow effects
- [ ] **COMP-05**: Header redesigned for light theme with sticky behavior and visible phone number
- [ ] **COMP-06**: Footer redesigned for premium light aesthetic

### Homepage

- [ ] **HOME-01**: Split-layout hero with vehicle imagery on one side and headline/CTAs on the other
- [ ] **HOME-02**: Featured vehicles section pulls 3-6 real inventory items from the API
- [ ] **HOME-03**: Stats/credibility bar redesigned for light palette
- [ ] **HOME-04**: All hardcoded hex colors replaced with CSS variables
- [ ] **HOME-05**: Scroll-reveal animations applied to page sections

### Inventory

- [ ] **INV-01**: Premium card grid with VehicleCard component, large images, and hover effects
- [ ] **INV-02**: Filter bar restyled for premium light aesthetic
- [ ] **INV-03**: Photo count badge displayed on inventory cards
- [ ] **INV-04**: Existing nuqs URL-synced filter/sort/pagination state preserved after redesign

### Vehicle Detail

- [ ] **VDP-01**: Gallery-first layout with large hero image dominating above the fold
- [ ] **VDP-02**: Thumbnail strip navigation for browsing all vehicle photos
- [ ] **VDP-03**: Sticky mobile CTA bar with Call/Inquire buttons on small screens
- [ ] **VDP-04**: Specs grid and feature badges restyled for premium aesthetic
- [ ] **VDP-05**: Image lazy-loading optimized — priority on hero, lazy on thumbnails

### Secondary Pages

- [ ] **SEC-01**: Contact page redesigned with premium form layout
- [ ] **SEC-02**: Contact page Google Maps embed replaces placeholder
- [ ] **SEC-03**: About page redesigned with brand story layout
- [ ] **SEC-04**: Financing page redesigned with refined step cards and CTAs
- [ ] **SEC-05**: All secondary pages use PageHero component with consistent premium headers

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Vehicle Detail Enhancements

- **DEF-01**: Payment estimator on VDP — client-side monthly payment calculator
- **DEF-02**: Similar vehicles section on VDP — 3-4 related vehicles by body style or price range
- **DEF-03**: Vehicle inquiry form on VDP — inline form pre-filled with vehicle info

### Homepage Enhancements

- **DEF-04**: Animated stats counters — numbers count up from 0 on scroll into view

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode toggle | Milestone explicitly removes dark mode for light-only premium aesthetic |
| Gated pricing / "Call for price" | Destroys buyer trust — always display listed price |
| Aggressive popups / chat widgets | Interrupts browsing, feels desperate for independent dealer |
| Auto-playing video with sound | Accessibility-hostile, increases bounce rate |
| Rotating hero carousel | Abysmal click-through rates (<1% after first slide) |
| Online purchasing / checkout | Out of scope per PROJECT.md — deals tracked in admin, not online |
| Buyer login / account system | No customer portal needed — public pages are anonymous |
| Heavy parallax scrolling | Gimmicky overuse causes motion sickness, hurts mobile performance |
| Stock photography of people | Undermines authenticity — use real vehicles or icon-based props |
| Admin dashboard redesign | Explicitly out of scope for v1.1 — public site only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSYS-01 | Phase 5 | Complete |
| DSYS-02 | Phase 5 | Complete |
| DSYS-03 | Phase 5 | Complete |
| DSYS-04 | Phase 5 | Complete |
| DSYS-05 | Phase 5 | Complete |
| COMP-01 | Phase 6 | Pending |
| COMP-02 | Phase 6 | Pending |
| COMP-03 | Phase 6 | Pending |
| COMP-04 | Phase 6 | Pending |
| COMP-05 | Phase 6 | Pending |
| COMP-06 | Phase 6 | Pending |
| HOME-01 | Phase 7 | Pending |
| HOME-02 | Phase 7 | Pending |
| HOME-03 | Phase 7 | Pending |
| HOME-04 | Phase 7 | Pending |
| HOME-05 | Phase 7 | Pending |
| INV-01 | Phase 8 | Pending |
| INV-02 | Phase 8 | Pending |
| INV-03 | Phase 8 | Pending |
| INV-04 | Phase 8 | Pending |
| VDP-01 | Phase 9 | Pending |
| VDP-02 | Phase 9 | Pending |
| VDP-03 | Phase 9 | Pending |
| VDP-04 | Phase 9 | Pending |
| VDP-05 | Phase 9 | Pending |
| SEC-01 | Phase 10 | Pending |
| SEC-02 | Phase 10 | Pending |
| SEC-03 | Phase 10 | Pending |
| SEC-04 | Phase 10 | Pending |
| SEC-05 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after roadmap creation*
