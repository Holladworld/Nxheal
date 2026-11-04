# NxHeal backend and security architecture

**Status:** Development schema applied; email authentication UI and an isolated cloud episode repository are implemented. Browser configuration, authenticated CRUD, cross-account RLS tests, and full security review remain outstanding. Do not enter real health information.

## Decision

Use Supabase (PostgreSQL + Supabase Auth + Row Level Security) as the proposed first backend for the React/Vite PWA. It provides relational storage and database-enforced row policies without requiring NxHeal to operate a custom application server for basic personal-record CRUD. This is a technical choice for the MVP, not a claim that a production environment is configured.

## Current state

- The personal journal in `src/App.tsx` reads/writes `localStorage` under `nxheal.episodes.v1`.
- Supabase email sign-up/sign-in/session restoration/sign-out UI exists in `src/AuthPanel.tsx`; it is not yet browser-verified.
- `src/lib/episodeCloudRepository.ts` provides account-checked cloud list/create/update/status-update/delete operations. It is not yet wired into the journal UI; the journal continues to use localStorage only.
- The Live Map and reviewer demo are separate, synthetic-only views.
- Population/workforce helpers are isolated and must not read personal journal records.
- The tracked `.env` file was removed from this branch. Because a public repository may retain earlier commit contents, rotate/restrict any credential that was ever placed in it; deleting a file from the latest commit does not erase Git history.

## Initial private personal-record schema

Migration: `supabase/migrations/20261029000100_create_private_health_episodes.sql`.

- Each episode has a required `user_id` foreign key to `auth.users`.
- Row Level Security is enabled and forced.
- Authenticated users can select, insert, update, and delete only rows whose `user_id` equals `auth.uid()`.
- Insert/update policies enforce ownership, not just read policies.
- Anonymous role access is revoked.
- The database constrains status, severity, symptom count and free-text lengths; `updated_at` is maintained by a trigger.
- No policy exposes individual episodes to an employer, reviewer, or population-health dashboard.
- No population reporting, sharing, location tracking, external data ingestion, or analytics is enabled by this migration.

## Security rules for the next implementation stage

1. Use only the Supabase project URL and publishable/anon key in the browser. Never put a service-role key, database password, JWT signing secret, or other privileged credential in Vite variables, browser code, or Git.
2. A publishable/anon key is not a secret; RLS is mandatory. Never treat the key itself as access control.
3. Require verified/authenticated users before enabling remote health-record operations. Configure appropriate email confirmation and password reset behaviour in the Supabase dashboard before pilot use.
4. Keep personal health episodes separate from aggregate monitoring tables. Do not derive population reports from personal episodes unless a separate, explicit, purpose-specific and governed pathway is designed and implemented.
5. Do not trust a client-supplied `user_id`; the database policies must enforce ownership.
6. Validate all input in the UI and at the database boundary. Do not store unnecessary identifiers, exact GPS, or sensitive free text.
7. Define retention, deletion, backup/recovery, audit and incident-response procedures before real use.
8. Test cross-user access denial for every CRUD operation with two separate test accounts. Include anonymous access, forged owner IDs, update ownership changes, and delete isolation.
9. Review the applicable legal basis, consent/purpose requirements, data residency, processor terms, and health-data obligations for the intended deployment jurisdictions before accepting real health data.
10. Keep secrets out of commit history. Use ignored local environment files for local development and hosting-provider environment settings for deployment.

## Frontend integration sequence

1. Create a Supabase project and configure authentication settings.
2. Review and apply the SQL migration in a development project.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to local ignored environment configuration and hosting settings; never add credentials to source files.
4. Add the official Supabase JS client and an isolated typed client module.
5. Build sign-up, sign-in, sign-out, session restoration and error states before switching record persistence.
6. Add a repository/service layer for episode CRUD; keep React components out of direct database details.
7. Add an explicit, tested local-data migration/opt-in flow. Do not silently upload existing browser entries.
8. Test database policies with separate users and test the complete save/edit/status/delete journey.
9. Only then consider a controlled pilot. Do not use real health data until privacy/security review is complete.

