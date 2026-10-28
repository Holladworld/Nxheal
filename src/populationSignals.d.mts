export type DemoSecondarySignal = {
  label: string;
  sourceLabel: string;
  status: 'available' | 'missing' | 'delayed';
  direction?: 'elevated' | 'stable' | 'lower' | 'unknown';
  observed?: string | number | null;
  baseline?: string | number | null;
};

export type PopulationSignalResult = {
  status: 'insufficient_data' | 'no_pattern_detected' | 'review_not_triggered' | 'potential_signal_for_review';
  currentCount: number;
  baselineCount: number;
  multiplier: number | null;
  explanation: string;
  requiresHumanReview: boolean;
  secondarySignal?: {
    label: string;
    sourceLabel: string;
    observed: string | number | null;
    baseline: string | number | null;
  };
};

export function evaluatePopulationSignal(input: {
  currentReports: unknown[];
  baselineReports: unknown[];
  secondarySignal?: DemoSecondarySignal | null;
  minCurrentReports?: number;
  minBaselineReports?: number;
  minimumMultiplier?: number;
}): PopulationSignalResult;

export function summariseUnitReports(
  reports: unknown[],
  unitId: string,
  range?: { startAt?: string; endAt?: string }
): { unitId: string; reportCount: number };

export function applySmallGroupSuppression(
  summary: { reportCount: number } | null,
  minimumGroupSize?: number
): { status: 'unavailable' | 'suppressed' | 'available'; reportCount: number | null; message: string };
