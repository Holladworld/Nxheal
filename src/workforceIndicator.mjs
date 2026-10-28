const INDICATOR_TYPES = new Set([
  'sickness_absence',
  'first_aid_visits',
  'workplace_incidents',
  'injury_reports',
]);
const QUALITY_STATUSES = new Set(['valid', 'estimated', 'delayed', 'missing', 'rejected']);
const AUTHORIZATION_STATUSES = new Set(['authorised', 'pending', 'unauthorised']);
const GEOGRAPHY_LEVELS = new Set(['community', 'neighbourhood', 'village', 'town', 'city', 'state_region', 'country']);
const PERSON_LEVEL_KEYS = new Set([
  'employeeid', 'employeename', 'personid', 'patientid', 'individualid',
  'reportids', 'individualrecords', 'personrecords', 'sicknotes',
]);

function isTimestamp(value) {
  return typeof value === 'string' && value.trim() !== '' && Number.isFinite(Date.parse(value));
}

function containsPersonLevelKey(value) {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    const likelyPersonLevel = PERSON_LEVEL_KEYS.has(normalizedKey)
      || /^(employee|worker|staff|person|patient|individual)(id|name|email|phone|address|record|details?)$/.test(normalizedKey)
      || /^(name|fullname|firstname|lastname|email|phone|phonenumber|address|homeaddress|medicalcertificate)$/.test(normalizedKey)
      || /^(sicknote|reportids|individualrecords|personrecords)$/.test(normalizedKey);
    if (likelyPersonLevel) return true;
    return child && typeof child === 'object' && containsPersonLevelKey(child);
  });
}

/**
 * Validates a pre-aggregated workforce indicator. This is schema validation,
 * not proof that a source is trustworthy or that the indicator is clinically meaningful.
 */
