// ============================================================
//  DELIVERY HANDLERS
//  Phase: DELIVERY
//  Build damage entries and immediate effects
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function DamageHandler(payload, character, tag) {
  payload.damages.push({ element: tag.type, power: tag.power });
  return { payload, consumed: true };
}

export function HealHandler(payload, character, tag) {
  const missing = character.max_health - character.health;
  const tempCap = Math.max(0, missing - (character.temp_hp ?? 0));
  character.temp_hp = (character.temp_hp ?? 0) + Math.min(tag.power, tempCap);
  return { payload, consumed: true };
}

export function GainResourceHandler(payload, character, tag) {
  const res = character.resources?.[tag.resource_type];
  if (!res) return { payload, consumed: true };
  res.current = Math.min(res.current + tag.power, res.max);
  return { payload, consumed: true };
}

registerTag('DAMAGE', {
  phases: ['DELIVERY'],
  handlers: { DELIVERY: DamageHandler },
});

registerTag('HEAL', {
  phases: ['DELIVERY'],
  handlers: { DELIVERY: HealHandler },
});

registerTag('GAIN_RESOURCE', {
  resource_delta: (tag) => ({ type: tag.resource_type, amount: tag.power }),
  phases: ['DELIVERY'],
  handlers: { DELIVERY: GainResourceHandler },
});
