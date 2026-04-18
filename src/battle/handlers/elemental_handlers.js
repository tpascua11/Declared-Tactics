// ============================================================
//  ELEMENTAL HANDLERS
//  Elemental status effects go here (e.g. FREEZE, BURN, etc.)
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── FREEZE ──
// Slows the host by -5 speed per stack. Max 10 stacks (-50 speed total).
// Decays by 1 stack at end of turn. 

function FreezeOnApply(pool, tag) {
  const existing = pool.find(t => t.tag_name === 'FREEZE');
  if (existing) {
    existing.stacks = Math.min(10, existing.stacks + (tag.stacks ?? 1));
  } else {
    pool.push({ ...tag, stacks: Math.min(10, tag.stacks ?? 1) });
  }
}

function FreezeSpeedCalcHandler(action, character, tag) {
  action.calc_speed -= tag.stacks * 5;
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
  phases: ['SPEED_CALC', 'END_OF_TURN'],
  status_type: 'debuff',
  onApply: FreezeOnApply,
  handlers: {
    SPEED_CALC: FreezeSpeedCalcHandler,
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
  tag.stacks = Math.floor(tag.stacks / 2);
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
    existing.stacks = Math.min(3, existing.stacks + (tag.stacks ?? 1));
  } else {
    pool.push({ ...tag, stacks: Math.min(3, tag.stacks ?? 1) });
  }
}

function SlowOnTurnStartHandler(context, tag) {
  const owner = context.owner;
  const reduce = tag.stacks ?? 1;
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
  action_slot_mod: (tag) => -(tag.stacks ?? 1),
  onApply: SlowOnApply,
  handlers: {
    ON_TURN_START: SlowOnTurnStartHandler,
    END_OF_TURN: SlowEndOfTurnHandler,
  },
});
