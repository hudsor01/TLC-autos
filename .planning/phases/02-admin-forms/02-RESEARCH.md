# Phase 2: Admin Forms - Research

**Researched:** 2026-03-17
**Domain:** Form management with @tanstack/react-form + Zod 4, image management, server-side validation
**Confidence:** HIGH

## Summary

This phase rewrites all 4 admin entity forms (vehicles, customers, leads, deals) from raw `useState` patterns to @tanstack/react-form v1 with Zod 4 schema validation. The project already has both libraries installed at current versions (`@tanstack/react-form@1.28.5`, `zod@4.3.6`). TanStack Form v1 supports Standard Schema natively -- no adapter package needed. Zod 4 schemas can be passed directly to the `validators` option of `useForm`.

A critical implementation detail: when using Standard Schema validators (Zod) with TanStack Form v1, the `field.state.meta.errors` array contains `StandardSchemaV1Issue` objects, not plain strings. Error messages must be extracted via `.message` property (e.g., `errors.map(err => err.message).join(', ')`). This is a common pitfall that causes blank error messages if not handled.

The phase also adds Zod validation to all admin API routes (vehicles, customers, leads, deals) with structured error responses that the client can map back to form fields. Image management (reorder, delete, set primary) is integrated as a section within the vehicle form. The existing API routes for image upload/delete are already functional and just need reorder and primary-toggle endpoints added.

**Primary recommendation:** Build a shared `FormField` wrapper component that handles the Label + Input + error display pattern with proper accessibility attributes, then compose all 4 entity forms from it. Use a single shared `schemas.ts` file for both client and server validation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full rewrite of existing useState forms to @tanstack/react-form + Zod (not a wrap of existing code)
- Shared form helpers: create reusable hooks/utilities for common patterns (field rendering, error display, submission handling) that all 4 entity forms compose
- Shared Zod schemas in `src/lib/schemas.ts` -- single source of truth for both client-side forms and server-side API validation
- Dual-mode forms: one component handles both create and edit (receives optional initialData prop, matching existing VehicleForm pattern)
- Vehicle form uses sections with Card components (Vehicle Info, Pricing/Costs, Description/Features, Images) -- single scrollable page, not tabs
- Deal form: extract pricing calculations to `src/lib/deal-calculations.ts` for testability and reuse
- Deal form includes searchable customer and vehicle selectors (link deal to existing records)
- Image management lives as a section within the vehicle form (an "Images" Card at the bottom)
- Reorder via up/down arrow buttons on each image thumbnail
- Delete via X/trash icon with confirmation dialog before removing
- Validation errors appear on submit, then re-validate on blur as user fixes fields (not before first submit attempt)
- Visual: red/destructive border on invalid field + error message text below the field in small red text
- No error summary banner at top of form -- field-level errors only, scroll to first error on submit
- Server-side Zod validation errors returned as structured field paths -- client maps them back to individual form fields
- After successful create/edit: redirect to entity list page with success toast via Sonner
- Submit button: disabled + loading spinner during submission, text changes to "Saving..."
- Unsaved changes: browser `beforeunload` warning if form has dirty fields
- All submissions use Sonner `toast.promise()` for loading/success/error feedback
- All admin API routes validate request body with Zod schemas imported from `src/lib/schemas.ts`
- Malformed JSON returns structured Zod validation error response (field paths + messages), not a 500

