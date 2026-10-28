export function validateEpisodeInput({ selectedSymptoms, customSymptom, onsetDate, today }) {
  if (!Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
    return 'Choose at least one symptom before saving.';
  }
  if (selectedSymptoms.includes('Other') && !String(customSymptom ?? '').trim()) {
    return 'Describe the other symptom before saving.';
  }
  if (!onsetDate || onsetDate > today) {
    return 'Choose a valid start date that is not in the future.';
  }
  return null;
}
