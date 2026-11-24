-- 0002_access_policies.sql
-- Who may see and change what. Rule: staff only ever touch their own clinic's rows.

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.current_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.clinic_id
  from public.staff s
  where s.user_id = (select auth.uid()) and s.active
  limit 1
$$;

create or replace function private.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from public.staff s
  where s.user_id = (select auth.uid()) and s.active
  limit 1
$$;

create or replace function private.current_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select s.is_owner from public.staff s
     where s.user_id = (select auth.uid()) and s.active limit 1),
    false)
$$;

revoke all on function private.current_clinic_id() from public;
revoke all on function private.current_staff_role() from public;
revoke all on function private.current_is_owner() from public;
grant execute on function private.current_clinic_id() to authenticated;
grant execute on function private.current_staff_role() to authenticated;
grant execute on function private.current_is_owner() to authenticated;

-- Table permissions: start from nothing, then grant only what is needed.
revoke all on public.clinics, public.staff, public.contacts, public.patients, public.consents
  from anon, authenticated;
grant all on public.clinics, public.staff, public.contacts, public.patients, public.consents
  to service_role;

grant select on public.clinics, public.staff to authenticated;
grant update (name, address, city, phone) on public.clinics to authenticated;  -- not messaging_enabled
grant select, insert, update on public.contacts, public.patients to authenticated;
grant select, insert on public.consents to authenticated;                      -- append-only

-- Row rules
create policy clinics_select on public.clinics for select to authenticated
  using (id = (select private.current_clinic_id()));

create policy clinics_update_owner on public.clinics for update to authenticated
  using (id = (select private.current_clinic_id()) and (select private.current_is_owner()))
  with check (id = (select private.current_clinic_id()));

create policy staff_select on public.staff for select to authenticated
  using (clinic_id = (select private.current_clinic_id()));

create policy contacts_select on public.contacts for select to authenticated
  using (clinic_id = (select private.current_clinic_id()));
create policy contacts_insert on public.contacts for insert to authenticated
  with check (clinic_id = (select private.current_clinic_id()));
create policy contacts_update on public.contacts for update to authenticated
  using (clinic_id = (select private.current_clinic_id()))
  with check (clinic_id = (select private.current_clinic_id()));

create policy patients_select on public.patients for select to authenticated
  using (clinic_id = (select private.current_clinic_id()));
create policy patients_insert on public.patients for insert to authenticated
  with check (clinic_id = (select private.current_clinic_id()));
create policy patients_update on public.patients for update to authenticated
  using (clinic_id = (select private.current_clinic_id()))
  with check (clinic_id = (select private.current_clinic_id()));

create policy consents_select on public.consents for select to authenticated
  using (clinic_id = (select private.current_clinic_id()));
create policy consents_insert on public.consents for insert to authenticated
  with check (clinic_id = (select private.current_clinic_id()));