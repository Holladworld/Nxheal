import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEpisodeInput } from '../src/episodeRules.mjs';

const baseInput = {
  selectedSymptoms: ['Headache'],
  customSymptom: '',
  onsetDate: '2026-10-27',
  today: '2026-10-28',
};

test('rejects an episode with no selected symptoms', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, selectedSymptoms: [] }),
    'Choose at least one symptom before saving.',
  );
});

test('requires a description when Other is selected', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, selectedSymptoms: ['Other'], customSymptom: '  ' }),
    'Describe the other symptom before saving.',
  );
});

test('accepts Other when a description is provided', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, selectedSymptoms: ['Other'], customSymptom: 'Rash' }),
    null,
  );
});

test('rejects a missing onset date', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, onsetDate: '' }),
    'Choose a valid start date that is not in the future.',
  );
});

test('rejects a future onset date', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, onsetDate: '2026-10-29' }),
    'Choose a valid start date that is not in the future.',
  );
});

test('accepts today and a past onset date', () => {
  assert.equal(validateEpisodeInput({ ...baseInput, onsetDate: '2026-10-28' }), null);
  assert.equal(validateEpisodeInput({ ...baseInput, onsetDate: '2026-01-01' }), null);
});

test('accepts multiple selected symptoms', () => {
  assert.equal(
    validateEpisodeInput({ ...baseInput, selectedSymptoms: ['Headache', 'Dizziness'] }),
    null,
  );
});
