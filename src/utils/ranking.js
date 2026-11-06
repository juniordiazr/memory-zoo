const compare = (a, b) => a.time - b.time || a.moves - b.moves;

export function readRanking() {
  try {
    const data = JSON.parse(localStorage.getItem('memory-zoo-ranking') || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter(entry => entry && typeof entry.playerId === 'string' &&
      typeof entry.name === 'string' && Number.isFinite(entry.time) && entry.time >= 0 &&
      Number.isInteger(entry.moves) && entry.moves >= 8).sort(compare).slice(0, 10);
  } catch {
    return [];
  }
}

export function addResult(ranking, result) {
  const previous = ranking.find(entry => entry.playerId === result.playerId);
  if (previous && compare(previous, result) <= 0) return ranking;
  return [...ranking.filter(entry => entry.playerId !== result.playerId), result]
    .sort(compare).slice(0, 10);
}

export function saveRanking(ranking) {
  try {
    localStorage.setItem('memory-zoo-ranking', JSON.stringify(ranking));
    return true;
  } catch {
    return false;
  }
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
