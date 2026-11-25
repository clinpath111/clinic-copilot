-- supabase/tests/signature_test.sql
-- Proves signature files are private to the clinic and writable only by their own doctor.
-- Everything is undone on purpose. "ALL ... CHECKS PASSED" is SUCCESS (shown as a red error).

do $$
declare
  user_a   uuid := gen_random_uuid();   -- doctor, clinic A
  user_a2  uuid := gen_random_uuid();   -- second doctor, clinic A
  user_r   uuid := gen_random_uuid();   -- receptionist, clinic A
  user_b   uuid := gen_random_uuid();   -- doctor, clinic B
  clinic_a uuid;
  clinic_b uuid;
  n        int;
  ts       timestamptz;
  total    int  := 0;
  report   text := '';
begin
  insert into auth.users (id, aud, role, email) values
    (user_a,  'authenticated', 'authenticated', user_a::text  || '@example.test'),
    (user_a2, 'authenticated', 'authenticated', user_a2::text || '@example.test'),
    (user_r,  'authenticated', 'authenticated', user_r::text  || '@example.test'),
    (user_b,  'authenticated', 'authenticated', user_b::text  || '@example.test');

  -- Create both clinics through the real onboarding function
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  clinic_a := public.create_my_clinic('Fake Clinic A', 'Fake Doctor A');
  reset role;

  perform set_config('request.jwt.claims',
    json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  clinic_b := public.create_my_clinic('Fake Clinic B', 'Fake Doctor B');
  reset role;

  -- A second doctor and a receptionist in clinic A (the invite screen comes in step 12c)
  insert into public.staff (clinic_id, user_id, full_name, role) values
    (clinic_a, user_a2, 'Fake Doctor A2', 'doctor'),
    (clinic_a, user_r,  'Fake Receptionist', 'receptionist');

  ------------------------------------------------------------------
  -- Doctor A
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  total := total + 1;
  begin
    insert into storage.objects (bucket_id, name)
      values ('signatures', clinic_a::text || '/' || user_a::text);
  exception when others then
    report := report || E'\n- Doctor A could not save their own signature file: ' || sqlerrm;
  end;

  total := total + 1;
  begin
    insert into storage.objects (bucket_id, name)
      values ('signatures', clinic_b::text || '/' || user_a::text);
    report := report || E'\n- A saved a file inside clinic B''s folder';
  exception when insufficient_privilege then null;
  end;

  total := total + 1;
  begin
    insert into storage.objects (bucket_id, name)
      values ('signatures', clinic_a::text || '/' || user_a2::text);
    report := report || E'\n- A saved a signature in another doctor''s name';
  exception when insufficient_privilege then null;
  end;

  total := total + 1;
  begin
    ts := public.mark_my_signature_uploaded();
    if ts is null then report := report || E'\n- Marking a saved signature returned nothing'; end if;
  exception when others then
    report := report || E'\n- Doctor A could not mark their signature as saved: ' || sqlerrm;
  end;

  total := total + 1;
  select count(*) into n from public.staff
    where user_id = user_a and signature_updated_at is not null;
  if n <> 1 then report := report || E'\n- Doctor A''s signature date was not recorded'; end if;

  total := total + 1;
  select count(*) into n from storage.objects where bucket_id = 'signatures';
  if n <> 1 then report := report || E'\n- Doctor A sees ' || n::text || ' signature files (expected 1)'; end if;

  reset role;

  ------------------------------------------------------------------
  -- Receptionist in clinic A: can read, cannot write, cannot mark
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_r, 'role', 'authenticated')::text, true);
  set local role authenticated;

  total := total + 1;
  select count(*) into n from storage.objects where bucket_id = 'signatures';
  if n <> 1 then report := report || E'\n- Receptionist sees ' || n::text || ' signature files (expected 1)'; end if;

  total := total + 1;
  begin
    insert into storage.objects (bucket_id, name)
      values ('signatures', clinic_a::text || '/' || user_r::text);
    report := report || E'\n- A receptionist saved a signature file';
  exception when insufficient_privilege then null;
  end;

  total := total + 1;
  begin
    perform public.mark_my_signature_uploaded();
    report := report || E'\n- A receptionist marked a signature as saved';
  exception when raise_exception then null;
  end;

  reset role;

  ------------------------------------------------------------------
  -- Doctor B in clinic B: sees nothing of clinic A, cannot mark without a file
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;

  total := total + 1;
  select count(*) into n from storage.objects where bucket_id = 'signatures';
  if n <> 0 then report := report || E'\n- Doctor B sees ' || n::text || ' of clinic A''s signature files'; end if;

  total := total + 1;
  begin
    perform public.mark_my_signature_uploaded();
    report := report || E'\n- Doctor B marked a signature as saved without a file';
  exception when raise_exception then null;
  end;

  reset role;

  ------------------------------------------------------------------
  -- Not logged in
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', '{}', true);
  set local role anon;

  total := total + 1;
  begin
    select count(*) into n from storage.objects where bucket_id = 'signatures';
    if n <> 0 then report := report || E'\n- A visitor who is not logged in sees signature files'; end if;
  exception when insufficient_privilege then null;
  end;

  reset role;

  ------------------------------------------------------------------
  -- Bucket settings
  ------------------------------------------------------------------
  total := total + 1;
  select count(*) into n from storage.buckets
    where id = 'signatures' and public = false
      and file_size_limit = 1048576 and allowed_mime_types = array['image/jpeg'];
  if n <> 1 then report := report || E'\n- The signatures bucket is not private, JPEG-only and 1 MB max'; end if;

  if report = '' then
    raise exception 'ALL % CHECKS PASSED. (Shown as an error on purpose: it undoes the fake test data.)', total;
  else
    raise exception 'SOME CHECKS FAILED:%', report;
  end if;
end $$;