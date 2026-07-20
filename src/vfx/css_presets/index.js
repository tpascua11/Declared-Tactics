// ============================================================
//  CSS Presets — reusable "impact frame" keyframe blocks.
//
//  A preset is just the meaningful hit portion of an effect (flash,
//  flicker, fade) with no idle hold baked in — offsets always run
//  0 to 1. Timeline entries in animation_data/*.json reference a
//  preset by name and decide WHEN it fires (`start`) and how long
//  it plays (`duration`), so the same preset can be reused across
//  many abilities and combo'd freely without CSS class conflicts.
//
//  Split by class, same idea as animation_data/<class>/ — SHARED_PRESETS
//  for anything cross-class or engine-wide, one file per class beyond
//  that (samurai.js today, more as new classes get their own kit). Add a
//  new class's presets by adding a file here and merging it into
//  CSS_PRESETS below — nothing else needs to change, lookups are by
//  bare preset name regardless of which file it came from.
//
//  NOTE: this will move to JSON (require.context loader, same
//  pattern as pixi_data.js) once the shape is proven.
//
//  GOTCHA — hit once already, don't reintroduce it: the Web Animations
//  API's outer `options.easing` applies to the WHOLE animation as a
//  single curve, unlike CSS @keyframes where the timing function re-
//  applies to EVERY segment between keyframes. Setting easing only at
//  the outer level makes multi-step impacts (like flame_impact) feel
//  smoothed-out/weaker, because the sharp per-hop snap gets averaged
//  into one long arc instead of getting its own accelerate/decelerate.
//  Always play presets through playPreset() below — it bakes easing
//  onto every individual keyframe and forces the outer option to
//  'linear' so each hop gets its own speed curve, based on itself.
// ============================================================

import { SHARED_PRESETS } from './shared';
import { SAMURAI_PRESETS } from './samurai';
import { ENEMY_SAMURAI_PRESETS } from './enemy_samurai';

export const CSS_PRESETS = { ...SHARED_PRESETS, ...SAMURAI_PRESETS, ...ENEMY_SAMURAI_PRESETS };

// Plays a preset on `el` via the Web Animations API.
//
// WAAPI's outer `options.easing` applies to the WHOLE animation as one
// curve — it does NOT re-apply per segment like CSS @keyframes does. To
// reproduce the CSS look, the preset's single `easing` value is baked onto
// every keyframe here (the only place presets get played), and the outer
// option always stays 'linear'. Callers never need to think about this.
//
// preset.pseudoElement — some effects (a shine sweep, a marching-ants
// border) are drawn on a ::before/::after layer, not the element itself,
// because they need a whole extra shape (a gradient sweep, a dashed
// border) that transform/filter on the base element can't produce. When
// set, this targets that pseudo-element instead of `el` directly.
//
// iterations — for presets whose source CSS looped `infinite` (e.g. a
// marching-ants border) but were always cut short by a fixed duration in
// practice. Defaults to 1 (play once).
//
// preset.fill — defaults to 'none' (snap back to normal the instant the
// animation ends, no manual cleanup needed). A few presets are authored to
// deliberately end in a non-resting state (e.g. shinsoku_disappear ends
// fully invisible) and set fill:'forwards' to stay there until something
// else changes it — callers (BattleScreen/VfxEditorScreen) are responsible
// for eventually cancelling a fill:'forwards' animation once its attack's
// real content has finished playing, so it can't outlive the attack.
export function playPreset(el, preset, { duration, iterations = 1 }) {
  if (!el || !preset) return null;
  const keyframes = preset.keyframes.map(k => ({ ...k, easing: preset.easing ?? 'linear' }));
  const options = { duration, iterations, easing: 'linear', fill: preset.fill ?? 'none' };
  if (preset.pseudoElement) options.pseudoElement = preset.pseudoElement;
  return el.animate(keyframes, options);
}

// params = the rest-spread of extra keys on an animation_data JSON
// css.target/css.owner timeline entry (e.g. { distance: 26 }), passed into
// the preset like function args: key -> same-named CSS var (numbers get
// px), e.g. distance:26 -> --distance:26px, read via calc(var(--distance)
// ...) in the preset's keyframes. No rename, no lookup table — a new param
// (e.g. "scale") needs zero code changes here or at call sites.
// MUST run before playPreset(el, ...) — el.animate() reads calc(var(--x))
// at start time; setting vars after that call is a silent no-op.
export function applyDynamicVars(el, params) {
  if (!el || !params) return;
  Object.entries(params).forEach(([key, value]) => {
    el.style.setProperty(`--${key}`, typeof value === 'number' ? `${value}px` : String(value));
  });
}

export default CSS_PRESETS;
