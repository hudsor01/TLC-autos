# Supabase Data API Security Hardening Guide

**Project:** TLC Autos (used car dealership DMS)
**Stack:** Next.js 16 + @supabase/ssr + @supabase/supabase-js + Supabase (PostgreSQL + Auth + Storage)
**Researched:** 2026-03-17
**Overall confidence:** HIGH (sourced from official Supabase docs, community pentest findings, and codebase audit)

---

## Table of Contents

1. [PostgREST Exposure](#1-postgrest-exposure)
2. [RLS Best Practices](#2-rls-best-practices)
3. [Service Role Key Security](#3-service-role-key-security)
4. [API Route Auth Patterns](#4-api-route-auth-patterns)
5. [Rate Limiting and Abuse Prevention](#5-rate-limiting-and-abuse-prevention)
6. [Input Validation](#6-input-validation)
7. [SQL Injection via PostgREST](#7-sql-injection-via-postgrest)
8. [Security Headers and Dashboard Settings](#8-security-headers-and-dashboard-settings)
9. [Storage Security](#9-storage-security)
10. [Production Checklist](#10-production-checklist)

---

## 1. PostgREST Exposure

### The Question

Should the PostgREST endpoint (via the anon/publishable key) be exposed to the browser at all, or should ALL data flow through Next.js API routes?

### Recommendation: Proxy Everything Through Next.js API Routes

For TLC Autos, **route all data access through Next.js API routes**. Do not use the Supabase client directly from the browser for data queries.

**Why this is the right call for a dealership app:**

| Approach | Pros | Cons |
|----------|------|------|
| **Direct client access** (browser Supabase client) | Lower latency (one hop), simpler code, real-time subscriptions work natively | Exposes table structure via OpenAPI spec, RLS is your only defense, harder to add business logic/validation |
| **Proxy through Next.js API routes** (recommended) | Full control over what data is exposed, server-side validation, can add rate limiting/logging, hides table structure | Extra hop, more boilerplate, real-time requires separate handling |

**When direct client access IS appropriate:**
- Real-time subscriptions (Supabase Realtime requires a browser client)
- Supabase Auth operations (login, signup, session refresh) -- these MUST use the browser client
- File uploads to Storage (can use signed upload URLs)

**When direct client access is DANGEROUS:**
- Any query that touches sensitive business data (deals, costs, purchase prices, customer PII)
- Any write operation that needs business logic validation
- Admin operations of any kind

### Current State in TLC Autos

The project already follows the proxy pattern correctly. The browser client (`src/lib/supabase/client.ts`) exists but is only needed for auth flows. All data access goes through `/api/` routes using the server client. **Keep it this way.**

### Implementation Pattern

The browser client should ONLY be used for auth:

```typescript
// src/lib/supabase/client.ts -- ONLY for auth in the browser
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

// Usage in a login component:
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

All data access goes through API routes, which use the server client:

```typescript
// src/app/api/inventory/route.ts
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  // Server client respects RLS based on the user's cookie session
  const { data } = await supabase.from("vehicles").select("*");
  return NextResponse.json(data);
}
```

### Disabling the OpenAPI Spec (Optional but Recommended)

With legacy anon keys, anyone could hit `https://your-project.supabase.co/rest/v1/` and see your full table schema. The new publishable keys (`sb_publishable_...`) restrict this by default. If you are still on legacy keys, consider migrating.

---

## 2. RLS Best Practices

### Critical Issue in Current Schema

**The current RLS policies have a significant security flaw.** The "Admin full access" policies use:

```sql
-- CURRENT (DANGEROUS for a public-facing app):
CREATE POLICY "Admin full access vehicles" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');
```

This means **ANY authenticated user** gets full access to ALL data. If someone creates an account (via the Supabase Auth API directly, or if signup is ever enabled), they immediately have admin-level access to every table.

### Fix: Use app_metadata-Based Role Checks

Since TLC Autos stores roles in `user_metadata`, and `user_metadata` is editable by the user themselves, this is insecure. Move role data to `app_metadata` (which only the service role can modify) and use it in RLS policies.

**Step 1: Create a helper function to extract role from app_metadata:**

```sql
-- Create in a NON-exposed schema (not public, not in API exposed schemas)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS boolean AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'role') IN ('admin', 'staff'),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Step 2: Update RLS policies to use these functions:**

```sql
-- Replace the overly permissive policies:
DROP POLICY "Admin full access vehicles" ON vehicles;

-- Staff can read all vehicles (including non-available ones)
CREATE POLICY "Staff read all vehicles" ON vehicles
  FOR SELECT TO authenticated
  USING (private.is_staff());

-- Staff can insert/update vehicles
CREATE POLICY "Staff write vehicles" ON vehicles
  FOR INSERT TO authenticated
  WITH CHECK (private.is_staff());

CREATE POLICY "Staff update vehicles" ON vehicles
  FOR UPDATE TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

-- Only admin can delete
CREATE POLICY "Admin delete vehicles" ON vehicles
  FOR DELETE TO authenticated
  USING (private.is_admin());

-- Keep the public read policy for available vehicles
-- (already correct in current schema)
```

**Step 3: Set roles via app_metadata when creating users:**

```typescript
// In your admin user creation route:
const admin = createAdminClient();
const { data: newUser, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: role || "staff" },  // NOT user_metadata
  user_metadata: { name },  // Display name only -- safe for user to edit
});
```

**Step 4: Add a Custom Access Token Hook to inject role into JWT:**

```sql
-- This hook runs every time a token is issued
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  claims := event->'claims';

  -- Get role from app_metadata (already in claims)
  user_role := claims->'app_metadata'->>'role';

  -- If no role set, default to null (no access)
  IF user_role IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}',
      coalesce(claims->'app_metadata', '{}'::jsonb) || '{"role": null}'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

Then enable the hook in Dashboard > Authentication > Hooks.

### Common RLS Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Forgetting `ENABLE ROW LEVEL SECURITY` | Table fully exposed via API | Always include in migrations; use event trigger for auto-enable |
| RLS enabled but no policies | All queries return empty results | Always add at least one policy per table |
| Using `auth.role() = 'authenticated'` as sole check | Any logged-in user has full access | Use `app_metadata` role checks or `auth.uid()` ownership checks |
| Storing roles in `user_metadata` | Users can escalate their own privileges | Store authorization data in `app_metadata` only |
| Missing `WITH CHECK` on INSERT/UPDATE | Users can insert rows claiming to be someone else | Always include `WITH CHECK` on write policies |
| Testing only in SQL Editor | SQL Editor runs as `postgres` superuser, bypasses RLS | Test through the Supabase client SDK with actual user auth |
| No index on policy columns | Slow queries at scale | `CREATE INDEX` on every column used in RLS policies |

### Auditing RLS Coverage

Run this query to find tables WITHOUT RLS enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

Run this query to find tables with RLS enabled but NO policies:

```sql
SELECT t.schemaname, t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.schemaname, t.tablename
HAVING COUNT(p.policyname) = 0;
```

### Auto-Enable RLS on New Tables

```sql
CREATE OR REPLACE FUNCTION private.auto_enable_rls()
RETURNS event_trigger AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER auto_enable_rls ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION private.auto_enable_rls();
```

---

## 3. Service Role Key Security

### Rules (Non-Negotiable)

1. **NEVER prefix with `NEXT_PUBLIC_`** -- this exposes the key to the browser bundle
2. **Only use in server-side code** -- API routes, Server Actions, server components
3. **Only use for operations that REQUIRE it** -- specifically Supabase Auth Admin API (`admin.listUsers`, `admin.createUser`, `admin.deleteUser`)
4. **Singleton pattern** -- create the admin client in one file, import from there

### Current State (Good)

The project correctly has the admin client in `src/lib/supabase/admin.ts` using `SUPABASE_SECRET_KEY` (no `NEXT_PUBLIC_` prefix). The `createAdminClient()` is only used in the users route. **This is correct.**

### Additional Safeguards

**Add a runtime check to prevent accidental client-side usage:**

```typescript
// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() was called on the client side. " +
      "This is a security violation -- the service role key must never reach the browser."
    );
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

**Add a lint rule to prevent importing the admin client in client components:**

```javascript
// In eslint.config.mjs, add a no-restricted-imports rule:
{
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["@/lib/supabase/admin"],
        importNames: ["createAdminClient"],
        message: "createAdminClient uses the service role key and must not be imported in client components. Use createClient from @/lib/supabase/server instead."
      }]
    }]
  }
}
```

### When to Use Each Client

| Client | Key Used | Bypasses RLS? | Use For |
|--------|----------|---------------|---------|
| Browser client (`client.ts`) | Publishable (anon) | No | Auth flows only (login, signup, session) |
| Server client (`server.ts`) | Publishable (anon) + user cookie | No | All data access in API routes |
| Admin client (`admin.ts`) | Service role (secret) | YES | User management (create/delete/list users) only |

---

## 4. API Route Auth Patterns

### Current Problem

Most admin API routes (vehicles, deals, customers, leads) do NOT verify the user is authenticated or has the right role. They rely on:
1. Middleware redirecting unauthenticated users away from `/admin/*` pages
2. RLS policies checking `auth.role() = 'authenticated'`

**This is insufficient because:**
- Middleware only protects page routes, not API routes (someone can call `/api/admin/vehicles` directly with curl)
- The middleware matcher is `/admin/:path*` but API routes are at `/api/admin/:path*` -- **the API routes are not protected by middleware at all**
- Even if middleware ran, CVE-2025-29927 showed middleware-only auth is fragile

### Fix: Verify Auth in Every API Route

**Create a reusable auth guard:**

```typescript
// src/lib/supabase/auth-guard.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type AuthResult =
  | { authorized: true; user: { id: string; role: string; email: string } }
  | { authorized: false; response: NextResponse };

/**
 * Verify the request is from an authenticated staff/admin user.
 * Call this at the top of every admin API route.
 */
export async function requireStaff(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "staff") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { id: user.id, role, email: user.email! },
  };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireStaff();
  if (!result.authorized) return result;

  if (result.user.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return result;
}
```

**Use in every admin route:**

```typescript
// src/app/api/admin/vehicles/route.ts
import { requireStaff } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireStaff();
  if (!auth.authorized) return auth.response;

  // auth.user.id, auth.user.role available here
  const supabase = await createClient();
  // ... rest of handler
}

