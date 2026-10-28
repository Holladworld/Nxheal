export type EnvironmentalSignalType = 'heat' | 'humidity' | 'air_quality' | 'official_advisory';
export type EnvironmentalQualityStatus = 'valid' | 'estimated' | 'delayed' | 'missing' | 'rejected';
export type EnvironmentalGeographyLevel = 'community' | 'neighbourhood' | 'village' | 'town' | 'city' | 'state_region' | 'country' | 'continent' | 'global';

export type EnvironmentalObservationInput = {
  observationId: string;
  signalType: EnvironmentalSignalType;
  value: number | null;
  unit?: string;
  observedAt: string;
  retrievedAt: string;
  sourceName: string;
  sourceUrl?: string | null;
  geographyLevel: EnvironmentalGeographyLevel;
  geographyCode: string;
  qualityStatus: EnvironmentalQualityStatus;
  qualityNotes?: string;
  isSynthetic: boolean;
};

export type NormalizedEnvironmentalObservation = {
  observationId: string;
  signalType: EnvironmentalSignalType;
  value: number | null;
  unit: string;
  observedAt: string;
  retrievedAt: string;
  sourceName: string;
  sourceUrl: string | null;
  geographyLevel: EnvironmentalGeographyLevel;
  geographyCode: string;
  qualityStatus: EnvironmentalQualityStatus;
  qualityNotes: string;
  isSynthetic: boolean;
};

export function normalizeEnvironmentalObservation(input: unknown):
  | { ok: true; observation: NormalizedEnvironmentalObservation }
  | { ok: false; errors: string[] };