### Claude's Discretion
- Exact field grouping within vehicle form sections
- Lead form vehicle selector approach (dropdown vs text)
- Primary image selection UI pattern (star vs radio vs position-based)
- Loading skeleton design for edit forms fetching data
- Exact @tanstack/react-form configuration and adapter setup

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORM-01 | Vehicle form uses @tanstack/react-form with Zod validation and field-level errors | TanStack Form v1 useForm + Zod Standard Schema integration, FormField wrapper pattern |
| FORM-02 | Customer form uses @tanstack/react-form with Zod validation | Same shared FormField pattern, customerSchema in schemas.ts |
| FORM-03 | Lead form uses @tanstack/react-form with Zod validation | Same shared FormField pattern, leadSchema in schemas.ts |
| FORM-04 | Deal form uses @tanstack/react-form with Zod validation | Same pattern + SearchableSelect (Popover+Command) + deal-calculations.ts |
| FORM-05 | All admin API routes validate input with Zod schemas | Shared schemas + validateRequest helper + structured error response format |
| MEDIA-02 | Vehicle images can be reordered and deleted in admin | ImageManager component with up/down arrows, new PATCH endpoint for sort_order/is_primary |
| MEDIA-03 | Primary image selection for vehicle listings | Star icon toggle on thumbnails, PATCH endpoint to update is_primary |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-form | 1.28.5 | Form state management, field-level validation | Already installed. Standard Schema support (Zod) built-in, no adapter needed |
| zod | 4.3.6 | Schema validation (client + server) | Already installed. Zod 4 with Standard Schema compliance |
| sonner | 2.0.7 | Toast notifications for form feedback | Already installed and wired in root layout |
| lucide-react | 0.577.0 | Icons (Loader2, Star, Trash2, ChevronUp, ChevronDown) | Already installed |

### Supporting (shadcn components to install)
| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| Separator | Visual dividers between form subsections | `npx shadcn@latest add separator` |
| Popover | Container for searchable selectors | `npx shadcn@latest add popover` |
| Command | Searchable list (cmdk-based) for deal form selectors | `npx shadcn@latest add command` |
| Checkbox | Boolean field controls | `npx shadcn@latest add checkbox` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-form | react-hook-form | RHF is more mature ecosystem, but project already has TanStack Form installed and CONTEXT.md locks this choice |
| Form-level Zod schema | Field-level inline validators | Form-level schema is the locked decision for single source of truth; field-level causes drift between client/server |

**Installation:**
```bash
npx shadcn@latest add separator popover command checkbox
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── schemas.ts              # Shared Zod schemas (vehicle, customer, lead, deal)
│   ├── deal-calculations.ts    # Extracted deal pricing logic
│   └── utils.ts                # Existing: cn(), camelKeys(), snakeKeys()
├── components/
│   ├── admin/
│   │   ├── form-field.tsx      # Reusable FormField wrapper (Label + Input + error)
│   │   ├── image-manager.tsx   # Image grid with upload/reorder/delete/primary
│   │   ├── searchable-select.tsx # Popover + Command combo for deal form
│   │   ├── vehicle-form.tsx    # REWRITTEN: TanStack Form + Card sections
│   │   ├── customer-form.tsx   # NEW: extracted from page component
│   │   ├── lead-form.tsx       # NEW: extracted from page component
│   │   └── deal-form.tsx       # NEW: extracted from page component
│   └── ui/                     # Existing shadcn primitives
├── app/
│   ├── api/admin/
│   │   ├── vehicles/
│   │   │   ├── route.ts        # ADD Zod validation
│   │   │   └── [id]/
│   │   │       ├── route.ts    # ADD Zod validation
│   │   │       └── images/
│   │   │           └── route.ts # ADD PATCH for reorder/primary
│   │   ├── customers/
│   │   │   ├── route.ts        # ADD Zod validation
│   │   │   └── [id]/route.ts   # ADD Zod validation
│   │   ├── leads/
│   │   │   ├── route.ts        # ADD Zod validation
│   │   │   └── [id]/route.ts   # ADD Zod validation
│   │   └── deals/
│   │       ├── route.ts        # ADD Zod validation
│   │       └── [id]/route.ts   # ADD Zod validation
│   └── admin/
│       ├── vehicles/new/page.tsx   # Uses VehicleForm
│       ├── vehicles/[id]/edit/page.tsx
│       ├── customers/new/page.tsx  # Uses CustomerForm
│       ├── customers/[id]/edit/page.tsx
│       ├── leads/new/page.tsx      # Uses LeadForm
│       ├── leads/[id]/edit/page.tsx
│       ├── deals/new/page.tsx      # Uses DealForm
│       └── deals/[id]/edit/page.tsx
└── types/
    ├── database.types.ts       # Generated Supabase types
    └── helpers.ts              # Tables, InsertTables, UpdateTables
```

