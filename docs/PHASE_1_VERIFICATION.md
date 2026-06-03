# Phase 1 Verification Checklist

## Deployment target

Verify the live deployment is serving `app_v2`, not the legacy root static app.

Checks:

- Login route loads from the Next.js app.
- Browser source/assets do not show the legacy root `public/main.js` bundle.
- Page title/metadata matches the Employee Hub app.
- Cloudflare deployment root/path points to `app_v2` or Workers/OpenNext config.

## Auth guardrails

Checks:

- Signed-out user visiting `/goals` is redirected to `/auth/login`.
- Signed-out user visiting `/admin` is redirected to `/auth/login`.
- Signed-out user visiting `/admin/goals` is redirected to `/auth/login`.
- Signed-in non-admin user can access normal hub pages.
- Signed-in non-admin user cannot access `/admin` or `/admin/goals`.
- Signed-in admin user can access `/admin` and `/admin/goals`.

Admin definition for current app model:

- `profiles.is_admin = true`, or
- `profiles.role = 'admin'`

## Monthly goal validation

Checks:

- Empty store cannot save.
- Net Sales goal must be greater than 0.
- Transaction goal must be greater than 0.
- Transaction goal must be a whole number.
- Valid monthly goal saves correctly.

## Daily goal publish behavior

Checks:

- Draft save does not make goals visible to store users.
- Publishing makes daily goals visible to store users.
- Draft saves do not silently unpublish already-published rows.
- Published store view reads only published daily goals.

## Supabase RLS baseline

After applying `supabase/sql/phase1_rls_baseline.sql`, verify:

- Anonymous user cannot read operational tables.
- Authenticated user can read published monthly/daily goals.
- Authenticated non-admin cannot insert/update/delete goals.
- Admin can insert/update monthly goals.
- Admin can insert/update daily goals.
- Actuals and historical sales are readable to authenticated users.
- Actuals and historical sales are writable only by admin or server-side service role operations.

## Known Phase 1 gaps after baseline

- Store-level scoping is not complete until the active app model has a user-to-store access table or migrates to `hub_user_store_access`.
- RLS baseline does not replace the need for store-scoped policies.
- The admin publish call-site should still be switched to `upsertDailyGoalsAsPublished` when a safe small patch is available.
- Lock/unlock governance remains a later Phase 1 slice.
