import { battle_registry as tagRegistry } from '../registry/battle_registry.js';

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

function getEffectiveSlots(enemy) {
  const base = enemy.total_action_slots ?? 1;
  const reduction = (enemy.active_tag_pool ?? []).reduce((sum, tag) => {
    const entry = tagRegistry[tag.tag_name];
    const mod = entry?.action_slot_mod ? entry.action_slot_mod(tag) : 0;
    return sum + mod;
  }, 0);
  return Math.max(0, base + reduction);
}

function evalCondition(condition, enemy, opponent) {
  if (!condition) return true;

  // compound AND: every sub-condition must pass
  if (condition.all) return condition.all.every(c => evalCondition(c, enemy, opponent));
  // compound OR: at least one sub-condition must pass
  if (condition.any) return condition.any.some(c => evalCondition(c, enemy, opponent));

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
    case 'OPPONENT_NOT_HAS_TAG':
      return !(opponent?.active_tag_pool ?? []).some(t => t.tag_name === tag);
    case 'OPPONENT_RESOURCE_GTE':
      return (opponent?.resources?.[resource]?.current ?? 0) >= value;
    case 'OPPONENT_RESOURCE_LT':
      return (opponent?.resources?.[resource]?.current ?? 0) < value;
    case 'OPPONENT_RESOURCE_PCT_GTE': {
      const res = opponent?.resources?.[resource];
      return ((res?.current ?? 0) / (res?.max ?? 1)) >= value;
    }
    case 'OPPONENT_RESOURCE_PCT_LTE': {
      const res = opponent?.resources?.[resource];
      return ((res?.current ?? 0) / (res?.max ?? 1)) <= value;
    }
    case 'OPPONENT_HEALTH_PCT_LTE': {
      const effective = (opponent?.health ?? 0) + (opponent?.temp_hp ?? 0);
      return effective / (opponent?.max_health ?? 1) <= value;
    }
    // enemy's own tag pool has a tag whose stack_count >= value
    case 'SELF_TAG_STACK_GTE': {
      const found = (enemy.active_tag_pool ?? []).find(t => t.tag_name === tag);
      return (found?.stack_count ?? 0) >= value;
    }
    // enemy's own tag pool contains a tag with the given tag_name (any stacks)
    case 'SELF_HAS_TAG':
      return (enemy.active_tag_pool ?? []).some(t => t.tag_name === tag);
    case 'SELF_NOT_HAS_TAG':
      return !(enemy.active_tag_pool ?? []).some(t => t.tag_name === tag);
    case 'EFFECTIVE_SLOTS_LTE':
      return getEffectiveSlots(enemy) <= value;
    case 'EFFECTIVE_SLOTS_GTE':
      return getEffectiveSlots(enemy) >= value;
    case 'TURN_MOD':
      return ((enemy.enemy_turn ?? 1) % condition.modulo) === (condition.remainder ?? 0);
    default:
      return true;
  }
}

// Advances and returns the next action list from a cycling set.
// cycle_key is a unique string per set so multiple sets can cycle independently.
// If the current variant has a condition that isn't met, returns null without advancing
// (the cycle holds until the condition is satisfied).
function resolveCycle(set, cycle_key, enemy, opponent) {
  const variants = set.variants ?? [set.actions];
  const idx = (enemy[cycle_key] ?? 0) % variants.length;
  const variant = variants[idx];

  if (!Array.isArray(variant)) {
    if (!evalCondition(variant.condition ?? null, enemy, opponent)) return null;
    enemy[cycle_key] = idx + 1;
    return variant.actions.map(name => enemy.action_library[name]).filter(Boolean);
  }

  enemy[cycle_key] = idx + 1;
  return variant.map(name => enemy.action_library[name]).filter(Boolean);
}

// Returns the opponent's currently queued action cards (nulls filtered out).
// Each entry has: name, payload_type, tag_type[], properties[], tags, owner_id.
// Available during selectActionSet — player commits queue before buildEnemyQueue runs.
export function getOpponentQueue(opponent) {
  return (opponent?.queue ?? []).filter(Boolean);
}

export function bypassesEvasion(card) {
  return (card?.tag_interactions ?? []).some(i => i.traits?.includes('EVASION') && i.bypass);
}

function resolveQueueMirror(set, enemy, opponent) {
  const opponentQueue = getOpponentQueue(opponent);
  const slots = enemy.total_action_slots ?? 1;
  return Array.from({ length: slots }, (_, i) => {
    const card = opponentQueue[i];
    const nameMatch = card && set.on_name?.[card.name];
    const isDamaging = (card?.tags?.target ?? []).some(t => t.tag_name === 'DAMAGE');
    const name = nameMatch ?? ((card && isDamaging) ? set.on_damage : set.on_no_damage);
    return enemy.action_library[name] ?? null;
  }).filter(Boolean);
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
          if (candidate.mode === 'random') {
            return [resolved[Math.floor(Math.random() * resolved.length)]];
          }
          if (candidate.mode === 'cycle') {
            return resolveCycle(candidate, `${set.id}_cycle`, enemy, opponent);
          }
          return resolved;
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
    if (!evalCondition(set.condition ?? null, enemy, opponent)) continue;

    if (set.mode === 'queue_mirror') {
      enemy.current_action_set_id = set.id;
      return resolveQueueMirror(set, enemy, opponent);
    }
    if (set.mode === 'cycle') {
      const result = resolveCycle(set, `${set.id}_cycle`, enemy, opponent);
      if (result !== null) {
        enemy.current_action_set_id = set.id;
        return result;
      }
      continue;
    }
    enemy.current_action_set_id = set.id;
    const resolved = set.actions.map(name => enemy.action_library[name]).filter(Boolean);
    if (set.mode === 'random') {
      return [resolved[Math.floor(Math.random() * resolved.length)]];
    }
    return resolved;
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
    const resource = enemy.phase_resource ?? 'BATTLE_SPIRIT';
    const res = enemy.resources?.[resource];
    const current = res?.current ?? 0;
    const max = res?.max ?? 0;
    let phase = enemy.current_phase ?? 'build';
    if (phase === 'spend') {
      if (current <= 0) phase = 'build';
    } else {
      if (current >= max) phase = 'spend';
    }
    return enemy.action_sets.find(s => s.id === phase) ?? null;
  }

  // Simulate the enemy_turn increment that buildEnemyQueue performs before selectActionSet,
  // so TURN_MOD conditions predict the correct upcoming turn rather than the one just played.
  const nextEnemy = { ...enemy, enemy_turn: (enemy.enemy_turn ?? 0) + 1 };

  for (const set of enemy.action_sets) {
    if (!evalCondition(set.condition ?? null, nextEnemy, opponent)) continue;

    if (set.mode === 'cycle') {
      const variants = set.variants ?? [set.actions];
      const idx = (nextEnemy[`${set.id}_cycle`] ?? 0) % variants.length;
      const variant = variants[idx];
      if (!Array.isArray(variant) && !evalCondition(variant.condition ?? null, nextEnemy, opponent)) continue;
    }

    return set;
  }

  return null;
}
