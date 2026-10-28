/**
 * Transparent rule-based population-signal demo logic.
 * This is not a validated epidemiological detector and must only be used with
 * clearly labelled synthetic/demo data until reviewed and validated.
 */
const DEFAULT_MIN_CURRENT_REPORTS = 5;
const DEFAULT_MIN_BASELINE_REPORTS = 5;
const DEFAULT_MINIMUM_MULTIPLIER = 1.5;

export function evaluatePopulationSignal({
  currentReports,
  baselineReports,
  secondarySignal = null,
  minCurrentReports = DEFAULT_MIN_CURRENT_REPORTS,
  minBaselineReports = DEFAULT_MIN_BASELINE_REPORTS,
  minimumMultiplier = DEFAULT_MINIMUM_MULTIPLIER,
}) {
  const currentCount = Array.isArray(currentReports) ? currentReports.length : 0;
  const baselineCount = Array.isArray(baselineReports) ? baselineReports.length : 0;

  if (currentCount < minCurrentReports || baselineCount < minBaselineReports) {
    return {
      status: 'insufficient_data',
      currentCount,
      baselineCount,
      multiplier: null,
      explanation: 'There is not enough reporting in the comparison and baseline periods to assess a pattern reliably.',
      requiresHumanReview: false,
    };
  }

  const multiplier = baselineCount === 0 ? null : currentCount / baselineCount;
  const symptomIncrease = multiplier !== null && multiplier >= minimumMultiplier;
  const hasIndependentElevatedSignal = Boolean(
    secondarySignal
      && secondarySignal.status === 'available'
      && secondarySignal.direction === 'elevated'
      && typeof secondarySignal.label === 'string'
      && secondarySignal.label.trim().length > 0
      && typeof secondarySignal.sourceLabel === 'string'
      && secondarySignal.sourceLabel.trim().length > 0
  );

  if (!symptomIncrease) {
    return {
      status: 'no_pattern_detected',
      currentCount,
      baselineCount,
      multiplier,
      explanation: 'The current report count does not meet this demo rule for an increase over the baseline. This does not prove that the area is risk-free.',
      requiresHumanReview: false,
    };
  }

  if (!hasIndependentElevatedSignal) {
    return {
      status: 'review_not_triggered',
      currentCount,
      baselineCount,
      multiplier,
      explanation: 'Reports increased, but this demo requires a separate relevant signal before flagging a potential pattern for review. Reports alone do not establish an outbreak or cause.',
      requiresHumanReview: false,
    };
  }

  return {
    status: 'potential_signal_for_review',
    currentCount,
    baselineCount,
    multiplier,
    secondarySignal: {
      label: secondarySignal.label,
      sourceLabel: secondarySignal.sourceLabel,
      observed: secondarySignal.observed ?? null,
      baseline: secondarySignal.baseline ?? null,
    },
    explanation: 'Reports increased compared with the demo baseline and a separate signal is marked elevated. This is a potential pattern for authorised human review—not a diagnosis, confirmed outbreak, causal finding, or official alert.',
    requiresHumanReview: true,
  };
}

/**
 * Produces only aggregate counts for a selected unit. It intentionally returns
 * no report IDs, symptom notes, or person-level records.
 */
export function summariseUnitReports(reports, unitId, { startAt, endAt } = {}) {
  const safeReports = Array.isArray(reports) ? reports : [];
  const start = startAt ? Date.parse(startAt) : Number.NEGATIVE_INFINITY;
  const end = endAt ? Date.parse(endAt) : Number.POSITIVE_INFINITY;

  const selected = safeReports.filter((report) => {
    if (!report || report.unitId !== unitId || typeof report.reportedAt !== 'string') return false;
    const timestamp = Date.parse(report.reportedAt);
    return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end;
  });

  return { unitId, reportCount: selected.length };
}

/**
 * Suppresses a small group rather than exposing a granular aggregate.
 */
export function applySmallGroupSuppression(summary, minimumGroupSize = 5) {
  if (!summary || !Number.isInteger(summary.reportCount) || summary.reportCount < 0) {
    return { status: 'unavailable', reportCount: null, message: 'Aggregate data is unavailable.' };
  }
  if (!Number.isInteger(minimumGroupSize) || minimumGroupSize < 1) {
    throw new RangeError('minimumGroupSize must be a positive integer.');
  }
  if (summary.reportCount < minimumGroupSize) {
    return {
      status: 'suppressed',
      reportCount: null,
      message: 'This group is too small to display safely. Try a larger geographic area or time window.',
    };
  }
  return {
    status: 'available',
    reportCount: summary.reportCount,
    message: 'Aggregate count only; it does not reveal individual reports.',
  };
}
