# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**
- Page routes use kebab-case: `page.tsx` in route directories (e.g., `src/app/contact/page.tsx`, `src/app/admin/customers/new/page.tsx`)
- API routes use kebab-case: `route.ts` in route directories (e.g., `src/app/api/leads/route.ts`, `src/app/api/admin/customers/route.ts`)
- Components use PascalCase: `Header`, `Footer`, `ContactForm`, `VehicleForm` (e.g., `src/components/header.tsx`, `src/components/admin/vehicle-form.tsx`)
- Utility/library files use camelCase: `constants.ts`, `inventory.ts`, `utils.ts`, `vin-decoder.ts`
- Directory names use kebab-case: `admin`, `api`, `contact`, `inventory`

**Functions:**
- Components: PascalCase (export function `ContactForm()`, export default function `RootLayout()`, export function `Header()`)
- Utility functions: camelCase (e.g., `fetchInventory()`, `fetchVehicleById()`, `getFilterOptions()`)
- API handlers: HTTP verb + async (e.g., `export async function GET()`, `export async function POST()`)
- Hooks and handlers: camelCase with verb prefix (e.g., `handleChange()`, `handleDecodeVin()`, `handleSubmit()`)
- State setters: camelCase with "set" prefix (e.g., `setSubmitted()`, `setError()`, `setForm()`)

**Variables:**
- State hooks: camelCase (e.g., `submitted`, `submitting`, `error`, `customer`)
- Constants: UPPER_SNAKE_CASE for globals (e.g., `SITE_NAME`, `SITE_DESCRIPTION`, `SITE_TAGLINE`, `CONTACT`, `NAV_LINKS`)
- Objects/records: camelCase (e.g., `where: Record<string, unknown>`, `formData`, `body`)
- Event parameters: camelCase with object type hint (e.g., `e: React.ChangeEvent<HTMLInputElement>`)

**Types/Interfaces:**
- PascalCase: `VehicleFormData`, `Vehicle`, `Customer`, `Deal`, `Lead`
- Props interfaces: PascalCase + "Props" suffix (e.g., `VehicleFormProps`)
- Exported types prefixed with "export interface" (e.g., `export interface VehicleFormData`)

## Code Style

**Formatting:**
- ESLint configured via `eslint-config-next` with strict TypeScript enabled
- Pre-commit hooks via Lefthook enforce linting on staged `.ts` and `.tsx` files
- Indentation appears to be 2 spaces (inferred from source files)
- No explicit Prettier config found — relies on eslint-config-next defaults

**Linting:**
- Tool: ESLint with Next.js core web vitals and TypeScript configs
- Config: `eslint.config.mjs` at project root
- Runs on: Staged `.ts`, `.tsx`, `.js`, `.jsx` files
- Pre-commit hook `lint` runs `npx eslint {staged_files}` and stages fixed files

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: `ES2017`
- Module resolution: `bundler`
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. External libraries (React, Next.js): `import { useState } from "react"`
2. Next.js internal modules: `import { useParams } from "next/navigation"`, `import Link from "next/link"`
3. UI components from shadcn/ui pattern: `import { Button } from "@/components/ui/button"`
4. Custom components: `import { Header } from "@/components/header"`
5. Utilities and helpers: `import { cn } from "@/lib/utils"`
6. Constants: `import { SITE_NAME, CONTACT } from "@/lib/constants"`
7. Types and interfaces: Declared inline in same file when scoped to one file
8. CSS/styles: `import "./globals.css"`

**Path Aliases:**
- Use `@/` prefix for all imports from `src/` directory
- Example: `@/components/ui/button`, `@/lib/utils`, `@/lib/constants`

**Client/Server Directives:**
- `"use client"` at top of client components (e.g., `contact-form.tsx`, `header.tsx`, page components with `useState`)
- Server components (default in Next.js 19) have no directive
- API routes are always server-side

## Error Handling

**Patterns:**
- Client components use `try`/`catch` blocks with `unknown` type for caught errors
- Error type checking: `err instanceof Error ? err.message : "fallback message"`
- HTTP responses checked with `.ok` property: `if (!res.ok) throw new Error("message")`
- Silent catch blocks allowed in non-critical operations (e.g., contact form still shows success if lead creation fails)
- State-based error tracking via `useState<string | null>(null)` for display to users
- Error messages displayed in UI via conditional rendering: `{error && <div>{error}</div>}`

