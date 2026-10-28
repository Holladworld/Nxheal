const SIGNAL_TYPES = new Set(['heat', 'humidity', 'air_quality', 'official_advisory']);
const QUALITY_STATUSES = new Set(['valid', 'estimated', 'delayed', 'missing', 'rejected']);
const GEOGRAPHY_LEVELS = new Set(['community', 'neighbourhood', 'village', 'town', 'city', 'state_region', 'country', 'continent', 'global']);

function isValidTimestamp(value) {
  return typeof value === 'string' && value.trim() !== '' && Number.isFinite(Date.parse(value));
}

/**
 * Normalises one source observation without inventing missing values.
 * Returns { ok: true, observation } or { ok: false, errors }.
 * This is a schema/quality helper only; it does not fetch or verify a source.
 */
export function normalizeEnvironmentalObservation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['Observation must be an object.'] };
  }

  const errors = [];
  if (typeof input.observationId !== 'string' || !input.observationId.trim()) errors.push('A non-empty observationId is required.');
  if (!SIGNAL_TYPES.has(input.signalType)) errors.push('signalType is not supported.');
  if (!isValidTimestamp(input.observedAt)) errors.push('observedAt must be a valid timestamp.');
  if (!isValidTimestamp(input.retrievedAt)) errors.push('retrievedAt must be a valid timestamp.');
  if (typeof input.sourceName !== 'string' || !input.sourceName.trim()) errors.push('sourceName is required.');
  if (typeof input.isSynthetic !== 'boolean') errors.push('isSynthetic must be explicitly true or false.');

  const qualityStatus = input.qualityStatus;
  if (!QUALITY_STATUSES.has(qualityStatus)) errors.push('qualityStatus is not supported.');

  const valueMissing = input.value === null || input.value === undefined;
  if (!valueMissing && (typeof input.value !== 'number' || !Number.isFinite(input.value))) {
    errors.push('value must be a finite number or null.');
  }
  if (valueMissing && qualityStatus !== 'missing') errors.push('A missing value must use qualityStatus "missing".');
  if (qualityStatus === 'missing' && !valueMissing) errors.push('A missing observation must not contain a numeric value.');
  if (!valueMissing && (typeof input.unit !== 'string' || !input.unit.trim())) errors.push('A numeric value requires an explicit unit.');

  if (!GEOGRAPHY_LEVELS.has(input.geographyLevel)) errors.push('geographyLevel is not supported.');
  if (typeof input.geographyCode !== 'string' || !input.geographyCode.trim()) errors.push('A coarse geographyCode is required.');

  if (input.sourceUrl != null) {
    try {
      const parsedUrl = new URL(input.sourceUrl);
      if (parsedUrl.protocol !== 'https:') errors.push('sourceUrl must use HTTPS.');
    } catch {
      errors.push('sourceUrl must be a valid HTTPS URL.');
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    observation: {
      observationId: input.observationId.trim(),
      signalType: input.signalType,
      value: valueMissing ? null : input.value,
      unit: typeof input.unit === 'string' ? input.unit.trim() : '',
      observedAt: new Date(input.observedAt).toISOString(),
      retrievedAt: new Date(input.retrievedAt).toISOString(),
      sourceName: input.sourceName.trim(),
      sourceUrl: input.sourceUrl?.trim() || null,
      geographyLevel: input.geographyLevel,
      geographyCode: input.geographyCode.trim(),
      qualityStatus,
      qualityNotes: typeof input.qualityNotes === 'string' ? input.qualityNotes.trim() : '',
      isSynthetic: input.isSynthetic,
    },
  };
}
