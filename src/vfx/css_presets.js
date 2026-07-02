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
//  NOTE: this will move to JSON (require.context loader, same
//  pattern as pixi_data.js) once the shape is proven. Kept as a
//  plain JS file for now during the Phase 1 proof of concept.
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

export const CSS_PRESETS = {
  // Fire-based hit flash/flicker/fade — shared by flame_strike and
  // any future fire ability that wants the same impact.
  flame_impact: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,      transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
      { offset: 0.0732, transform: 'translate(-4px, -3px) rotate(-2deg)', filter: 'brightness(4) sepia(1) saturate(6) hue-rotate(-30deg)' },
      { offset: 0.1585, transform: 'translate(3px, 2px) rotate(1deg)',    filter: 'brightness(1.8) sepia(1) saturate(4) hue-rotate(-25deg)' },
      { offset: 0.2439, transform: 'translate(-3px, -1px) rotate(-1deg)', filter: 'brightness(3) sepia(1) saturate(5) hue-rotate(-28deg)' },
      { offset: 0.3293, transform: 'translate(2px, 1px) rotate(1deg)',    filter: 'brightness(1.6) sepia(1) saturate(4) hue-rotate(-22deg)' },
      { offset: 0.4146, transform: 'translate(-2px, -1px) rotate(-1deg)', filter: 'brightness(2.8) sepia(1) saturate(5) hue-rotate(-26deg)' },
      { offset: 0.5,    transform: 'translate(2px, 0px) rotate(0deg)',    filter: 'brightness(1.5) sepia(1) saturate(3.5) hue-rotate(-20deg)' },
      { offset: 0.5854, transform: 'translate(-1px, 1px) rotate(-1deg)',  filter: 'brightness(2.4) sepia(1) saturate(4) hue-rotate(-24deg)' },
      { offset: 0.6707, transform: 'translate(1px, 0px) rotate(0deg)',    filter: 'brightness(1.4) sepia(0.9) saturate(3) hue-rotate(-18deg)' },
      { offset: 0.7561, transform: 'translate(-1px, -1px) rotate(0deg)',  filter: 'brightness(2) sepia(0.8) saturate(3.5) hue-rotate(-20deg)' },
      { offset: 0.9024, transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1.5) sepia(0.5) saturate(2) hue-rotate(-10deg)' },
      { offset: 1,      transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Generic weapon-hit shake, no filter — shared by heavy_slice, dual_heavy_slice,
  // and any plain physical slash impact. No hold to strip; motion starts at offset 0.
  heavy_shake: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    transform: 'translate(1px, 1px) rotate(0deg)' },
      { offset: 0.12, transform: 'translate(-2px, -2px) rotate(-1deg)' },
      { offset: 0.25, transform: 'translate(-3px, 0px) rotate(1deg)' },
      { offset: 0.37, transform: 'translate(3px, 2px) rotate(0deg)' },
      { offset: 0.50, transform: 'translate(1px, -1px) rotate(-1deg)' },
      { offset: 0.62, transform: 'translate(-2px, -2px) rotate(-1deg)' },
      { offset: 0.75, transform: 'translate(-3px, 0px) rotate(1deg)' },
      { offset: 0.87, transform: 'translate(3px, 2px) rotate(0deg)' },
      { offset: 1,    transform: 'translate(0px, 0px) rotate(0deg)' },
    ],
  },

  // Stance/buff glow — brightness+saturation+hue bloom with a slight scale pop.
  // Shared by sumurai_sheath (Battojutsu) and the generic buff animation.
  buff_glow: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    filter: 'brightness(1) saturate(1) hue-rotate(0deg)',     transform: 'scale(1)' },
      { offset: 0.25, filter: 'brightness(2) saturate(2.5) hue-rotate(40deg)',  transform: 'scale(1.04)' },
      { offset: 0.55, filter: 'brightness(1.6) saturate(2) hue-rotate(45deg)',  transform: 'scale(1.02)' },
      { offset: 0.85, filter: 'brightness(1.2) saturate(1.3) hue-rotate(20deg)', transform: 'scale(1.01)' },
      { offset: 1,    filter: 'brightness(1) saturate(1) hue-rotate(0deg)',     transform: 'scale(1)' },
    ],
  },

  // Two-hit ice reaction (↘ slash then ↖ slash) — cyan/blue hue-rotate flash
  // per hit. No hold to strip; impact starts immediately at offset 0.
  ice_impact: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(2.2) hue-rotate(180deg) saturate(3)' },
      { offset: 0.05, transform: 'translate(-3px, -2px) rotate(-1deg)',   filter: 'brightness(1.6) hue-rotate(180deg) saturate(2.5)' },
      { offset: 0.10, transform: 'translate(3px, 1px) rotate(1deg)',      filter: 'brightness(1.4) hue-rotate(160deg) saturate(2)' },
      { offset: 0.17, transform: 'translate(-2px, -1px) rotate(-0.5deg)', filter: 'brightness(1.2) hue-rotate(120deg) saturate(1.5)' },
      { offset: 0.26, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.1) hue-rotate(60deg) saturate(1.2)' },
      { offset: 0.30, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1) hue-rotate(0deg) saturate(1)' },
      { offset: 0.32, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(2.2) hue-rotate(180deg) saturate(3)' },
      { offset: 0.37, transform: 'translate(3px, -2px) rotate(1deg)',     filter: 'brightness(1.6) hue-rotate(180deg) saturate(2.5)' },
      { offset: 0.43, transform: 'translate(-3px, 1px) rotate(-1deg)',    filter: 'brightness(1.4) hue-rotate(160deg) saturate(2)' },
      { offset: 0.52, transform: 'translate(2px, -1px) rotate(0.5deg)',   filter: 'brightness(1.2) hue-rotate(120deg) saturate(1.5)' },
      { offset: 0.65, transform: 'translate(-1px, 1px) rotate(-0.3deg)',  filter: 'brightness(1.1) hue-rotate(90deg) saturate(1.2)' },
      { offset: 0.80, transform: 'translate(1px, 0px) rotate(0.2deg)',    filter: 'brightness(1.1) hue-rotate(40deg) saturate(1.1)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1) hue-rotate(0deg) saturate(1)' },
    ],
  },

  // True circular orbit (two clockwise laps) — linear easing on purpose, so
  // the motion traces an actual circle instead of easing in/out of it.
  run_circle: {
    easing: 'linear',
    keyframes: [
      { offset: 0,      transform: 'translate(0px, 0px)' },
      { offset: 0.0625, transform: 'translate(13px, -5px)' },
      { offset: 0.125,  transform: 'translate(18px, -18px)' },
      { offset: 0.1875, transform: 'translate(13px, -31px)' },
      { offset: 0.25,   transform: 'translate(0px, -36px)' },
      { offset: 0.3125, transform: 'translate(-13px, -31px)' },
      { offset: 0.375,  transform: 'translate(-18px, -18px)' },
      { offset: 0.4375, transform: 'translate(-13px, -5px)' },
      { offset: 0.5,    transform: 'translate(0px, 0px)' },
      { offset: 0.5625, transform: 'translate(13px, -5px)' },
      { offset: 0.625,  transform: 'translate(18px, -18px)' },
      { offset: 0.6875, transform: 'translate(13px, -31px)' },
      { offset: 0.75,   transform: 'translate(0px, -36px)' },
      { offset: 0.8125, transform: 'translate(-13px, -31px)' },
      { offset: 0.875,  transform: 'translate(-18px, -18px)' },
      { offset: 0.9375, transform: 'translate(-13px, -5px)' },
      { offset: 1,      transform: 'translate(0px, 0px)' },
    ],
  },
};

// Plays a preset on `el` via the Web Animations API.
//
// WAAPI's outer `options.easing` applies to the WHOLE animation as one
// curve — it does NOT re-apply per segment like CSS @keyframes does. To
// reproduce the CSS look, the preset's single `easing` value is baked onto
// every keyframe here (the only place presets get played), and the outer
// option always stays 'linear'. Callers never need to think about this.
export function playPreset(el, preset, { duration }) {
  if (!el || !preset) return null;
  const keyframes = preset.keyframes.map(k => ({ ...k, easing: preset.easing ?? 'linear' }));
  return el.animate(keyframes, { duration, easing: 'linear', fill: 'none' });
}

export default CSS_PRESETS;