export async function POST(req: NextRequest) {
  const auth = await requireStaff();
  if (!auth.authorized) return auth.response;

  // ... rest of handler
}
```

### Preventing IDOR (Insecure Direct Object Reference) Attacks

IDOR happens when a user can access or modify resources by guessing/changing IDs in the URL. For TLC Autos, this is less of a concern because all admin users are staff at the same dealership. But good habits matter:

```typescript
// For routes like /api/admin/vehicles/[id]:
// Since all staff can access all vehicles, the main defense is the auth check.
// If you later add multi-dealership support, add ownership checks:

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  // Validate UUID format to prevent garbage queries
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

### Update Middleware to Also Cover API Routes

```typescript
// src/middleware.ts
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",  // ADD THIS
  ],
};
```

This adds a first layer of defense for API routes. But always verify auth inside the route handler too -- defense in depth.

---

## 5. Rate Limiting and Abuse Prevention

### What Needs Rate Limiting

| Endpoint | Why | Recommended Limit |
|----------|-----|-------------------|
| `POST /api/leads` | Public -- spam bots can flood it | 5 per minute per IP |
| `POST /admin/login` | Brute force prevention | 5 per minute per IP (Supabase Auth also has built-in limits) |
| All `/api/admin/*` | Prevent abuse from compromised credentials | 60 per minute per user |
| `GET /api/inventory` | Public -- scraping prevention | 30 per minute per IP |

