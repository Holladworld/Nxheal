export type EpisodeLifecycleStatus = 'ongoing' | 'improving' | 'recovered';

export type EpisodeLifecycleRecord = {
  id: string;
  status: EpisodeLifecycleStatus;
  updatedAt: string;
};

export function updateEpisodeStatus<T extends EpisodeLifecycleRecord>(
  episodes: T[],
  id: string,
  status: EpisodeLifecycleStatus,
  updatedAt: string
): T[];

export function removeEpisode<T extends { id: string }>(episodes: T[], id: string): T[];
