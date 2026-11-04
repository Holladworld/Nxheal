import type { StoredEpisode } from './episodeStorage.mjs';

export type LocalMigrationPlan = {
  total: number;
  eligible: StoredEpisode[];
  skipped: (string | null)[];
  eligibleCount: number;
  skippedCount: number;
};

export function buildLocalMigrationPlan(episodes: StoredEpisode[]): LocalMigrationPlan;
