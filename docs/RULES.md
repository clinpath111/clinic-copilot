# Clinic Copilot: Rules (check every step against this file)

## Clinical safety
1. No AI picks medicines or diagnoses in v1. Medicine data comes only from the doctor's own templates. The system never gives medical advice and never answers a patient's medical question; free-text replies go to the staff inbox.
2. A prescription is a locked snapshot. Editing after it is sent creates a new version. Only the doctor role can issue one. Receptionists can never change medicine lines.
3. Every prescription carries: doctor name, qualifications, registration number, clinic details, date, patient details, medicines (generic names in CAPITAL LETTERS), advice, follow-up date, signature image.
4. Prescriptions reach patients by secure link. WhatsApp text carries only clinic name, doctor name, date and link, never a diagnosis or medicine name. Link tokens are random, stored hashed, expire in 30 days and can be revoked. "Sent to wrong number" revokes the link and is logged.

## Messaging
5. Every message goes through ONE messaging function that checks consent, quiet hours (8 am to 8 pm India time), weekly cap per patient, opt-out and the clinic's kill switch, and never sends the same message twice.
6. Incoming WhatsApp webhooks: verify the signature, answer within 2 seconds, store the raw payload, process later, ignore duplicates.
7. Follow-up logic is plain testable functions (no database or network inside). Every step is saved as an event.

## Privacy and security
8. Every business table has clinic_id and row-level security ON. Two fake clinics must never see each other's data, and tests prove it.
9. No patient data (names, phone numbers, message text, prescription content) in logs, error reports, URLs, analytics or screenshots.
10. No new outside service, SDK or analytics tool touches patient data unless it is written in PROGRESS.md as "needs legal review".
11. Secrets live only in .env.local, never in Git, chat or screenshots. Only NEXT_PUBLIC_ values may reach the browser. The Supabase secret key never gets that prefix.
12. Patient data stays in India regions (Supabase Mumbai, Vercel functions in Mumbai).
13. Fake patients and fake payloads only until the pilot step.
14. Roles are owner, doctor, receptionist. Check the role on every server route, not just on the screen.
14. Staff roles are doctor and receptionist. The owner is a flag on a staff member (a clinic owner is usually also the doctor). Check the role on every server route, not just on the screen.## Honesty about law
15. Never write "compliant", "certified", "DPDP-compliant" or "HIPAA" in code, screens, docs or commits. Consent texts, privacy texts, WhatsApp templates and Hindi strings are DRAFTS. Label them "needs lawyer review", "needs doctor review" or "needs native-speaker review".

## How we work
16. One step at a time. A step is done only when its check passed. If a check was skipped, write that in PROGRESS.md.
17. Every SQL change is saved as a numbered file in supabase/migrations/ (0001_..., 0002_...). Never edit an old one; add a new one.
18. Store times in UTC, show them in India time (Asia/Kolkata).
19. Every screen text exists in English and Hindi.
20. Nothing is faked silently. Fakes are listed in PROGRESS.md.
21. After ANY database change, re-run supabase/tests/isolation_test.sql. It must say ALL ... CHECKS PASSED before we commit.

