import test from 'node:test';
import assert from 'node:assert/strict';
import { readEpisodesFromStorage } from '../src/episodeStorage.mjs';
import { removeEpisode, updateEpisodeDetails, updateEpisodeStatus } from '../src/episodeState.mjs';

const STORAGE_KEY = 'nxheal.episodes.v1';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function persist(storage, episodes) {
  storage.setItem(STORAGE_KEY, JSON.stringify(episodes));
}

function makeEpisode(id, symptom) {
  const timestamp = '2026-10-28T10:00:00.000Z';
  return {
    id,
    symptoms: [symptom],
    onsetDate: '2026-10-28',
    severity: 'moderate',
    notes: '',
    suspectedCondition: '',
    reportedCondition: '',
    status: 'ongoing',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

test('save and reload preserves an episode through the storage helper', () => {
  const storage = createMemoryStorage();
  const saved = [makeEpisode('episode-1', 'Headache')];

  persist(storage, saved);
  const reloaded = readEpisodesFromStorage(storage, STORAGE_KEY);

  assert.deepEqual(reloaded, saved);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, 'episode-1');
});

test('status update persists to the same episode without creating a duplicate', () => {
  const storage = createMemoryStorage();
  const original = makeEpisode('episode-1', 'Headache');
  persist(storage, [original]);

  const loaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  const updated = updateEpisodeStatus(loaded, 'episode-1', 'improving', '2026-10-28T11:00:00.000Z');
  persist(storage, updated);

  const reloaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, 'episode-1');
  assert.equal(reloaded[0].status, 'improving');
  assert.equal(reloaded[0].updatedAt, '2026-10-28T11:00:00.000Z');
});

test('deleting one episode preserves other saved episodes after reload', () => {
  const storage = createMemoryStorage();
  persist(storage, [
    makeEpisode('episode-1', 'Headache'),
    makeEpisode('episode-2', 'Cough'),
  ]);

  const loaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  const remaining = removeEpisode(loaded, 'episode-1');
  persist(storage, remaining);

  const reloaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, 'episode-2');
  assert.deepEqual(reloaded[0].symptoms, ['Cough']);
});

test('unknown episode ids do not change persisted episode count', () => {
  const storage = createMemoryStorage();
  persist(storage, [makeEpisode('episode-1', 'Headache')]);

  const loaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  persist(storage, removeEpisode(loaded, 'not-present'));

  assert.equal(readEpisodesFromStorage(storage, STORAGE_KEY).length, 1);
});


test('editing episode details survives reload without creating a duplicate', () => {
  const storage = createMemoryStorage();
  const original = makeEpisode('episode-1', 'Headache');
  original.status = 'improving';
  persist(storage, [original]);

  const loaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  const updated = updateEpisodeDetails(loaded, 'episode-1', {
    symptoms: ['Cough', 'Tiredness'],
    onsetDate: '2026-10-27',
    severity: 'mild',
    notes: 'Updated note',
    suspectedCondition: '',
    reportedCondition: 'A condition reported by the user',
  }, '2026-10-28T11:00:00.000Z');
  persist(storage, updated);

  const reloaded = readEpisodesFromStorage(storage, STORAGE_KEY);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, 'episode-1');
  assert.equal(reloaded[0].status, 'improving');
  assert.equal(reloaded[0].createdAt, original.createdAt);
  assert.equal(reloaded[0].updatedAt, '2026-10-28T11:00:00.000Z');
  assert.deepEqual(reloaded[0].symptoms, ['Cough', 'Tiredness']);
  assert.equal(reloaded[0].notes, 'Updated note');
});
