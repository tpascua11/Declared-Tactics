// `requires` check shared by `if` game_events, the location menu and the map.
// An entry is a flag name, or { cleared: scenario_id } (resolves to the `cleared:<id>` flag). AND-only.
// Design: todo/location-scaneario-structure-thought-design.txt (DECISION).
//
// runFlags = temporary flags of the current scenario run (e.g. 'battle_won'); pass none outside a run.

import { hasFlag, isScenarioCleared } from '../context/PlayerContext';

export function meetsRequires(requires = [], playerData, runFlags = []) {
  return requires.every(entry =>
    typeof entry === 'string'
      ? runFlags.includes(entry) || hasFlag(playerData, entry)
      : isScenarioCleared(playerData, entry.cleared)
  );
}
