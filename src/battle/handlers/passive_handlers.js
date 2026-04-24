// ============================================================
//  PASSIVE HANDLERS
//  Permanent tags — never consumed, class-specific passives.
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function UndyingSpiritHandler(payload, character, tag) {
  const totalDamage = payload.damages.reduce((sum, d) => sum + d.power, 0);
  if (totalDamage >= character.max_health * 0.10) {
    const res = character.resources?.BATTLE_SPIRIT;
    if (res) res.current = Math.min(res.current + 1, res.max);
  }
  return { consumed: false };
}

registerTag('UNDYING_SPIRIT', {
  phases: ['ON_RECEIVE'],
  handlers: { ON_RECEIVE: UndyingSpiritHandler },
});

function UnderTheSunHandler(context, tag) {
  const owner = context.owner;
  const res = owner.resources?.BATTLE_SPIRIT;
  if (res) res.current = Math.min(res.current + 1, res.max);
  return {
    consumed: false,
    logs: [{ msg: `☀️ ${owner.name} regains 1 Battle Spirit`, type: 'resource' }],
  };
}

registerTag('UNDER_THE_SUN', {
  phases: ['END_OF_TURN'],
  handlers: { END_OF_TURN: UnderTheSunHandler },
});

// ── ONE_UNDER_THE_SUN — enemy sumurai passive ──
// Increments the flat `resource` field on the character by 1 each end of turn.

function OneUnderTheSunHandler(context, tag) {
  const owner = context.owner;
  const res = owner.resources?.BATTLE_SPIRIT;
  if (res) res.current = Math.min(res.current + 1, res.max);
  return {
    consumed: false,
    logs: [{ msg: `☀️ ${owner.name} gains 1 Battle Spirit (${res?.current ?? 0} / ${res?.max ?? 0})`, type: 'resource' }],
  };
}

registerTag('ONE_UNDER_THE_SUN', {
  phases: ['END_OF_TURN'],
  handlers: { END_OF_TURN: OneUnderTheSunHandler },
});

// ── GOUKI ──
// Buff with up to 3 stacks. On apply: cleanses all debuffs from the holder.
// DAMAGE_REDUCE: reduces incoming damage by 25% per stack. Consumes 1 stack per hit.
// Expires when stacks reach 0.

function GoukiOnApply(pool, tag) {
  for (let i = pool.length - 1; i >= 0; i--) {
    if (pool[i].status_type === 'debuff') pool.splice(i, 1);
  }
  const existing = pool.find(t => t.tag_name === 'GOUKI');
  if (existing) {
    existing.stacks = Math.min(3, existing.stacks + (tag.stacks ?? 3));
  } else {
    pool.push(tag);
  }
}

function GoukiDamageReduceHandler(payload, tag) {
  const totalDamage = payload.damages.reduce((sum, d) => sum + d.power, 0);
  if (totalDamage === 0) return { payload, consumed: false };

  const stacks = tag.stacks ?? 1;
  const reductionPct = Math.min(stacks * 0.25, 0.75);
  const reducedPayload = {
    ...payload,
    damages: payload.damages.map(d => ({ ...d, power: Math.floor(d.power * (1 - reductionPct)) })),
  };

  tag.stacks = stacks - 1;
  const consumed = tag.stacks <= 0;
  const stacksAfter = consumed ? 0 : tag.stacks;

  return {
    payload: reducedPayload,
    consumed,
    logs: [{ msg: `🛡️ GOUKI reduces damage by ${Math.round(reductionPct * 100)}% (${stacks} → ${stacksAfter} stacks)`, type: 'buff' }],
  };
}

registerTag('GOUKI', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  onApply: GoukiOnApply,
  handlers: { DAMAGE_REDUCE: GoukiDamageReduceHandler },
});

// ── HARAI ──
// Buff applied when the Harai card is used. Costs 1 Battle Spirit.
// DAMAGE_REDUCE: reduces all incoming damage by 75% (flat, no stacks).
// NOT consumed on damage — persists until the owner takes their next action
// via reset: ['ON_OWNER_ACTION'] in the card tag data.

function HaraiDamageReduceHandler(payload, tag) {
  const totalDamage = payload.damages.reduce((sum, d) => sum + d.power, 0);
  if (totalDamage === 0) return { payload, consumed: false };

  const reducedPayload = {
    ...payload,
    damages: payload.damages.map(d => ({ ...d, power: Math.floor(d.power * 0.25) })),
  };

  return {
    payload: reducedPayload,
    consumed: false,
    logs: [{ msg: `🌿 HARAI reduces incoming damage by 75%`, type: 'buff' }],
  };
}

registerTag('HARAI', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  handlers: { DAMAGE_REDUCE: HaraiDamageReduceHandler },
});
