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
  action.calc_speed -= 10;
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

// ── ELECTRIFIED ──
// Starts at 10 stacks. Each turn start injects SHOCKED onto the holder,
// which slows their first action by -20 speed. Halves stacks (floor) at
// end of turn; expires at 0.

function ElectrifiedOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'ELECTRIFIED');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 10));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 10) });
  }
}

function ElectrifiedOnTurnStartHandler(context, tag) {
  return {
    consumed: false,
    inject: [{ tag_name: 'SHOCKED', reset: 'ON_OWNER_ACTION', tier: 'condition', status_type: 'debuff' }],
    logs: [{ msg: `⚡ ${context.owner.name} is SHOCKED (-20 speed this action)`, type: 'debuff' }],
  };
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
    logs: [{ msg: `⚡ ${context.owner.name}: ELECTRIFIED ${tag.stacks} stack(s) remaining`, type: 'info' }],
  };
}

registerTag('ELECTRIFIED', {
  phases: ['ON_TURN_START', 'END_OF_TURN'],
  status_type: 'debuff',
  traits: ['ELECTRIC', 'ELEMENTAL'],
  onApply: ElectrifiedOnApply,
  handlers: {
    ON_TURN_START: ElectrifiedOnTurnStartHandler,
    END_OF_TURN: ElectrifiedEndOfTurnHandler,
  },
});

// ── SHOCKED ──
// Injected by ELECTRIFIED each turn start. Applies -20 speed to the holder's
// first action, then is consumed when that action fires (reset: ON_OWNER_ACTION).

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