### Simple In-Memory Rate Limiter (Good Enough for Single-Instance Vercel)

For a small dealership app, an in-memory rate limiter is sufficient. Vercel serverless functions do share some in-memory state within a single instance's lifetime.

```typescript
// src/lib/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit) {
    if (now > value.resetAt) rateLimit.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  const allowed = entry.count <= maxRequests;
  return { allowed, remaining: Math.max(0, maxRequests - entry.count) };
}
```

**Usage in the leads route:**

```typescript
// src/app/api/leads/route.ts
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { allowed } = checkRateLimit(`leads:${ip}`, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### For Production Scale: Upstash Redis

If you need rate limiting that works across multiple serverless function instances (not needed for a small dealership app, but good to know):

```bash
bun add @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});
```

### Supabase Built-In Rate Limits

Supabase Auth has its own rate limits (e.g., email sending, sign-up attempts). These are configured in Dashboard > Authentication > Rate Limits. The defaults are reasonable for a small app but review them.

**Gotcha with Server Actions:** When using Next.js server-side calls to Supabase Auth, all requests come from the server's IP and share the same rate limit bucket. This can cause `Rate limit exceeded` errors for legitimate users. If you hit this, you can set `GOTRUE_RATE_LIMIT_HEADER` to forward the client IP (self-hosted only), or use the Supabase dashboard to adjust limits.

---

## 6. Input Validation

### Use Zod for All API Route Inputs

Zod is already installed in the project. Use it in every API route.

**Create shared schemas:**

```typescript
// src/lib/validations/leads.ts
import { z } from "zod";

