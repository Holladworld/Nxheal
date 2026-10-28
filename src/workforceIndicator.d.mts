export type WorkforceIndicatorType =
  | 'sickness_absence'
  | 'first_aid_visits'
  | 'workplace_incidents'
  | 'injury_reports';

export type WorkforceIndicator = {
  indicatorId: string;
  indicatorType: WorkforceIndicatorType;
  metricType: 'count' | 'rate';
  value: number | null;
  denominator: number | null;
  rateScale: 'proportion' | 'per_100' | 'per_1000' | null;
  periodStart: string;
  periodEnd: string;
  geographyLevel: 'community' | 'neighbourhood' | 'village' | 'town' | 'city' | 'state_region' | 'country';
  geographyCode: string;
  sourceName: string;
  authorizationStatus: 'authorised' | 'pending' | 'unauthorised';
  qualityStatus: 'valid' | 'estimated' | 'delayed' | 'missing' | 'rejected';
  contributingPeopleCount: number | null;
  isSynthetic: boolean;
  qualityNotes: string;
};

export type WorkforceIndicatorResult =
  | { ok: true; indicator: WorkforceIndicator }
  | { ok: false; errors: string[] };

export function normalizeWorkforceIndicator(input: Record<string, unknown>): WorkforceIndicatorResult;

export function presentWorkforceIndicator(
  indicator: Partial<WorkforceIndicator> | null,
  minimumGroupSize?: number
): {
  status: 'unavailable' | 'not_authorised' | 'suppressed' | 'available';
  value: number | null;
  metricType?: 'count' | 'rate';
  denominator?: number | null;
  rateScale?: 'proportion' | 'per_100' | 'per_1000' | null;
  message: string;
};