### Pattern 1: FormField Wrapper Component
**What:** A reusable component that wraps Label + Input/Select/Textarea + error display, integrating with TanStack Form's field API.
**When to use:** Every form field across all 4 entity forms.
**Example:**
```typescript
// src/components/admin/form-field.tsx
import type { AnyFieldApi } from "@tanstack/react-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function getFieldErrors(field: AnyFieldApi): string[] {
  // Standard Schema validators return issue objects, not strings
  return field.state.meta.errors.map((err) =>
    typeof err === "string" ? err : (err as { message: string }).message
  )
}

interface FormFieldProps {
  field: AnyFieldApi
  label: string
  children: (props: {
    isInvalid: boolean
    errorId: string
  }) => React.ReactNode
}

export function FormField({ field, label, children }: FormFieldProps) {
  const errors = getFieldErrors(field)
  const isInvalid = field.state.meta.isTouched && errors.length > 0
  const errorId = `${field.name}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      {children({ isInvalid, errorId })}
      {isInvalid && (
        <p id={errorId} className="text-xs text-destructive mt-1">
          {errors[0]}
        </p>
      )}
    </div>
  )
}
```

### Pattern 2: useForm with Zod Standard Schema + Validation Strategy
**What:** Form-level Zod schema validation that triggers on submit first, then re-validates on blur.
**When to use:** All entity forms.
**Example:**
```typescript
// Source: TanStack Form v1 docs + Zod Standard Schema
import { useForm } from "@tanstack/react-form"
import { vehicleSchema } from "@/lib/schemas"

const form = useForm({
  defaultValues: initialData ?? defaultVehicleValues,
  validators: {
    onSubmit: vehicleSchema,
    onBlur: vehicleSchema,
  },
  onSubmit: async ({ value }) => {
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    })
    if (!res.ok) {
      const data = await res.json()
      if (data.fieldErrors) {
        // Map server validation errors to form fields
        Object.entries(data.fieldErrors).forEach(([field, message]) => {
          form.setFieldMeta(field, (prev) => ({
            ...prev,
            errors: [{ message: message as string }],
          }))
        })
        return
      }
      throw new Error(data.error || "Failed to save")
    }
    // Success: redirect handled by caller
  },
})
```

### Pattern 3: Server-Side Zod Validation Helper
**What:** A reusable helper that validates request body against Zod schema and returns structured errors.
**When to use:** All admin API route POST/PUT handlers.
**Example:**
```typescript
// src/lib/api-validation.ts
import { z } from "zod"
import { NextResponse } from "next/server"

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message
      }
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}
```

### Pattern 4: Dual-Mode Form Component
**What:** Single component handling create and edit via optional `initialData` prop.
**When to use:** All entity forms (matches existing VehicleForm pattern).
**Example:**
```typescript
interface VehicleFormProps {
  initialData?: VehicleFormValues
  vehicleId?: string  // present = edit mode
}