export function normalizeWorkforceIndicator(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['Workforce indicator must be an object.'] };
  }

  const errors = [];
  if (containsPersonLevelKey(input)) errors.push('Person-level identifiers or records are not accepted; provide aggregate data only.');
  if (typeof input.indicatorId !== 'string' || !input.indicatorId.trim()) errors.push('A non-empty indicatorId is required.');
  if (!INDICATOR_TYPES.has(input.indicatorType)) errors.push('indicatorType is not supported.');
  if (!isTimestamp(input.periodStart) || !isTimestamp(input.periodEnd)) {
    errors.push('periodStart and periodEnd must be valid timestamps.');
  } else if (Date.parse(input.periodStart) >= Date.parse(input.periodEnd)) {
    errors.push('periodStart must be earlier than periodEnd.');
  }
  if (!GEOGRAPHY_LEVELS.has(input.geographyLevel)) errors.push('geographyLevel must be a coarse supported area.');
  if (typeof input.geographyCode !== 'string' || !input.geographyCode.trim()) errors.push('A coarse geographyCode is required.');
  if (typeof input.sourceName !== 'string' || !input.sourceName.trim()) errors.push('sourceName is required.');
  if (typeof input.isSynthetic !== 'boolean') errors.push('isSynthetic must be explicitly true or false.');
  if (!AUTHORIZATION_STATUSES.has(input.authorizationStatus)) errors.push('authorizationStatus is not supported.');
  if (!QUALITY_STATUSES.has(input.qualityStatus)) errors.push('qualityStatus is not supported.');

  const valueMissing = input.value === null || input.value === undefined;
  if (!valueMissing && (typeof input.value !== 'number' || !Number.isFinite(input.value) || input.value < 0)) {
    errors.push('value must be a finite, non-negative number or null.');
  }
  if (valueMissing && input.qualityStatus !== 'missing') errors.push('A missing value must use qualityStatus "missing".');
  if (input.qualityStatus === 'missing' && !valueMissing) errors.push('A missing indicator must not contain a numeric value.');
  if (!valueMissing && input.metricType === 'count' && !Number.isInteger(input.value)) {
    errors.push('Count indicators must use a whole-number value.');
  }
  if (!['count', 'rate'].includes(input.metricType)) errors.push('metricType must be count or rate.');

  const denominatorMissing = input.denominator === null || input.denominator === undefined;
  if (!denominatorMissing && (!Number.isInteger(input.denominator) || input.denominator <= 0)) {
    errors.push('denominator must be a positive integer when supplied.');
  }
  if (input.metricType === 'rate' && denominatorMissing) errors.push('Rate indicators require a positive denominator.');
  if (input.metricType === 'rate' && !valueMissing && !['proportion', 'per_100', 'per_1000'].includes(input.rateScale)) {
    errors.push('Rate indicators require an explicit rateScale: proportion, per_100, or per_1000.');
  }
  if (input.metricType === 'count' && input.rateScale != null) {
    errors.push('Count indicators must not specify rateScale.');
  }
  if (input.rateScale != null && !['proportion', 'per_100', 'per_1000'].includes(input.rateScale)) {
    errors.push('rateScale is not supported.');
  }
  if (input.metricType === 'rate' && input.rateScale === 'proportion' && !valueMissing && input.value > 1) {
    errors.push('A proportion rate must be between 0 and 1.');
  }

  const groupSizeMissing = input.contributingPeopleCount === null || input.contributingPeopleCount === undefined;
  if (!groupSizeMissing && (!Number.isInteger(input.contributingPeopleCount) || input.contributingPeopleCount < 0)) {
    errors.push('contributingPeopleCount must be a non-negative integer when supplied.');
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    indicator: {
      indicatorId: input.indicatorId.trim(),
      indicatorType: input.indicatorType,
      metricType: input.metricType,
      value: valueMissing ? null : input.value,
      denominator: denominatorMissing ? null : input.denominator,
      rateScale: input.rateScale ?? null,
      periodStart: new Date(input.periodStart).toISOString(),
      periodEnd: new Date(input.periodEnd).toISOString(),
      geographyLevel: input.geographyLevel,
      geographyCode: input.geographyCode.trim(),
      sourceName: input.sourceName.trim(),
      authorizationStatus: input.authorizationStatus,
      qualityStatus: input.qualityStatus,
      contributingPeopleCount: groupSizeMissing ? null : input.contributingPeopleCount,
      isSynthetic: input.isSynthetic,
      qualityNotes: typeof input.qualityNotes === 'string' ? input.qualityNotes.trim() : '',
    },
  };
}

/**
 * Produces a safe reviewer-facing representation. Pending/unauthorised sources,
 * missing or stale data, and small groups are never displayed as usable counts.
 */
export function presentWorkforceIndicator(indicator, minimumGroupSize = 5) {
  if (!Number.isInteger(minimumGroupSize) || minimumGroupSize < 1) {
    throw new RangeError('minimumGroupSize must be a positive integer.');
  }
  if (!indicator || typeof indicator !== 'object') {
    return { status: 'unavailable', value: null, message: 'Workforce indicator is unavailable.' };
  }
  if (indicator.authorizationStatus !== 'authorised') {
    return { status: 'not_authorised', value: null, message: 'This source is not authorised for reporting.' };
  }
  if (indicator.qualityStatus !== 'valid' && indicator.qualityStatus !== 'estimated') {
    return { status: 'unavailable', value: null, message: 'The indicator is missing, delayed, or rejected and cannot support review.' };
  }
  if (!Number.isInteger(indicator.contributingPeopleCount)) {
    return { status: 'unavailable', value: null, message: 'The contributing group size is unknown, so this indicator cannot be safely displayed.' };
  }
  if (indicator.contributingPeopleCount < minimumGroupSize) {
    return { status: 'suppressed', value: null, message: 'This group is too small to display safely. Use a broader area or reporting period.' };
  }
  if (indicator.value === null || indicator.value === undefined) {
    return { status: 'unavailable', value: null, message: 'The aggregate value is unavailable.' };
  }
  return {
    status: 'available',
    value: indicator.value,
    metricType: indicator.metricType,
    denominator: indicator.denominator ?? null,
    rateScale: indicator.rateScale ?? null,
    message: 'Authorised aggregate indicator only; this is not an individual employee record.',
  };
}
