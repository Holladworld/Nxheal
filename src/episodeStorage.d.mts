export type StoredEpisode = {
  id: string;
  symptoms: string[];
  onsetDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  suspectedCondition: string;
  reportedCondition: string;
  status: 'ongoing' | 'improving' | 'recovered';
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export function readEpisodesFromStorage(
  storage: Pick<Storage, 'getItem'>,
  key: string
): StoredEpisode[];
