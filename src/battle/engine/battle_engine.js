// ============================================================
//  BATTLE ENGINE
//  Pure functions — take state in, return new state out.
//  No direct mutation. Safe for React useReducer pattern. 
// ============================================================

import { battle_registry } from '../registry/battle_registry';
import '../handlers'; // triggers all self-registering tag handlers


// ── HELPERS ──

export function calcSpeed(base_speed, slot_index) {
  return base_speed - slot_index * 20;
}


export function getEffectiveActionSlots(character) {
  let slots = character.total_action_slots ?? 0;
  for (const tag of character.active_tag_pool ?? []) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.action_slot_mod) {
      slots += entry.action_slot_mod(tag);
    }
  }
  return Math.max(0, slots);
}

export function addTagToPool(pool, tag, actionContext = null) {
  const entry = battle_registry[tag.tag_name];
  // Allow registry entries to stamp action-time data onto the tag (e.g. calc_speed for QUICK_STEPS)
  const resolvedTag = (actionContext && entry?.enrichFromAction)
    ? entry.enrichFromAction(tag, actionContext)
    : tag;
  const tagWithMeta = {
    ...resolvedTag,
    tier: 'condition',
    ...(entry?.status_type ? { status_type: entry.status_type } : {}),
  };
  if (entry?.onApply) {
    const newPool = [...pool];
    entry.onApply(newPool, tagWithMeta);
    return newPool;
  }
  return [...pool, { ...tagWithMeta }];
}


function resolveSelfTags(action, owner) {
  for (const branch of (action.tags?.self_if ?? [])) {
    if (owner.active_tag_pool.some(t => t.tag_name === branch.owner_has)) return branch.tags;
  }
  return action.tags?.self ?? [];
}

// ── SPEED CHECK ──

export function SpeedCheckAllAvailableActions(characters) {
  let actions = [];

  for (const character of characters) {
    if (character.health <= 0) continue;
    if (!character.queue || character.queue.length === 0) continue;
    const action = structuredClone(character.queue[0]);
    if (!action) continue;
    if (action.priority_flag === 'SKIP') continue;

    // Base speed from character state, not baked queue value
    action.calc_speed = (character.base_speed + (action.speed_mod ?? 0)) - (character.action_count ?? 0) * 20;

    // Apply SPEED_CALC tags
    for (const tag of character.active_tag_pool) {
      const entry = battle_registry[tag.tag_name];
      if (entry?.phases?.includes('SPEED_CALC')) {
        entry.handlers['SPEED_CALC'](action, character, tag);
      }
    }
    actions.push({ ...action, owner_id: character.id, owner_name: character.name });
  }

  const next_actions = actions.filter(a => a.priority_flag === 'NEXT');
  const normal_actions = actions.filter(a => a.priority_flag !== 'NEXT');
  normal_actions.sort((a, b) => b.calc_speed - a.calc_speed);

  return [...next_actions, ...normal_actions];
}

// ── INTERACTION CHECK ──

export function InteractionCheck(actionA, actionB) {
  if (!actionA || !actionB) {
    return { resultA: 'EXECUTE', resultB: 'UNAFFECTED', log: null };
  }

  const opposing = actionA.owner_id !== actionB.owner_id;
  const speedDiff = Math.abs(actionA.calc_speed - actionB.calc_speed);

  // CLASH
  const aHasClash = actionA.tag_type?.includes('CLASH');
  const bHasClash = actionB.tag_type?.includes('CLASH');
  if (opposing && aHasClash && bHasClash && speedDiff <= 2) {
    return {
      resultA: 'NULLIFY',
      resultB: 'NULLIFY',
      log: { msg: `⚡ CLASH! "${actionA.name}" vs "${actionB.name}" — both cancelled!`, type: 'clash' },
    };
  }

  // INTERRUPT
  const aHasInterrupt = actionA.properties?.includes('INTERRUPT');
  if (opposing && aHasInterrupt && actionA.calc_speed > actionB.calc_speed) {
    return {
      resultA: 'EXECUTE',
      resultB: 'SKIP',
      log: { msg: `⚡ INTERRUPT! "${actionA.name}" suppresses "${actionB.name}"`, type: 'clash' },
    };
  }

  return { resultA: 'EXECUTE', resultB: 'UNAFFECTED', log: null };
}

