// ============================================================
//  SPEED HANDLERS
//  Phase: SPEED_CALC
//  Applied during SpeedCheckAllAvailableActions
//  Modifies calc_speed on the action before sorting
//  SPEED_CALC handler signature: (context, tag), context = { action, owner }.
//  Must return a number, never mutate context/tag — runs for every
//  character's queued action every step, so mutation compounds.
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function SpeedBoostHandler(context, tag) {
  return tag.amount * (tag.stacks ?? 1);
}

export function SpeedBoostImbueHandler(payload, character, tag) {
  if (tag.mode === 'turns') return { payload, consumed: false };
  // Speed actions (e.g. Shinsoku) don't consume the boost — stacks persist
  if (payload.properties?.includes('SPEED_ACTION')) return { payload, consumed: false };
  return { payload, consumed: true };
}

export function SpeedBoostOnMiss(context, tag) {
  const { action, owner } = context;
  if (tag.mode === 'turns') return { consumed: false };
  if (action.properties?.includes('SPEED_ACTION')) return { consumed: false };
  return {
    consumed: true,
    logs: [{ msg: `💨 ${owner.name}'s Speed Boost was spent — attack missed!`, type: 'debuff' }],
  };
}

export function SpeedBoostOnApply(pool, tag) {
  if (tag.turns) {
    const existing = pool.find(t => t.tag_name === 'SPEED_BOOST' && t.mode === 'turns');
    if (existing) {
      existing.duration = Math.max(existing.duration, tag.turns);
    } else {
      pool.push({ ...tag, mode: 'turns', duration: tag.turns, status_type: 'buff' });
    }
  } else {
    const existing = pool.find(t => t.tag_name === 'SPEED_BOOST' && t.mode === 'actions');
    const maxStacks = tag.max_stacks ?? Infinity;
    if (existing) {
      existing.stacks = Math.min(maxStacks, (existing.stacks ?? 1) + 1);
    } else {
      pool.push({ ...tag, mode: 'actions', stacks: 1, status_type: 'buff' });
    }
  }
}

registerTag('SPEED_BOOST', {
  phases: ['SPEED_CALC', 'IMBUE', 'ON_MISS'],
  onApply: SpeedBoostOnApply,
  handlers: {
    SPEED_CALC: SpeedBoostHandler,
    IMBUE: SpeedBoostImbueHandler,
    ON_MISS: SpeedBoostOnMiss,
  },
});
