# Progress

## Now
- Done: Steps 5-8 (workshop)
- Next: Step 9 (database v1)

## How to run
- npm run dev, then open http://localhost:3000
- Health check: http://localhost:3000/api/health

## Decisions
- Stack: Next.js + Supabase (Mumbai) + Vercel
- Login: email first (SMS needs DLT registration)
- WhatsApp: one shared Clinic Copilot number for the pilot
- Free at launch: usage meter only, no billing

## Fakes and open items
- (none yet)
## Now
- Done: Steps 5-9 (workshop, repo, Supabase dev project, database v1 with RLS on)
- Next: Step 10 (access policies + two-clinic isolation test)
## Now
- Done: Steps 5-11 (workshop, repo, Supabase dev project, database v1, access policies, isolation test, staff login with roles)
- Next: Step 12

## How to run
- npm run dev, then open http://localhost:3000
- Health check: http://localhost:3000/api/health
- After ANY database change, run supabase/tests/isolation_test.sql in the Supabase SQL Editor. It must say ALL 32 CHECKS PASSED.