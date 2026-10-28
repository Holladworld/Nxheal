const VALID_STATUSES = new Set(['ongoing', 'improving', 'recovered']);
const VALID_SEVERITIES = new Set(['mild', 'moderate', 'severe']);

function normalizeEpisode(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (typeof value.id !== 'string' || !value.id.trim()) return null;
  if (!Array.isArray(value.symptoms) || !value.symptoms.every((item) => typeof item === 'string')) return null;

  return {
    ...value,
    id: value.id,
    symptoms: value.symptoms,
    onsetDate: typeof value.onsetDate === 'string' ? value.onsetDate : '',
    severity: VALID_SEVERITIES.has(value.severity) ? value.severity : 'moderate',
    notes: typeof value.notes === 'string' ? value.notes : '',
    suspectedCondition: typeof value.suspectedCondition === 'string' ? value.suspectedCondition : '',
    reportedCondition: typeof value.reportedCondition === 'string' ? value.reportedCondition : '',
    status: VALID_STATUSES.has(value.status) ? value.status : 'ongoing',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

export function readEpisodesFromStorage(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEpisode).filter(Boolean);
  } catch {
    return [];
  }
}
