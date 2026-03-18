# Research Summary: TLC Autos Ecosystem Improvements

**Domain:** Used car dealership website + admin DMS
**Researched:** 2026-03-16
**Overall confidence:** MEDIUM (training data only -- WebSearch/Context7 unavailable for live verification)

## Executive Summary

The TLC Autos project has a solid foundation with Next.js 16, React 19, Prisma 7.5/SQLite, and a shadcn/ui-pattern component library. However, the current codebase has several high-impact gaps that introduce unnecessary boilerplate, poor user feedback, and fragile data handling.

The admin DMS pages use raw `fetch` + `useState` + `useEffect` patterns for every data operation -- no caching, no optimistic updates, no automatic revalidation. Forms use manual state management with zero validation. There is no toast notification system, no animation layer, no charting library for the dashboard, and the data tables are hand-rolled without sorting, column visibility, or export capability.

Adding 8-10 targeted packages would eliminate hundreds of lines of boilerplate, add proper validation at both client and server boundaries, give users immediate feedback via toasts, and make the admin DMS feel like a professional tool with sortable/filterable data tables and dashboard charts.

The most impactful additions are: (1) Zod for schema validation across API routes and forms, (2) react-hook-form for the vehicle form and all admin forms, (3) sonner for toast notifications, (4) @tanstack/react-table for admin data tables, (5) recharts for dashboard analytics, and (6) sharp for server-side image optimization.

## Key Findings

**Stack:** Add Zod, react-hook-form, sonner, @tanstack/react-table, recharts, sharp, nuqs, motion
**Architecture:** Replace raw fetch/useState patterns with proper form + validation + notification layers
**Critical pitfall:** No input validation on API routes -- any malformed data goes straight to Prisma

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation Layer** - Zod schemas + react-hook-form + sonner
   - Addresses: Form handling, validation, user feedback (all admin forms)
   - Avoids: Building more unvalidated forms that need retrofitting later

2. **Data Display Layer** - @tanstack/react-table + recharts + nuqs
   - Addresses: Admin data tables (vehicles, customers, leads, deals), dashboard charts, URL-synced filters
   - Avoids: Hand-rolling sorting/filtering logic that gets complex fast

3. **Media + Polish Layer** - sharp + motion
   - Addresses: Image optimization for vehicle photos, page transitions, UI micro-interactions
   - Avoids: Premature optimization before core functionality is solid

**Phase ordering rationale:**
- Validation must come first because every subsequent feature builds on validated data
- Data tables depend on having clean data, so they come after validation
- Visual polish (animations, image optimization) is last because it does not block functionality

**Research flags for phases:**
- Phase 1: Standard patterns, unlikely to need further research
- Phase 2: @tanstack/react-table integration with server-side pagination may need phase-specific research
- Phase 3: sharp configuration with Next.js 16 image component should be verified against current docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | All packages are well-established, but exact version compatibility with Next.js 16.1.6 could not be live-verified |
| Features | HIGH | Based on direct code analysis of the existing project |
| Architecture | MEDIUM | Patterns are industry standard but Next.js 16 specifics may differ |
| Pitfalls | HIGH | Identified directly from reading the codebase |

## Gaps to Address

- Could not verify exact latest versions of recommended packages via npm
- Next.js 16 specific caching/revalidation APIs may have changed from 15 -- verify with official docs
- @tanstack/react-table v9 release status unclear -- may still be v8
- motion (framer-motion rebrand) API stability with React 19 server components needs verification