// ── PHASE RUNNERS ──

function runPhaseImbue(tag_pool, payload) {
  const remaining = [];
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('IMBUE')) {
      const result = entry.handlers['IMBUE'](payload, null, tag);
      payload = result.payload;
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }
  return { tag_pool: remaining, payload };
}

function runPhaseInjectMult(tag_pool, payload, character) {
  const remaining = [];
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('INJECT_MULT')) {
      const result = entry.handlers['INJECT_MULT'](payload, character, tag);
      payload = result.payload;
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }
  return { tag_pool: remaining, payload };
}

function runPhaseInjectFlat(tag_pool, payload, character) {
  const remaining = [];
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('INJECT_FLAT')) {
      const result = entry.handlers['INJECT_FLAT'](payload, character, tag);
      payload = result.payload;
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }
  return { tag_pool: remaining, payload };
}

function runPhaseOnReceive(tag_pool, payload, character, hit_result) {
  const remaining = [];
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('ON_RECEIVE')) {
      const result = entry.handlers['ON_RECEIVE'](payload, character, tag, hit_result);
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }
  return remaining;
}

function runPhasePostAttack(tag_pool, payload, character, hit_result) {
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('POST_ATTACK')) {
      entry.handlers['POST_ATTACK'](payload, character, tag, hit_result);
    }
  }
  return tag_pool;
}

function runPhaseDamageReduce(tag_pool, payload) {
  const remaining = [];
  const logs = [];
  for (const tag of tag_pool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('DAMAGE_REDUCE')) {
      const result = entry.handlers['DAMAGE_REDUCE'](payload, tag);
      payload = result.payload;
      if (result.logs) logs.push(...result.logs);
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }
  return { tag_pool: remaining, payload, logs };
}

function runPhasePreAction(tag_pool, action, owner) {
  const logs = [];
  const remaining = [];

  // Strip stance/buff tags that expire when the owner acts (e.g. QUICK_STEPS from a prior slot).
  // Done here — at the START of the next action — so the tag survives after being applied
  // and is only cleared right before the owner's following action fires.
  const activePool = tag_pool.filter(tag => {
    const reset = tag.reset;
    return !(Array.isArray(reset) ? reset.includes('ON_OWNER_ACTION') : reset === 'ON_OWNER_ACTION');
  });

  for (let i = 0; i < activePool.length; i++) {
    const tag = activePool[i];
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('PRE_ACTION')) {
      const result = entry.handlers['PRE_ACTION'](action, owner, tag);
      logs.push(...(result.logs ?? []));
      if (result.cancelled) return { cancelled: true, logs, tag_pool: [...remaining, ...activePool.slice(i + 1)] };
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }

  // Engine-level resource gate — not a tag, just a rule
  for (const [resourceType, amount] of Object.entries(action.cost ?? {})) {
    const res = owner.resources?.[resourceType];
    if (!res || res.current < amount) {
      logs.push({ msg: `💨 "${action.name}" fizzled — not enough ${resourceType}`, type: 'fizzle' });
      return { cancelled: true, logs, tag_pool: remaining };
    }
  }

  return { cancelled: false, logs, tag_pool: remaining };
}

// ── TAG INTERACTION RESOLVER ──
// Scans the target's active_tag_pool for tags whose registry traits overlap
// with the action's tag_interactions declarations.
// Returns a list of active interactions for this hit — used by ON_INCOMING
// handlers (bypass/consume decisions) and ExecuteAction (bonus multipliers).
//
// Card declares:
//   tag_interactions: [{ traits: ['EVASION'], bypass: true, bonus_multiplier: 0.5 }]
// Registry declares:
//   QUICK_STEPS: { traits: ['EVASION', 'STANCE'], ... }
// If any trait overlaps → interaction is active for that tag.

