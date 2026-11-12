/** Una fuente de verdad para el score y protección frente a eventos duplicados. */
export function createScore() {
  return { crystals: 0, drones: 0, levels: 0, remainingSeconds: 0, hits: 0, seen: new Set() };
}
export function calculateScore(s) {
  return Math.max(0, 100 * s.crystals + 50 * s.drones + 200 * s.levels + 2 * s.remainingSeconds - 25 * s.hits);
}
export function applyScoreEvent(score, {id, type, remainingSeconds = 0}) {
  if (!id || score.seen.has(id)) return false;
  switch (type) {
    case 'crystal': score.crystals++; break;
    case 'drone': score.drones++; break;
    case 'complete':
      score.levels++;
      score.remainingSeconds += Math.max(0, Math.floor(remainingSeconds));
      break;
    case 'hit': score.hits++; break;
    default: return false;
  }
  score.seen.add(id);
  return true;
}
