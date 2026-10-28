import test from 'node:test';
import assert from 'node:assert/strict';
import { removeEpisode, updateEpisodeDetails, updateEpisodeStatus } from '../src/episodeState.mjs';

const episodes = [
  { id: 'a', status: 'ongoing', updatedAt: 'old', notes: 'keep me' },
  { id: 'b', status: 'improving', updatedAt: 'old', notes: 'leave untouched' },
];

test('status update changes only the matching episode and preserves its other fields', () => {
  const result = updateEpisodeStatus(episodes, 'a', 'recovered', 'new-time');
  assert.deepEqual(result[0], {
    id: 'a', status: 'recovered', updatedAt: 'new-time', notes: 'keep me',
  });
  assert.deepEqual(result[1], episodes[1]);
  assert.notEqual(result, episodes);
  assert.equal(episodes[0].status, 'ongoing', 'input list is not mutated');
});

test('status update for an unknown id leaves all episodes unchanged', () => {
  assert.deepEqual(updateEpisodeStatus(episodes, 'missing', 'recovered', 'new-time'), episodes);
});

test('deletion removes only the selected episode', () => {
  assert.deepEqual(removeEpisode(episodes, 'a'), [episodes[1]]);
});

test('deleting an unknown id leaves the list unchanged', () => {
  assert.deepEqual(removeEpisode(episodes, 'missing'), episodes);
});

test('deleting from an empty list returns an empty list', () => {
  assert.deepEqual(removeEpisode([], 'a'), []);
});

test('editing episode details updates the same record and preserves its identity, status, and creation time', () => {
  const original = [{ id: 'a', status: 'improving', createdAt: 'created', updatedAt: 'old', symptoms: ['Fever'], onsetDate: '2026-10-01', severity: 'mild', notes: '', suspectedCondition: '', reportedCondition: '' }];
  const details = { symptoms: ['Cough'], onsetDate: '2026-10-02', severity: 'moderate', notes: 'Updated note', suspectedCondition: '', reportedCondition: '' };
  const result = updateEpisodeDetails(original, 'a', details, 'new-time');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { ...original[0], ...details, id: 'a', status: 'improving', createdAt: 'created', updatedAt: 'new-time' });
  assert.equal(original[0].symptoms[0], 'Fever', 'input record is not mutated');
});

test('editing an unknown episode id leaves records unchanged', () => {
  assert.deepEqual(updateEpisodeDetails(episodes, 'missing', { symptoms: ['Cough'] }, 'new-time'), episodes);
});