function resolveTagInteractions(action, target) {
  const activeInteractions = [];
  if (!action.tag_interactions?.length || !target) return { activeInteractions };

  for (const interaction of action.tag_interactions) {
    for (const tag of target.active_tag_pool) {
      const entry = battle_registry[tag.tag_name];
      if (!entry?.traits?.length) continue;
      const matched = interaction.traits.some(t => entry.traits.includes(t));
      if (matched) {
        activeInteractions.push({ ...interaction, matchedTagName: tag.tag_name });
        break; // one match per interaction entry is enough
      }
    }
  }

  return { activeInteractions };
}

// ── ON_INCOMING PHASE RUNNER ──
// Runs on the *defender's* tag pool when an action is about to hit them.
// Any tag declaring phase 'ON_INCOMING' can cancel the action, reflect damage,
// trigger counters, etc. — this is the general defender-side gate.
// interactionResult from resolveTagInteractions is passed through so each
// handler can check if it is being bypassed by the incoming action.

function runPhaseOnIncoming(tag_pool, incoming_action, defender, state, interactionResult = { activeInteractions: [] }) {
  const logs = [];
  const remaining = [];

  for (let i = 0; i < tag_pool.length; i++) {
    const tag = tag_pool[i];
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('ON_INCOMING')) {
      // Engine-level bypass: if the incoming action has a tag_interaction that
      // matches this tag, consume it and skip the handler entirely — the action
      // goes through without giving the tag a chance to cancel.
      const bypassInteraction = interactionResult.activeInteractions.find(
        i => i.bypass && i.matchedTagName === tag.tag_name
      );
      if (bypassInteraction) {
        logs.push({ msg: `💨 ${defender.name}'s ${tag.tag_name} was bypassed by "${incoming_action.name}"!`, type: 'buff' });
        // consumed — do not push back to remaining
        continue;
      }

      const result = entry.handlers['ON_INCOMING'](incoming_action, defender, tag, state);
      logs.push(...(result.logs ?? []));
      if (result.cancelled) {
        const keep = result.consumed ? [] : [tag];
        return { cancelled: true, logs, tag_pool: [...remaining, ...keep, ...tag_pool.slice(i + 1)] };
      }
      if (!result.consumed) remaining.push(tag);
    } else {
      remaining.push(tag);
    }
  }

  return { cancelled: false, logs, tag_pool: remaining };
}

// ── EXECUTE ACTION ──

