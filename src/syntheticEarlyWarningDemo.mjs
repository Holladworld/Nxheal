import { normalizeEnvironmentalObservation } from './environmentalObservation.mjs';
import { evaluatePopulationSignal } from './populationSignals.mjs';
import { normalizeWorkforceIndicator, presentWorkforceIndicator } from './workforceIndicator.mjs';

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
export function buildSyntheticEarlyWarningDemo({ currentObservation = {}, currentWorkforceIndicator = {} } = {}) {
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

  const workforceBase = {
    indicatorId: 'demo-workforce-baseline',
    indicatorType: 'first_aid_visits',
    metricType: 'count',
    value: 4,
    denominator: 40,
    rateScale: null,
    periodStart: '2026-10-28T00:00:00.000Z',
    periodEnd: '2026-11-04T00:00:00.000Z',
    geographyLevel: 'city',
    geographyCode: 'fictional-city-01',
    sourceName: DEMO_SOURCE,
    authorizationStatus: 'authorised',
    qualityStatus: 'valid',
    contributingPeopleCount: 40,
    isSynthetic: true,
    qualityNotes: 'Fictional aggregate only. Not real workplace information.',
  };
  const baselineWorkforceResult = normalizeWorkforceIndicator(workforceBase);
  const currentWorkforceResult = normalizeWorkforceIndicator({
    ...workforceBase,
    indicatorId: 'demo-workforce-current',
    value: 8,
    ...currentWorkforceIndicator,
  });
  const baselineWorkforce = baselineWorkforceResult.ok ? baselineWorkforceResult.indicator : null;
  const currentWorkforce = currentWorkforceResult.ok ? currentWorkforceResult.indicator : null;
  const baselineWorkforcePresentation = presentWorkforceIndicator(baselineWorkforce);
  const currentWorkforcePresentation = presentWorkforceIndicator(currentWorkforce);
  const workforceElevated = Boolean(
    baselineWorkforcePresentation.status === 'available'
    && currentWorkforcePresentation.status === 'available'
    && baselineWorkforcePresentation.metricType === 'count'
    && currentWorkforcePresentation.metricType === 'count'
    && currentWorkforcePresentation.value > baselineWorkforcePresentation.value
  );

  // This demo uses deliberately conservative triangulation: both the heat
  // observation and the authorised aggregate workforce indicator must be elevated.
  const secondarySignal = elevated && workforceElevated ? {
    label: 'Fictional heat and workforce indicators',
    sourceLabel: `${current.sourceName}; ${currentWorkforce.sourceName}`,
    status: 'available',
    direction: 'elevated',
    observed: `Heat ${current.value} ${current.unit}; first-aid visits ${currentWorkforce.value}`,
    baseline: `Heat ${baselineObservation.value} ${baselineObservation.unit}; first-aid visits ${baselineWorkforce.value}`,
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
      workforce: {
        type: 'first_aid_visits',
        current: currentWorkforcePresentation,
        baseline: baselineWorkforcePresentation,
        comparisonAvailable: baselineWorkforcePresentation.status === 'available' && currentWorkforcePresentation.status === 'available',
        direction: workforceElevated ? 'higher_than_demo_baseline' : 'unknown_or_not_higher',
        synthetic: true,
        note: 'Fictional aggregate only; no employee identities or individual records.',
      },
    },
    evaluation,
    coverage: {
      reportCountsAreFictional: true,
      environmentalDataIsSynthetic: true,
      workforceDataIsSynthetic: true,
      workforceSourceAuthorised: currentWorkforce?.authorizationStatus === 'authorised',
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
