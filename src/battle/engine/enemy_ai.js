// ============================================================
//  ENEMY AI — selects action set for a given enemy each turn
//
//  selectActionSet(enemy) scans action_sets top to bottom and
//  returns the first set whose condition passes, with actions
//  resolved from action_library.
//
//  ai_type field on the enemy determines the evaluator:
//    "conditional" — data-driven condition checks (default)
//    "sequential"  — cycles through action_sets in order
//    "phase"       — two-phase: build resource until max, then
//                    spend until 0, then repeat. Requires two
//                    action_sets with id "build" and "spend".
//                    Transition resource configured via
//                    phase_resource (default: "BATTLE_SPIRIT").
//
//  Falls back to base_actions for enemies without action_sets.
// ============================================================

function evalCondition(condition, enemy) {
  if (!condition) return true;

  const { type, resource, value } = condition;

  switch (type) {
    case 'RESOURCE_GTE':
      return (enemy.resources?.[resource]?.current ?? 0) >= value;
    case 'RESOURCE_LT':
      return (enemy.resources?.[resource]?.current ?? 0) < value;
    case 'HEALTH_LTE':
      return enemy.health <= value;
    case 'HEALTH_GTE':
      return enemy.health >= value;
    default:
      return true;
  }
}

export function selectActionSet(enemy) {
  if (!enemy.action_sets || !enemy.action_library) {
    return enemy.base_actions ?? [];
  }

  // Sequential AI: cycle through action_sets in order, one per turn.
  // sequence_index is stored on the enemy and mutated here — safe because
  // the caller always deep-copies characters before calling buildEnemyQueue.
  if (enemy.ai_type === 'sequential') {
    const idx = (enemy.sequence_index ?? 0) % enemy.action_sets.length;
    enemy.sequence_index = idx + 1;
    const set = enemy.action_sets[idx];
    return set.actions.map(name => enemy.action_library[name]).filter(Boolean);
  }

  // Phase AI: toggle between "build" and "spend" phases based on resource level.
  // current_phase persists on the enemy object between turns (same as sequence_index).
  if (enemy.ai_type === 'phase') {
    const resource = enemy.phase_resource ?? 'BATTLE_SPIRIT';
    const res = enemy.resources?.[resource];
    const current = res?.current ?? 0;
    const max = res?.max ?? 0;

    if (enemy.current_phase === 'spend') {
      if (current <= 0) enemy.current_phase = 'build';
    } else {
      if (current >= max) enemy.current_phase = 'spend';
    }

    const phaseId = enemy.current_phase ?? 'build';
    const set = enemy.action_sets.find(s => s.id === phaseId);
    if (!set) return [];
    const resolved = set.actions.map(name => enemy.action_library[name]).filter(Boolean);

    if (set.mode === 'random') {
      return [resolved[Math.floor(Math.random() * resolved.length)]];
    }

    return resolved;
  }

  for (const set of enemy.action_sets) {
    if (evalCondition(set.condition ?? null, enemy)) {
      const resolved = set.actions
        .map(name => enemy.action_library[name])
        .filter(Boolean);
      if (set.mode === 'random') {
        return [resolved[Math.floor(Math.random() * resolved.length)]];
      }
      return resolved;
    }
  }

  return [];
}
