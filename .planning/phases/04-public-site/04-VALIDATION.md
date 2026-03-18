---
phase: 04
slug: public-site
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `bunx vitest run --reporter=verbose` |
| **Full suite command** | `bunx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bunx vitest run --reporter=verbose`
- **After every plan wave:** Run `bunx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PUB-01, PUB-04 | integration | `bunx vitest run` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | PUB-02 | integration | `bunx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | PUB-03 | unit | `bunx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing vitest infrastructure covers all phase requirements
- [ ] Test utilities for Supabase mock queries if needed

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Filter dropdowns show correct options | PUB-01 | Requires browser rendering | Open /inventory, verify make/year/price dropdowns populate |
| Image gallery lightbox navigation | PUB-02 | Visual browser interaction | Click vehicle image, verify lightbox opens with prev/next |
| URL filter persistence across tabs | PUB-04 | Requires multi-tab browser test | Apply filters, copy URL, paste in new tab, verify same results |
| Contact form inline errors | PUB-03 | Visual error display | Submit empty form, verify field-level error messages appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
