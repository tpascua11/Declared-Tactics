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

function evalCondition(condition, enemy, opponent) {
  if (!condition) return true;

  // compound AND: every sub-condition must pass
  if (condition.all) return condition.all.every(c => evalCondition(c, enemy, opponent));

  const { type, resource, value, tag } = condition;

  switch (type) {
    case 'RESOURCE_GTE':
      return (enemy.resources?.[resource]?.current ?? 0) >= value;
    case 'RESOURCE_LT':
      return (enemy.resources?.[resource]?.current ?? 0) < value;
    case 'HEALTH_LTE':
      return enemy.health <= value;
    case 'HEALTH_GTE':
      return enemy.health >= value;
    // (enemy.health + enemy.temp_hp) / enemy.max_health <= value  (0–1 range)
    case 'HEALTH_PCT_LTE': {
      const effective = (enemy.health ?? 0) + (enemy.temp_hp ?? 0);
      const max = enemy.max_health ?? 1;
      return effective / max <= value;
    }
    // opponent's active_tag_pool contains a tag with the given tag_name
    case 'OPPONENT_HAS_TAG':
      return (opponent?.active_tag_pool ?? []).some(t => t.tag_name === tag);
    // enemy's own tag pool has a tag whose stack_count >= value
    case 'SELF_TAG_STACK_GTE': {
      const found = (enemy.active_tag_pool ?? []).find(t => t.tag_name === tag);
      return (found?.stack_count ?? 0) >= value;
    }
    // enemy's own tag pool contains a tag with the given tag_name (any stacks)
    case 'SELF_HAS_TAG':
      return (enemy.active_tag_pool ?? []).some(t => t.tag_name === tag);
    default:
      return true;
  }
}

export function selectActionSet(enemy, opponent) {
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

    // candidates: priority list of conditional action sets — first match wins.
    // A candidate with no condition is an unconditional default.
    if (set.candidates) {
      for (const candidate of set.candidates) {
        if (evalCondition(candidate.condition ?? null, enemy, opponent)) {
          const resolved = candidate.actions.map(name => enemy.action_library[name]).filter(Boolean);
          return candidate.mode === 'random'
            ? [resolved[Math.floor(Math.random() * resolved.length)]]
            : resolved;
        }
      }
      return [];
    }

    const resolved = set.actions.map(name => enemy.action_library[name]).filter(Boolean);

    if (set.mode === 'random') {
      return [resolved[Math.floor(Math.random() * resolved.length)]];
    }

    return resolved;
  }

  for (const set of enemy.action_sets) {
    if (evalCondition(set.condition ?? null, enemy, opponent)) {
      enemy.current_action_set_id = set.id;
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

// Stamps display_action_set_id onto each enemy in the characters array.
// Call only at the three aura checkpoints: battle init, turn cleanup, stage advance.
export function primeDisplayAura(characters) {
  const opponent = characters.find(c => c.faction === 'player');
  characters.filter(c => c.faction === 'enemy').forEach(e => {
    const set = predictEnemyActionSet(e, opponent);
    e.display_action_set_id = set?.id ?? null;
  });
}

// Pure read-only: returns the action set the enemy is about to use, without mutating state.
// Mirrors selectActionSet priority. Use this to derive aura, intent display, etc.
export function predictEnemyActionSet(enemy, opponent) {
  if (!enemy.action_sets) return null;

  if (enemy.ai_type === 'sequential') {
    const idx = (enemy.sequence_index ?? 0) % enemy.action_sets.length;
    return enemy.action_sets[idx] ?? null;
  }

  if (enemy.ai_type === 'phase') {
    const phaseId = enemy.current_phase ?? 'build';
    return enemy.action_sets.find(s => s.id === phaseId) ?? null;
  }

  for (const set of enemy.action_sets) {
    if (evalCondition(set.condition ?? null, enemy, opponent)) {
      return set;
    }
  }

  return null;
}
