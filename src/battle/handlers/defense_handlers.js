// ============================================================
//  DEFENSE HANDLERS
//  Universal, data-driven defensive reactions — the defensive
//  counterpart of the DAMAGE tag. One registered handler per
//  defensive phase; each card's tag instance supplies the options.
//
//  BLOCKING — DAMAGE_REDUCE — the hit lands, weakened:
//    { tag_name: 'BLOCKING',
//      reduction: 0.75,                        // fraction of damage blocked
//      reaction_anim: 'steel_guard_deflect',   // animation JSON fused in when the block fires
//      label: 'Steel Guard',                   // display name for logs (defaults to BLOCKING)
//      reset: ['ON_OWNER_ACTION', 'END_OF_TURN'] }
//
//  EVADING — ON_INCOMING — the hit never lands:
//    { tag_name: 'EVADING',
//      reaction_anim: 'sidestep',              // class flavor: 'ninja_vanish', 'water_swift', ...
//      label: 'Vanish',
//      charges: 1,                             // evades consumed before expiring (omit = unlimited,
//                                              // lifetime controlled by reset alone)
//      reset: ['ON_OWNER_ACTION', 'END_OF_TURN'] }
//
//  `reaction_anim` is not read here — it rides on the tag instance
//  into active_tag_pool so the engine can bubble it up to the
//  reaction animation fuse (see src/vfx/fuseDeflect.js) when that
//  wiring lands. These handlers only own the mechanics.
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── BLOCKING ──

// One blocking stance at a time — applying a new one replaces the old.
function BlockingOnApply(pool, tag) {
  const existing = pool.findIndex(t => t.tag_name === 'BLOCKING');
  if (existing !== -1) pool.splice(existing, 1);
  pool.push(tag);
}

function BlockingDamageReduceHandler(payload, tag) {
  const totalDamage = payload.damages.reduce((sum, d) => sum + d.power, 0);
  if (totalDamage === 0) return { payload, consumed: false };

  const reduction = tag.reduction ?? 0.75;
  const reducedPayload = {
    ...payload,
    damages: payload.damages.map(d => ({ ...d, power: Math.floor(d.power * (1 - reduction)) })),
  };

  return {
    payload: reducedPayload,
    consumed: false,
    logs: [{ msg: `🛡️ ${tag.label ?? 'BLOCKING'} reduces incoming damage by ${Math.round(reduction * 100)}%`, type: 'buff' }],
  };
}

registerTag('BLOCKING', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  onApply: BlockingOnApply,
  handlers: { DAMAGE_REDUCE: BlockingDamageReduceHandler },
});

// ── EVADING ──

// One evading stance at a time — applying a new one replaces the old.
function EvadingOnApply(pool, tag) {
  const existing = pool.findIndex(t => t.tag_name === 'EVADING');
  if (existing !== -1) pool.splice(existing, 1);
  pool.push(tag);
}

function EvadingOnIncomingHandler(incoming_action, defender, tag) {
  let consumed = false;
  if (tag.charges != null) {
    tag.charges -= 1;
    consumed = tag.charges <= 0;
  }

  return {
    cancelled: true,
    consumed,
    logs: [
      { msg: `[${String(incoming_action.calc_speed).padStart(3, ' ')}] 💨 ${defender.name} evades "${incoming_action.name}" with ${tag.label ?? 'EVADING'}!`, type: 'buff' },
    ],
  };
}

registerTag('EVADING', {
  traits: ['EVASION'],
  phases: ['ON_INCOMING'],
  status_type: 'buff',
  onApply: EvadingOnApply,
  handlers: { ON_INCOMING: EvadingOnIncomingHandler },
});
