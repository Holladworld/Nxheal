import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalMigrationPlan } from '../src/localMigrationPlan.mjs';

function episode(id, overrides = {}) {
  return {
    id,
    symptoms: ['Headache'],
    onsetDate: '2026-10-28',
    severity: 'moderate',
    notes: '',
    suspectedCondition: '',
    reportedCondition: '',
    status: 'ongoing',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
    ...overrides,
  };
}

test('migration plan includes valid local records without changing their identity or details', () => {
  const source = episode('local-1', { notes: 'User note', status: 'improving' });
  const plan = buildLocalMigrationPlan([source]);
  assert.equal(plan.total, 1);
  assert.equal(plan.eligibleCount, 1);
  assert.equal(plan.skippedCount, 0);
  assert.equal(plan.eligible[0].id, 'local-1');
  assert.equal(plan.eligible[0].notes, 'User note');
  assert.equal(plan.eligible[0].status, 'improving');
  assert.equal(source.id, 'local-1');
});

test('migration plan excludes malformed records and duplicate local IDs', () => {
  const plan = buildLocalMigrationPlan([
    episode('duplicate'),
    episode('duplicate'),
    episode('bad-date', { onsetDate: 'not-a-date' }),
    episode('bad-status', { status: 'unknown' }),
    episode('blank-symptom', { symptoms: ['  '] }),
  ]);
  assert.equal(plan.eligibleCount, 1);
  assert.equal(plan.skippedCount, 4);
  assert.deepEqual(plan.eligible.map((item) => item.id), ['duplicate']);
});

test('migration plan handles empty local history', () => {
  const plan = buildLocalMigrationPlan([]);
  assert.equal(plan.total, 0);
  assert.deepEqual(plan.eligible, []);
  assert.deepEqual(plan.skipped, []);
});

test('migration plan rejects non-array input', () => {
  assert.throws(() => buildLocalMigrationPlan(null), /array/);
});
