# Supabase Implementation Patterns — TLC Autos

Reference patterns extracted from official Supabase docs, aligned to our exact stack:
Next.js 16 App Router, @supabase/ssr, TypeScript, Supabase project `ychvjgynekceffeqqymf`.

## 1. Auth — @supabase/ssr (Cookie-Based)

### Browser Client (client components)

```typescript
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign out
await supabase.auth.signOut();

// Get current user (verified — makes API call)
const { data: { user } } = await supabase.auth.getUser();
```

### Server Client (server components, route handlers)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### Middleware (token refresh on every request)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Always use getUser() not getSession() — getUser() verifies the JWT
  const { data: { user } } = await supabase.auth.getUser();

  return { user, response };
}
```

### Server Actions (login/signup)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect('/admin/login?error=' + encodeURIComponent(error.message));
  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect('/error');
  revalidatePath('/', 'layout');
  redirect('/admin');
}
```

### Key Rules
- ALWAYS use `getAll`/`setAll` cookie methods — NEVER `get`/`set`/`remove`
- NEVER import from `@supabase/auth-helpers-nextjs` (deprecated)
- Use `getUser()` for verified identity, not `getSession()` (unverified cookie data)
- Set `Cache-Control: private, no-store` on routes that set cookies

## 2. Password Auth UI Components

Supabase shadcn UI block provides ready-made auth pages:

```
app/auth/sign-up/page.tsx        - Registration
app/auth/login/page.tsx          - Login
app/auth/forgot-password/page.tsx - Password recovery
app/auth/update-password/page.tsx - Password change
app/auth/confirm/route.ts        - Email confirmation endpoint
components/login-form.tsx
components/sign-up-form.tsx
components/forgot-password-form.tsx
components/update-password-form.tsx
components/logout-button.tsx
```

Email templates must use:
```html
<!-- Sign-up confirmation -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
  Confirm your email
</a>

<!-- Password reset -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
  Reset Password
</a>
```

**Our approach:** We already have `src/app/admin/login/page.tsx`. Adapt the shadcn components to fit our admin layout rather than creating separate `/auth/*` routes. Staff-only app — no public signup.

## 3. Database Queries (PostgREST via JS Client)

### Basic CRUD

```typescript
// Select with relationships (foreign key joins)
const { data, error } = await supabase
  .from('vehicles')
  .select('*, vehicle_images(url, alt, is_primary, sort_order)')
  .eq('status', 'available')
  .order('date_added', { ascending: false })
  .range(0, 19); // pagination: first 20 rows

// Insert
const { data, error } = await supabase
  .from('vehicles')
  .insert({ make: 'Toyota', model: 'Camry', year: 2024 })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('vehicles')
  .update({ status: 'sold' })
  .eq('id', vehicleId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId);
```

### Filtering with .or() — MUST sanitize input

```typescript
import { sanitizeSearch } from '@/lib/utils';

const search = sanitizeSearch(searchParams.get('search') || '');
if (search) {
  query = query.or(
    `make.ilike.%${search}%,model.ilike.%${search}%,stock_number.ilike.%${search}%`
  );
}
```

### Performance tip
Always add explicit `.eq()` filters even with RLS — helps Postgres optimize query plans.

## 4. TypeScript Type Generation

```bash
# Generate types from remote database
npx supabase gen types typescript --project-id ychvjgynekceffeqqymf > src/types/database.types.ts
```

Generated types provide Row, Insert, and Update types per table:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Type-safe client — all queries get autocomplete
const supabase = createClient<Database>(url, key);

// Now supabase.from('vehicles').select() returns typed data
```

**Our use:** Generate types in Phase 1 (INFRA-03), pass `Database` generic to all `createClient` calls. Eliminates `Record<string, unknown>` casts.

## 5. Row Level Security (RLS)

RLS policies act as implicit WHERE clauses on every query:

```sql
-- Enable RLS on a table
alter table vehicles enable row level security;

-- Allow authenticated users to read all vehicles
create policy "Authenticated users can read vehicles"
on vehicles for select
to authenticated
using (true);

-- Allow authenticated users to insert/update/delete
create policy "Authenticated users can modify vehicles"
on vehicles for all
to authenticated
using (true)
with check (true);

-- Example: restrict to own rows (not needed for our DMS, but useful pattern)
create policy "Users can only see their own data"
on profiles for select
using (auth.uid() = user_id);
```

**Our approach:** All admin tables (vehicles, customers, leads, deals, follow_ups, vehicle_images, vehicle_costs) need:
- `select` for `authenticated` role
- `insert`, `update`, `delete` for `authenticated` role
- Public tables (inventory view) need `select` for `anon` role
- `auth.uid()` check not needed — all staff see all data (single dealership)

## 6. Storage (Vehicle Images)

```typescript
// Upload a file
const { data, error } = await supabase.storage
  .from('vehicle-images')
  .upload(`vehicles/${vehicleId}/${filename}.jpg`, file, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('vehicle-images')
  .getPublicUrl(`vehicles/${vehicleId}/${filename}.jpg`);

// Delete a file
const { error } = await supabase.storage
  .from('vehicle-images')
  .remove([`vehicles/${vehicleId}/${filename}.jpg`]);

// List files in a folder
const { data, error } = await supabase.storage
  .from('vehicle-images')
  .list(`vehicles/${vehicleId}`);
```

Storage RLS policy for authenticated uploads:
```sql
create policy "Authenticated users can upload vehicle images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'vehicle-images');

create policy "Anyone can view vehicle images"
on storage.objects
for select
using (bucket_id = 'vehicle-images');

create policy "Authenticated users can delete vehicle images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'vehicle-images');
```

## 7. Edge Functions — Not Needed

Edge Functions run on Deno at the edge. For our use case:
- **Next.js API routes** handle all server logic (same deployment on Vercel)
- No background processing needs (small dataset, 1-2 users)
- No webhook receivers needed currently
- **Verdict:** Skip Edge Functions. Revisit only if we need Supabase-triggered logic (e.g., database webhooks)

## 8. Realtime — Not Needed

- Single-user DMS, no concurrent editing
- Out of scope per REQUIREMENTS.md
- **Verdict:** Skip. If needed later, Supabase Realtime can subscribe to table changes via channels.

## 9. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ychvjgynekceffeqqymf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key from dashboard>
SUPABASE_SECRET_KEY=<service_role key from dashboard — NEVER expose client-side>
```

- `NEXT_PUBLIC_*` keys are safe for browser — they respect RLS
- `SUPABASE_SECRET_KEY` bypasses RLS — server-only (admin user management)

## 10. Connection String (Direct DB Access)

```
postgresql://postgres:[PASSWORD]@db.ychvjgynekceffeqqymf.supabase.co:5432/postgres
```

Used for: type generation CLI, direct SQL migrations, seed scripts.
NOT used for: application code (use JS client instead).
