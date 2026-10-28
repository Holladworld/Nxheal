import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHealthSummary } from '../src/healthSummary.mjs';

const formatDate = (value) => value ? `formatted:${value}` : 'Date not set';

test('summarises an empty history without implying a diagnosis', () => {
  const summary = buildHealthSummary([], { preparedOn: '28 Oct 2026' });
  assert.match(summary, /Episodes recorded: 0/);
  assert.match(summary, /No health episodes have been recorded/);
  assert.match(summary, /not a diagnosis or a verified medical record/);
});

test('keeps suspected and user-reported conditions clearly separate', () => {
  const summary = buildHealthSummary([{
    id: 'one',
    onsetDate: '2026-10-20',
    symptoms: ['Headache', 'Dizziness'],
    severity: 'moderate',
    status: 'improving',
    suspectedCondition: 'Could be malaria',
    reportedCondition: 'Hypertension',
    notes: 'User note',
    updatedAt: '2026-10-21T10:00:00.000Z',
  }], {
    preparedOn: '28 Oct 2026',
    formatOnsetDate: formatDate,
    formatUpdatedDate: formatDate,
  });

  assert.match(summary, /Symptoms recorded: Headache, Dizziness/);
  assert.match(summary, /Suspected condition .* not a diagnosis\): Could be malaria/);
  assert.match(summary, /User-reported condition \(not independently verified\): Hypertension/);
  assert.match(summary, /User-reported severity: moderate/);
  assert.match(summary, /Current status: improving/);
  assert.match(summary, /Additional notes recorded by user: User note/);
  assert.match(summary, /Last updated: formatted:2026-10-21T10:00:00.000Z/);
});

test('preserves special characters and multiple episodes in the editable summary text', () => {
  const summary = buildHealthSummary([
    { onsetDate: '2026-10-22', symptoms: ['Other: pain & nausea'], severity: 'mild', status: 'ongoing', notes: 'Pain <after> lunch & tea' },
    { onsetDate: '2026-10-23', symptoms: ['Cough'], severity: 'severe', status: 'recovered' },
  ], { formatOnsetDate: formatDate });

  assert.match(summary, /Episodes recorded: 2/);
  assert.match(summary, /Other: pain & nausea/);
  assert.match(summary, /Pain <after> lunch & tea/);
  assert.match(summary, /2\. Episode — started formatted:2026-10-23/);
  assert.match(summary, /Current status: recovered/);
});

test('handles incomplete legacy fields without throwing', () => {
  const summary = buildHealthSummary([{}]);
  assert.match(summary, /Symptoms recorded: Not available/);
  assert.match(summary, /User-reported severity: Not recorded/);
  assert.match(summary, /Current status: Not recorded/);
});
