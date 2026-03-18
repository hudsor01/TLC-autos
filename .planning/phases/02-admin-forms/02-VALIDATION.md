---
phase: 2
slug: admin-forms
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (to install in Wave 0) |
| **Config file** | vitest.config.ts (Wave 0 creates) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | W0 | 0 | N/A | setup | `npx vitest run` | Wave 0 creates | ⬜ pending |
| 02-01-01 | 01 | 1 | FORM-01 | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 1 | FORM-05 | unit | `npx vitest run src/lib/__tests__/api-validation.test.ts` | Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | FORM-02 | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 1 | FORM-03 | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 | ⬜ pending |
| 02-02-03 | 02 | 1 | FORM-04 | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 | ⬜ pending |
| 02-03-01 | 03 | 2 | MEDIA-02 | manual-only | Reorder images in vehicle form | N/A | ⬜ pending |
| 02-03-02 | 03 | 2 | MEDIA-03 | manual-only | Click star icon on image | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest: `npm install -D vitest @vitejs/plugin-react`
- [ ] Create `vitest.config.ts` with path alias support (`@/` → `./src/`)
- [ ] `src/lib/__tests__/schemas.test.ts` — stubs for FORM-01 through FORM-04
- [ ] `src/lib/__tests__/api-validation.test.ts` — stubs for FORM-05
- [ ] `src/lib/__tests__/deal-calculations.test.ts` — stubs for deal pricing math

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Image reorder via arrow buttons | MEDIA-02 | Browser interaction, Supabase Storage state | Open vehicle edit, click up/down arrows, verify order persists after save |
| Primary image selection via star icon | MEDIA-03 | Browser interaction, visual state | Click star on non-primary image, verify it becomes primary, verify listing shows it |
| Image deletion with confirmation | MEDIA-02 | Browser interaction, confirmation dialog | Click trash on image, confirm dialog, verify image removed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
