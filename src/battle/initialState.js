// ============================================================
//  initialState — builds the starting game state and enemy queues
// ============================================================

import { CLASS_REGISTRY } from '../data/classes/class_registry';
import EMBER_KEEP from '../data/scenarios/ember_keep.json';
import EMBER_WITCH_TEST from '../data/scenarios/ember_witch_test.json';
import WOLF_SLOW_TEST from '../data/scenarios/wolf_slow_test.json';
import { ENEMY_REGISTRY } from '../data/characters/enemy_registry';
import { buildPlayer } from '../data/player';
import { derivePlayerSnapshot } from '../context/PlayerContext';
import { calcSpeed } from './engine/battle_engine';
import { selectActionSet } from './engine/enemy_ai';

export const MAX_ENEMIES = 5;

// ── BUILD STAGE ENEMIES ──
// Turns an array of enemy ID strings into runtime enemy objects.
// stageIndex + offset are used to generate unique IDs across stages and bench slots.
export function buildStageEnemies(enemyIds, stageIndex, offset = 0) {
  return enemyIds
    .map((id, i) => {
      const def = ENEMY_REGISTRY[id];
      if (!def) return null;
      return {
        ...JSON.parse(JSON.stringify(def)),
        id: `${def.id}_s${stageIndex}_${offset + i + 1}`,
      };
    })
    .filter(Boolean);
}

// ── BUILD ENEMY QUEUE ──
export function buildEnemyQueue(enemy) {
  const actions = selectActionSet(enemy);
  return actions.map((act, i) => ({
    ...act,
    owner_id: enemy.id,
    owner_name: enemy.name,
    target_id: 'vrax',
    payload_type: act.payload_type || 'PHYSICAL',
    calc_speed: calcSpeed(enemy.base_speed + (act.speed_mod ?? 0), i),
    priority_flag: null,
  }));
}

// ── BUILD INITIAL STATE ──
// scenario: a scenario JSON from src/data/scenarios/ — defaults to EMBER_KEEP for debug.
// playerData: persistent player from PlayerContext — falls back to SAMURAI if null.
export function buildInitialState(scenario = WOLF_SLOW_TEST, playerData = null) {
  const stage0Ids = scenario?.stages?.[0]?.enemies ?? [];
  const activeIds = stage0Ids.slice(0, MAX_ENEMIES);
  const benchIds  = stage0Ids.slice(MAX_ENEMIES);

  const builtEnemies = buildStageEnemies(activeIds, 0, 0);
  const enemyBench   = buildStageEnemies(benchIds,  0, MAX_ENEMIES);

  // Derive full runtime player from stored minimal data, or fall back to SAMURAI for debug
  const player = playerData
    ? derivePlayerSnapshot(playerData)
    : buildPlayer(CLASS_REGISTRY.samurai, { id: 'vrax', name: 'VRAX' });

  const characters = [player, ...builtEnemies];
  return {
    phase: new URLSearchParams(window.location.search).has('debug') ? 'QUEUE_SETUP' : 'TITLE',
    music: scenario?.music ?? null,
    battleBackground: scenario?.battle_background ?? null,
    turn: 1,
    result: null,          // WIN | LOSS
    characters,
    scenario,
    currentStageIndex: 0,
    enemyBench,
    logs: [{ msg: '⚔️  System Ready. Queue your actions and execute.', type: 'info' }],
    stepCount: 0,
    pendingAnimation: [],
    activeEnemyId: null,
    lastTargetId: characters.find(c => c.faction === 'enemy' && c.health > 0)?.id ?? null,
  };
}
