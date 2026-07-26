// ============================================================
//  POST ATTACK HANDLERS
//  Phase: POST_ATTACK
//  Fires after delivery. Handler signature: (context, tag), where
//  context = { payload, owner, hit_result, deflected }.
// ============================================================

import { registerTag } from '../registry/battle_registry';

export function ComboStackHandler(context, tag) {
  if (context.hit_result !== 'HIT') return { consumed: false };
  tag.stack_count = (tag.stack_count || 0) + 1;
  return { consumed: false };
}

registerTag('COMBO_STACK', {
  phases: ['POST_ATTACK'],
  handlers: { POST_ATTACK: ComboStackHandler },
});