export const leadSubmissionSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().max(200).trim(),
  phone: z.string().max(50).trim().optional().default(""),
  vehicleInterest: z.string().max(500).trim().optional().default(""),
  notes: z.string().max(2000).trim().optional().default(""),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
```

```typescript
// src/lib/validations/vehicles.ts
import { z } from "zod";

export const vehicleCreateSchema = z.object({
  stockNumber: z.string().max(20).optional(),
  vin: z.string().min(17).max(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "Invalid VIN format"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1).max(100).trim(),
  model: z.string().min(1).max(100).trim(),
  trim: z.string().max(100).trim().optional().default(""),
  bodyStyle: z.string().max(50).optional().default(""),
  exteriorColor: z.string().max(50).optional().default(""),
  interiorColor: z.string().max(50).optional().default(""),
  mileage: z.number().int().min(0).max(999999).optional().default(0),
  transmission: z.string().max(50).optional().default(""),
  engine: z.string().max(100).optional().default(""),
  sellingPrice: z.number().min(0).max(9999999.99).optional().default(0),
  purchasePrice: z.number().min(0).max(9999999.99).optional().default(0),
  status: z.enum(["available", "pending", "sold", "wholesale"]).optional().default("available"),
  description: z.string().max(5000).trim().optional().default(""),
  features: z.array(z.string()).optional().default([]),
});
```

**Use in the leads route (replacing manual String() truncation):**

```typescript
// src/app/api/leads/route.ts
import { leadSubmissionSchema } from "@/lib/validations/leads";

