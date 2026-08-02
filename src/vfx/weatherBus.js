// ============================================================
//  weatherBus — pub/sub with last-value memory for the ambient
//  weather key. A plain window CustomEvent would race EffectsLayer's
//  async pixi init: BattleScreen's dispatch can fire before the
//  listener exists and be lost with no retry. subscribe() replays
//  the current value immediately so a late-attaching listener
//  still catches up.
// ============================================================

let current = null;
const listeners = new Set();

export function setWeather(key) {
  current = key;
  listeners.forEach(fn => fn(current));
}

export function subscribeWeather(fn) {
  fn(current);
  listeners.add(fn);
  return () => listeners.delete(fn);
}
