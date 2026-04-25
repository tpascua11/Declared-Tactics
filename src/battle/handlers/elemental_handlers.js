// ============================================================
//  ELEMENTAL HANDLERS
//  Elemental status effects go here (e.g. FREEZE, BURN, etc.)
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── OLD_FREEZE ──
// Original freeze: -5 speed per stack, max 10 stacks. Decays 1 stack/turn.

function OldFreezeOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'OLD_FREEZE');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 1));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 1) });
  }
}

function OldFreezeSpeedCalcHandler(action, character, tag) {
  action.calc_speed -= tag.stacks * 5;
}

function OldFreezeEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return {
      consumed: true,
      logs: [{ msg: `🧊 ${context.owner.name}: OLD FREEZE wore off`, type: 'info' }],
    };
  }
  return {
    consumed: false,
    logs: [{ msg: `🧊 ${context.owner.name}: OLD FREEZE ${tag.stacks} stack(s) remaining`, type: 'info' }],
  };
}

registerTag('OLD_FREEZE', {
  phases: ['SPEED_CALC', 'END_OF_TURN'],
  status_type: 'debuff',
  onApply: OldFreezeOnApply,
  handlers: {
    SPEED_CALC: OldFreezeSpeedCalcHandler,
    END_OF_TURN: OldFreezeEndOfTurnHandler,
  },
});

// ── FREEZE ──
// Like SLOW: reduces actions by 1 (stacks 1–3) or 2 (stacks 4–5), max 5 stacks, decays 1/turn.
// Also applies a flat -10 speed penalty regardless of stacks.

function FreezeOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'FREEZE');
  if (existing) {
    existing.stacks = Math.min(5, existing.stacks + (tag.stacks ?? 1));
  } else {
    pool.push({ ...tag, stacks: Math.min(5, tag.stacks ?? 1) });
  }
}

function FreezeSpeedCalcHandler(action, character, tag) {
  // += adds to existing calc_speed; use = to hard-set instead
  action.calc_speed += 0;
}

function FreezeOnTurnStartHandler(context, tag) {
  const owner = context.owner;
  const reduce = (tag.stacks ?? 1) >= 3 ? 2 : 1;
  if (owner.faction === 'enemy' && owner.queue.length > 0) {
    owner.queue = owner.queue.slice(0, Math.max(0, owner.queue.length - reduce));
  }
  return {
    consumed: false,
    logs: [{ msg: `🧊 ${owner.name} is FROZEN — loses ${reduce} action(s) and -10 speed!`, type: 'debuff' }],
  };
}

function FreezeEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return {
      consumed: true,
      logs: [{ msg: `🧊 ${context.owner.name}: FREEZE wore off`, type: 'info' }],
    };
  }
  return {
    consumed: false,
    logs: [{ msg: `🧊 ${context.owner.name}: FREEZE ${tag.stacks} stack(s) remaining`, type: 'info' }],
  };
}

registerTag('FREEZE', {
  phases: ['SPEED_CALC', 'ON_TURN_START', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['FREEZE'],
  action_slot_mod: (tag) => (tag.stacks ?? 1) >= 3 ? -2 : -1,
  onApply: FreezeOnApply,
  handlers: {
    SPEED_CALC: FreezeSpeedCalcHandler,
    ON_TURN_START: FreezeOnTurnStartHandler,
    END_OF_TURN: FreezeEndOfTurnHandler,
  },
});

// ── OLD_ELECTRIFIED ──
// Original approach: ON_TURN_START injects SHOCKED (reset: ON_OWNER_ACTION),
// which applies -20 speed to the holder's first action then self-destructs.
// Replaced by ELECTRIFIED which checks action_count directly in SPEED_CALC.

function OldElectrifiedOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'OLD_ELECTRIFIED');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 10));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 10) });
  }
}

function OldElectrifiedOnTurnStartHandler(context, tag) {
  return {
    consumed: false,
    inject: [{ tag_name: 'SHOCKED', reset: 'ON_OWNER_ACTION', tier: 'condition', status_type: 'debuff' }],
    logs: [{ msg: `⚡ ${context.owner.name} is SHOCKED (-20 speed this action)`, type: 'debuff' }],
  };
}

function OldElectrifiedEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return { consumed: true, logs: [{ msg: `⚡ ${context.owner.name}: OLD_ELECTRIFIED wore off`, type: 'info' }] };
  }
  return { consumed: false, logs: [{ msg: `⚡ ${context.owner.name}: OLD_ELECTRIFIED ${tag.stacks} stack(s) remaining`, type: 'info' }] };
}

registerTag('OLD_ELECTRIFIED', {
  phases: ['ON_TURN_START', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['ELECTRIC', 'ELEMENTAL'],
  onApply: OldElectrifiedOnApply,
  handlers: {
    ON_TURN_START: OldElectrifiedOnTurnStartHandler,
    END_OF_TURN: OldElectrifiedEndOfTurnHandler,
  },
});

// ── ELECTRIFIED ──
// Applies a flat -20 speed penalty to all of the holder's actions.
// Stacks decay by 1 at END_OF_TURN; expires at 0.

function ElectrifiedOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'ELECTRIFIED');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 10));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 10) });
  }
}

