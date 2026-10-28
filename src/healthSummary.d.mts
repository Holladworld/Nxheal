type SummaryEpisode = {
  symptoms?: string[];
  onsetDate?: string;
  severity?: string;
  status?: string;
  suspectedCondition?: string;
  reportedCondition?: string;
  notes?: string;
  updatedAt?: string;
};

type HealthSummaryOptions = {
  preparedOn?: string;
  formatOnsetDate?: (value: string) => string;
  formatUpdatedDate?: (value: string) => string;
};

export function buildHealthSummary(
  episodes: SummaryEpisode[],
  options?: HealthSummaryOptions
): string;