## Open decisions before production

- Supabase hosting region and data-residency review.
- Account verification and account recovery requirements.
- Retention and deletion policy, including account deletion.
- Whether personal health data may ever be separately submitted for population monitoring, and the purpose/consent/lawful-authorisation model for that pathway.
- Minimum aggregation and complementary-suppression policy for population/workforce outputs.
- Backup, recovery and incident-response ownership.

## Verification boundary

The migration is source code only. It has not been applied to a database or executed against PostgreSQL here. GitHub Actions currently runs TypeScript/Vite build and Node tests; it does not validate SQL migrations or live RLS behaviour. A successful frontend CI run is not evidence that backend security is verified.


## Development database migration status — 2026-10-29

The user applied `20261029000100_create_private_health_episodes.sql` successfully in the development Supabase SQL Editor. A follow-up metadata query returned:
- `health_episodes` table exists.
- Row Level Security is enabled.
- Row Level Security is forced.
- Four table policies exist for SELECT, INSERT, UPDATE, and DELETE.

This verifies migration execution and policy metadata only. It does **not** yet prove cross-account isolation, anonymous denial, authenticated CRUD behavior, or frontend integration. Do not enter real health information until those tests and the remaining privacy/security review are complete.


## Email authentication implementation — 2026-10-29

- The Supabase Email provider was confirmed enabled by the user in the development project.
- Added `@supabase/supabase-js`, a client configured only from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and an email/password authentication panel for account creation, sign-in, session restoration, and sign-out.
- The panel is integrated into the personal journal shell. Authentication does not currently enable remote episode persistence, and it does not upload or migrate local journal entries.
- The browser client must use only the project's publishable/anon key. Never use a service-role key in the frontend.
- The user must configure the project URL and publishable/anon key in the Codespaces environment before the UI can contact Supabase. Do not ask the user to paste credentials into chat or commit them.
- This code is not yet verified by CI or browser testing. Email confirmation redirect behavior, password recovery, cross-account RLS behavior, and remote health-record CRUD remain unverified.
\n\n## Account-scoped cloud repository — 2026-10-29\n\n- Added `src/lib/episodeCloudRepository.ts` with list, create, edit-details, update-status, and delete operations.\n- Each operation first requires a Supabase-authenticated user. Create derives `user_id` from the verified session user; callers cannot pass an owner ID.\n- Update/delete address a record ID only; PostgreSQL RLS remains the authoritative row-ownership boundary.\n- Database snake_case fields are mapped to the journal's camelCase episode shape.\n- This repository is intentionally not connected to `src/App.tsx` yet. The journal still uses browser localStorage, and no existing record is uploaded.\n- TypeScript/CI validation is required; live authenticated CRUD and cross-account RLS tests remain pending.\n

## Explicit local-to-cloud migration — 2026-10-29

- Added a second migration, `20261029000200_add_local_migration_idempotency.sql`, adding `source_local_id` and a per-user unique index. This is required before the UI import action can run.
- Added a local migration preview that reads only `nxheal.episodes.v1`, validates entries, skips malformed/duplicate local IDs, and shows a sample of eligible records.
- Import requires an explicit confirmation naming the signed-in account and explaining that personal health details will be uploaded. Local copies are retained.
- The cloud repository derives `user_id` from the authenticated session and uses `(user_id, source_local_id)` conflict handling to make retries idempotent. It imports records sequentially and reports added/already-present counts.
- If a network interruption occurs, already completed records remain; retrying should skip those rows and continue. The UI does not delete local records.
- The import UI must not be used until the second SQL migration has been applied successfully. Build/automated tests do not prove the live Supabase operation or RLS isolation.
- No automatic sync is enabled. Existing local records remain local unless the user previews and confirms import.
