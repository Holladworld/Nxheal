import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePopulationSignal,
  summariseUnitReports,
  applySmallGroupSuppression,
} from '../src/populationSignals.mjs';

const reports = (count, unitId = 'village-a', start = '2026-10-01T10:00:00Z') =>
  Array.from({ length: count }, (_, index) => ({
    id: `synthetic-${index}`,
    unitId,
    reportedAt: new Date(Date.parse(start) + index * 1000).toISOString(),
    symptoms: ['Headache'],
  }));

test('sparse current or baseline data is marked insufficient, not a warning', () => {
  const result = evaluatePopulationSignal({
    currentReports: reports(3),
    baselineReports: reports(8),
    secondarySignal: { label: 'Synthetic heat observation', sourceLabel: 'Synthetic fixture', status: 'available', direction: 'elevated' },
  });
  assert.equal(result.status, 'insufficient_data');
  assert.equal(result.requiresHumanReview, false);
});

test('symptom report increase alone does not trigger a potential signal', () => {
  const result = evaluatePopulationSignal({
    currentReports: reports(9),
    baselineReports: reports(5),
  });
  assert.equal(result.status, 'review_not_triggered');
  assert.equal(result.requiresHumanReview, false);
  assert.match(result.explanation, /do not establish an outbreak or cause/i);
});

test('an increase plus a labelled independent elevated signal is only flagged for human review', () => {
  const result = evaluatePopulationSignal({
    currentReports: reports(10),
    baselineReports: reports(5),
    secondarySignal: {
      label: 'Synthetic heat observation',
      sourceLabel: 'DEMO ONLY — synthetic fixture',
      status: 'available',
      direction: 'elevated',
      observed: '38°C',
      baseline: '33°C',
    },
  });
  assert.equal(result.status, 'potential_signal_for_review');
  assert.equal(result.requiresHumanReview, true);
  assert.match(result.explanation, /not a diagnosis, confirmed outbreak, causal finding/i);
  assert.equal(result.secondarySignal.sourceLabel, 'DEMO ONLY — synthetic fixture');
});

test('missing or non-elevated second signal does not trigger review', () => {
  for (const secondarySignal of [
    null,
    { label: 'Heat', sourceLabel: 'Demo', status: 'missing', direction: 'elevated' },
    { label: 'Heat', sourceLabel: 'Demo', status: 'available', direction: 'stable' },
    { label: '', sourceLabel: 'Demo', status: 'available', direction: 'elevated' },
  ]) {
    const result = evaluatePopulationSignal({
      currentReports: reports(10),
      baselineReports: reports(5),
      secondarySignal,
    });
    assert.notEqual(result.status, 'potential_signal_for_review');
  }
});

test('report aggregation returns only a count for the selected unit and time window', () => {
  const sample = [
    ...reports(2, 'village-a', '2026-10-01T10:00:00Z'),
    ...reports(3, 'village-b', '2026-10-01T10:00:00Z'),
    ...reports(2, 'village-a', '2026-10-10T10:00:00Z'),
  ];
  const summary = summariseUnitReports(sample, 'village-a', {
    startAt: '2026-10-01T00:00:00Z',
    endAt: '2026-10-02T00:00:00Z',
  });
  assert.deepEqual(summary, { unitId: 'village-a', reportCount: 2 });
  assert.equal('reports' in summary, false);
});

test('small groups are suppressed and sufficient groups show only the aggregate count', () => {
  assert.equal(applySmallGroupSuppression({ reportCount: 4 }, 5).status, 'suppressed');
  assert.equal(applySmallGroupSuppression({ reportCount: 5 }, 5).status, 'available');
  assert.equal(applySmallGroupSuppression({ reportCount: 4 }, 5).reportCount, null);
});

test('invalid suppression threshold is rejected', () => {
  assert.throws(() => applySmallGroupSuppression({ reportCount: 10 }, 0), RangeError);
});
