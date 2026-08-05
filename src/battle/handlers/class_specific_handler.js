// ============================================================
//  CLASS-SPECIFIC HANDLERS
//  Buff/stance tags tied to specific class mechanics.
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── STILL WIND ──
// Applied by the Still Wind card at 3 stacks (max 3).
// PRE_ACTION: grants 0.5 Battle Spirit and consumes 1 stack. Removed when stacks hit 0.
// ON_RECEIVE: consumed entirely when the owner takes a HIT.

function StillWindPreActionHandler(context, tag) {
  const { action, owner } = context;
  if (action.properties?.includes('SPEED_ACTION')) {
    return { cancelled: false, consumed: false };
  }
  const res = owner.resources?.BATTLE_SPIRIT;
  if (res) {
    res.current = Math.min(res.current + 0.5, res.max);
  }
  tag.stacks -= 1;
  const consumed = tag.stacks <= 0;
  const stackText = consumed ? 'fades' : `${tag.stacks} left`;
  return {
    cancelled: false,
    consumed,
    logs: [{ msg: `🌬️ ${owner.name} gains 0.5 Battle Spirit from Still Wind (${stackText})`, type: 'resource' }],
  };
}

function StillWindOnReceiveHandler(context, tag) {
  if (context.hit_result === 'HIT') {
    return { consumed: true };
  }
  return { consumed: false };
}

// ── STEEL WILL ──
// Applied by the Steel Will card.
// DAMAGE_REDUCE: reduces all incoming damage by 75% until the owner acts next.
// Removed by ON_OWNER_ACTION reset when the owner takes their next action.

function SteelWillDamageReduceHandler(context, tag) {
  const { payload } = context;
  const reduced = {
    ...payload,
    damages: payload.damages.map(d => ({ ...d, power: Math.round(d.power * 0.50) })),
  };
  return { payload: reduced, consumed: false };
}

registerTag('STEEL_WILL', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  handlers: {
    DAMAGE_REDUCE: SteelWillDamageReduceHandler,
  },
});

registerTag('STILL_WIND', {
  phases: ['PRE_ACTION', 'ON_RECEIVE'],
  status_type: 'buff',
  onApply(pool, tag) {
    const existing = pool.find(t => t.tag_name === 'STILL_WIND');
    if (existing) {
      existing.stacks = Math.min(existing.stacks + tag.stacks, 3);
    } else {
      pool.push(tag);
    }
  },
  handlers: {
    PRE_ACTION: StillWindPreActionHandler,
    ON_RECEIVE: StillWindOnReceiveHandler,
  },
});

// ── DRAGON SLASH ──
// DRAGON_SLASH_RESOLVE is an action tag (see samurai_cards.js dragon_slash) —
// merged in as if applied by an earlier action, scoped to this action only.
// SPEED_CALC: at <=5% HP, cancels the slot speed penalty entirely.
// INJECT_FLAT: same HP read, adds flat damage on top of the card's base power.
// ACTION_END: always consumed — this tag only exists for this one action.

function DragonSlashResolveSpeedCalcHandler(context, tag) {
  const { owner } = context;
  const ratio = owner.health / owner.max_health;
  let bonus = 0;
  if (ratio <= 0.05) bonus = 80;
  else if (ratio <= 0.25) bonus = 60;
  else if (ratio <= 0.50) bonus = 40;
  else if (ratio <= 0.75) bonus = 20;
  if (ratio <= 0.05) bonus += (owner.action_count ?? 0) * 20;
  return bonus;
}

function DragonSlashResolveInjectFlatHandler(context, tag) {
  const { payload, owner } = context;
  const ratio = owner.health / owner.max_health;
  let flat = 0;
  if (ratio <= 0.05) flat = 367;
  else if (ratio <= 0.25) flat = 267;
  else if (ratio <= 0.50) flat = 167;
  else if (ratio <= 0.75) flat = 67;
  payload.damages.forEach(d => { d.power += flat; });
  return { payload, consumed: false };
}

function DragonSlashResolveActionEndHandler(context, tag) {
  return { consumed: true };
}

registerTag('DRAGON_SLASH_RESOLVE', {
  phases: ['SPEED_CALC', 'INJECT_FLAT', 'ACTION_END'],
  handlers: {
    SPEED_CALC: DragonSlashResolveSpeedCalcHandler,
    INJECT_FLAT: DragonSlashResolveInjectFlatHandler,
    ACTION_END: DragonSlashResolveActionEndHandler,
  },
});

registerTag('DRAGON_SLASH_CAST', {
  status_type: 'buff',
});