export function VehicleForm({ initialData, vehicleId }: VehicleFormProps) {
  const router = useRouter()
  const isEdit = !!vehicleId

  const form = useForm({
    defaultValues: initialData ?? DEFAULT_VALUES,
    validators: { onSubmit: vehicleSchema, onBlur: vehicleSchema },
    onSubmit: async ({ value }) => {
      const url = isEdit
        ? `/api/admin/vehicles/${vehicleId}`
        : "/api/admin/vehicles"
      const promise = fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      }).then(async (res) => {
        if (!res.ok) throw await res.json()
        return res.json()
      })

      toast.promise(promise, {
        loading: "Saving...",
        success: isEdit ? "Changes saved" : "Vehicle added successfully",
        error: "Something went wrong. Please try again.",
      })

      await promise
      router.push("/admin/vehicles")
    },
  })
  // ...render form
}
```

### Anti-Patterns to Avoid
- **Using `onChange` for form-level Zod schema:** Causes ALL fields to re-render on every keystroke (known TanStack Form issue). Use `onSubmit` + `onBlur` only (matches CONTEXT.md decision).
- **Using `field.state.meta.errors.join(',')` directly:** With Standard Schema (Zod) validators, errors are objects not strings. Must extract `.message` first.
- **Mixing Zod 3 and Zod 4 syntax:** Project uses Zod 4.3.6. Use `z.email()` not `z.string().email()`. Use `error:` not `message:` for custom error messages.
- **Separate client/server schemas:** CONTEXT.md explicitly requires single source in `src/lib/schemas.ts`.
- **Hand-rolling Select with Radix SelectTrigger/SelectContent for simple dropdowns:** Project's existing Select component is a plain HTML select wrapper. Use it for simple dropdowns. Only use Popover+Command (SearchableSelect) for the deal form's customer/vehicle selectors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Searchable dropdown | Custom filter + dropdown | shadcn Popover + Command (cmdk) | Keyboard navigation, accessibility, scroll virtualization |
| Form state management | useState per field | @tanstack/react-form useForm | Dirty tracking, validation lifecycle, field-level subscriptions |
| Schema validation | Manual if/else checks | Zod schemas with safeParse | Type inference, composability, Standard Schema compliance |
| Toast notifications | Custom alert system | Sonner toast.promise() | Already wired, handles loading/success/error states |
| Confirmation dialog | window.confirm() | shadcn Dialog component | Consistent styling, accessible, customizable buttons |
| Image sort order logic | Array splice + manual indexing | Swap-based reorder with DB sort_order | Simple, predictable, matches existing DB schema |

**Key insight:** The existing codebase has most infrastructure already built (toast system, auth guards, camelKeys/snakeKeys conversion, Supabase client setup). The forms are the main gap.

## Common Pitfalls

### Pitfall 1: Standard Schema Error Objects vs Strings
**What goes wrong:** Error messages render as `[object Object]` or are blank.
**Why it happens:** TanStack Form v1 with Standard Schema validators returns `StandardSchemaV1Issue` objects in `field.state.meta.errors`, not plain strings. Calling `.join(',')` on objects produces garbage.
**How to avoid:** Always use `errors.map(err => typeof err === 'string' ? err : err.message)` to extract messages.
**Warning signs:** Error messages showing `[object Object]` or empty strings below fields.

### Pitfall 2: Zod 4 API Changes
**What goes wrong:** TypeScript errors or runtime failures using Zod 3 patterns.
**Why it happens:** Zod 4 moved string format validators to top-level (`z.email()` not `z.string().email()`), changed error customization from `message:` to `error:`, and requires two arguments for `z.record()`.
**How to avoid:** Use Zod 4 syntax consistently: `z.email()`, `z.url()`, `z.uuid()`, `z.guid()` (for non-strict UUID matching). Use `error:` parameter for custom messages.
**Warning signs:** Import errors, unexpected validation behavior, TypeScript type errors on schema definitions.

### Pitfall 3: onChange Form-Level Validator Causes Re-render Storm
**What goes wrong:** Typing in any field causes all form fields to re-render on every keystroke, making the form sluggish.
**Why it happens:** Form-level `onChange` validator runs Zod schema on every keystroke, and every field with an error gets re-rendered.
**How to avoid:** Use `onSubmit` + `onBlur` validators only (matches CONTEXT.md decision). Never use `onChange` with form-level Zod schemas.
**Warning signs:** Laggy typing, React DevTools showing excessive re-renders.

### Pitfall 4: Snake_case / CamelCase Mismatch
**What goes wrong:** Form data doesn't match DB column names, inserts fail silently or with Postgres errors.
**Why it happens:** Database uses `snake_case` (e.g., `stock_number`, `first_name`), but forms use `camelCase` (e.g., `stockNumber`, `firstName`). The existing `snakeKeys()` and `camelKeys()` utilities handle conversion.
**How to avoid:** Define Zod schemas in camelCase (matching form field names). Use `snakeKeys()` before DB insert in API routes. Use `camelKeys()` when sending data back to client.
**Warning signs:** Supabase insert errors about unknown columns.

### Pitfall 5: Missing beforeunload Cleanup
**What goes wrong:** Browser shows unsaved changes warning even after successful submission.
**Why it happens:** `beforeunload` event listener isn't removed when form submits successfully.
**How to avoid:** Add the listener in a `useEffect` that checks `form.state.isDirty`, and clean up on unmount. Remove listener before programmatic navigation.
**Warning signs:** False "unsaved changes" warnings after saving.

### Pitfall 6: Image Operations Without Optimistic Updates
**What goes wrong:** User clicks reorder/delete and nothing happens visually until server responds.
**Why it happens:** Waiting for server roundtrip before updating UI.
**How to avoid:** Update local image array state immediately (optimistic), then sync with server. Revert on failure.
**Warning signs:** Sluggish-feeling image management.

## Code Examples

### Zod 4 Schema Definition (schemas.ts)
```typescript
// src/lib/schemas.ts
import { z } from "zod"

