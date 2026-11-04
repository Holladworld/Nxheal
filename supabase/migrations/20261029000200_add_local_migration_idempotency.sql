-- Add an idempotency key for explicit local-to-cloud imports.
-- Apply after 20261029000100_create_private_health_episodes.sql.

alter table public.health_episodes
  add column if not exists source_local_id text;

create unique index if not exists health_episodes_owner_source_local_id_uidx
  on public.health_episodes (user_id, source_local_id)
  where source_local_id is not null;

comment on column public.health_episodes.source_local_id is
  'Original browser-local episode ID used only to make a user-approved migration retry-safe.';