export function ExecuteAction(action, interaction_result, state) {
  const logs = [];
  let newState = structuredClone(state);

  if (interaction_result === 'NULLIFY') {
    logs.push({ msg: `💨 "${action.name}" was nullified`, type: 'clash' });
    return { newState, logs };
  }

  const owner = newState.characters.find(c => c.id === action.owner_id);
  const target = newState.characters.find(c => c.id === action.target_id);

  if (!owner || !target) return { newState, logs };
  if (owner.health <= 0) return { newState, logs };

  // PRE_ACTION phase — tag-based gates, then engine resource check
  const preAction = runPhasePreAction(owner.active_tag_pool, action, owner);
  logs.push(...preAction.logs);
  owner.active_tag_pool = preAction.tag_pool;
  if (preAction.cancelled) return { newState, logs, fizzled: true };

  // Deduct resource costs at execution time
  for (const [resourceType, amount] of Object.entries(action.cost ?? {})) {
    owner.resources[resourceType].current -= amount;
  }

  // ── RESOLVE TAG INTERACTIONS ──
  // Check if this action has tag_interactions that match any traits on the
  // target's active tags. Result is passed into ON_INCOMING so handlers can
  // decide to bypass/consume themselves, and used below for bonus multipliers.
  const interactionResult = resolveTagInteractions(action, target);
  const isAoe = action.properties?.includes('AOE');
  const isSelfBuff = (action.tags?.target ?? []).length === 0 && (action.tags?.self ?? []).length > 0;

  // ON_INCOMING phase — defender-side gate (dodge, parry, reflect, etc.)
  // Runs on the original target before any payload is built or damage dealt.
  // If cancelled: attacker resources are still spent (action was committed).
  // AOE and self-buff actions skip — self-buffs don't actually target the enemy
  // even though target_id points to one (an artifact of how ADD_TO_QUEUE assigns targets).
  if (!isAoe && !isSelfBuff && target.health > 0) {
    const onIncoming = runPhaseOnIncoming(target.active_tag_pool, action, target, newState, interactionResult);
    logs.push(...onIncoming.logs);
    target.active_tag_pool = onIncoming.tag_pool;
    if (onIncoming.cancelled) {
      return { newState, logs, dodged: true, dodgerId: target.id, attackerId: owner.id };
    }
  }

  // ── TAG INTERACTION BONUSES ──
  // Apply bonus_multiplier from any matched tag interactions.
  // Runs after ON_INCOMING (so cancelled actions never reach this) and before
  // payload construction so DELIVERY uses the boosted damage values.
  for (const interaction of interactionResult.activeInteractions) {
    if (interaction.bonus_multiplier) {
      for (const tag of (action.tags?.target || [])) {
        if (tag.tag_name === 'DAMAGE' && tag.power != null) {
          tag.power = Math.floor(tag.power * (1 + interaction.bonus_multiplier));
        }
      }
      logs.push({ msg: `⚡ ${action.name} exploits ${target.name}'s stance! +${Math.round(interaction.bonus_multiplier * 100)}% damage`, type: 'dmg' });
    }
  }

  // Retarget if original target is already dead — prefer same faction as original target
  const resolvedTarget = target.health > 0
    ? target
    : newState.characters.find(c => c.faction === target.faction && c.id !== action.owner_id && c.health > 0) ?? null;
  const retargeted = resolvedTarget && resolvedTarget.id !== target.id;

  // ── BUILD ──
  let payload = {
    type: action.payload_type,
    tag_types: [...(action.tag_type || [])],
    damages: [],
    properties: [...(action.properties || [])],
    status_effects: [],
  };

  // ── IMBUE ──
  const imbueResult = runPhaseImbue(owner.active_tag_pool, payload);
  owner.active_tag_pool = imbueResult.tag_pool;
  payload = imbueResult.payload;

  // ── BUILD DAMAGES from card target tags ──
  for (const tag of (action.tags?.target || [])) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('DELIVERY')) {
      const result = entry.handlers['DELIVERY'](payload, owner, tag);
      payload = result.payload;
    }
  }

  // ── INJECT_MULT ──
  const injectMultResult = runPhaseInjectMult(owner.active_tag_pool, payload, owner);
  owner.active_tag_pool = injectMultResult.tag_pool;
  payload = injectMultResult.payload;

  // ── INJECT_FLAT ──
  const injectFlatResult = runPhaseInjectFlat(owner.active_tag_pool, payload, owner);
  owner.active_tag_pool = injectFlatResult.tag_pool;
  payload = injectFlatResult.payload;

  // ── DEFENDER PIPELINE ──
  // Payload is frozen here — owner buffs (BATTOJUTSU, MAGIC_CHARGE, etc.) were
  // consumed in INJECT_MULT / INJECT_FLAT above. Each target now runs through
  // their own independent defender-side pipeline.
  //
  // Single-target: one pass on resolvedTarget.
  // AOE: every living opposing character loops through ON_INCOMING, DAMAGE_REDUCE,
  //      delivery, APPLY STATUS TAGS, and ON_RECEIVE independently.
  //      Payload is cloned per-enemy so one enemy's mitigation doesn't bleed to the next.
  if (!isAoe && retargeted) logs.push({ msg: `🔀 ${action.name} retargeted to ${resolvedTarget.name}`, type: 'info' });

  const deliveryTargets = isAoe
    ? newState.characters.filter(c => c.faction !== owner.faction && c.health > 0)
    : (resolvedTarget ? [resolvedTarget] : []);

  let total_damage = 0;
  const aoeHits = []; // { targetId, damage } — one entry per enemy hit, used for per-enemy animation

  if (deliveryTargets.length > 0) {
    for (const defTarget of deliveryTargets) {
      // ON_INCOMING — single-target already ran above; for AOE run per-enemy
      if (isAoe && defTarget.health > 0) {
        const onIncoming = runPhaseOnIncoming(defTarget.active_tag_pool, action, defTarget, newState, { activeInteractions: [] });
        logs.push(...onIncoming.logs);
        defTarget.active_tag_pool = onIncoming.tag_pool;
        if (onIncoming.cancelled) continue; // this enemy dodged — move to next
      }

      // DAMAGE_REDUCE — clone payload so each enemy's mitigation is independent
      let defPayload = structuredClone(payload);
      const damageReduceResult = runPhaseDamageReduce(defTarget.active_tag_pool, defPayload);
      defTarget.active_tag_pool = damageReduceResult.tag_pool;
      defPayload = damageReduceResult.payload;
      logs.push(...(damageReduceResult.logs ?? []));

      // Deliver damage — temp_hp absorbs first, then real health
      let dmg_this_target = 0;
      for (const dmg of defPayload.damages) {
        const absorbed = Math.min(defTarget.temp_hp ?? 0, dmg.power);
        defTarget.temp_hp = (defTarget.temp_hp ?? 0) - absorbed;
        defTarget.health = Math.max(0, defTarget.health - (dmg.power - absorbed));
        dmg_this_target += dmg.power;
        logs.push({ msg: `⚔️ ${owner.name} uses ${action.name} → ${defTarget.name} takes ${dmg.power} ${dmg.element} dmg`, type: 'dmg' });
      }
      total_damage += dmg_this_target;
      aoeHits.push({ targetId: defTarget.id, damage: dmg_this_target });

      // APPLY STATUS TARGET TAGS
      for (const tag of (action.tags?.target || [])) {
        const entry = battle_registry[tag.tag_name];
        if (!entry?.phases?.includes('DELIVERY')) {
          defTarget.active_tag_pool = addTagToPool(defTarget.active_tag_pool, tag);
          logs.push({ msg: `🔻 ${defTarget.name} gains ${tag.tag_name}`, type: 'debuff' });
        }
      }

      // ON_RECEIVE
      const hit_result_this = dmg_this_target > 0 ? 'HIT' : 'MISS';
      defTarget.active_tag_pool = runPhaseOnReceive(defTarget.active_tag_pool, defPayload, defTarget, hit_result_this);
    }
  } else {
    logs.push({ msg: `💨 ${owner.name} uses ${action.name} — no targets remaining`, type: 'info' });
  }

  // ── SELF TAGS ──
  for (const tag of resolveSelfTags(action, owner)) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('DELIVERY')) {
      const result = entry.handlers['DELIVERY'](payload, owner, tag);
      payload = result.payload || payload;
      if (tag.tag_name === 'HEAL') {
        logs.push({ msg: `💙 ${owner.name} gains ${tag.power} temp HP`, type: 'heal' });
      }
    } else {
      // Pass action as context so registry entries can stamp action-time data (e.g. calc_speed)
      owner.active_tag_pool = addTagToPool(owner.active_tag_pool, tag, action);
      logs.push({ msg: `✨ ${owner.name} gains ${tag.tag_name}`, type: 'buff' });
    }
  }

  const hit_result = total_damage > 0 ? 'HIT' : 'MISS';

  // ── POST_ATTACK ──
  owner.active_tag_pool = runPhasePostAttack(owner.active_tag_pool, payload, owner, hit_result);


  return {
    newState,
    logs,
    actualTargetId: isAoe ? (aoeHits[0]?.targetId ?? null) : (resolvedTarget?.id ?? null),
    aoeHits: isAoe ? aoeHits : null,
    isSelfBuff,
    animationHint: action.animation ?? (action.payload_type === 'MAGIC' ? 'shake_magic' : 'shake'),
    animationSelf: action.animation_self ?? null,
    animationIntensity: action.animation_intensity ?? 1.0,
    damageDealt: total_damage,
  };
}

