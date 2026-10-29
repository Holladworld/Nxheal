-- NxHeal private personal health records.
-- Apply through Supabase SQL Editor or the Supabase CLI after reviewing the project.
-- No population-level reporting or sharing is enabled by this migration.

create table if not exists public.health_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symptoms text[] not null,
  onset_date date not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  notes text not null default '',
  suspected_condition text not null default '',
  reported_condition text not null default '',
  status text not null default 'ongoing'
    check (status in ('ongoing', 'improving', 'recovered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_episodes_symptoms_count
    check (cardinality(symptoms) between 1 and 15),
  constraint health_episodes_symptoms_not_blank
    check (array_position(symptoms, '') is null),
  constraint health_episodes_notes_length
    check (char_length(notes) <= 1000),
  constraint health_episodes_suspected_condition_length
    check (char_length(suspected_condition) <= 100),
  constraint health_episodes_reported_condition_length
    check (char_length(reported_condition) <= 100)
);

comment on table public.health_episodes is
  'Private personal health episodes. Never used for population reporting by default.';
comment on column public.health_episodes.user_id is
  'Owner from Supabase Auth; row-level security restricts access to this user.';
comment on column public.health_episodes.suspected_condition is
  'User-entered suspicion; not a verified diagnosis.';
comment on column public.health_episodes.reported_condition is
  'User-reported condition; not independently verified.';

alter table public.health_episodes enable row level security;
alter table public.health_episodes force row level security;

revoke all on table public.health_episodes from anon, authenticated;
grant select, insert, update, delete on table public.health_episodes to authenticated;

drop policy if exists "Users can read their own health episodes" on public.health_episodes;
create policy "Users can read their own health episodes"
  on public.health_episodes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own health episodes" on public.health_episodes;
create policy "Users can create their own health episodes"
  on public.health_episodes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own health episodes" on public.health_episodes;
create policy "Users can update their own health episodes"
  on public.health_episodes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own health episodes" on public.health_episodes;
create policy "Users can delete their own health episodes"
  on public.health_episodes for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_health_episode_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_health_episode_updated_at on public.health_episodes;
create trigger set_health_episode_updated_at
  before update on public.health_episodes
  for each row execute function public.set_health_episode_updated_at();

create index if not exists health_episodes_owner_updated_idx
  on public.health_episodes (user_id, updated_at desc);
