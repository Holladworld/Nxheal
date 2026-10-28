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

export type EpisodeEditableDetails = {
  symptoms: string[];
  onsetDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  suspectedCondition: string;
  reportedCondition: string;
};

export function updateEpisodeDetails<T extends EpisodeLifecycleRecord & { createdAt: string }>(
  episodes: T[], id: string, details: EpisodeEditableDetails, updatedAt: string
): T[];
