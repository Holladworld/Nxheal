import test from 'node:test';
import assert from 'node:assert/strict';
import { readEpisodesFromStorage } from '../src/episodeStorage.mjs';

function fakeStorage(value, shouldThrow = false) {
  return {
    getItem() {
      if (shouldThrow) throw new Error('Storage unavailable');
      return value;
    },
  };
}

test('returns an empty list when storage is empty', () => {
  assert.deepEqual(readEpisodesFromStorage(fakeStorage(null), 'episodes'), []);
});

test('returns an empty list for malformed JSON or a non-array value', () => {
  assert.deepEqual(readEpisodesFromStorage(fakeStorage('{broken'), 'episodes'), []);
  assert.deepEqual(readEpisodesFromStorage(fakeStorage(JSON.stringify({ id: 'one' })), 'episodes'), []);
});

test('handles storage access exceptions without crashing', () => {
  assert.deepEqual(readEpisodesFromStorage(fakeStorage(null, true), 'episodes'), []);
});

test('keeps valid episodes and skips malformed list entries', () => {
  const valid = {
    id: 'episode-1',
    symptoms: ['Headache'],
    onsetDate: '2026-10-27',
    severity: 'mild',
    notes: 'Keep this',
    suspectedCondition: '',
    reportedCondition: '',
    status: 'improving',
    createdAt: '2026-10-27T09:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };
  const stored = [valid, null, { id: 'missing-symptoms' }, 'not-an-episode'];
  assert.deepEqual(readEpisodesFromStorage(fakeStorage(JSON.stringify(stored)), 'episodes'), [valid]);
});

test('fills missing optional fields on older records without discarding the episode', () => {
  const oldRecord = { id: 'legacy-1', symptoms: ['Cough'] };
  const [result] = readEpisodesFromStorage(fakeStorage(JSON.stringify([oldRecord])), 'episodes');
  assert.equal(result.id, 'legacy-1');
  assert.deepEqual(result.symptoms, ['Cough']);
  assert.equal(result.status, 'ongoing');
  assert.equal(result.severity, 'moderate');
  assert.equal(result.notes, '');
  assert.equal(result.reportedCondition, '');
});
