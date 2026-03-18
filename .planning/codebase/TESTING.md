# Testing Patterns

**Analysis Date:** 2026-03-17

## Current Testing Status

**Status:** No test files present in the codebase.
- Zero `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx` files in `src/` directory
- Project relies entirely on pre-commit hooks for quality assurance
- Testing framework and infrastructure not configured

## Pre-Commit Quality Assurance

Instead of automated tests, the project uses **Lefthook** pre-commit hooks to enforce code quality:

**Config:** `lefthook.yml` at project root

**Hooks (parallel: false):**

1. **lint** - Runs on staged `.ts`, `.tsx`, `.js`, `.jsx` files
   ```bash
   npx eslint {staged_files}
   ```
   - Enforces ESLint rules from `eslint-config-next`
   - Auto-fixes staged files via `stage_fixed: true`
   - Aborts commit if unfixable violations detected

2. **typecheck** - Runs on all source
   ```bash
   npx tsc --noEmit
   ```
   - Full TypeScript type checking in strict mode
   - Does not generate output files
   - Aborts commit if type errors detected

3. **prisma-generate** - Runs on schema changes
   ```bash
   npx prisma generate
   ```
   - Triggered when `prisma/schema.prisma` is staged
   - Generates Prisma Client types

4. **db-push** - Runs on schema changes
   ```bash
   npx prisma db push --skip-generate
   ```
   - Triggered when `prisma/schema.prisma` is staged
   - Applies schema to database
   - Skips redundant code generation

5. **build** - Runs on every commit
   ```bash
   npm run build
   ```
   - Full Next.js production build
   - Sets `AUTH_SECRET=local-dev-secret` for local development
   - Aborts commit if build fails

**Installation:** Automatic via `postinstall` script: `lefthook install`

## Testing Strategy for New Code

Since testing infrastructure is not configured, follow these patterns when implementing tests:

### Recommended Framework

**Jest or Vitest** (both compatible with Next.js 16):
- Jest: More mature, broader ecosystem
- Vitest: Faster, modern configuration
- Either integrates cleanly with TypeScript and Tailwind

### Test File Locations

**Co-located pattern (recommended):**
- Place `.test.tsx` files next to source files
- Example: `src/components/header.tsx` → `src/components/header.test.tsx`
- Example: `src/lib/inventory.ts` → `src/lib/inventory.test.ts`

**Alternative: Separate `__tests__` directories:**
- Create `src/__tests__/` mirror of source structure
- Less common in Next.js projects

### Test Types to Add

**Unit Tests:**
- Utility functions: `src/lib/inventory.ts` → test `fetchInventory()`, `fetchVehicleById()`, `getFilterOptions()`
- Pure functions: `src/lib/utils.ts` → test `cn()` class merging
- Type safety: Test TypeScript type inference with data fixtures

**Component Tests:**
- UI components: `src/components/ui/*` → test rendering, props, accessibility
- Form components: `src/components/admin/vehicle-form.tsx` → test form submission, validation, state management
- Page-level components: Test with mocked API calls

**Integration Tests:**
- API routes: Test `POST /api/leads`, `GET /api/admin/customers`, etc.
- Form submission flow: User interaction → API call → success/error handling
- Database operations: Test Prisma queries against test database

**Snapshot Tests:**
- Use sparingly; prefer explicit assertions
- Consider for complex component rendering

### API Route Testing

**Pattern to follow:**
```typescript
// Example: src/app/api/leads/route.test.ts
import { POST } from './route';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db');

describe('POST /api/leads', () => {
  it('creates a lead with sanitized input', async () => {
    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'John',
        email: 'test@example.com',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
  });

  it('prevents injection via field length limits', async () => {
    // Test string slicing: String(body.firstName || "").slice(0, 100)
  });
});
```

### Form Component Testing

