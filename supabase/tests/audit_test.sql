-- supabase/tests/audit_test.sql
-- Proves the audit log records key actions, hides patient details, and cannot be edited.
-- Everything is undone on purpose. "ALL ... CHECKS PASSED" is SUCCESS (shown as a red error).

do $$
declare
  owner_a    uuid := gen_random_uuid();
  owner_b    uuid := gen_random_uuid();
  rcpt       uuid := gen_random_uuid();
  clinic_a   uuid;
  clinic_b   uuid;
  rcpt_staff uuid;
  patient_a  uuid;
  contact_a  uuid;
  n          int;
  total      int  := 0;
  report     text := '';
begin
  insert into auth.users (id, aud, role, email, email_confirmed_at) values
    (owner_a, 'authenticated', 'authenticated', 'fake-owner-a@example.test', now()),
    (owner_b, 'authenticated', 'authenticated', 'fake-owner-b@example.test', now()),
    (rcpt,    'authenticated', 'authenticated', 'fake-rcpt@example.test', now());

  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  clinic_a := public.create_my_clinic('Fake Clinic A', 'Fake Owner A');
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  clinic_b := public.create_my_clinic('Fake Clinic B', 'Fake Owner B');
  reset role;

  -- A receptionist added by the system (database owner)
  perform set_config('request.jwt.claims', '{}', true);
  insert into public.staff (clinic_id, user_id, full_name, role)
    values (clinic_a, rcpt, 'Fake Receptionist', 'receptionist');
  select id into rcpt_staff from public.staff where user_id = rcpt;

  -- Creating a clinic and adding staff are recorded
  total := total + 1;
  select count(*) into n from public.audit_log where clinic_id = clinic_a and action = 'clinic.created';
  if n <> 1 then report := report || E'\n- Creating a clinic wrote ' || n::text || ' "clinic.created" rows (expected 1)'; end if;
  select count(*) into n from public.audit_log where clinic_id = clinic_a and action = 'staff.added';
  if n <> 2 then report := report || E'\n- Adding staff wrote ' || n::text || ' "staff.added" rows (expected 2)'; end if;

  ------------------------------------------------------------------
  -- Owner A does things, then reads the log
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  update public.staff set qualifications = 'MBBS QUALTEXT', registration_number = 'REGTEXT-999'
    where user_id = owner_a;

  insert into public.patients (clinic_id, full_name, birth_year)
    values (clinic_a, 'Fake Patient Zed', 1990) returning id into patient_a;

  insert into public.contacts (clinic_id, phone_e164)
    values (clinic_a, '+910000000011') returning id into contact_a;

  insert into public.consents (clinic_id, contact_id, purpose, status, method, text_version)
    values (clinic_a, contact_a, 'whatsapp_messages', 'granted', 'staff_entry', 'test');

  perform public.invite_staff('fake-new@example.test', 'Fake New', 'receptionist');

  total := total + 1;
  select count(*) into n from public.audit_log
    where clinic_id = clinic_a and action = 'staff.profile_updated'
      and (details -> 'fields') @> '"qualifications"'::jsonb
      and details::text not like '%QUALTEXT%' and details::text not like '%REGTEXT%';
  if n <> 1 then report := report || E'\n- A profile change was not logged, or its values leaked into the log'; end if;

  total := total + 1;
  select count(*) into n from public.audit_log
    where target_id = patient_a and action = 'patient.created' and details::text not like '%Zed%';
  if n <> 1 then report := report || E'\n- Adding a patient was not logged, or the name leaked into the log'; end if;

  total := total + 1;
  select count(*) into n from public.audit_log
    where clinic_id = clinic_a and action = 'consent.recorded'
      and details ->> 'purpose' = 'whatsapp_messages' and details::text not like '%+91%';
  if n <> 1 then report := report || E'\n- A consent was not logged, or a phone number leaked into the log'; end if;

  total := total + 1;
  select count(*) into n from public.audit_log
    where clinic_id = clinic_a and action = 'staff.invited' and actor_user_id = owner_a
      and details ->> 'role' = 'receptionist' and details::text not like '%@%';
  if n <> 1 then report := report || E'\n- An invitation was not logged with its actor, or an email leaked into the log'; end if;

  total := total + 1;
  select count(*) into n from public.audit_log where clinic_id = clinic_b;
  if n <> 0 then report := report || E'\n- Owner A sees ' || n::text || ' audit rows of clinic B'; end if;
  select count(*) into n from public.audit_log;
  if n = 0 then report := report || E'\n- Owner A sees no audit rows at all'; end if;

  total := total + 1;
  begin
    insert into public.audit_log (clinic_id, action) values (clinic_a, 'fake.event');
    report := report || E'\n- The app could write to the audit log directly';
  exception when insufficient_privilege then null;
  end;

  reset role;

  ------------------------------------------------------------------
  -- Receptionist: no access to the log
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', rcpt, 'role', 'authenticated')::text, true);
  set local role authenticated;

  total := total + 1;
  select count(*) into n from public.audit_log;
  if n <> 0 then report := report || E'\n- A receptionist sees ' || n::text || ' audit rows'; end if;

  reset role;

  ------------------------------------------------------------------
  -- Owner A turns off the receptionist
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  perform public.set_staff_active(rcpt_staff, false);

  total := total + 1;
  select count(*) into n from public.audit_log
    where clinic_id = clinic_a and action = 'staff.access_changed'
      and target_id = rcpt_staff and details ->> 'active' = 'false';
  if n <> 1 then report := report || E'\n- Turning off access was not logged'; end if;

  reset role;

  ------------------------------------------------------------------
  -- A system change (no signed-in user) and history that cannot be edited
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', '{}', true);

  update public.clinics set messaging_enabled = true where id = clinic_a;

  total := total + 1;
  select count(*) into n from public.audit_log
    where clinic_id = clinic_a and action = 'clinic.updated'
      and details ->> 'messaging_enabled' = 'true' and actor_user_id is null;
  if n <> 1 then report := report || E'\n- A messaging kill-switch change was not logged as a system change'; end if;

  total := total + 1;
  begin
    update public.audit_log set action = 'tampered' where clinic_id = clinic_a;
    report := report || E'\n- An audit row could be changed';
  exception when raise_exception then
    if sqlerrm <> 'audit_log_is_append_only' then
      report := report || E'\n- Wrong error when changing an audit row: ' || sqlerrm;
    end if;
  end;
  begin
    delete from public.audit_log where clinic_id = clinic_a;
    report := report || E'\n- An audit row could be deleted';
  exception when raise_exception then
    if sqlerrm <> 'audit_log_is_append_only' then
      report := report || E'\n- Wrong error when deleting an audit row: ' || sqlerrm;
    end if;
  end;

  ------------------------------------------------------------------
  -- Not logged in
  ------------------------------------------------------------------
  set local role anon;

  total := total + 1;
  begin
    select count(*) into n from public.audit_log;
    report := report || E'\n- A visitor who is not logged in could read the audit log';
  exception when insufficient_privilege then null;
  end;

  reset role;

  if report = '' then
    raise exception 'ALL % CHECKS PASSED. (Shown as an error on purpose: it undoes the fake test data.)', total;
  else
    raise exception 'SOME CHECKS FAILED:%', report;
  end if;
end $$;
