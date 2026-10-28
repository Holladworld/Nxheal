import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWorkforceIndicator, presentWorkforceIndicator } from '../src/workforceIndicator.mjs';

const validInput = (overrides = {}) => ({
  indicatorId: 'DEMO-WORK-001',
  indicatorType: 'first_aid_visits',
  metricType: 'count',
  value: 8,
  denominator: 40,
  rateScale: null,
  periodStart: '2026-10-20T00:00:00Z',
  periodEnd: '2026-10-27T00:00:00Z',
  geographyLevel: 'city',
  geographyCode: 'fictional-city-01',
  sourceName: 'DEMO ONLY — fictional workforce aggregate',
  authorizationStatus: 'authorised',
  qualityStatus: 'valid',
  contributingPeopleCount: 40,
  isSynthetic: true,
  qualityNotes: 'Fictional training data; not real workplace information.',
  ...overrides,
});

test('normalizes a source-labelled synthetic aggregate and UTC reporting period', () => {
  const result = normalizeWorkforceIndicator(validInput());
  assert.equal(result.ok, true);
  assert.equal(result.indicator.isSynthetic, true);
  assert.equal(result.indicator.value, 8);
  assert.equal(result.indicator.periodStart, '2026-10-20T00:00:00.000Z');
  assert.equal(result.indicator.geographyCode, 'fictional-city-01');
});

test('rejects person-level identifiers or individual records', () => {
  const result = normalizeWorkforceIndicator(validInput({ employeeId: 'EMP-123' }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /person-level identifiers/i.test(error)));
  assert.equal(normalizeWorkforceIndicator(validInput({ individualRecords: [{ employeeName: 'Example' }] })).ok, false);
});

test('rejects invalid periods, unsupported indicators, negative and fractional counts', () => {
  assert.equal(normalizeWorkforceIndicator(validInput({ periodStart: '2026-10-28', periodEnd: '2026-10-27' })).ok, false);
  assert.equal(normalizeWorkforceIndicator(validInput({ indicatorType: 'employee_diagnosis' })).ok, false);
  assert.equal(normalizeWorkforceIndicator(validInput({ value: -1 })).ok, false);
  assert.equal(normalizeWorkforceIndicator(validInput({ value: 2.5 })).ok, false);
});

test('missing values remain null and cannot be silently changed to zero', () => {
  const result = normalizeWorkforceIndicator(validInput({ value: null, qualityStatus: 'missing', denominator: null }));
  assert.equal(result.ok, true);
  assert.equal(result.indicator.value, null);
  assert.equal(result.indicator.qualityStatus, 'missing');
  assert.equal(presentWorkforceIndicator(result.indicator).status, 'unavailable');
});

test('rate indicators require denominator and explicit scale where ambiguous', () => {
  assert.equal(normalizeWorkforceIndicator(validInput({ metricType: 'rate', denominator: null })).ok, false);
  assert.equal(normalizeWorkforceIndicator(validInput({ metricType: 'rate', value: 12, rateScale: null })).ok, false);
  assert.equal(normalizeWorkforceIndicator(validInput({ metricType: 'rate', value: 12, rateScale: 'per_100', denominator: 40 })).ok, true);
});

test('unauthorised or pending sources are not presented as usable indicators', () => {
  for (const authorizationStatus of ['pending', 'unauthorised']) {
    const result = normalizeWorkforceIndicator(validInput({ authorizationStatus }));
    assert.equal(result.ok, true);
    assert.equal(presentWorkforceIndicator(result.indicator).status, 'not_authorised');
    assert.equal(presentWorkforceIndicator(result.indicator).value, null);
  }
});

test('small groups are suppressed and sufficient groups expose only the aggregate value', () => {
  const small = normalizeWorkforceIndicator(validInput({ contributingPeopleCount: 4 }));
  assert.equal(presentWorkforceIndicator(small.indicator, 5).status, 'suppressed');
  const sufficient = normalizeWorkforceIndicator(validInput({ contributingPeopleCount: 5 }));
  const presented = presentWorkforceIndicator(sufficient.indicator, 5);
  assert.equal(presented.status, 'available');
  assert.equal(presented.value, 8);
  assert.equal('contributingPeopleCount' in presented, false);
});

test('invalid suppression threshold is rejected', () => {
  assert.throws(() => presentWorkforceIndicator(validInput(), 0), RangeError);
});