// Vehicle schema -- camelCase field names matching form fields
export const vehicleSchema = z.object({
  stockNumber: z.string().min(1, { error: "Stock number is required" }),
  vin: z.string().min(11, { error: "VIN must be at least 11 characters" }),
  year: z.number({ error: "Year is required" })
    .min(1900, { error: "Year must be between 1900 and 2030" })
    .max(2030, { error: "Year must be between 1900 and 2030" }),
  make: z.string().min(1, { error: "Make is required" }),
  model: z.string().min(1, { error: "Model is required" }),
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  vehicleType: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  mileage: z.number().optional(),
  mileageType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  engine: z.string().optional(),
  cylinders: z.number().optional(),
  drivetrain: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().optional(),
  buyerFee: z.number().optional(),
  lotFee: z.number().optional(),
  sellingPrice: z.number().optional(),
  status: z.string().optional(),
  locationCode: z.string().optional(),
  features: z.string().optional(),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>

// Customer schema
export const customerSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z.union([z.email({ error: "Enter a valid email" }), z.literal("")]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  driversLicense: z.string().optional(),
  notes: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

// Lead schema
export const leadSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.union([z.email({ error: "Enter a valid email" }), z.literal("")]).optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  vehicleInterest: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>

// Deal schema
export const dealSchema = z.object({
  vehicleId: z.string().min(1, { error: "Vehicle is required" }),
  customerId: z.string().min(1, { error: "Customer is required" }),
  saleType: z.string().min(1, { error: "Sale type is required" }),
  sellingPrice: z.number().min(0, { error: "Selling price must be 0 or greater" }),
  tradeAllowance: z.number().optional(),
  tradePayoff: z.number().optional(),
  downPayment: z.number().optional(),
  taxRate: z.number().optional(),
  titleFee: z.number().optional(),
  registrationFee: z.number().optional(),
  docFee: z.number().optional(),
  otherFees: z.number().optional(),
  apr: z.number().optional(),
  term: z.number().optional(),
  notes: z.string().optional(),
})

export type DealFormValues = z.infer<typeof dealSchema>
```

### Deal Calculations (deal-calculations.ts)
```typescript
// src/lib/deal-calculations.ts
export interface DealInputs {
  sellingPrice: number
  tradeAllowance: number
  tradePayoff: number
  downPayment: number
  taxRate: number
  titleFee: number
  registrationFee: number
  docFee: number
  otherFees: number
  apr: number
  term: number
  saleType: string
}

export interface DealCalculations {
  netTrade: number
  taxAmount: number
  totalFees: number
  totalPrice: number
  amountFinanced: number
  monthlyPayment: number
}

export function calculateDeal(inputs: DealInputs): DealCalculations {
  const netTrade = inputs.tradeAllowance - inputs.tradePayoff
  const taxableAmount = inputs.sellingPrice - inputs.tradeAllowance
  const taxAmount = Math.max(0, taxableAmount * (inputs.taxRate / 100))
  const totalFees = inputs.titleFee + inputs.registrationFee + inputs.docFee + inputs.otherFees
  const totalPrice = inputs.sellingPrice - netTrade + taxAmount + totalFees
  const amountFinanced = totalPrice - inputs.downPayment

  let monthlyPayment = 0
  if ((inputs.saleType === "finance" || inputs.saleType === "bhph") && inputs.term > 0 && amountFinanced > 0) {
    if (inputs.apr > 0) {
      const monthlyRate = inputs.apr / 100 / 12
      monthlyPayment =
        (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, inputs.term)) /
        (Math.pow(1 + monthlyRate, inputs.term) - 1)
    } else {
      monthlyPayment = amountFinanced / inputs.term
    }
  }

  return {
    netTrade,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalFees,
    totalPrice: Math.round(totalPrice * 100) / 100,
    amountFinanced: Math.round(amountFinanced * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
  }
}
```

### API Route with Zod Validation
```typescript
// Pattern for POST handler with Zod validation
import { vehicleSchema } from "@/lib/schemas"
import { validateRequest } from "@/lib/api-validation"
import { snakeKeys } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { supabase, error: authError } = await requireAuth()
    if (authError) return authError

    // Validate with shared Zod schema
    const validation = validateRequest(vehicleSchema, body)
    if (!validation.success) return validation.response

    const dbData = snakeKeys(validation.data)
    const { data, error } = await supabase
      .from("vehicles")
      .insert(dbData as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(camelKeys(data), { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
```

### Image Reorder/Primary PATCH Endpoint
```typescript
// New PATCH handler for src/app/api/admin/vehicles/[id]/images/route.ts
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const { supabase, error: authError } = await requireAuth()
    if (authError) return authError

    // Handle reorder: expects { images: [{ id, sortOrder }] }
    if (body.images) {
      for (const img of body.images) {
        await supabase
          .from("vehicle_images")
          .update({ sort_order: img.sortOrder })
          .eq("id", img.id)
          .eq("vehicle_id", id)
      }
    }

    // Handle primary toggle: expects { primaryImageId: string }
    if (body.primaryImageId) {
      // Unset all primary
      await supabase
        .from("vehicle_images")
        .update({ is_primary: false })
        .eq("vehicle_id", id)
      // Set new primary
      await supabase
        .from("vehicle_images")
        .update({ is_primary: true })
        .eq("id", body.primaryImageId)
        .eq("vehicle_id", id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update images" }, { status: 500 })
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @tanstack/zod-form-adapter required | Standard Schema built into TanStack Form v1 | TanStack Form v1 (2024) | No adapter package needed, pass Zod schema directly |
| z.string().email() | z.email() | Zod 4 (2025) | String format validators are now top-level functions |
| { message: "..." } in Zod | { error: "..." } in Zod 4 | Zod 4 (2025) | Unified error customization API |
| field.state.meta.errors as string[] | errors as StandardSchemaV1Issue[] | TanStack Form v1 | Must extract .message from error objects |
| z.record(valueSchema) | z.record(keySchema, valueSchema) | Zod 4 (2025) | Two arguments required |

**Deprecated/outdated:**
- `@tanstack/zod-form-adapter`: Not needed with TanStack Form v1 + Standard Schema
- `z.string().email()`: Deprecated in Zod 4, use `z.email()` instead
- `message:` parameter in Zod: Use `error:` parameter instead
- `ZodType<Output, Def, Input>` with 3 generics: Zod 4 uses 2 generics, `Def` removed

## Open Questions

1. **Lead form vehicle selector approach**
   - What we know: Leads table has `vehicle_interest` (text field) and no FK to vehicles table. Schema shows `vehicle_interest: string | null`.
   - What's unclear: Should this be a free-text field or a SearchableSelect linking to vehicles?
   - Recommendation: Use a plain text Input field since there's no FK relationship. The lead may be interested in a vehicle not yet in inventory. This is simpler and matches the schema. (Claude's Discretion decision)

2. **Primary image selection UI**
   - What we know: UI-SPEC specifies star icon (lucide Star), filled = primary, outline = not primary.
   - Recommendation: Follow the UI-SPEC -- use Star icon with filled/outline states. This is the most intuitive pattern for "favoriting" an image. (Claude's Discretion decision)

3. **Server validation error mapping back to form fields**
   - What we know: `form.setFieldMeta()` can set errors on individual fields. Server returns `{ fieldErrors: { fieldName: "message" } }`.
   - What's unclear: Whether `setFieldMeta` reliably triggers re-render and error display in all TanStack Form v1 versions.
   - Recommendation: Test this pattern during implementation. Fallback is `toast.error()` with the first error message if field mapping fails.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Vehicle form validates with Zod schema | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 |
| FORM-02 | Customer form validates with Zod schema | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 |
| FORM-03 | Lead form validates with Zod schema | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 |
| FORM-04 | Deal form validates with Zod schema | unit | `npx vitest run src/lib/__tests__/schemas.test.ts` | Wave 0 |
| FORM-05 | API routes validate with Zod + return structured errors | unit | `npx vitest run src/lib/__tests__/api-validation.test.ts` | Wave 0 |
| MEDIA-02 | Image reorder updates sort_order | manual-only | Manual: reorder images in vehicle form | N/A |
| MEDIA-03 | Primary image selection updates is_primary | manual-only | Manual: click star icon on image | N/A |
| N/A | Deal calculations correct | unit | `npx vitest run src/lib/__tests__/deal-calculations.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install vitest: `npm install -D vitest @vitejs/plugin-react`
- [ ] Create `vitest.config.ts` with path alias support
- [ ] `src/lib/__tests__/schemas.test.ts` -- covers FORM-01 through FORM-04 (validate schema accepts valid data, rejects invalid with correct error messages)
- [ ] `src/lib/__tests__/api-validation.test.ts` -- covers FORM-05 (validateRequest returns structured field errors)
- [ ] `src/lib/__tests__/deal-calculations.test.ts` -- covers deal pricing logic

## Sources

### Primary (HIGH confidence)
- @tanstack/react-form v1 installed at 1.28.5 -- verified via `package.json` and `node_modules`
- zod v4.3.6 installed -- verified via `package.json` and `node_modules`
- [TanStack Form v1 Validation Guide](https://tanstack.com/form/v1/docs/framework/react/guides/validation) -- Standard Schema, validators API
- [TanStack Form v1 Standard Schema Example](https://tanstack.com/form/v1/docs/framework/react/examples/standard-schema) -- Zod integration pattern
- [shadcn/ui TanStack Form Integration](https://ui.shadcn.com/docs/forms/tanstack-form) -- FormField pattern, error display, shadcn component integration
- [Zod v4 Migration Guide](https://zod.dev/v4/changelog) -- API changes from v3

### Secondary (MEDIUM confidence)
- [TanStack Form v1 Custom Errors](https://tanstack.com/form/v1/docs/framework/react/guides/custom-errors) -- errorMap, StandardSchemaV1Issue handling
- [TanStack Form Discussion #1284](https://github.com/TanStack/form/discussions/1284) -- Errors changed to objects in v1
- [Avoiding TanStack Form Pitfalls](https://matthuggins.com/blog/posts/avoiding-tanstack-form-pitfalls) -- Common mistakes
- [TanStack Form Issue #1625](https://github.com/TanStack/form/issues/1625) -- onChange re-render issue

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and version-verified
- Architecture: HIGH - Patterns derived from official docs and existing codebase conventions
- Pitfalls: HIGH - Documented in official TanStack Form discussions and Zod 4 migration guide
- Validation architecture: MEDIUM - No test framework currently installed; vitest recommended but not verified in this project context

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (30 days -- stable libraries, no fast-moving changes expected)
