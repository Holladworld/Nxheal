type SyntheticDemoObservation = {
  value: number | null;
  unit: string;
  qualityStatus: 'valid' | 'estimated' | 'delayed' | 'missing' | 'rejected';
  observedAt: string;
  sourceName: string;
  qualityNotes: string;
};

export type SyntheticEarlyWarningDemo = {
  demoOnly: true;
  title: string;
  geography: { level: string; code: string; label: string };
  period: { current: string; baseline: string };
  signals: {
    symptomReports: { currentCount: number; baselineCount: number; synthetic: true };
    environment: {
      type: string;
      current: SyntheticDemoObservation | null;
      baseline: SyntheticDemoObservation | null;
      comparisonAvailable: boolean;
      direction: string;
    };
    workforce: {
      type: string;
      current: { status: string; value: number | null; message: string };
      baseline: { status: string; value: number | null; message: string };
      comparisonAvailable: boolean;
      direction: string;
      synthetic: true;
      note: string;
    };
  };
  evaluation: {
    status: 'insufficient_data' | 'no_pattern_detected' | 'review_not_triggered' | 'potential_signal_for_review';
    currentCount: number;
    baselineCount: number;
    multiplier: number | null;
    explanation: string;
    requiresHumanReview: boolean;
  };
  coverage: {
    reportCountsAreFictional: true;
    environmentalDataIsSynthetic: true;
    workforceDataIsSynthetic: true;
    workforceSourceAuthorised: boolean;
    realWorldCoverage: string;
    missingOrDelayedData: boolean;
  };
  reviewerGuidance: string[];
};

export function buildSyntheticEarlyWarningDemo(input?: {
  currentObservation?: Record<string, unknown>;
  currentWorkforceIndicator?: Record<string, unknown>;
}): SyntheticEarlyWarningDemo;