// ── ACTION CLEANUP ──

export function ActionCleanup(action, state) {
  const newState = structuredClone(state);
  const owner = newState.characters.find(c => c.id === action.owner_id);
  if (!owner) return newState;
  owner.queue = owner.queue.slice(1);
  // Clear priority flags on remaining queue
  if (owner.queue[0]) owner.queue[0].priority_flag = null;
  if (!action.ignores_slot_penalty) owner.action_count = (owner.action_count ?? 0) + 1;
  return newState;
}

// ── ON_TURN_START / END_OF_TURN PHASE RUNNERS ──

export function runPhaseOnTurnStart(characters, field) {
  const newCharacters = structuredClone(characters);
  const logs = [];

  for (const character of newCharacters) {
    if (character.health <= 0) continue;
    const remaining = [];
    for (const tag of character.active_tag_pool) {
      const entry = battle_registry[tag.tag_name];
      if (entry?.phases?.includes('ON_TURN_START')) {
        const context = { owner: character, field, state: { characters: newCharacters } };
        const result = entry.handlers['ON_TURN_START'](context, tag);
        logs.push(...(result.logs ?? []));
        if (!result.consumed) remaining.push(tag);
        if (result.inject?.length) remaining.push(...result.inject);
      } else {
        remaining.push(tag);
      }
    }
    character.active_tag_pool = remaining;
  }

  return { newCharacters, logs };
}

