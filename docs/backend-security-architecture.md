# NxHeal backend and security architecture

**Status:** Initial architecture and database migration scaffold. Not yet applied to a Supabase project, connected to the frontend, or security-tested against a live backend. Do not enter real health information.

## Decision

Use Supabase (PostgreSQL + Supabase Auth + Row Level Security) as the proposed first backend for the React/Vite PWA. It provides relational storage and database-enforced row policies without requiring NxHeal to operate a custom application server for basic personal-record CRUD. This is a technical choice for the MVP, not a claim that a production environment is configured.

## Current state

- The personal journal in `src/App.tsx` reads/writes `localStorage` under `nxheal.episodes.v1`.
- There is no authentication, remote persistence, shared database, or server-side authorisation in the current frontend.
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
