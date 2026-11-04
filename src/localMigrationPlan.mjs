export function buildLocalMigrationPlan(episodes) {
  if (!Array.isArray(episodes)) {
    throw new TypeError('Local episodes must be provided as an array.');
  }

  const seenIds = new Set();
  const eligible = [];
  const skipped = [];

  for (const episode of episodes) {
    if (!episode || typeof episode !== 'object' || Array.isArray(episode)
      || typeof episode.id !== 'string' || !episode.id.trim()
      || seenIds.has(episode.id)
      || !Array.isArray(episode.symptoms) || episode.symptoms.length < 1
      || !episode.symptoms.every((symptom) => typeof symptom === 'string' && symptom.trim())
      || typeof episode.onsetDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(episode.onsetDate)
      || !['mild', 'moderate', 'severe'].includes(episode.severity)
      || !['ongoing', 'improving', 'recovered'].includes(episode.status)) {
      skipped.push(episode?.id ?? null);
      continue;
    }

    seenIds.add(episode.id);
    eligible.push({
      id: episode.id,
      symptoms: episode.symptoms.map((symptom) => symptom.trim()),
      onsetDate: episode.onsetDate,
      severity: episode.severity,
      notes: typeof episode.notes === 'string' ? episode.notes : '',
      suspectedCondition: typeof episode.suspectedCondition === 'string' ? episode.suspectedCondition : '',
      reportedCondition: typeof episode.reportedCondition === 'string' ? episode.reportedCondition : '',
      status: episode.status,
      createdAt: typeof episode.createdAt === 'string' ? episode.createdAt : '',
      updatedAt: typeof episode.updatedAt === 'string' ? episode.updatedAt : '',
    });
  }

  return {
    total: episodes.length,
    eligible,
    skipped,
    eligibleCount: eligible.length,
    skippedCount: skipped.length,
  };
}
