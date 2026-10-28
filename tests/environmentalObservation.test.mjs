import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEnvironmentalObservation } from '../src/environmentalObservation.mjs';

const validObservation = () => ({
  observationId: 'demo-heat-001',
  signalType: 'heat',
  value: 38,
  unit: '°C',
  observedAt: '2026-10-28T09:00:00+01:00',
  retrievedAt: '2026-10-28T09:05:00+01:00',
  sourceName: 'DEMO ONLY — synthetic fixture',
  sourceUrl: 'https://example.org/demo-observation',
  geographyLevel: 'city',
  geographyCode: 'demo-city-01',
  qualityStatus: 'estimated',
  qualityNotes: 'Synthetic example; not a live measurement.',
  isSynthetic: true,
});

test('normalises a valid observation and preserves provenance and synthetic label', () => {
  const result = normalizeEnvironmentalObservation(validObservation());
  assert.equal(result.ok, true);
  assert.equal(result.observation.value, 38);
  assert.equal(result.observation.unit, '°C');
  assert.equal(result.observation.observedAt, '2026-10-28T08:00:00.000Z');
  assert.equal(result.observation.sourceName, 'DEMO ONLY — synthetic fixture');
  assert.equal(result.observation.isSynthetic, true);
});

test('does not turn missing observations into zero', () => {
  const result = normalizeEnvironmentalObservation({
    ...validObservation(),
    value: null,
    unit: '',
    qualityStatus: 'missing',
  });
  assert.equal(result.ok, true);
  assert.equal(result.observation.value, null);
  assert.equal(result.observation.qualityStatus, 'missing');
});

test('rejects missing values marked valid and numeric values marked missing', () => {
  const missingButValid = normalizeEnvironmentalObservation({ ...validObservation(), value: null, qualityStatus: 'valid' });
  const numericButMissing = normalizeEnvironmentalObservation({ ...validObservation(), qualityStatus: 'missing' });
  assert.equal(missingButValid.ok, false);
  assert.equal(numericButMissing.ok, false);
});

test('rejects unsupported signal types, invalid timestamps, insecure URLs, and absent synthetic flag', () => {
  const result = normalizeEnvironmentalObservation({
    ...validObservation(),
    signalType: 'unverified-risk-score',
    observedAt: 'not-a-date',
    sourceUrl: 'http://example.org/feed',
    isSynthetic: undefined,
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length >= 4, true);
});

test('rejects non-finite values and missing units', () => {
  assert.equal(normalizeEnvironmentalObservation({ ...validObservation(), value: Infinity }).ok, false);
  assert.equal(normalizeEnvironmentalObservation({ ...validObservation(), unit: '' }).ok, false);
});

test('rejects non-object input and incomplete provenance', () => {
  assert.equal(normalizeEnvironmentalObservation(null).ok, false);
  const result = normalizeEnvironmentalObservation({ ...validObservation(), sourceName: '', geographyCode: '' });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /sourceName/);
  assert.match(result.errors.join(' '), /geographyCode/);
});
