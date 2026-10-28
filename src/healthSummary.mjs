export function buildHealthSummary(episodes, options = {}) {
  const {
    preparedOn = 'Date not available',
    formatOnsetDate = (value) => value || 'Date not set',
    formatUpdatedDate = (value) => value || 'Date not available',
  } = options;

  const lines = [
    'NxHeal — Personal Health Summary',
    `Prepared on: ${preparedOn}`,
    '',
    'This summary is based only on information entered by the user. It is not a diagnosis or a verified medical record.',
    `Episodes recorded: ${episodes.length}`,
    '',
  ];

  if (episodes.length === 0) {
    lines.push('No health episodes have been recorded in NxHeal yet.');
  } else {
    episodes.forEach((episode, index) => {
      lines.push(`${index + 1}. Episode — started ${formatOnsetDate(episode.onsetDate)}`);
      lines.push(`   Symptoms recorded: ${Array.isArray(episode.symptoms) ? episode.symptoms.join(', ') : 'Not available'}`);
      lines.push(`   User-reported severity: ${episode.severity || 'Not recorded'}`);
      lines.push(`   Current status: ${episode.status || 'Not recorded'}`);
      if (episode.suspectedCondition) lines.push(`   Suspected condition (user's own suspicion; not a diagnosis): ${episode.suspectedCondition}`);
      if (episode.reportedCondition) lines.push(`   User-reported condition (not independently verified): ${episode.reportedCondition}`);
      if (episode.notes?.trim()) lines.push(`   Additional notes recorded by user: ${episode.notes.trim()}`);
      if (episode.updatedAt) lines.push(`   Last updated: ${formatUpdatedDate(episode.updatedAt)}`);
      lines.push('');
    });
  }

  lines.push('Please review this summary for accuracy before sharing it. NxHeal does not diagnose or replace professional medical care.');
  return lines.join('\n');
}