**Pattern to follow:**
```typescript
// Example: src/components/admin/vehicle-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleForm from './vehicle-form';

describe('VehicleForm', () => {
  it('submits form with validated data', async () => {
    const onSubmit = jest.fn();
    render(<VehicleForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Stock Number'), {
      target: { value: 'VH-001' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        stockNumber: 'VH-001',
      }));
    });
  });

  it('displays errors from submission', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Server error'));
    render(<VehicleForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Server error')).toBeInTheDocument();
  });
});
```

### Mocking Strategy

**Mock Prisma queries:**
```typescript
jest.mock('@/lib/db', () => ({
  prisma: {
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

**Mock fetch for client components:**
```typescript
global.fetch = jest.fn();

// Reset between tests
beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

// Mock success
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({ id: '1', ... }),
});

// Mock failure
(global.fetch as jest.Mock).mockResolvedValue({
  ok: false,
  status: 500,
});
```

**Mock Next.js hooks:**
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ id: 'test-id' }),
}));
```

### Fixtures and Factories

**Location:** Create `src/lib/test/` directory for shared test utilities

**Example fixture:**
```typescript
// src/lib/test/fixtures.ts
export const mockVehicle = {
  id: 'v-1',
  stockNumber: 'VH-001',
  vin: '1HGCV1F32LA123456',
  year: 2020,
  make: 'Honda',
  model: 'Accord',
  trim: 'EX',
  bodyStyle: 'Sedan',
  exteriorColor: 'Blue',
  interiorColor: 'Gray',
  mileage: 75000,
  price: 18995,
  status: 'available' as const,
  images: [],
  features: [],
};

export const mockCustomer = {
  id: 'c-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: '123 Main St',
  city: 'Dallas',
  state: 'TX',
  zip: '75001',
};
```

**Factory pattern (if needed):**
```typescript
// src/lib/test/factories.ts
export function createMockVehicle(overrides?: Partial<Vehicle>): Vehicle {
  return {
    ...mockVehicle,
    ...overrides,
  };
}
```

### Coverage Targets

No coverage thresholds currently enforced. When implementing tests:

**Recommended targets:**
- **Utilities:** 90%+ (pure functions should be fully tested)
- **Components:** 75%+ (complex state/effects harder to test)
- **API routes:** 80%+ (critical business logic)
- **Pages:** 50%+ (often just glue logic)

View coverage with test runner report (after setup).

## What NOT to Mock

- Core React hooks (`useState`, `useEffect`, `useContext`) — test with actual hooks
- Tailwind CSS utilities — don't snapshot style classes
- Routing navigation — test navigation effects, not the router itself
- Local storage/cookies — only if behavior depends on them

## Test Data Strategy

**Avoid magic numbers:**
```typescript
// Bad
const res = await prisma.customer.findMany({ take: 20 });

// Good (with comment if non-obvious)
const PAGE_LIMIT = 20;
const res = await prisma.customer.findMany({ take: PAGE_LIMIT });
```

**Use type-safe fixtures:**
- All mock data must match actual type definitions
- Leverage TypeScript strict mode to catch mismatches
- Example: `mockVehicle as Vehicle` guarantees type compatibility

## Running Tests (When Configured)

**Standard commands to add to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Run before commit:**
- Add test stage to `lefthook.yml` (optional, or keep only in CI)
- Example: `npx jest --bail` (stops at first failure)

## Configuration Files to Create

**jest.config.ts** or **vitest.config.ts:**
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // For component tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};
```

**jest.setup.ts:**
```typescript
import '@testing-library/jest-dom';
// Add polyfills or global mocks here
```

## Current Quality Assurance

Without test files, quality relies on:
1. **Linting** - ESLint enforces code style and common bugs
2. **Type checking** - TypeScript strict mode catches type errors
3. **Build validation** - Next.js build catches runtime issues
4. **Manual testing** - Developer verification before commit

This is **insufficient for production code** — tests should be added as features mature.

---

*Testing analysis: 2026-03-17*
