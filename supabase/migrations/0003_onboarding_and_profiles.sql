-- Doctor details that are printed on prescriptions
alter table public.staff
  add column qualifications text,
  add column registration_number text,
  add column registration_council text;

alter table public.staff add constraint staff_text_lengths check (
  char_length(full_name) between 1 and 100
  and coalesce(char_length(qualifications), 0) <= 200
  and coalesce(char_length(registration_number), 0) <= 50
  and coalesce(char_length(registration_council), 0) <= 100
);

alter table public.clinics add constraint clinics_text_lengths check (
  char_length(name) between 1 and 120
  and coalesce(char_length(address), 0) <= 300
  and coalesce(char_length(city), 0) <= 80
  and coalesce(char_length(phone), 0) <= 20
);

grant update (full_name, qualifications, registration_number, registration_council)
  on public.staff to authenticated;

create policy staff_update_self on public.staff for update to authenticated
  using (user_id = (select auth.uid()) and active)
  with check (user_id = (select auth.uid()) and clinic_id = (select private.current_clinic_id()));

create or replace function public.create_my_clinic(p_clinic_name text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_cid uuid;
  v_clinic_name text := btrim(p_clinic_name);
  v_full_name text := btrim(p_full_name);
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if char_length(coalesce(v_clinic_name, '')) not between 2 and 120
     or char_length(coalesce(v_full_name, '')) not between 2 and 100 then
    raise exception 'invalid_name';
  end if;
  if exists (select 1 from public.staff where user_id = v_uid) then
    raise exception 'already_linked';
  end if;

  insert into public.clinics (name) values (v_clinic_name) returning id into v_cid;
  insert into public.staff (clinic_id, user_id, full_name, role, is_owner)
    values (v_cid, v_uid, v_full_name, 'doctor', true);
  return v_cid;
end;
$$;

revoke all on function public.create_my_clinic(text, text) from public, anon;
grant execute on function public.create_my_clinic(text, text) to authenticated;
