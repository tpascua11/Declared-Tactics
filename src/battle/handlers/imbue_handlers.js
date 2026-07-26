// ============================================================
//  IMBUE HANDLERS
//  Phase: IMBUE
//  Modify what the attack IS — convert elements, add properties/status
//  Always consumed on trigger
//  Handler signature: (context, tag), context = { payload } — no owner,
//  IMBUE fires before a character reference is available at the call site.
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function FireImbueHandler(context, tag) {
  const { payload } = context;
  payload.damages.forEach(d => (d.element = 'FIRE'));
  payload.status_effects.push('BURN');
  return { payload, consumed: true };
}

export function IceImbueHandler(context, tag) {
  const { payload } = context;
  payload.damages.forEach(d => (d.element = 'ICE'));
  payload.status_effects.push('FREEZE_CHANCE');
  return { payload, consumed: true };
}

registerTag('FIRE_IMBUE', {
  phases: ['IMBUE'],
  handlers: { IMBUE: FireImbueHandler },
});

registerTag('ICE_IMBUE', {
  phases: ['IMBUE'],
  handlers: { IMBUE: IceImbueHandler },
});
