---
phase: 02-admin-forms
plan: 02
subsystem: ui
tags: [tanstack-form, zod, image-management, vehicle-form, card-layout, optimistic-updates]

# Dependency graph
requires:
  - phase: 02-admin-forms
    provides: "Zod schemas (vehicleSchema), FormField wrapper, api-validation helper, SearchableSelect"
  - phase: 01-foundation
    provides: "Database types, Supabase client, utility functions (cn, camelKeys, snakeKeys), auth-guard"
provides:
  - "VehicleForm component with TanStack Form + Zod Standard Schema validation + 4 Card sections"
  - "ImageManager component with upload, reorder, delete, primary selection and optimistic updates"
  - "Vehicle API POST/PUT routes with Zod validation returning structured field errors"
  - "Image API PATCH endpoint for reorder (sort_order) and primary toggle (is_primary)"
affects: [02-admin-forms]

# Tech tracking
tech-stack:
  added: []
  patterns: ["TanStack Form useForm with Standard Schema validators (onSubmit + onBlur)", "Optimistic UI with revert on API failure", "toast.promise for async submit feedback", "beforeunload dirty form guard", "Card-section form layout"]

key-files:
  created:
    - src/components/admin/image-manager.tsx
  modified:
    - src/components/admin/vehicle-form.tsx
    - src/app/admin/vehicles/new/page.tsx
    - src/app/admin/vehicles/[id]/page.tsx
    - src/app/api/admin/vehicles/route.ts
    - src/app/api/admin/vehicles/[id]/route.ts
    - src/app/api/admin/vehicles/[id]/images/route.ts

key-decisions:
  - "VehicleForm handles submit internally (no onSubmit prop) -- simpler page integration, form owns routing"
  - "ImageManager uses optimistic updates with revert on failure for responsive UX"
  - "Edit page removed separate Images tab -- ImageManager embedded in form's Images Card section"
  - "setFieldMeta with errorMap.onSubmit for server-side validation error propagation"

patterns-established:
  - "Form components own their submit logic and routing -- pages just pass initialData"
  - "Optimistic image operations with rollback pattern for PATCH/DELETE"
  - "Card-section layout for multi-section forms with CardHeader/CardContent"

requirements-completed: [FORM-01, MEDIA-02, MEDIA-03, FORM-05]

# Metrics
duration: 6min
completed: 2026-03-18
---

# Phase 2 Plan 2: Vehicle Form & Image Management Summary

**TanStack Form vehicle form with 4 Card sections, Zod validation, ImageManager with upload/reorder/delete/primary, and validated API routes with PATCH endpoint**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-18T05:07:31Z
- **Completed:** 2026-03-18T05:13:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- VehicleForm fully rewritten with TanStack Form useForm, Zod Standard Schema validators (onSubmit + onBlur), 4 Card sections (Vehicle Information, Pricing & Costs, Description & Features, Images)
- ImageManager component handles upload (POST FormData), arrow reorder (PATCH), star primary toggle (PATCH), trash delete with confirmation dialog (DELETE), all with optimistic updates and error rollback
- Vehicle API POST/PUT routes validate request body with vehicleSchema via validateRequest, returning structured fieldErrors on 400
- Image API PATCH endpoint handles both reorder (sort_order updates) and primary toggle (is_primary updates) in a single endpoint
- beforeunload guard prevents accidental navigation away from dirty forms
- toast.promise provides loading/success/error feedback on form submission

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite VehicleForm with TanStack Form + Card sections + ImageManager** - `d4fedf8` (feat)
2. **Task 2: Add Zod validation to vehicle API routes + PATCH endpoint for images** - `731ad4d` (feat)

## Files Created/Modified
- `src/components/admin/image-manager.tsx` - ImageManager component with upload, reorder, delete, primary selection
- `src/components/admin/vehicle-form.tsx` - Full rewrite with TanStack Form, Zod validators, 4 Card sections, toast.promise
- `src/app/admin/vehicles/new/page.tsx` - Simplified to render VehicleForm without props
- `src/app/admin/vehicles/[id]/page.tsx` - Updated to pass VehicleFormValues + id + images to form, removed Images tab
- `src/app/api/admin/vehicles/route.ts` - Added validateRequest + vehicleSchema to POST handler
- `src/app/api/admin/vehicles/[id]/route.ts` - Added validateRequest + vehicleSchema to PUT handler
- `src/app/api/admin/vehicles/[id]/images/route.ts` - Added PATCH endpoint for reorder and primary toggle

## Decisions Made
- VehicleForm handles submit internally (no onSubmit prop) for simpler page integration -- form owns routing and toast feedback
- ImageManager uses optimistic updates with revert on API failure for responsive UX
- Edit page removed separate Images tab -- ImageManager is now embedded directly in the form's Images Card section
- Server-side validation errors are propagated to form fields via setFieldMeta with errorMap.onSubmit

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed store.subscribe cleanup in useEffect**
- **Found during:** Task 1 (VehicleForm rewrite)
- **Issue:** TanStack Store subscribe returns a Subscription object with .unsubscribe() method, not a cleanup function
- **Fix:** Changed `return form.store.subscribe(...)` to `const sub = form.store.subscribe(...); return () => sub.unsubscribe()`
- **Files modified:** src/components/admin/vehicle-form.tsx
- **Verification:** npx tsc --noEmit passes

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor API correction. No scope creep.

## Issues Encountered
- Pre-existing TypeScript errors in src/components/admin/deal-form.tsx (out of scope, not modified by this plan)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Vehicle form and image management complete, ready for customer/lead/deal forms in plans 02-03 and 02-04
- Card-section layout pattern established for reuse across entity forms
- Validated API route pattern (validateRequest + schema) ready to apply to other entity routes

---
*Phase: 02-admin-forms*
*Completed: 2026-03-18*