function ElectrifiedSpeedCalcHandler(action, character, tag) {
  action.calc_speed -= 20;
}

function ElectrifiedEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return {
      consumed: true,
      logs: [{ msg: `⚡ ${context.owner.name}: ELECTRIFIED wore off`, type: 'info' }],
    };
  }
  return {
    consumed: false,
    logs: [
      { msg: `⚡ ${context.owner.name} was slowed by ELECTRIFIED (-20 all actions)`, type: 'debuff' },
      { msg: `⚡ ${context.owner.name}: ELECTRIFIED ${tag.stacks} stack(s) remaining`, type: 'info' },
    ],
  };
}

registerTag('ELECTRIFIED', {
  phases: ['SPEED_CALC', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['ELECTRIC', 'ELEMENTAL'],
  onApply: ElectrifiedOnApply,
  handlers: {
    SPEED_CALC: ElectrifiedSpeedCalcHandler,
    END_OF_TURN: ElectrifiedEndOfTurnHandler,
  },
});

// ── PARALYSIS ──
// Applies -20 speed to the holder's first action each turn (action_count === 0).
// SPEED_CALC fires every action, but action_count tracks how many have fired
// this turn — so the penalty only lands on the first. Do NOT use a persistent
// SPEED_CALC tag without this guard; it would slow every action.
// Stacks decay by 1 at END_OF_TURN; expires at 0.

function ParalysisOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'PARALYSIS');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 10));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 10) });
  }
}

function ParalysisSpeedCalcHandler(action, character, tag) {
  if ((character?.action_count ?? 0) === 0) {
    action.calc_speed -= 20;
  }
}

function ParalysisEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return {
      consumed: true,
      logs: [{ msg: `⚡ ${context.owner.name}: PARALYSIS wore off`, type: 'info' }],
    };
  }
  return {
    consumed: false,
    logs: [
      { msg: `⚡ ${context.owner.name} was slowed by PARALYSIS (-20 first action)`, type: 'debuff' },
      { msg: `⚡ ${context.owner.name}: PARALYSIS ${tag.stacks} stack(s) remaining`, type: 'info' },
    ],
  };
}

registerTag('PARALYSIS', {
  phases: ['SPEED_CALC', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['ELECTRIC', 'ELEMENTAL'],
  onApply: ParalysisOnApply,
  handlers: {
    SPEED_CALC: ParalysisSpeedCalcHandler,
    END_OF_TURN: ParalysisEndOfTurnHandler,
  },
});

// ── SHOCKED ──
// Kept for OLD_ELECTRIFIED reference. Injected on turn start, applies -20 speed,
// consumed after the first action fires via reset: ON_OWNER_ACTION.

function ShockedSpeedCalcHandler(action, character, tag) {
  action.calc_speed -= 20;
}

registerTag('SHOCKED', {
  phases: ['SPEED_CALC'],
  status_type: 'debuff',
  handlers: {
    SPEED_CALC: ShockedSpeedCalcHandler,
  },
});

// ── SLOW ──
// Reduces available actions by 1 per stack.
// Player: getEffectiveActionSlots reads action_slot_mod — limits queuing.
// Enemy: ON_TURN_START pops from queue (which was just built before this fires).
// Stacks decay by 1 at END_OF_TURN; apply with stacks: 2 to affect the next full turn.

function SlowOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'SLOW');
  if (existing) {
    existing.stacks = Math.min(5, existing.stacks + (tag.stacks ?? 1));
  } else {
    pool.push({ ...tag, stacks: Math.min(5, tag.stacks ?? 1) });
  }
}

function SlowOnTurnStartHandler(context, tag) {
  const owner = context.owner;
  const reduce = Math.min(2, tag.stacks ?? 1);
  if (owner.faction === 'enemy' && owner.queue.length > 0) {
    owner.queue = owner.queue.slice(0, Math.max(0, owner.queue.length - reduce));
  }
  return {
    consumed: false,
    logs: [{ msg: `🐢 ${owner.name} is SLOWED — loses ${reduce} action(s) this turn!`, type: 'debuff' }],
  };
}

function SlowEndOfTurnHandler(context, tag) {
  tag.stacks -= 1;
  if (tag.stacks <= 0) {
    return { consumed: true, logs: [{ msg: `🐢 ${context.owner.name}: SLOW wore off`, type: 'info' }] };
  }
  return { consumed: false, logs: [{ msg: `🐢 ${context.owner.name}: SLOW — ${tag.stacks} turn(s) remaining`, type: 'info' }] };
}

registerTag('SLOW', {
  phases: ['ON_TURN_START', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['SLOW'],
  action_slot_mod: (tag) => -Math.min(2, tag.stacks ?? 1),
  onApply: SlowOnApply,
  handlers: {
    ON_TURN_START: SlowOnTurnStartHandler,
    END_OF_TURN: SlowEndOfTurnHandler,
  },
});
