---
phase: 03
slug: admin-data-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.1.1 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DATA-01..04 | build+type | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | DATA-05 | build+type | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-01 | 02 | 2 | DASH-01 | build+type | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-02 | 02 | 2 | DASH-02 | build+type | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Vitest is installed and configured from Phase 2. TypeScript strict mode provides compile-time validation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| URL filter sync | DATA-05 | Requires browser URL bar inspection | Apply filter, copy URL, open in new tab, verify same filter state |
| Chart interactivity | DASH-02 | Requires visual/hover inspection | Hover chart elements, verify tooltips show correct values |
| Table sort/filter UX | DATA-01..04 | Requires browser interaction | Click column headers, type in search, verify table updates |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
