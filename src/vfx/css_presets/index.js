// ============================================================
//  CSS Presets — reusable "impact frame" keyframe blocks. A preset is
//  just the meaningful hit portion of an effect (flash, flicker, fade),
//  offsets always 0-1; a JSON timeline entry decides WHEN/how long it
//  plays. Split by class like animation_data/<class> — SHARED_PRESETS is
//  cross-class, one file per class beyond that, merged into CSS_PRESETS
//  below by bare name regardless of source file.
//
//  Deep API mechanics (WAAPI easing gotcha, fill:'forwards' cleanup
//  contract, applyDynamicVars ordering, captureCurrentTransform's
//  m41/m42 + the unverified 'none' edge case) live in
//  todo/css_preset_guide_line.txt — read it before modifying this file
//  or debugging one of these three functions, skip it for routine
//  preset/JSON authoring. Composition principles (the --dir/--distance/
//  --from-x,y connectors, chaining rules) live in
//  todo/css_animation_philosophy.txt.
// ============================================================

import { SHARED_PRESETS } from './shared';
import { GENERAL_MOVEMENT_PRESETS } from './general_movement';
import { SAMURAI_PRESETS } from './samurai';
import { ENEMY_SAMURAI_PRESETS } from './enemy_samurai';

export const CSS_PRESETS = { ...SHARED_PRESETS, ...GENERAL_MOVEMENT_PRESETS, ...SAMURAI_PRESETS, ...ENEMY_SAMURAI_PRESETS };

// Plays a preset on `el` via the Web Animations API. ALWAYS play presets
// through here, never el.animate() directly — see guide for why.
export function playPreset(el, preset, { duration, iterations = 1 }) {
  if (!el || !preset) return null;
  const keyframes = preset.keyframes.map(k => ({ ...k, easing: preset.easing ?? 'linear' }));
  const options = { duration, iterations, easing: 'linear', fill: preset.fill ?? 'none' };
  if (preset.pseudoElement) options.pseudoElement = preset.pseudoElement;
  return el.animate(keyframes, options);
}

// Forwards extra JSON timeline-entry keys onto `el` as same-named CSS
// vars (numbers get px). MUST run before playPreset() for the same
// entry — see guide.
export function applyDynamicVars(el, params) {
  if (!el || !params) return;
  Object.entries(params).forEach(([key, value]) => {
    el.style.setProperty(`--${key}`, typeof value === 'number' ? `${value}px` : String(value));
  });
}

// Reads el's actual current rendered translateX/Y and exposes it as
// --from-x/--from-y, so a chained preset can continue from wherever the
// last one left off instead of a hardcoded value. Call before EVERY
// playPreset(), same spot as --dir. See guide for the 'none' edge case
// and the translate-before-rotate ordering requirement.
export function captureCurrentTransform(el) {
  if (!el) return;
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  el.style.setProperty('--from-x', `${m.m41}px`);
  el.style.setProperty('--from-y', `${m.m42}px`);
}

export default CSS_PRESETS;