export function runPhaseEndOfTurn(characters, field) {
  const newCharacters = structuredClone(characters);
  const logs = [];

  for (const character of newCharacters) {
    if (character.health <= 0) continue;
    const remaining = [];
    for (const tag of character.active_tag_pool) {
      const entry = battle_registry[tag.tag_name];
      if (entry?.phases?.includes('END_OF_TURN')) {
        const context = { owner: character, field, state: { characters: newCharacters } };
        const result = entry.handlers['END_OF_TURN'](context, tag);
        logs.push(...(result.logs ?? []));
        if (!result.consumed) remaining.push(tag);
      } else {
        remaining.push(tag);
      }
    }
    character.active_tag_pool = remaining;
  }

  return { newCharacters, logs };
}

// ── TURN RESULT CLEANUP ──

export function TurnResultCleanup(state, field = null) {
  let newState = structuredClone(state);
  const logs = [];

  // END_OF_TURN tag phase — runs before expiry sweep
  const endOfTurnResult = runPhaseEndOfTurn(newState.characters, field);
  newState.characters = endOfTurnResult.newCharacters;
  logs.push(...endOfTurnResult.logs);

  for (const character of newState.characters) {
    character.action_count = 0;
  }

  for (const character of newState.characters) {
    character.active_tag_pool = character.active_tag_pool.filter(tag => {
      const hasReset = (key) => Array.isArray(tag.reset) ? tag.reset.includes(key) : tag.reset === key;
      if (hasReset('END_OF_TURN')) {
        logs.push({ msg: `🔄 ${character.name}: ${tag.tag_name} expired`, type: 'info' });
        return false;
      }
      if (hasReset('TICK_TURN')) {
        tag.duration -= 1;
        if (tag.duration <= 0) {
          logs.push({ msg: `🔄 ${character.name}: ${tag.tag_name} expired`, type: 'info' });
          return false;
        }
        logs.push({ msg: `🔄 ${character.name}: ${tag.tag_name} — ${tag.duration} turn(s) remaining`, type: 'info' });
        return true;
      }
      return true;
    });
  }

  return { newState, logs };
}
