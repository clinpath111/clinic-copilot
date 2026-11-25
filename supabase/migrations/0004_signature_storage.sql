alter table public.staff
  add column signature_updated_at timestamptz;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('signatures', 'signatures', false, 1048576, array['image/jpeg']);

create policy signatures_read_same_clinic on storage.objects
  for select to authenticated
  using (
    bucket_id = 'signatures'
    and (storage.foldername(name))[1] = (select private.current_clinic_id())::text
  );

create policy signatures_insert_own_doctor on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'signatures'
    and (select private.current_staff_role()) = 'doctor'
    and (storage.foldername(name))[1] = (select private.current_clinic_id())::text
    and storage.filename(name) = (select auth.uid())::text
    and coalesce(array_length(storage.foldername(name), 1), 0) = 1
  );

create policy signatures_update_own_doctor on storage.objects
  for update to authenticated
  using (
    bucket_id = 'signatures'
    and (select private.current_staff_role()) = 'doctor'
    and (storage.foldername(name))[1] = (select private.current_clinic_id())::text
    and storage.filename(name) = (select auth.uid())::text
    and coalesce(array_length(storage.foldername(name), 1), 0) = 1
  )
  with check (
    bucket_id = 'signatures'
    and (select private.current_staff_role()) = 'doctor'
    and (storage.foldername(name))[1] = (select private.current_clinic_id())::text
    and storage.filename(name) = (select auth.uid())::text
    and coalesce(array_length(storage.foldername(name), 1), 0) = 1
  );

create or replace function public.mark_my_signature_uploaded()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_clinic_id uuid;
  v_updated_at timestamptz;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;

  select s.clinic_id into v_clinic_id
  from public.staff s
  where s.user_id = v_uid and s.active and s.role = 'doctor';

  if v_clinic_id is null then
    raise exception 'doctor_required';
  end if;

  if not exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'signatures'
      and o.name = v_clinic_id::text || '/' || v_uid::text
  ) then
    raise exception 'signature_file_missing';
  end if;

  update public.staff
  set signature_updated_at = now()
  where user_id = v_uid and active and role = 'doctor'
  returning signature_updated_at into v_updated_at;

  if v_updated_at is null then
    raise exception 'signature_not_saved';
  end if;

  return v_updated_at;
end;
$$;

revoke all on function public.mark_my_signature_uploaded() from public, anon;
grant execute on function public.mark_my_signature_uploaded() to authenticated;
