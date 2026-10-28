import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSyntheticEarlyWarningDemo } from '../src/syntheticEarlyWarningDemo.mjs';

test('synthetic heat plus increased reports is flagged only for human review', () => {
  const demo = buildSyntheticEarlyWarningDemo();
  assert.equal(demo.demoOnly, true);
  assert.equal(demo.signals.symptomReports.currentCount, 10);
  assert.equal(demo.signals.symptomReports.baselineCount, 5);
  assert.equal(demo.signals.environment.current.isSynthetic, true);
  assert.equal(demo.evaluation.status, 'potential_signal_for_review');
  assert.equal(demo.evaluation.requiresHumanReview, true);
  assert.match(demo.evaluation.explanation, /not a diagnosis, confirmed outbreak, causal finding/i);
  assert.ok(demo.reviewerGuidance.some((item) => /not proof of causation/i.test(item)));
});

test('missing environmental observation does not trigger a potential signal', () => {
  const demo = buildSyntheticEarlyWarningDemo({
    currentObservation: {
      value: null,
      unit: '',
      qualityStatus: 'missing',
      qualityNotes: 'Fictional source outage.',
    },
  });
  assert.equal(demo.signals.environment.current.value, null);
  assert.equal(demo.signals.environment.comparisonAvailable, false);
  assert.equal(demo.evaluation.status, 'review_not_triggered');
  assert.equal(demo.evaluation.requiresHumanReview, false);
});

test('delayed environmental observation is not treated as current corroboration', () => {
  const demo = buildSyntheticEarlyWarningDemo({
    currentObservation: {
      qualityStatus: 'delayed',
      qualityNotes: 'Fictional observation arrived late.',
    },
  });
  assert.equal(demo.signals.environment.comparisonAvailable, false);
  assert.equal(demo.signals.environment.direction, 'unknown');
  assert.equal(demo.evaluation.status, 'review_not_triggered');
  assert.equal(demo.coverage.missingOrDelayedData, true);
});

test('invalid environmental observation cannot support the demo signal', () => {
  const demo = buildSyntheticEarlyWarningDemo({
    currentObservation: { observedAt: 'not-a-date' },
  });
  assert.equal(demo.signals.environment.current, null);
  assert.equal(demo.signals.environment.comparisonAvailable, false);
  assert.equal(demo.evaluation.status, 'review_not_triggered');
});
