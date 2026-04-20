// ============================================================
//  SPEED HANDLERS
//  Phase: SPEED_CALC
//  Applied during SpeedCheckAllAvailableActions
//  Modifies calc_speed on the action before sorting
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function SpeedBoostHandler(action, character, tag) {
  action.calc_speed += tag.amount;
}

export function SpeedBoostImbueHandler(payload, character, tag) {
  if (tag.mode === 'turns') return { payload, consumed: false };
  // Speed actions (e.g. Shinsoku) don't consume the boost — stacks persist
  if (payload.properties?.includes('SPEED_ACTION')) return { payload, consumed: false };
  return { payload, consumed: true };
}

export function SpeedBoostOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'SPEED_BOOST');

  if (tag.turns) {
    // Turn-based mode
    if (existing && existing.mode === 'turns') {
      existing.duration = Math.max(existing.duration, tag.turns);
    } else {
      pool.push({ ...tag, mode: 'turns', duration: tag.turns, status_type: 'buff' });
    }
  } else {
    // Action-based — accumulate amount up to max_amount, consumed all at once
    if (existing && existing.mode === 'actions') {
      const cap = tag.max_amount ?? Infinity;
      existing.amount = Math.min(existing.amount + tag.amount, cap);
      existing.stacks = Math.round(existing.amount / tag.amount);
    } else {
      pool.push({ ...tag, mode: 'actions', stacks: 1, status_type: 'buff' });
    }
  }
}

registerTag('SPEED_BOOST', {
  phases: ['SPEED_CALC', 'IMBUE'],
  onApply: SpeedBoostOnApply,
  handlers: {
    SPEED_CALC: SpeedBoostHandler,
    IMBUE: SpeedBoostImbueHandler,
  },
});
