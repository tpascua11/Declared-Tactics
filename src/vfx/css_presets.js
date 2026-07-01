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
