---
phase: 5
slug: design-system-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `bunx vitest run` |
| **Full suite command** | `bunx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run build`
- **After every plan wave:** Run `bun run build && bunx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DSYS-01 | unit | `bunx vitest run tests/design-system.test.ts -t "dark mode removed"` | W0 | pending |
| 05-01-02 | 01 | 1 | DSYS-02 | unit | `bunx vitest run tests/design-system.test.ts -t "palette"` | W0 | pending |
| 05-01-03 | 01 | 1 | DSYS-03 | unit | `bunx vitest run tests/design-system.test.ts -t "animation"` | W0 | pending |
| 05-02-01 | 02 | 1 | DSYS-04 | unit | `bunx vitest run tests/design-system.test.ts -t "libraries"` | W0 | pending |
| 05-01-04 | 01 | 1 | DSYS-05 | manual | Visual admin dashboard verification | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/design-system.test.ts` — stubs for DSYS-01 through DSYS-04 (file-based assertions on globals.css content + library imports)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin dashboard renders correctly on dark-OS | DSYS-05 | Visual verification of chart colors, sidebar, tables on light background | 1. Set OS to dark mode 2. Load /admin 3. Verify sidebar dark navy, content light 4. Check charts readable 5. Verify tables/forms display correctly |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
