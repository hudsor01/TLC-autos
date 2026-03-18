---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed yet |
| **Config file** | None — see Wave 0 |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx next build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-03 | smoke | `npx tsc --noEmit` | Existing via lefthook | ⬜ pending |
| 01-02-01 | 02 | 1 | INFRA-02 | manual-only | SQL role query in Supabase | N/A | ⬜ pending |
| 01-03-01 | 03 | 2 | INFRA-01 | manual-only | `bun run scripts/seed.ts` | N/A | ⬜ pending |
| 01-04-01 | 04 | 2 | AUTH-03 | manual-only | Click logout, verify redirect | N/A | ⬜ pending |
| 01-04-02 | 04 | 2 | NOTF-01 | manual-only | Trigger CRUD, verify toast | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No formal test framework needed for Phase 1
- Existing lefthook pre-commit hooks (lint + typecheck + build) serve as primary automated validation
- Formal test framework setup (vitest/playwright) deferred to Phase 2+

*Existing infrastructure covers all phase requirements via typecheck and build pipeline.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Seed script populates DB | INFRA-01 | One-time script execution, verifies DB state | Run `bun run scripts/seed.ts`, query tables for expected row counts |
| RLS blocks unauthenticated | INFRA-02 | Requires Supabase role context | Query tables as anon role, verify empty results; query as staff, verify filtered rows |
| Logout redirects to homepage | AUTH-03 | Browser interaction | Click logout in admin sidebar, verify redirect to `/` |
| Toast on CRUD operations | NOTF-01 | Visual UI feedback | Trigger a CRUD action, verify toast appears bottom-right |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