**Validation:**
- Form data validated at API boundaries by slicing/coercing types: `String(body.firstName || "").slice(0, 100)`
- Input validation on required fields via HTML `required` attribute
- Numeric parsing via `parseInt()`, `parseFloat()`, `parseFloat() || 0`

## Logging

**Framework:** `console` (default browser and Node.js logging)
- No explicit logging library imported
- Console methods used implicitly where needed

**Patterns:**
- Not extensively used in visible source files
- When errors occur, typically captured in state and displayed to user rather than logged

## Comments

**When to Comment:**
- JSDoc comments used for public API functions in libraries (`src/lib/inventory.ts`)
- Block comments for major sections (e.g., `/** Inventory data layer — ... */`)
- Inline comments rare; code clarity prioritized
- TODO/FIXME comments not observed in codebase

**JSDoc/TSDoc:**
- Block comment style for function documentation:
  ```typescript
  /**
   * Fetch all available inventory for the public-facing site.
   */
  export async function fetchInventory(): Promise<Vehicle[]> { ... }
  ```
- Describes purpose, not implementation
- Used for exported utility functions, not component functions

## Function Design

**Size:**
- Page components (200-300 lines) contain full page logic including state and fetch
- API handlers (30-100 lines) handle single HTTP method with inline calculations
- Utility functions (10-50 lines) focused on data transformation
- Component event handlers (inline) kept short with arrow functions

**Parameters:**
- Destructured in function signatures where possible: `{ children }: Readonly<{ children: React.ReactNode }>`
- Component props explicitly typed with interface definitions
- Event handlers accept `React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>`

**Return Values:**
- API routes return `NextResponse.json(data, { status: code })`
- Components return JSX
- Utility functions return typed values: `Promise<Vehicle[]>`, `Vehicle | null`, etc.

## Module Design

**Exports:**
- Named exports for utilities and functions: `export function fetchInventory()`
- Default export for page components: `export default function RootLayout()`
- Type exports for interfaces: `export interface Vehicle`
- UI component libraries (shadcn/ui) use default exports wrapped in files

**Barrel Files:**
- Not observed in this codebase
- Each file imports directly from source location

**Component Structure (shadcn/ui pattern):**
- UI primitives in `src/components/ui/` (e.g., `button.tsx`, `card.tsx`, `input.tsx`)
- Feature components in `src/components/` (e.g., `header.tsx`, `footer.tsx`)
- Admin-specific components in `src/components/admin/` (e.g., `vehicle-form.tsx`)
- Page-level components colocated in app directory routes

## Tailwind & Styling

**Framework:** Tailwind CSS v4 with CSS custom properties
- Config: `tailwindcss`, `@tailwindcss/postcss`
- Global styles in `src/app/globals.css` using `@import "tailwindcss"` and `@theme inline`
- CSS custom properties bridge Tailwind utilities to design tokens (colors, fonts, radii)
- Class utility patterns: `className="flex min-h-screen flex-col"`, `className="space-y-4"`
- Responsive classes: `md:hidden`, `sm:inline`, `sm:grid-cols-2`
- Component library (shadcn/ui) uses `cn()` utility for class merging: `className={cn("base-classes", conditional)}`

## Form Patterns

**Client-side forms:**
- Use `<form>` with `onSubmit` handler
- State management via `useState` for each field or single form object
- Event handler: `const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value }))`
- Form data extracted via `new FormData(e.currentTarget)`
- Submission state tracked with separate boolean: `submitting`
- Fields have `id` and `name` attributes matching state keys

**API submission:**
- `fetch()` with `method: "POST"`, `headers: { "Content-Type": "application/json" }`, `body: JSON.stringify()`
- Response parsed with `.json()`
- Success/error state tracked separately

## Database/API Patterns

**API routes:**
- Extract query params: `const { searchParams } = new URL(req.url); searchParams.get("page")`
- Build where clause dynamically: `const where: Record<string, unknown> = {}`
- Pagination calculated: `skip: (page - 1) * limit, take: limit`
- Counts via parallel promises: `const [data, total] = await Promise.all([...])`
- Response format: `NextResponse.json({ data, pagination: { ... } })`

**Calculations:**
- Inline calculations in API routes (e.g., deal pricing, monthly payments)
- Complex math with comments for clarity
- Rounding with: `Math.round(value * 100) / 100`

---

*Convention analysis: 2026-03-17*
