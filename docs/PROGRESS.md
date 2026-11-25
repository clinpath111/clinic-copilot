# Progress

## Now
- Done: Steps 5-11; Step 12a, 12b and 12c code is in place, but database and browser checks are pending.
- Next: Apply the migrations and complete Step 12a-12c checks.

## How to run
- `npm run dev`, then open http://localhost:3000
- Health check: http://localhost:3000/api/health
- After ANY database change, run `supabase/tests/isolation_test.sql` in the Supabase SQL Editor. It must say ALL 41 CHECKS PASSED.

## Decisions
- Stack: Next.js + Supabase (Mumbai) + Vercel
- Login: email first (SMS needs DLT registration)
- WhatsApp: one shared Clinic Copilot number for the pilot
- Free at launch: usage meter only, no billing
- The first account of a clinic is its doctor-owner. Receptionists are added by the owner (Step 12c).
- Clinic opening hours move to Step 16 (appointment slots).

## Fakes and open items
- Sign-up is open to anyone with an email. New accounts can create an empty clinic. Restrict to invited clinics before the pilot (Step 34).
- Doctors cannot issue prescriptions until their profile is complete (enforced in Step 20).
- The dev database inventory reports 13 public policies, the `staff_invites` table, five invite/access functions, four doctor-profile columns, and the private signatures bucket. Step 12a-12c browser checks remain pending because this session has no authenticated app login. `supabase/tests/isolation_test.sql` is missing from this checkout, so the ALL 41 CHECKS PASSED result is unverified. `supabase/tests/signature_test.sql` is present but unrun; there is no team-invitation SQL test yet.
