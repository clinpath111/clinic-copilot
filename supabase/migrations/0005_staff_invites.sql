create table public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  full_name text not null check (char_length(full_name) between 2 and 100),
  role text not null check (role in ('doctor', 'receptionist')),
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'revoked', 'expired')),
  created_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  claimed_at timestamptz
);

create unique index staff_invites_pending_email_idx
  on public.staff_invites (lower(email))
  where status = 'pending';
create index staff_invites_clinic_status_idx
  on public.staff_invites (clinic_id, status, created_at desc);

alter table public.staff_invites enable row level security;
revoke all on public.staff_invites from anon, authenticated;
grant select on public.staff_invites to authenticated;

create policy staff_invites_select_owner on public.staff_invites
  for select to authenticated
  using (
    clinic_id = (select private.current_clinic_id())
    and (select private.current_is_owner())
  );

create or replace function public.my_access_state()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.active then 'active'
    else 'inactive'
  end
  from public.staff s
  where s.user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.claim_my_invite()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_invite public.staff_invites%rowtype;
  v_staff_id uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;

  if exists (select 1 from public.staff s where s.user_id = v_uid) then
    return null;
  end if;

  select lower(btrim(u.email)) into v_email
  from auth.users u
  where u.id = v_uid;

  if v_email is null then
    return null;
  end if;

  update public.staff_invites
  set status = 'expired'
  where lower(email) = v_email
    and status = 'pending'
    and expires_at <= now();

  select i.* into v_invite
  from public.staff_invites i
  where lower(i.email) = v_email
    and i.status = 'pending'
    and i.expires_at > now()
  order by i.created_at desc
  limit 1
  for update;

  if not found then
    return null;
  end if;

  insert into public.staff (clinic_id, user_id, full_name, role, is_owner, active)
  values (v_invite.clinic_id, v_uid, v_invite.full_name, v_invite.role, false, true)
  returning id into v_staff_id;

  update public.staff_invites
  set status = 'claimed', claimed_at = now()
  where id = v_invite.id;

  return v_invite.clinic_id;
end;
$$;

create or replace function public.invite_staff(
  p_email text,
  p_full_name text,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_staff_id uuid;
  v_clinic_id uuid;
  v_email text := lower(btrim(p_email));
  v_full_name text := btrim(p_full_name);
  v_invite_id uuid;
begin
  select s.id, s.clinic_id into v_staff_id, v_clinic_id
  from public.staff s
  where s.user_id = v_user_id and s.active and s.is_owner;

  if v_staff_id is null then
    raise exception 'not_owner';
  end if;

  if v_email is null
    or char_length(v_email) > 254
    or v_email !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'invalid_email';
  end if;
  if char_length(coalesce(v_full_name, '')) < 2
    or char_length(v_full_name) > 100 then
    raise exception 'invalid_name';
  end if;
  if p_role is null or p_role not in ('doctor', 'receptionist') then
    raise exception 'invalid_role';
  end if;

  if exists (
    select 1
    from auth.users u
    join public.staff s on s.user_id = u.id
    where lower(u.email) = v_email
  ) then
    raise exception 'already_staff';
  end if;

  update public.staff_invites
  set status = 'expired'
  where lower(email) = v_email
    and status = 'pending'
    and expires_at <= now();

  if exists (
    select 1
    from public.staff_invites i
    where lower(i.email) = v_email
      and i.status = 'pending'
      and i.expires_at > now()
  ) then
    raise exception 'already_invited';
  end if;

  begin
    insert into public.staff_invites (clinic_id, email, full_name, role, created_by)
    values (v_clinic_id, v_email, v_full_name, p_role, v_staff_id)
    returning id into v_invite_id;
  exception when unique_violation then
    raise exception 'already_invited';
  end;

  return v_invite_id;
end;
$$;

create or replace function public.revoke_staff_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clinic_id uuid;
begin
  select s.clinic_id into v_clinic_id
  from public.staff s
  where s.user_id = auth.uid() and s.active and s.is_owner;

  if v_clinic_id is null then
    raise exception 'not_owner';
  end if;

  update public.staff_invites
  set status = 'revoked'
  where id = p_invite_id
    and clinic_id = v_clinic_id
    and status = 'pending';

  if not found then
    raise exception 'not_found';
  end if;
end;
$$;

create or replace function public.set_staff_active(p_staff_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_clinic_id uuid;
  v_target_owner boolean;
begin
  if p_active is null then
    raise exception 'invalid_active';
  end if;

  select s.id, s.clinic_id into v_owner_id, v_clinic_id
  from public.staff s
  where s.user_id = auth.uid() and s.active and s.is_owner;

  if v_owner_id is null then
    raise exception 'not_owner';
  end if;

  select s.is_owner into v_target_owner
  from public.staff s
  where s.id = p_staff_id and s.clinic_id = v_clinic_id;

  if not found then
    raise exception 'not_found';
  end if;
  if v_target_owner or p_staff_id = v_owner_id then
    raise exception 'cannot_change_owner';
  end if;

  update public.staff
  set active = p_active
  where id = p_staff_id
    and clinic_id = v_clinic_id
    and is_owner = false;
end;
$$;

revoke all on function public.my_access_state() from public, anon;
revoke all on function public.claim_my_invite() from public, anon;
revoke all on function public.invite_staff(text, text, text) from public, anon;
revoke all on function public.revoke_staff_invite(uuid) from public, anon;
revoke all on function public.set_staff_active(uuid, boolean) from public, anon;

grant execute on function public.my_access_state() to authenticated;
grant execute on function public.claim_my_invite() to authenticated;
grant execute on function public.invite_staff(text, text, text) to authenticated;
grant execute on function public.revoke_staff_invite(uuid) to authenticated;
grant execute on function public.set_staff_active(uuid, boolean) to authenticated;
