// ============================================================
//  CLASS-SPECIFIC HANDLERS
//  Buff/stance tags tied to specific class mechanics.
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── STILL WIND ──
// Applied by the Still Wind card at 3 stacks (max 3).
// PRE_ACTION: grants 1 Battle Spirit and consumes 1 stack. Removed when stacks hit 0.
// ON_RECEIVE: consumed entirely when the owner takes a HIT.

function StillWindPreActionHandler(action, owner, tag) {
  if (action.properties?.includes('SPEED_ACTION')) {
    return { cancelled: false, consumed: false };
  }
  const res = owner.resources?.BATTLE_SPIRIT;
  if (res) {
    res.current = Math.min(res.current + 1, res.max);
  }
  tag.stacks -= 1;
  const consumed = tag.stacks <= 0;
  const stackText = consumed ? 'fades' : `${tag.stacks} left`;
  return {
    cancelled: false,
    consumed,
    logs: [{ msg: `🌬️ ${owner.name} gains 1 Battle Spirit from Still Wind (${stackText})`, type: 'resource' }],
  };
}

function StillWindOnReceiveHandler(payload, character, tag, hit_result) {
  if (hit_result === 'HIT') {
    return { consumed: true };
  }
  return { consumed: false };
}

// ── STEEL WILL ──
// Applied by the Steel Will card.
// DAMAGE_REDUCE: reduces all incoming damage by 75% until the owner acts next.
// Removed by ON_OWNER_ACTION reset when the owner takes their next action.

function SteelWillDamageReduceHandler(payload, tag) {
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
