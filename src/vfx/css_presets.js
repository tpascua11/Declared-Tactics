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

  // Storm strike target reaction — white charge flash, slash impact,
  // electric shake, fade. No hold; charge flash starts immediately.
  storm_impact: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.07, transform: 'translate(-1px, -1px) rotate(-0.5deg)', filter: 'brightness(3) saturate(0) hue-rotate(0deg)' },
      { offset: 0.15, transform: 'translate(1px, 0px) rotate(0.3deg)',   filter: 'brightness(2) saturate(0.3) hue-rotate(0deg)' },
      { offset: 0.23, transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1.2) saturate(0.8) hue-rotate(0deg)' },
      { offset: 0.26, transform: 'translate(-3px, -2px) rotate(-1.5deg)', filter: 'brightness(4.5) saturate(0) hue-rotate(0deg)' },
      { offset: 0.30, transform: 'translate(4px, 3px) rotate(2deg)',     filter: 'brightness(3.5) saturate(5) hue-rotate(185deg)' },
      { offset: 0.35, transform: 'translate(-4px, -3px) rotate(-2deg)',  filter: 'brightness(2.8) saturate(4.5) hue-rotate(190deg)' },
      { offset: 0.40, transform: 'translate(4px, 2px) rotate(2deg)',     filter: 'brightness(3.2) saturate(5) hue-rotate(183deg)' },
      { offset: 0.45, transform: 'translate(-3px, -2px) rotate(-1.5deg)', filter: 'brightness(2.5) saturate(4) hue-rotate(188deg)' },
      { offset: 0.50, transform: 'translate(3px, 3px) rotate(1.5deg)',   filter: 'brightness(2.8) saturate(4.5) hue-rotate(185deg)' },
      { offset: 0.55, transform: 'translate(-3px, -1px) rotate(-1.5deg)', filter: 'brightness(2.2) saturate(3.5) hue-rotate(182deg)' },
      { offset: 0.60, transform: 'translate(3px, 2px) rotate(1deg)',     filter: 'brightness(2.5) saturate(4) hue-rotate(185deg)' },
      { offset: 0.65, transform: 'translate(-2px, -2px) rotate(-1deg)',  filter: 'brightness(2) saturate(3) hue-rotate(180deg)' },
      { offset: 0.70, transform: 'translate(2px, 1px) rotate(0.8deg)',   filter: 'brightness(1.8) saturate(2.5) hue-rotate(175deg)' },
      { offset: 0.75, transform: 'translate(-1px, -1px) rotate(-0.5deg)', filter: 'brightness(1.5) saturate(2) hue-rotate(168deg)' },
      { offset: 0.82, transform: 'translate(1px, 0px) rotate(0.3deg)',   filter: 'brightness(1.3) saturate(1.5) hue-rotate(140deg)' },
      { offset: 0.92, transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1.1) saturate(1.2) hue-rotate(60deg)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Storm strike attacker surge — upward lunge with a purple electric flash.
  storm_lunge: {
    easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
    keyframes: [
      { offset: 0,    transform: 'translateY(0px)',   filter: 'brightness(1)' },
      { offset: 0.10, transform: 'translateY(-30px)', filter: 'brightness(2.8) saturate(4) hue-rotate(260deg)' },
      { offset: 0.25, transform: 'translateY(-28px)', filter: 'brightness(2.4) saturate(3) hue-rotate(250deg)' },
      { offset: 0.45, transform: 'translateY(0px)',   filter: 'brightness(1.2) saturate(1.5) hue-rotate(220deg)' },
      { offset: 1,    transform: 'translateY(0px)',   filter: 'brightness(1)' },
    ],
  },

  // Storm strike attacker shine — a light streak sweeping up across the
  // card. Drawn on ::after since it's a whole extra gradient layer, not
  // something transform/filter on the card itself can produce. `background`
  // doesn't change across the animation — it's repeated on every keyframe
  // because the base [data-*]::after rule (shared.css) deliberately leaves
  // it unset, so each preset owns its own look.
  storm_shine: {
    easing: 'ease-in',
    pseudoElement: '::after',
    keyframes: [
      { offset: 0,    transform: 'translateY(130%) skewY(-8deg)',  opacity: 0, background: 'linear-gradient(0deg, transparent 30%, rgba(129,140,248,0.75) 45%, rgba(255,255,255,0.8) 52%, rgba(129,140,248,0.45) 60%, transparent 72%)' },
      { offset: 0.10, transform: 'translateY(97.5%) skewY(-8deg)', opacity: 1, background: 'linear-gradient(0deg, transparent 30%, rgba(129,140,248,0.75) 45%, rgba(255,255,255,0.8) 52%, rgba(129,140,248,0.45) 60%, transparent 72%)' },
      { offset: 0.80, transform: 'translateY(-130%) skewY(-8deg)', opacity: 1, background: 'linear-gradient(0deg, transparent 30%, rgba(129,140,248,0.75) 45%, rgba(255,255,255,0.8) 52%, rgba(129,140,248,0.45) 60%, transparent 72%)' },
      { offset: 1,    transform: 'translateY(-130%) skewY(-8deg)', opacity: 0, background: 'linear-gradient(0deg, transparent 30%, rgba(129,140,248,0.75) 45%, rgba(255,255,255,0.8) 52%, rgba(129,140,248,0.45) 60%, transparent 72%)' },
    ],
  },

  // Harai purifying flash — a flat green wash on ::before.
  harai_flash: {
    easing: 'ease-out',
    pseudoElement: '::before',
    keyframes: [
      { offset: 0,    opacity: 0,    background: '#6ee7b7' },
      { offset: 0.10, opacity: 0.28, background: '#6ee7b7' },
      { offset: 0.45, opacity: 0,    background: '#6ee7b7' },
      { offset: 1,    opacity: 0,    background: '#6ee7b7' },
    ],
  },

  // Harai purifying shine — teal light streak sweeping across on ::after.
  harai_shine: {
    easing: 'ease-in-out',
    pseudoElement: '::after',
    keyframes: [
      { offset: 0,    transform: 'translateX(-120%) skewX(-15deg)', opacity: 0, background: 'linear-gradient(105deg, transparent 35%, rgba(110,231,183,0.75) 47%, rgba(255,255,255,0.65) 52%, rgba(110,231,183,0.45) 58%, transparent 68%)' },
      { offset: 0.12, transform: 'translateX(-72%) skewX(-15deg)',  opacity: 1, background: 'linear-gradient(105deg, transparent 35%, rgba(110,231,183,0.75) 47%, rgba(255,255,255,0.65) 52%, rgba(110,231,183,0.45) 58%, transparent 68%)' },
      { offset: 0.85, transform: 'translateX(220%) skewX(-15deg)',  opacity: 1, background: 'linear-gradient(105deg, transparent 35%, rgba(110,231,183,0.75) 47%, rgba(255,255,255,0.65) 52%, rgba(110,231,183,0.45) 58%, transparent 68%)' },
      { offset: 1,    transform: 'translateX(220%) skewX(-15deg)',  opacity: 0, background: 'linear-gradient(105deg, transparent 35%, rgba(110,231,183,0.75) 47%, rgba(255,255,255,0.65) 52%, rgba(110,231,183,0.45) 58%, transparent 68%)' },
    ],
  },

  // Green heal pulse — flat green wash on ::before. Source CSS looped
  // `infinite`; this preset represents ONE loop (350ms) — the timeline
  // entry's `iterations` decides how many times it repeats.
  green_flash: {
    easing: 'ease-in-out',
    pseudoElement: '::before',
    keyframes: [
      { offset: 0,    opacity: 0,    background: '#4ade80' },
      { offset: 0.40, opacity: 0.35, background: '#4ade80' },
      { offset: 1,    opacity: 0,    background: '#4ade80' },
    ],
  },

  // Marching-ants dashed border on ::after — background-position shifts one
  // dash-period per loop. Source CSS looped `infinite`; this preset is ONE
  // loop (100ms) — `iterations` on the timeline entry decides the repeat
  // count. backgroundImage/Size/Repeat are static (same every keyframe);
  // only backgroundPosition actually animates.
  march_ants: {
    easing: 'linear',
    pseudoElement: '::after',
    keyframes: [
      {
        offset: 0,
        opacity: 1,
        backgroundImage: 'repeating-linear-gradient(90deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(180deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(90deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(180deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px)',
        backgroundSize: '12px 5px, 5px 12px, 12px 5px, 5px 12px',
        backgroundRepeat: 'repeat-x, repeat-y, repeat-x, repeat-y',
        backgroundPosition: '0 0, 100% 0, 100% 100%, 0 100%',
      },
      {
        offset: 1,
        opacity: 1,
        backgroundImage: 'repeating-linear-gradient(90deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(180deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(90deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px), repeating-linear-gradient(180deg, #4ade80 0, #4ade80 7px, transparent 7px, transparent 12px)',
        backgroundSize: '12px 5px, 5px 12px, 12px 5px, 5px 12px',
        backgroundRepeat: 'repeat-x, repeat-y, repeat-x, repeat-y',
        backgroundPosition: '12px 0, 100% 12px, calc(100% - 12px) 100%, 0 calc(100% - 12px)',
      },
    ],
  },

  // Speed dash — attacker surge (scale squash + brightness flash, card
  // lifts upward). No hold; motion starts immediately.
  speed_dash_lunge: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    filter: 'brightness(1) saturate(1)',     transform: 'scaleX(1) scaleY(1) translateY(0px)' },
      { offset: 0.20, filter: 'brightness(2.2) saturate(1.4)', transform: 'scaleX(0.96) scaleY(1.02) translateY(32px)' },
      { offset: 0.58, filter: 'brightness(1.5) saturate(1.2)', transform: 'scaleX(0.97) scaleY(1.01) translateY(20px)' },
      { offset: 1,    filter: 'brightness(1) saturate(1)',     transform: 'scaleX(1) scaleY(1) translateY(0px)' },
    ],
  },

  // Speed dash marching stripe lines on ::after — background-position
  // shifts one dash-period per loop. Source CSS looped `infinite`; this
  // preset is ONE loop (40ms) — `iterations` on the timeline entry decides
  // the repeat count. Runs alongside speed_dash_fade below (two separate
  // playPreset() calls on the same ::after, same as the original CSS's
  // comma-separated dual `animation` declaration) — this preset never
  // touches opacity, so speed_dash_fade fully controls visibility.
  speed_dash_stripes: {
    easing: 'linear',
    pseudoElement: '::after',
    keyframes: [
      {
        offset: 0,
        backgroundImage: 'repeating-linear-gradient(180deg, rgba(180, 230, 255, 0.95) 0, rgba(180, 230, 255, 0.95) 16px, transparent 16px, transparent 22px), repeating-linear-gradient(180deg, rgba(180, 230, 255, 0.95) 0, rgba(180, 230, 255, 0.95) 16px, transparent 16px, transparent 22px)',
        backgroundSize: '6px 22px, 6px 22px',
        backgroundRepeat: 'repeat-y, repeat-y',
        backgroundPosition: '0% 0, 100% 0',
      },
      {
        offset: 1,
        backgroundImage: 'repeating-linear-gradient(180deg, rgba(180, 230, 255, 0.95) 0, rgba(180, 230, 255, 0.95) 16px, transparent 16px, transparent 22px), repeating-linear-gradient(180deg, rgba(180, 230, 255, 0.95) 0, rgba(180, 230, 255, 0.95) 16px, transparent 16px, transparent 22px)',
        backgroundSize: '6px 22px, 6px 22px',
        backgroundRepeat: 'repeat-y, repeat-y',
        backgroundPosition: '0% 22px, 100% 22px',
      },
    ],
  },

  // Speed dash stripe visibility fade on ::after — single-shot opacity
  // in/out, paired with speed_dash_stripes above.
  speed_dash_fade: {
    easing: 'ease-in-out',
    pseudoElement: '::after',
    keyframes: [
      { offset: 0,    opacity: 0 },
      { offset: 0.12, opacity: 1 },
      { offset: 0.78, opacity: 1 },
      { offset: 1,    opacity: 0 },
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
export function playPreset(el, preset, { duration, iterations = 1 }) {
  if (!el || !preset) return null;
  const keyframes = preset.keyframes.map(k => ({ ...k, easing: preset.easing ?? 'linear' }));
  const options = { duration, iterations, easing: 'linear', fill: 'none' };
  if (preset.pseudoElement) options.pseudoElement = preset.pseudoElement;
  return el.animate(keyframes, options);
}

export default CSS_PRESETS;
