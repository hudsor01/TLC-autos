# Architecture Patterns

**Domain:** Used car dealership website + admin DMS
**Researched:** 2026-03-16

## Current Architecture

```
Public Site (Server Components)          Admin DMS (Client Components)
  /                                        /admin
  /inventory    --> fetchInventory()        /admin/vehicles   --> fetch(/api/admin/vehicles)
  /about                                   /admin/customers  --> fetch(/api/admin/customers)
  /contact                                 /admin/leads      --> fetch(/api/admin/leads)
  /financing                               /admin/deals      --> fetch(/api/admin/deals)
                                           /admin/settings
                                           /admin/users

API Routes (/api/admin/*)
  --> prisma.vehicle.findMany / create / update / delete
  --> No validation
  --> No error standardization

Database: SQLite via Prisma + better-sqlite3 adapter
Auth: NextAuth v5 beta
Images: Raw file upload to public/uploads/
```

## Recommended Architecture Changes

### 1. Shared Zod Schema Layer

**What:** Create a `/src/lib/schemas/` directory with Zod schemas that are shared between API routes and forms.

**Why:** Currently the VehicleFormData interface and the API route accept different shapes. Schemas become the single source of truth.

```typescript
// src/lib/schemas/vehicle.ts
import { z } from "zod";

export const vehicleSchema = z.object({
  stockNumber: z.string().min(1, "Stock number required"),
  vin: z.string().min(11, "VIN must be at least 11 characters").max(17),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, "Make required"),
  model: z.string().min(1, "Model required"),
  trim: z.string().optional().default(""),
  // ... all fields with proper coercion and validation
  sellingPrice: z.coerce.number().min(0),
  status: z.enum(["available", "pending", "sold"]),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
// Use this type everywhere -- forms, API routes, inventory lib
```

### 2. API Route Validation Pattern

**What:** Wrap every API route handler with Zod parsing.

```typescript
// src/app/api/admin/vehicles/route.ts
import { vehicleSchema } from "@/lib/schemas/vehicle";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = vehicleSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.create({ data: result.data });
  return NextResponse.json(vehicle, { status: 201 });
}
```

### 3. Form Architecture with react-hook-form

**What:** Replace manual useState forms with react-hook-form + Zod resolver.

```typescript
// src/components/admin/vehicle-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@/lib/schemas/vehicle";
import { toast } from "sonner";

export default function VehicleForm({ initialData, onSubmit }: Props) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData ?? defaultVehicle,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    toast.promise(onSubmit(data), {
      loading: "Saving vehicle...",
      success: "Vehicle saved",
      error: "Failed to save vehicle",
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Field-level errors now automatic */}
      <Input {...form.register("stockNumber")} />
      {form.formState.errors.stockNumber && (
        <p className="text-sm text-destructive">
          {form.formState.errors.stockNumber.message}
        </p>
      )}
    </form>
  );
}
```

### 4. Toast Integration Pattern

**What:** Add sonner's `<Toaster />` to root layout, use `toast()` throughout admin.

```typescript
// src/app/admin/layout.tsx
import { Toaster } from "sonner";

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
```

### 5. Data Table Architecture

**What:** Create a reusable `DataTable` component using @tanstack/react-table + existing shadcn Table primitives.

```
src/components/admin/
  data-table.tsx          -- Generic DataTable<T> component
  data-table-toolbar.tsx  -- Search, filters, column visibility
  data-table-pagination.tsx -- Pagination controls
  columns/
    vehicle-columns.tsx   -- Column definitions for vehicles
    customer-columns.tsx  -- Column definitions for customers
    lead-columns.tsx      -- Column definitions for leads
    deal-columns.tsx      -- Column definitions for deals
```

This replaces 4 pages of hand-rolled table markup with a single reusable component.

### 6. Image Processing Pipeline

**What:** Process images through sharp on upload before saving.

```typescript
// src/lib/storage.ts (enhanced)
import sharp from "sharp";

export async function uploadImage(file: File, vehicleId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  // Generate optimized version + thumbnail
  const optimized = await sharp(buffer)
    .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbnail = await sharp(buffer)
    .resize(400, 300, { fit: "cover" })
    .webp({ quality: 70 })
    .toBuffer();

  // Save both versions
  // ...
}
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `/lib/schemas/*` | Zod schemas, shared types | Forms, API routes |
| `/components/admin/data-table.tsx` | Generic sortable/filterable table | All admin list pages |
| `/components/admin/vehicle-form.tsx` | Vehicle CRUD form with validation | API routes via fetch |
| Sonner `<Toaster />` | Global toast notifications | All admin operations |
| `/lib/storage.ts` | Image upload + sharp processing | Vehicle image API routes |
| recharts components | Dashboard charts | Dashboard API endpoint |

## Anti-Patterns to Avoid

### Anti-Pattern 1: Over-abstracting the API layer
**What:** Creating a custom fetch wrapper, API client class, or tRPC layer.
**Why bad:** The project has ~15 API routes used by one admin user. Abstraction adds indirection for no benefit.
**Instead:** Keep raw `fetch()` calls in components. Add Zod validation at the API boundary. That is sufficient.

### Anti-Pattern 2: Client-side caching for admin data
**What:** Adding React Query or SWR to cache admin API responses.
**Why bad:** SQLite is local (sub-millisecond queries), 1-2 users, no stale data risk. A caching layer adds complexity for zero perceptible performance gain.
**Instead:** Simple `useEffect` + fetch is fine. Add nuqs for URL state persistence.

### Anti-Pattern 3: Moving forms to Server Actions
**What:** Converting all admin forms from API routes to Next.js Server Actions.
**Why bad:** The project already has working API routes with pagination, search, and filtering. Server Actions are better for simple mutations but worse for complex list queries with URL params.
**Instead:** Keep API routes for list/query operations. Server Actions are fine for new simple mutations if desired.

## Sources

- Direct code analysis of TLC Autos codebase
- Architecture patterns based on Next.js App Router conventions (training data)
