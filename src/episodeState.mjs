export function updateEpisodeStatus(episodes, id, status, updatedAt) {
  return episodes.map((episode) => episode.id === id
    ? { ...episode, status, updatedAt }
    : episode);
}

export function removeEpisode(episodes, id) {
  return episodes.filter((episode) => episode.id !== id);
}
