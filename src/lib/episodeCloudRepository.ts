import type { SupabaseClient } from '@supabase/supabase-js';

export type EpisodeStatus = 'ongoing' | 'improving' | 'recovered';
export type EpisodeSeverity = 'mild' | 'moderate' | 'severe';

export type HealthEpisode = {
  id: string;
  symptoms: string[];
  onsetDate: string;
  severity: EpisodeSeverity;
  notes: string;
  suspectedCondition: string;
  reportedCondition: string;
  status: EpisodeStatus;
  createdAt: string;
  updatedAt: string;
};

type HealthEpisodeRow = {
  id: string;
  user_id: string;
  symptoms: string[];
  onset_date: string;
  severity: EpisodeSeverity;
  notes: string;
  suspected_condition: string;
  reported_condition: string;
  status: EpisodeStatus;
  created_at: string;
  updated_at: string;
  source_local_id?: string | null;
};

export type NewHealthEpisode = Omit<HealthEpisode, 'id' | 'createdAt' | 'updatedAt'>;
export type HealthEpisodeChanges = Pick<
  HealthEpisode,
  'symptoms' | 'onsetDate' | 'severity' | 'notes' | 'suspectedCondition' | 'reportedCondition'
>;

const TABLE = 'health_episodes';

function toEpisode(row: HealthEpisodeRow): HealthEpisode {
  return {
    id: row.id,
    symptoms: row.symptoms,
    onsetDate: row.onset_date,
    severity: row.severity,
    notes: row.notes,
    suspectedCondition: row.suspected_condition,
    reportedCondition: row.reported_condition,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDatabaseChanges(changes: HealthEpisodeChanges) {
  return {
    symptoms: changes.symptoms,
    onset_date: changes.onsetDate,
    severity: changes.severity,
    notes: changes.notes,
    suspected_condition: changes.suspectedCondition,
    reported_condition: changes.reportedCondition,
  };
}

async function requireAuthenticatedUser(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in before accessing your cloud health journal.');
  return data.user.id;
}

/**
 * Fetches only the signed-in user's records. Database RLS remains the
 * authoritative ownership boundary; the client-side user check is not a
 * substitute for those policies.
 */
export async function listCloudEpisodes(client: SupabaseClient): Promise<HealthEpisode[]> {
  await requireAuthenticatedUser(client);
  const { data, error } = await client
    .from(TABLE)
    .select('id,user_id,symptoms,onset_date,severity,notes,suspected_condition,reported_condition,status,created_at,updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as HealthEpisodeRow[]).map(toEpisode);
}

/** Creates a cloud record using the verified session user's ID, never a caller-supplied owner ID. */
export async function createCloudEpisode(
  client: SupabaseClient,
  episode: NewHealthEpisode,
): Promise<HealthEpisode> {
  const userId = await requireAuthenticatedUser(client);
  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: userId,
      symptoms: episode.symptoms,
      onset_date: episode.onsetDate,
      severity: episode.severity,
      notes: episode.notes,
      suspected_condition: episode.suspectedCondition,
      reported_condition: episode.reportedCondition,
      status: episode.status,
    })
    .select('id,user_id,symptoms,onset_date,severity,notes,suspected_condition,reported_condition,status,created_at,updated_at')
    .single();

  if (error) throw error;
  return toEpisode(data as HealthEpisodeRow);
}

/** Updates editable details only; ownership and updated_at are enforced by RLS and the database trigger. */
export async function updateCloudEpisode(
  client: SupabaseClient,
  episodeId: string,
  changes: HealthEpisodeChanges,
): Promise<HealthEpisode> {
  await requireAuthenticatedUser(client);
  const { data, error } = await client
    .from(TABLE)
    .update(toDatabaseChanges(changes))
    .eq('id', episodeId)
    .select('id,user_id,symptoms,onset_date,severity,notes,suspected_condition,reported_condition,status,created_at,updated_at')
    .single();

  if (error) throw error;
  return toEpisode(data as HealthEpisodeRow);
}

/** Changes episode progress without replacing the record or its creation timestamp. */
export async function updateCloudEpisodeStatus(
  client: SupabaseClient,
  episodeId: string,
  status: EpisodeStatus,
): Promise<HealthEpisode> {
  await requireAuthenticatedUser(client);
  const { data, error } = await client
    .from(TABLE)
    .update({ status })
    .eq('id', episodeId)
    .select('id,user_id,symptoms,onset_date,severity,notes,suspected_condition,reported_condition,status,created_at,updated_at')
    .single();

  if (error) throw error;
  return toEpisode(data as HealthEpisodeRow);
}

/** Deletes only the requested row; RLS must reject rows owned by another user. */
export async function deleteCloudEpisode(
  client: SupabaseClient,
  episodeId: string,
): Promise<void> {
  await requireAuthenticatedUser(client);
  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', episodeId);

  if (error) throw error;
}


export type LocalEpisodeForMigration = HealthEpisode;

/**
 * Imports only records explicitly selected by the user. A per-user unique
 * source_local_id makes retries safe after a network interruption or refresh.
 * The migration SQL adding that column/index must be applied first.
 */
export async function importLocalEpisodes(
  client: SupabaseClient,
  episodes: LocalEpisodeForMigration[],
): Promise<{ imported: number; alreadyPresent: number }> {
  const userId = await requireAuthenticatedUser(client);
  let imported = 0;
  let alreadyPresent = 0;

  for (const episode of episodes) {
    const { data, error } = await client
      .from(TABLE)
      .upsert({
        user_id: userId,
        source_local_id: episode.id,
        symptoms: episode.symptoms,
        onset_date: episode.onsetDate,
        severity: episode.severity,
        notes: episode.notes,
        suspected_condition: episode.suspectedCondition,
        reported_condition: episode.reportedCondition,
        status: episode.status,
      }, {
        onConflict: 'user_id,source_local_id',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) throw error;
    if (data?.length) imported += 1;
    else alreadyPresent += 1;
  }

  return { imported, alreadyPresent };
}
