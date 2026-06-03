-- Phase 1 RLS baseline for current app_v2 runtime tables.
-- Review before execution. Do not run blindly in production.

-- Admin helper for current short-term profile model.
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (p.is_admin = true or p.role = 'admin')
  );
$$;

-- Profiles
alter table public.profiles enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_current_user_admin());

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_current_user_admin())
with check (id = auth.uid() or public.is_current_user_admin());

-- Stores are readable to authenticated users. Store-level scoping requires a current-model access table.
alter table public.stores_v2 enable row level security;

drop policy if exists stores_v2_select_authenticated on public.stores_v2;
create policy stores_v2_select_authenticated
on public.stores_v2
for select
to authenticated
using (true);

drop policy if exists stores_v2_admin_write on public.stores_v2;
create policy stores_v2_admin_write
on public.stores_v2
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Monthly goals
alter table public.monthly_goals enable row level security;

drop policy if exists monthly_goals_select_authenticated on public.monthly_goals;
create policy monthly_goals_select_authenticated
on public.monthly_goals
for select
to authenticated
using (is_published = true or public.is_current_user_admin());

drop policy if exists monthly_goals_admin_write on public.monthly_goals;
create policy monthly_goals_admin_write
on public.monthly_goals
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Daily goals
alter table public.daily_goals enable row level security;

drop policy if exists daily_goals_select_authenticated on public.daily_goals;
create policy daily_goals_select_authenticated
on public.daily_goals
for select
to authenticated
using (is_published = true or public.is_current_user_admin());

drop policy if exists daily_goals_admin_write on public.daily_goals;
create policy daily_goals_admin_write
on public.daily_goals
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Actuals: authenticated read, admin write. Store-level scoping comes later.
alter table public.daily_actuals enable row level security;

drop policy if exists daily_actuals_select_authenticated on public.daily_actuals;
create policy daily_actuals_select_authenticated
on public.daily_actuals
for select
to authenticated
using (true);

drop policy if exists daily_actuals_admin_write on public.daily_actuals;
create policy daily_actuals_admin_write
on public.daily_actuals
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Historical daily sales: authenticated read, admin write/import.
alter table public.historical_daily_sales enable row level security;

drop policy if exists historical_daily_sales_select_authenticated on public.historical_daily_sales;
create policy historical_daily_sales_select_authenticated
on public.historical_daily_sales
for select
to authenticated
using (true);

drop policy if exists historical_daily_sales_admin_write on public.historical_daily_sales;
create policy historical_daily_sales_admin_write
on public.historical_daily_sales
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());
