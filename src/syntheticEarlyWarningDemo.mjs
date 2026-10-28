import { normalizeEnvironmentalObservation } from './environmentalObservation.mjs';
import { evaluatePopulationSignal } from './populationSignals.mjs';

const DEMO_SOURCE = 'DEMO ONLY — fictional scenario, not a live measurement';
const DEMO_TIME = '2026-10-28T09:00:00.000Z';

function observation(overrides) {
  return normalizeEnvironmentalObservation({
    observationId: 'demo-heat-current',
    signalType: 'heat',
    value: 38,
    unit: '°C',
    observedAt: DEMO_TIME,
    retrievedAt: '2026-10-28T09:05:00.000Z',
    sourceName: DEMO_SOURCE,
    sourceUrl: null,
    geographyLevel: 'city',
    geographyCode: 'fictional-city-01',
    qualityStatus: 'estimated',
    qualityNotes: 'Fictional training fixture. Not an observed real-world condition.',
    isSynthetic: true,
    ...overrides,
  });
}

function makeReports(count, period) {
  return Array.from({ length: count }, (_, index) => ({
    id: `DEMO-${period}-${index + 1}`,
    unitId: 'fictional-city-01',
    reportedAt: DEMO_TIME,
    symptoms: index % 2 === 0 ? ['Dizziness'] : ['Headache'],
    isSynthetic: true,
  }));
}

/**
 * Builds a self-contained fictional scenario for reviewer/demo use.
 * It never reads personal journal entries or external services.
 */
export function buildSyntheticEarlyWarningDemo({ currentObservation = {} } = {}) {
  const baselineObservationResult = observation({
    observationId: 'demo-heat-baseline',
    value: 33,
    observedAt: '2026-10-21T09:00:00.000Z',
    retrievedAt: '2026-10-21T09:05:00.000Z',
    qualityNotes: 'Fictional baseline fixture. Not an observed real-world condition.',
  });
  const currentObservationResult = observation({
    ...currentObservation,
    observationId: 'demo-heat-current',
  });

  const baselineObservation = baselineObservationResult.ok
    ? baselineObservationResult.observation
    : null;
  const current = currentObservationResult.ok ? currentObservationResult.observation : null;

  const hasComparableHeat = Boolean(
    baselineObservation
    && current
    && typeof baselineObservation.value === 'number'
    && typeof current.value === 'number'
    && ['valid', 'estimated'].includes(baselineObservation.qualityStatus)
    && ['valid', 'estimated'].includes(current.qualityStatus)
    && baselineObservation.unit === current.unit
  );
  const elevated = hasComparableHeat && current.value > baselineObservation.value;
  const secondarySignal = elevated ? {
    label: 'Fictional heat observation',
    sourceLabel: current.sourceName,
    status: 'available',
    direction: 'elevated',
    observed: `${current.value} ${current.unit}`,
    baseline: `${baselineObservation.value} ${baselineObservation.unit}`,
  } : null;

  const evaluation = evaluatePopulationSignal({
    currentReports: makeReports(10, 'current'),
    baselineReports: makeReports(5, 'baseline'),
    secondarySignal,
  });

  return {
    demoOnly: true,
    title: 'Synthetic heat and symptom-report scenario',
    geography: { level: 'city', code: 'fictional-city-01', label: 'Fictional city — not a real location' },
    period: {
      current: 'Fictional current period',
      baseline: 'Fictional comparison period',
    },
    signals: {
      symptomReports: { currentCount: 10, baselineCount: 5, synthetic: true },
      environment: {
        type: 'heat',
        current: current,
        baseline: baselineObservation,
        comparisonAvailable: hasComparableHeat,
        direction: hasComparableHeat ? (elevated ? 'higher_than_demo_baseline' : 'not_higher_than_demo_baseline') : 'unknown',
      },
    },
    evaluation,
    coverage: {
      reportCountsAreFictional: true,
      environmentalDataIsSynthetic: true,
      realWorldCoverage: 'Not applicable; this scenario uses fictional fixtures only.',
      missingOrDelayedData: current && ['missing', 'delayed', 'rejected'].includes(current.qualityStatus),
    },
    reviewerGuidance: [
      'Check source quality, timestamps, geographic coverage, and reporting changes before interpreting any pattern.',
      'Seek independent corroboration and authorised human review before taking action.',
      'Do not infer that heat caused symptoms; temporal co-occurrence is not proof of causation.',
      'This demo cannot diagnose, confirm an outbreak, estimate individual risk, or issue an official alert.',
    ],
  };
}
