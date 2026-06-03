# Supabase Phase 1 Security Checklist

## Purpose

This checklist converts Phase 1 security work into controlled Supabase execution steps.

Do not run broad SQL changes blindly. Apply policies in a staging or reviewed window first, then verify app behavior.

## Current app runtime tables

The current `app_v2` runtime uses the short-term table set:

- `profiles`
- `stores_v2`
- `monthly_goals`
- `daily_goals`
- `daily_actuals`
- `historical_daily_sales`

The richer `hub_*` model exists but is not the active app model yet. Do not mix the two models in Phase 1 without a migration plan.

## Current known gap

The current runtime model does not yet have a store-access table tied to `stores_v2`.

That means the first RLS pass can protect admin writes and block public anonymous access, but it cannot fully enforce store-level scoping until a current-model store access table exists or the app migrates to the `hub_*` model.

## Recommended execution sequence

1. Confirm at least one admin profile exists:

```sql
select id, email, role, is_admin
from public.profiles
where is_admin = true or role = 'admin';
```

2. Confirm the app login user has a matching `profiles.id = auth.users.id` row.

3. Apply the draft SQL in:

```text
supabase/sql/phase1_rls_baseline.sql
```

4. Verify behavior:

- Anonymous user cannot read goal tables.
- Authenticated user can read published goals.
- Non-admin user cannot write goals.
- Admin user can save monthly goals.
- Admin user can save/publish daily goals.

5. Only after baseline RLS works, design store-level scoping.

## Store-level scoping decision

Before enforcing store-level RLS, choose one path:

### Option A: add current-model access table

Create a table such as:

```sql
public.user_store_access (
  user_id uuid references public.profiles(id),
  store_id text references public.stores_v2(store_id),
  primary key (user_id, store_id)
)
```

Then update app queries and policies against `stores_v2`.

### Option B: migrate app to `hub_*` model

Use existing:

- `hub_profiles`
- `hub_stores`
- `hub_user_store_access`
- `hub_monthly_goals`
- `hub_daily_goals`

This is cleaner long term but is a larger migration and should not be mixed into the current Phase 1 hardening PRs.

## Do not do yet

- Do not enforce store-level policies until the active app model has a store-access source of truth.
- Do not migrate to `hub_*` tables inside the same PR as RLS baseline.
- Do not give anon public read access to operational goal or actuals tables.
- Do not allow client-side admin checks to be the only protection.