export async function POST(req: NextRequest) {
  // Rate limiting first...

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = leadSubmissionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const validated = result.data;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      first_name: validated.firstName,
      last_name: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      source: "website",
      status: "new",
      vehicle_interest: validated.vehicleInterest,
      notes: validated.notes,
    })
    .select("id")
    .single();

  // ... rest of handler
}
```

### Why Validation Matters Even With RLS

- RLS controls WHO can access data, not WHAT data is valid
- Supabase will accept any data that matches the column types -- `TEXT` columns accept megabytes of text
- PostgreSQL constraints (NOT NULL, UNIQUE) catch some issues but not business logic
- Zod catches bad data before it hits the database, providing better error messages
- Defense in depth: Zod + database constraints + RLS

---

## 7. SQL Injection via PostgREST

### Short Answer: PostgREST Parameterizes Queries -- Standard SQL Injection Is Not Possible

When using the Supabase JS client (`.from("table").select("*").eq("id", userInput)`), all inputs are parameterized. The query is sent as a prepared statement. User input is never interpolated into SQL.

### Edge Cases to Watch

**1. The `.or()` filter with string interpolation (CURRENT VULNERABILITY IN CODE):**

```typescript
// CURRENT CODE in /api/admin/vehicles/route.ts (line 27):
query = query.or(
  `make.ilike.%${search}%,model.ilike.%${search}%,stock_number.ilike.%${search}%,vin.ilike.%${search}%`
);
```

This is NOT a SQL injection risk (PostgREST still parameterizes it), but it IS a **PostgREST filter injection** risk. A user could submit a search string containing PostgREST filter syntax (e.g., commas, parentheses, periods) that could alter the filter logic.

Additionally, the `%` and `_` characters in the search term are LIKE wildcards. A search for `%` would match every row.

**Fix: Sanitize search input for PostgREST filter strings:**

```typescript
function sanitizeForIlike(input: string): string {
  // Escape LIKE wildcards
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    // Escape PostgREST special characters
    .replace(/[(),."]/g, "");
}

// Then:
const safe = sanitizeForIlike(search);
query = query.or(
  `make.ilike.%${safe}%,model.ilike.%${safe}%,stock_number.ilike.%${safe}%,vin.ilike.%${safe}%`
);
```

**2. The `.filter()` method is an escape hatch:**

The `.filter()` method passes values as-is to PostgREST. If you use it, you must sanitize manually. Prefer `.eq()`, `.ilike()`, `.in()`, etc. instead.

**3. The `.rpc()` method for custom functions:**

If you write custom Postgres functions and call them via `.rpc()`, SQL injection IS possible if the function builds dynamic SQL with string concatenation. Always use parameterized queries inside functions:

```sql
-- BAD:
EXECUTE 'SELECT * FROM vehicles WHERE make = ''' || input_make || '''';

-- GOOD:
EXECUTE 'SELECT * FROM vehicles WHERE make = $1' USING input_make;
```

**4. CVE-2024-24213 (pg_meta SQL injection):**

This affected the `/pg_meta/default/query` endpoint in Supabase PostgreSQL 15.1. It was patched in 15.2+. Hosted Supabase projects are automatically updated. Not a concern for managed Supabase.

### Summary

| Vector | Risk | Mitigation |
|--------|------|------------|
| Standard `.eq()`, `.select()`, `.insert()` | None -- parameterized | Use the SDK correctly |
| `.or()` with string interpolation | PostgREST filter manipulation | Sanitize special characters |
| `.filter()` escape hatch | Moderate if misused | Avoid; use specific methods |
| Custom `.rpc()` functions | High if function uses dynamic SQL | Use `USING` parameters |
| Direct database connections | Standard SQL injection risk | Do not expose; use PostgREST API |

---

## 8. Security Headers and Dashboard Settings

### API Key Management

**Migrate to the new key format** when available for your project:
- `sb_publishable_...` replaces the anon key
- `sb_secret_...` replaces the service_role key

Benefits of the new format:
- Independent rotation without downtime (create new key, deploy, delete old key)
- GitHub Secret Scanning auto-revokes leaked secret keys
- OpenAPI spec is no longer publicly visible
- Shorter expiry (not the legacy 10-year JWT)

**To rotate keys (new format):**
1. Dashboard > Settings > API Keys
2. Create a new secret key
3. Update `.env.local` and Vercel environment variables
4. Deploy
5. Delete the old key

**To rotate keys (legacy format):**
1. Dashboard > Settings > API > Generate new JWT Secret
2. This invalidates ALL existing keys -- requires updating both anon and service_role keys
3. This also invalidates all user sessions

### Network Restrictions

For a Vercel-deployed app, you cannot restrict the API to specific IPs (Vercel uses dynamic IPs). But you can:

1. **Restrict direct database access:** Dashboard > Settings > Database > Network Restrictions
   - Only allow connections from your development IP and any services that need direct DB access
   - This does NOT affect PostgREST/API access, only direct PostgreSQL connections

2. **Enable SSL enforcement:** Dashboard > Settings > Database > Enforce SSL
   - Ensures all database connections use TLS

### Dashboard Settings Checklist

| Setting | Location | Action |
|---------|----------|--------|
| Email confirmations | Auth > Settings | Enable (prevent fake accounts) |
| Minimum password length | Auth > Settings | Set to 8+ characters |
| Enable MFA | Auth > Settings | Enable TOTP for admin accounts |
| Disable signup | Auth > Settings | If only admins create users, DISABLE public signup |
| Custom SMTP | Auth > Settings | Configure so auth emails come from your domain |
| Rate limits | Auth > Rate Limits | Review defaults; adjust if needed |
| RLS enabled | Database > Tables | Verify every table has RLS enabled |
| Network restrictions | Database > Settings | Restrict direct DB access to known IPs |
| Point-in-time recovery | Database > Backups | Enable (available on Pro plan) |
| Log retention | Settings > General | Enable and review logs periodically |

### Critical: Disable Public Signup

If TLC Autos only allows admin-created users (which it should -- this is an internal DMS), **disable public signup entirely**:

Dashboard > Authentication > Settings > Enable Sign Ups: **OFF**

This prevents anyone from calling `supabase.auth.signUp()` to create an account. Only the admin client (`admin.auth.admin.createUser()`) can create users.

**This single setting eliminates the biggest risk with the current `auth.role() = 'authenticated'` RLS policies.** Even so, fix the RLS policies to use proper role checks (Section 2) for defense in depth.

### Security Headers for Next.js

Add these headers in `next.config.ts`:

```typescript
const nextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
  ],
};
```

---

## 9. Storage Security

### Current State

The schema creates a public `vehicle-images` bucket with RLS policies. This is appropriate for vehicle photos -- they should be publicly viewable.

### Current Policies (Mostly Good, One Improvement Needed)

```sql
-- Current: Any authenticated user can upload to vehicle-images
CREATE POLICY "Admin can upload vehicle images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
```

**Same issue as table RLS:** `auth.role() = 'authenticated'` should be `private.is_staff()`.

### Recommended Storage Configuration

**1. Set allowed MIME types on the bucket:**

```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
]
WHERE id = 'vehicle-images';
```

This prevents uploading PDFs, executables, HTML files, etc. to the image bucket.

**2. Set max file size:**

```sql
UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10MB
WHERE id = 'vehicle-images';
```

**3. Validate on upload in your API route too (defense in depth):**

```typescript
// In your image upload API route:
const file = formData.get("file") as File;

// Validate file type
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
}

// Validate file size (10MB)
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
}

// Generate a safe filename (prevent path traversal)
const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
const safeName = `${vehicleId}/${crypto.randomUUID()}.${ext}`;

const supabase = await createClient();
const { error } = await supabase.storage
  .from("vehicle-images")
  .upload(safeName, file, { contentType: file.type, upsert: false });
```

### Public vs Signed URLs

For TLC Autos vehicle images, **public URLs are fine**. These are marketing images meant to be seen by everyone.

| Approach | Use When |
|----------|----------|
| Public bucket + public URLs | Vehicle photos, marketing images |
| Private bucket + signed URLs | Customer documents, deal paperwork, driver's licenses |

**If you later add document storage (deal packets, etc.):**

```typescript
// Create a private bucket
// INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

// Generate a signed URL valid for 1 hour
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("deals/D-0001/contract.pdf", 3600);
```

---

## 10. Production Checklist

### Pre-Launch (Do Before Going Live)

#### Authentication & Access Control
- [ ] **Disable public signup** -- Dashboard > Auth > Settings > Enable Sign Ups: OFF
- [ ] **Move roles from `user_metadata` to `app_metadata`** -- users cannot self-modify
- [ ] **Enable email confirmation** -- Dashboard > Auth > Settings
- [ ] **Set minimum password length** to 8+ characters
- [ ] **Configure custom SMTP** for auth emails from your domain
- [ ] **Set up MFA** for admin accounts (optional but recommended)

#### Row Level Security
- [ ] **Verify RLS is enabled on ALL tables** -- run the audit query from Section 2
- [ ] **Replace `auth.role() = 'authenticated'` policies** with `app_metadata` role checks
- [ ] **Add `WITH CHECK` clauses** to all INSERT/UPDATE policies
- [ ] **Create the `private.is_staff()` / `private.is_admin()` helper functions**
- [ ] **Add indexes** on all columns referenced in RLS policies
- [ ] **Test RLS** through the Supabase JS client (NOT the SQL Editor)

#### API Routes
- [ ] **Add auth guard to every `/api/admin/*` route** using `requireStaff()` / `requireAdmin()`
- [ ] **Update middleware matcher** to include `/api/admin/:path*`
- [ ] **Add Zod validation** to all API route request bodies
- [ ] **Sanitize search inputs** in the `.or()` filter (vehicles route)
- [ ] **Validate UUID format** on all `[id]` route parameters

#### API Keys
- [ ] **Migrate to new key format** (`sb_publishable_...` / `sb_secret_...`) when available
- [ ] **Verify `SUPABASE_SECRET_KEY` has no `NEXT_PUBLIC_` prefix** in all environments
- [ ] **Set environment variables in Vercel** dashboard (not committed to git)
- [ ] **Add `.env.local` to `.gitignore`** (should already be there)

#### Storage
- [ ] **Set `allowed_mime_types`** on the vehicle-images bucket (jpeg, png, webp, avif)
- [ ] **Set `file_size_limit`** on the vehicle-images bucket (10MB)
- [ ] **Update storage RLS policies** to use role checks instead of `auth.role() = 'authenticated'`
- [ ] **Validate file type and size** in upload API routes (defense in depth)

#### Rate Limiting
- [ ] **Add rate limiting to `POST /api/leads`** (5/min per IP)
- [ ] **Add rate limiting to `GET /api/inventory`** (30/min per IP)
- [ ] **Review Supabase Auth rate limits** in dashboard

#### Security Headers
- [ ] **Add security headers** in `next.config.ts` (X-Frame-Options, CSP, etc.)
- [ ] **Set `Cache-Control: no-store`** on all API responses

#### Network & Infrastructure
- [ ] **Restrict direct database access** to known IPs
- [ ] **Enforce SSL** on database connections
- [ ] **Enable Point-in-Time Recovery** (Pro plan) or verify daily backups are running
- [ ] **Enable GitHub Secret Scanning** on the repository

#### Monitoring
- [ ] **Review Supabase logs** periodically for suspicious activity
- [ ] **Set up Vercel alerts** for error rate spikes
- [ ] **Monitor database size** and connection count

### Post-Launch (Ongoing)

- [ ] **Rotate API keys** quarterly (or immediately if suspected compromise)
- [ ] **Review RLS policies** when adding new tables
- [ ] **Update Supabase client libraries** when new versions are released
- [ ] **Review auth logs** monthly for unusual patterns
- [ ] **Test backup restoration** quarterly

---

## Priority Order for Implementation

Given the current state of TLC Autos (migration not yet complete, RLS written but not applied), here is the recommended order:

1. **Disable public signup** -- 30 seconds, eliminates the biggest risk
2. **Move roles to `app_metadata`** -- when creating users, critical for RLS
3. **Create `private.is_staff()` / `private.is_admin()` functions** -- needed before applying RLS
4. **Update RLS policies** to use role functions instead of `auth.role() = 'authenticated'`
5. **Apply the database migration** with corrected RLS
6. **Add auth guards to API routes** -- `requireStaff()` pattern
7. **Add Zod validation** to all API routes
8. **Configure storage bucket constraints** (MIME types, file size)
9. **Add rate limiting** to public endpoints
10. **Add security headers** to `next.config.ts`

Items 1-5 should be done in the database migration phase. Items 6-7 should be done during the API route rewrite. Items 8-10 can be done in a dedicated hardening pass.

---

## Sources

- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase Security Docs](https://supabase.com/docs/guides/security)
- [Supabase Securing Your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Supabase Custom Claims and RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Supabase API Keys Changes Discussion](https://github.com/orgs/supabase/discussions/29260)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [2025 Supabase Security Guide - Pentest Findings](https://github.com/orgs/supabase/discussions/38690)
- [Supabase Anonymous Key Security Guide](https://www.audityour.app/guides/supabase-anonymous-key-security-guide)
- [CVE-2025-48757 - Lovable/Supabase RLS Exposure](https://radar.offseq.com/threat/2025-supabase-security-best-practices-guide-common-1c545891)
- [Supabase Security Retro 2025](https://supaexplorer.com/dev-notes/supabase-security-2025-whats-new-and-how-to-stay-secure.html)
