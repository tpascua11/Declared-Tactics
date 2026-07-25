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
//      dodge_range: 10,                        // speed window: dodges only attacks with calc_speed in
//                                              // [dodge_anchor - dodge_range, dodge_anchor], where the
//                                              // anchor = the stance action's own calc_speed (stamped at
//                                              // resolution). Omit = no window, dodge everything.
//      reset: ['ON_OWNER_ACTION', 'END_OF_TURN'] }
//
//  `reaction_anim` is not read here — it rides on the tag instance
//  into active_tag_pool, and the phase runners capture it at fire time
//  (EVADING via `cancelled`, BLOCKING via `reacted`) to bubble up to
//  the reaction animation fuse (see src/vfx/fuseDeflect.js).
//  These handlers only own the mechanics.
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
    reacted: true,
    logs: [{ msg: `🛡️ ${tag.label ?? 'BLOCKING'} reduces incoming damage by ${Math.round(reduction * 100)}%`, type: 'buff' }],
  };
}

registerTag('BLOCKING', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  onApply: BlockingOnApply,
  handlers: { DAMAGE_REDUCE: BlockingDamageReduceHandler },
});

// ── UKE_SPIRIT ──
// Rides alongside BLOCKING on the Uke card — reacts on its own DAMAGE_REDUCE
// pass, independent of BLOCKING's reduction math, so a hit landing while
// blocking refunds 1 Battle Spirit.
function UkeSpiritDamageReduceHandler(payload, tag, character) {
  const totalDamage = payload.damages.reduce((sum, d) => sum + d.power, 0);
  if (totalDamage === 0) return { payload, consumed: false };

  const res = character.resources?.BATTLE_SPIRIT;
  if (res) res.current = Math.min(res.current + 1, res.max);

  return {
    payload,
    consumed: false,
    logs: [{ msg: `☯️ ${character.name} gains 1 Battle Spirit`, type: 'resource' }],
  };
}

registerTag('UKE_SPIRIT', {
  phases: ['DAMAGE_REDUCE'],
  status_type: 'buff',
  handlers: { DAMAGE_REDUCE: UkeSpiritDamageReduceHandler },
});

// ── EVADING ──

// One evading stance at a time — applying a new one replaces the old.
function EvadingOnApply(pool, tag) {
  const existing = pool.findIndex(t => t.tag_name === 'EVADING');
  if (existing !== -1) pool.splice(existing, 1);
  pool.push(tag);
}

function EvadingOnIncomingHandler(incoming_action, defender, tag) {
  // Speed window — opt-in via `dodge_range` on the card's tag data.
  // dodge_anchor is stamped at resolution (enrichFromAction) from the
  // stance action's own calc_speed, so WHERE the window sits depends on
  // when the stance was played; the card only decides how WIDE it is.
  // No dodge_range authored = no window: dodge everything, lifetime
  // governed by charges/reset alone (the pre-window behavior).
  if (tag.dodge_range != null && tag.dodge_anchor != null) {
    const speed = incoming_action.calc_speed;
    if (speed < tag.dodge_anchor - tag.dodge_range || speed > tag.dodge_anchor) {
      return { cancelled: false, consumed: false };
    }
  }

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
  // Remember how fast the stance action resolved — the window's anchor
  enrichFromAction: (tag, action) => ({ ...tag, dodge_anchor: action.calc_speed }),
  handlers: { ON_INCOMING: EvadingOnIncomingHandler },
});
