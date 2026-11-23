-- 0001_foundation.sql
-- Clinic Copilot foundation tables. RLS is ON here; the access policies come in 0002.

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  phone text,
  timezone text not null default 'Asia/Kolkata',
  -- Kill switch: messaging stays OFF for a clinic until we switch it on.
  messaging_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete restrict,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('doctor', 'receptionist')),
  is_owner boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index staff_clinic_id_idx on public.staff (clinic_id);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete restrict,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now(),
  unique (clinic_id, phone_e164),
  unique (id, clinic_id)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete restrict,
  contact_id uuid,
  full_name text not null,
  sex text check (sex in ('female', 'male', 'other')),
  birth_year smallint not null check (birth_year between 1900 and 2100),
  language text not null default 'en' check (language in ('en', 'hi')),
  created_by uuid references public.staff (id),
  created_at timestamptz not null default now(),
  -- A patient can only link to a contact of the SAME clinic.
  foreign key (contact_id, clinic_id) references public.contacts (id, clinic_id) on delete restrict
);
create index patients_clinic_contact_idx on public.patients (clinic_id, contact_id);
create index patients_clinic_name_idx on public.patients (clinic_id, lower(full_name));

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete restrict,
  contact_id uuid not null,
  purpose text not null check (purpose in ('whatsapp_messages')),
  status text not null check (status in ('granted', 'withdrawn')),
  method text not null check (method in ('in_clinic_form', 'whatsapp_reply', 'staff_entry')),
  text_version text not null,
  captured_by uuid references public.staff (id),
  created_at timestamptz not null default now(),
  foreign key (contact_id, clinic_id) references public.contacts (id, clinic_id) on delete restrict
);
create index consents_contact_idx on public.consents (clinic_id, contact_id, created_at desc);

alter table public.clinics  enable row level security;
alter table public.staff    enable row level security;
alter table public.contacts enable row level security;
alter table public.patients enable row level security;
alter table public.consents enable row level security;