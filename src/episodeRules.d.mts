export type EpisodeInputValidation = {
  selectedSymptoms: string[];
  customSymptom: string;
  onsetDate: string;
  today: string;
};

export function validateEpisodeInput(input: EpisodeInputValidation): string | null;
