// ============================================================
//  Samurai CSS Presets — Fox Samurai class only.
//  See css_presets/index.js for the "impact frame" concept + playPreset().
// ============================================================

export const SAMURAI_PRESETS = {
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

  // Flash of light at impact, tinted blue/teal — target is punched
  // upward, then right after the impact sound lands, gets knocked a
  // full ~100px to the top-right, holds there, then settles back.
  dragon_slash_impact: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0, 0) rotate(0deg)',                                    filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
      { offset: 0.06, transform: 'translate(0, -14px) rotate(5deg)',                                filter: 'brightness(3.4) sepia(1) saturate(6) hue-rotate(160deg)' },
      { offset: 0.14, transform: 'translate(6px, -16px) rotate(0deg)',           filter: 'brightness(3) sepia(0.9) saturate(5.5) hue-rotate(160deg)' },
      { offset: 0.20, transform: 'translate(13px, -17px) rotate(-8deg)',         filter: 'brightness(2.6) sepia(0.8) saturate(4.8) hue-rotate(160deg)' },
      { offset: 0.225, transform: 'translate(62px, -62px) rotate(-17deg)',       filter: 'brightness(2.3) sepia(0.7) saturate(4.2) hue-rotate(160deg)' },
      { offset: 0.27, transform: 'translate(47px, -47px) rotate(-12deg)',       filter: 'brightness(2) sepia(0.6) saturate(3.6) hue-rotate(160deg)' },
      { offset: 0.5,  transform: 'translate(47px, -47px) rotate(-12deg)',       filter: 'brightness(1.5) sepia(0.35) saturate(2.2) hue-rotate(140deg)' },
      { offset: 0.85, transform: 'translate(47px, -47px) rotate(-12deg)',         filter: 'brightness(1.1) sepia(0.1) saturate(1.2) hue-rotate(60deg)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',                                    filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Mirror of dragon_slash_impact for dragon_slash_second — that slash
  // travels the opposite direction (top-left instead of top-right), so
  // the knockback and tilt are mirrored to match. Same filter/timing.
  dragon_slash_impact_reverse: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0, 0) rotate(0deg)',                                    filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
      { offset: 0.06, transform: 'translate(0, -14px) rotate(-5deg)',                               filter: 'brightness(3.4) sepia(1) saturate(6) hue-rotate(160deg)' },
      { offset: 0.14, transform: 'translate(-6px, -16px) rotate(0deg)',           filter: 'brightness(3) sepia(0.9) saturate(5.5) hue-rotate(160deg)' },
      { offset: 0.20, transform: 'translate(-13px, -17px) rotate(8deg)',          filter: 'brightness(2.6) sepia(0.8) saturate(4.8) hue-rotate(160deg)' },
      { offset: 0.225, transform: 'translate(-62px, -62px) rotate(17deg)',        filter: 'brightness(2.3) sepia(0.7) saturate(4.2) hue-rotate(160deg)' },
      { offset: 0.27, transform: 'translate(-47px, -47px) rotate(12deg)',        filter: 'brightness(2) sepia(0.6) saturate(3.6) hue-rotate(160deg)' },
      { offset: 0.5,  transform: 'translate(-47px, -47px) rotate(12deg)',        filter: 'brightness(1.5) sepia(0.35) saturate(2.2) hue-rotate(140deg)' },
      { offset: 0.85, transform: 'translate(-47px, -47px) rotate(12deg)',          filter: 'brightness(1.1) sepia(0.1) saturate(1.2) hue-rotate(60deg)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',                                    filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
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

  // Heal glow — green-tinted brightness/scale bloom. Same shape as
  // buff_glow (filter+scale), different hue-rotate curve.
  heal_glow: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    filter: 'brightness(1) saturate(1) hue-rotate(0deg)',      transform: 'scale(1)' },
      { offset: 0.20, filter: 'brightness(1.8) saturate(2) hue-rotate(100deg)',  transform: 'scale(1.03)' },
      { offset: 0.50, filter: 'brightness(1.5) saturate(1.8) hue-rotate(110deg)', transform: 'scale(1.02)' },
      { offset: 0.80, filter: 'brightness(1.2) saturate(1.3) hue-rotate(90deg)', transform: 'scale(1.01)' },
      { offset: 1,    filter: 'brightness(1) saturate(1) hue-rotate(0deg)',      transform: 'scale(1)' },
    ],
  },

  // Enemy-side speed dash — same shape as speed_dash_lunge but mirrored
  // (card dashes upward instead of down).
  speed_dash_lunge_up: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    filter: 'brightness(1) saturate(1)',     transform: 'scaleX(1) scaleY(1) translateY(0px)' },
      { offset: 0.20, filter: 'brightness(2.2) saturate(1.4)', transform: 'scaleX(0.96) scaleY(1.02) translateY(-32px)' },
      { offset: 0.58, filter: 'brightness(1.5) saturate(1.2)', transform: 'scaleX(0.97) scaleY(1.01) translateY(-20px)' },
      { offset: 1,    filter: 'brightness(1) saturate(1)',     transform: 'scaleX(1) scaleY(1) translateY(0px)' },
    ],
  },

  // Enemy-side speed dash marching stripes on ::after — mirrored direction
  // (march_up instead of march_down). Pairs with speed_dash_fade above.
  speed_dash_stripes_up: {
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
        backgroundPosition: '0% -22px, 100% -22px',
      },
    ],
  },

  // Tri ice slash — three vertical/horizontal ice hits, one continuous
  // preset (per the "treat multi-hit combos as one thing" decision).
  tri_ice_impact: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(-2px, -2px) rotate(-1deg)',   filter: 'brightness(2.8) hue-rotate(185deg) saturate(4)' },
      { offset: 0.07, transform: 'translate(2px, 1px) rotate(0.5deg)',    filter: 'brightness(1.8) hue-rotate(180deg) saturate(3)' },
      { offset: 0.13, transform: 'translate(-1px, 1px) rotate(-0.5deg)',  filter: 'brightness(1.4) hue-rotate(170deg) saturate(2.5)' },
      { offset: 0.18, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.2) hue-rotate(160deg) saturate(2)' },
      { offset: 0.20, transform: 'translate(3px, -2px) rotate(1deg)',     filter: 'brightness(3) hue-rotate(185deg) saturate(4.5)' },
      { offset: 0.26, transform: 'translate(-3px, 1px) rotate(-1deg)',    filter: 'brightness(1.9) hue-rotate(180deg) saturate(3.5)' },
      { offset: 0.32, transform: 'translate(2px, -1px) rotate(0.5deg)',   filter: 'brightness(1.5) hue-rotate(170deg) saturate(2.5)' },
      { offset: 0.37, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.3) hue-rotate(165deg) saturate(2.2)' },
      { offset: 0.40, transform: 'translate(-4px, -2px) rotate(-1.5deg)', filter: 'brightness(3.5) hue-rotate(190deg) saturate(5.5)' },
      { offset: 0.46, transform: 'translate(4px, 2px) rotate(1.5deg)',    filter: 'brightness(2.2) hue-rotate(185deg) saturate(4)' },
      { offset: 0.52, transform: 'translate(-3px, -1px) rotate(-1deg)',   filter: 'brightness(2.8) hue-rotate(182deg) saturate(4.5)' },
      { offset: 0.58, transform: 'translate(2px, 1px) rotate(0.5deg)',    filter: 'brightness(2) hue-rotate(178deg) saturate(3.5)' },
      { offset: 0.65, transform: 'translate(-1px, 0px) rotate(0deg)',     filter: 'brightness(1.6) hue-rotate(170deg) saturate(2.8)' },
      { offset: 0.74, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.4) hue-rotate(150deg) saturate(2.2)' },
      { offset: 0.84, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.2) hue-rotate(100deg) saturate(1.6)' },
      { offset: 0.93, transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1.1) hue-rotate(40deg) saturate(1.2)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1) hue-rotate(0deg) saturate(1)' },
    ],
  },

  // Cross flame strike — X-slash, both blades land at once. Hold (0-14%)
  // stripped; the JSON timeline entry fires this at start:224 to compensate.
  cross_flame_impact: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,      transform: 'translate(-4px, -3px) rotate(-2deg)',  filter: 'brightness(5.5) sepia(0.3) saturate(0) hue-rotate(0deg)' },
      { offset: 0.0698, transform: 'translate(4px, 3px) rotate(2deg)',     filter: 'brightness(3) sepia(1) saturate(6) hue-rotate(-30deg)' },
      { offset: 0.1395, transform: 'translate(-3px, -2px) rotate(-1deg)',  filter: 'brightness(4) sepia(1) saturate(7) hue-rotate(-32deg)' },
      { offset: 0.2093, transform: 'translate(3px, 1px) rotate(1deg)',     filter: 'brightness(2.2) sepia(1) saturate(5) hue-rotate(-26deg)' },
      { offset: 0.2791, transform: 'translate(-3px, 2px) rotate(-1deg)',   filter: 'brightness(3.5) sepia(1) saturate(6) hue-rotate(-30deg)' },
      { offset: 0.3488, transform: 'translate(2px, -2px) rotate(1deg)',    filter: 'brightness(2) sepia(1) saturate(5) hue-rotate(-25deg)' },
      { offset: 0.4186, transform: 'translate(-2px, 1px) rotate(-1deg)',   filter: 'brightness(3) sepia(1) saturate(5.5) hue-rotate(-28deg)' },
      { offset: 0.4884, transform: 'translate(2px, 0px) rotate(0deg)',     filter: 'brightness(1.8) sepia(0.9) saturate(4.5) hue-rotate(-22deg)' },
      { offset: 0.5581, transform: 'translate(-1px, -1px) rotate(-0.5deg)', filter: 'brightness(2.5) sepia(0.9) saturate(4) hue-rotate(-24deg)' },
      { offset: 0.6279, transform: 'translate(1px, 1px) rotate(0deg)',     filter: 'brightness(1.7) sepia(0.8) saturate(3.5) hue-rotate(-20deg)' },
      { offset: 0.7093, transform: 'translate(-1px, 0px) rotate(0deg)',    filter: 'brightness(2) sepia(0.7) saturate(3) hue-rotate(-18deg)' },
      { offset: 0.7907, transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1.4) sepia(0.4) saturate(2) hue-rotate(-10deg)' },
      { offset: 0.9186, transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
      { offset: 1,      transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Dual flame strike — two fire slashes (↘ then ↙), one continuous preset.
  // Hold (0-12%) stripped; the JSON timeline entry fires this at start:240.
  dual_flame_impact: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,      transform: 'translate(-4px, -3px) rotate(-2deg)', filter: 'brightness(4) sepia(1) saturate(6) hue-rotate(-30deg)' },
      { offset: 0.0682, transform: 'translate(3px, 2px) rotate(1deg)',    filter: 'brightness(1.8) sepia(1) saturate(4) hue-rotate(-25deg)' },
      { offset: 0.1364, transform: 'translate(-3px, -1px) rotate(-1deg)', filter: 'brightness(3) sepia(1) saturate(5) hue-rotate(-28deg)' },
      { offset: 0.2045, transform: 'translate(1px, 0px) rotate(0deg)',    filter: 'brightness(1.8) sepia(0.9) saturate(3.5) hue-rotate(-20deg)' },
      { offset: 0.2955, transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1.5) sepia(0.8) saturate(3) hue-rotate(-18deg)' },
      { offset: 0.3864, transform: 'translate(4px, -3px) rotate(2deg)',   filter: 'brightness(4.5) sepia(1) saturate(7) hue-rotate(-35deg)' },
      { offset: 0.4545, transform: 'translate(-3px, 2px) rotate(-1deg)',  filter: 'brightness(2) sepia(1) saturate(5) hue-rotate(-28deg)' },
      { offset: 0.5227, transform: 'translate(3px, -1px) rotate(1deg)',   filter: 'brightness(3.2) sepia(1) saturate(6) hue-rotate(-30deg)' },
      { offset: 0.5909, transform: 'translate(-2px, 1px) rotate(-1deg)',  filter: 'brightness(1.8) sepia(1) saturate(4.5) hue-rotate(-25deg)' },
      { offset: 0.6591, transform: 'translate(2px, 0px) rotate(0deg)',    filter: 'brightness(2.5) sepia(0.9) saturate(4) hue-rotate(-22deg)' },
      { offset: 0.7386, transform: 'translate(-1px, -1px) rotate(0deg)',  filter: 'brightness(2) sepia(0.8) saturate(3.5) hue-rotate(-20deg)' },
      { offset: 0.8182, transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1.4) sepia(0.4) saturate(2) hue-rotate(-10deg)' },
      { offset: 0.9318, transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
      { offset: 1,      transform: 'translate(0, 0) rotate(0deg)',        filter: 'brightness(1) sepia(0) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Stream slash disappear — attacker vanish, invisible hold while the
  // slash lands, reappear. Ends visible (opacity:1), fine with fill:'none'.
  // The target side just reuses heavy_shake (fired at start:900 in the
  // timeline JSON — no dedicated preset needed there).
  stream_slash_vanish: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: [
      { offset: 0,    transform: 'translateX(0)',     opacity: 1,    filter: 'brightness(1)' },
      { offset: 0.04, transform: 'translateX(-45px)', opacity: 0.9,  filter: 'brightness(1.8)' },
      { offset: 0.09, transform: 'translateX(45px)',  opacity: 0.85, filter: 'brightness(1.6)' },
      { offset: 0.14, transform: 'translateX(-60px)', opacity: 0.75, filter: 'brightness(2.2)' },
      { offset: 0.19, transform: 'translateX(60px)',  opacity: 0.6,  filter: 'brightness(1.9)' },
      { offset: 0.23, transform: 'translateX(-50px)', opacity: 0.45, filter: 'brightness(2.5)' },
      { offset: 0.27, transform: 'translateX(0)',     opacity: 0.28, filter: 'brightness(3.5)' },
      { offset: 0.33, transform: 'translateX(0)',     opacity: 0.1,  filter: 'brightness(5)' },
      { offset: 0.50, transform: 'translateX(0)',     opacity: 0,    filter: 'brightness(1)' },
      { offset: 0.78, transform: 'translateX(0)',     opacity: 0,    filter: 'brightness(1)' },
      { offset: 0.88, transform: 'translateX(0)',     opacity: 0.6,  filter: 'brightness(2)' },
      { offset: 1,    transform: 'translateX(0)',     opacity: 1,    filter: 'brightness(1)' },
    ],
  },

  // Shinsoku disappear — speed vanish that stays gone. Ends at opacity:0
  // and DELIBERATELY does not reset — fill:'forwards' so the character
  // stays invisible until something else (their next action, enemy_enter,
  // etc.) changes it. The one preset in this file that isn't fill:'none'.
  shinsoku_vanish: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
    keyframes: [
      { offset: 0,    transform: 'translateX(0)',     opacity: 1,    filter: 'brightness(1)' },
      { offset: 0.08, transform: 'translateX(-45px)', opacity: 0.9,  filter: 'brightness(1.8)' },
      { offset: 0.18, transform: 'translateX(45px)',  opacity: 0.85, filter: 'brightness(1.6)' },
      { offset: 0.27, transform: 'translateX(-60px)', opacity: 0.75, filter: 'brightness(2.2)' },
      { offset: 0.37, transform: 'translateX(60px)',  opacity: 0.6,  filter: 'brightness(1.9)' },
      { offset: 0.46, transform: 'translateX(-50px)', opacity: 0.45, filter: 'brightness(2.5)' },
      { offset: 0.54, transform: 'translateX(0)',     opacity: 0.28, filter: 'brightness(3.5)' },
      { offset: 0.65, transform: 'translateX(0)',     opacity: 0.1,  filter: 'brightness(5)' },
      { offset: 1,    transform: 'translateX(0)',     opacity: 0,    filter: 'brightness(1)' },
    ],
  },

  // Dragon hard step — a hard step to the left, angled forward toward
  // the opponent (Y uses --dir so it's forward for either side). Snaps
  // out fast then settles into the stepped stance and HOLDS there
  // (fill:'forwards') — this is footwork setting up for the slash that
  // follows immediately after, not a full step-and-return.
  dragon_hard_step: {
    easing: 'ease-out',
    fill: 'forwards',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px) rotate(0deg)',                                filter: 'brightness(1)' },
      { offset: 0.35, transform: 'translate(-55px, calc(var(--dir) * 35px)) rotate(-6deg)',         filter: 'brightness(1.6)' },
      { offset: 1,    transform: 'translate(-42px, calc(var(--dir) * 28px)) rotate(-3deg)',         filter: 'brightness(1)' },
    ],
  },

  // Dragon step right — a real positional dash to the right (110px, no
  // --dir, literal screen-right), not a stylized snap like dragon_hard_step.
  // Meant to pair with an afterimage.owner trail in the JSON so the real
  // cloned-DOM copies sell the distance covered. Holds at the new position.
  // offset 0 matches dragon_hard_step's own ending transform exactly (its
  // chain partner in dragon_side_step.json) so the handoff between them
  // doesn't pop back to origin — see dragon_hard_step's own last keyframe.
  dragon_step_right: {
    easing: 'ease-out',
    fill: 'forwards',
    keyframes: [
      { offset: 0,    transform: 'translate(-42px, calc(var(--dir) * 28px)) rotate(-3deg)', filter: 'brightness(1)' },
      { offset: 0.3,  transform: 'translate(110px, 0px) rotate(0deg)', filter: 'brightness(1)' },
      { offset: 1,    transform: 'translate(110px, 0px) rotate(0deg)', filter: 'brightness(1)' },
    ],
  },

  // Samurai hard step left/right — test presets for captureCurrentTransform
  // (see css_presets/index.js). Forward 100px (--dir) + 100px left/right,
  // written relative to --from-x/--from-y instead of a hardcoded starting
  // point, so either can chain after the other (or after anything else)
  // in any order and still continue correctly from wherever it actually
  // starts, with no manually-copied value like dragon_step_right needed.
  samurai_hard_step_left: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0, transform: 'translate(var(--from-x), var(--from-y))' },
      { offset: 1, transform: 'translate(calc(var(--from-x) - 100px), calc(var(--from-y) + var(--dir) * 100px))' },
    ],
  },
  samurai_hard_step_right: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0, transform: 'translate(var(--from-x), var(--from-y))' },
      { offset: 1, transform: 'translate(calc(var(--from-x) + 100px), calc(var(--from-y) + var(--dir) * 100px))' },
    ],
  },

  // Dragon step forward — steps forward (Y uses --dir, forward for
  // either side) while rotating 10deg clockwise mid-step, holds flat at
  // that 10deg angle and forward position, then slowly returns all the
  // way back to the resting position/angle by the end.
  dragon_step_forward: {
    easing: 'ease-out',
    fill: 'forwards',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px) rotate(0deg)' },
      { offset: 0.3,  transform: 'translate(0px, calc(var(--dir) * 90px)) rotate(10deg)' },
      { offset: 0.8,  transform: 'translate(0px, calc(var(--dir) * 90px)) rotate(10deg)' },
      { offset: 1,    transform: 'translate(0px, 0px) rotate(0deg)' },
    ],
  },

  // Dragon step forward, long-hold variant — same snap (~150ms) and same
  // return (~100ms) as dragon_step_forward in absolute time, tuned for
  // being stretched across a much longer duration (e.g. 1350ms in
  // dragon_slash_combo) so the snap doesn't slow down along with the hold.
  dragon_step_forward_hold: {
    easing: 'ease-out',
    fill: 'forwards',
    keyframes: [
      { offset: 0,     transform: 'translate(0px, 0px) rotate(0deg)' },
      { offset: 0.111, transform: 'translate(0px, calc(var(--dir) * 90px)) rotate(10deg)' },
      { offset: 0.926, transform: 'translate(0px, calc(var(--dir) * 90px)) rotate(10deg)' },
      { offset: 1,     transform: 'translate(0px, 0px) rotate(0deg)' },
    ],
  },

  // Gatotsu — fang thrust. No wind-up; frame 0 is already the impact
  // (target driven back), blade snaps out with a diminishing oscillation.
  gatotsu_thrust: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(18px, -1px) rotate(0.5deg)',  filter: 'brightness(3) saturate(0)' },
      { offset: 0.15, transform: 'translate(16px, 0px) rotate(0.3deg)',   filter: 'brightness(2) saturate(0.2)' },
      { offset: 0.25, transform: 'translate(14px, 0px) rotate(0.2deg)',   filter: 'brightness(1.5) saturate(0.5)' },
      { offset: 0.40, transform: 'translate(-5px, 0px) rotate(-0.5deg)',  filter: 'brightness(1.1) saturate(0.8)' },
      { offset: 0.54, transform: 'translate(6px, 0px) rotate(0.3deg)',    filter: 'brightness(1) saturate(1)' },
      { offset: 0.66, transform: 'translate(-3px, 0px) rotate(-0.2deg)',  filter: 'brightness(1) saturate(1)' },
      { offset: 0.78, transform: 'translate(2px, 0px) rotate(0.1deg)',    filter: 'brightness(1) saturate(1)' },
      { offset: 0.90, transform: 'translate(-1px, 0px) rotate(0deg)',     filter: 'brightness(1) saturate(1)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1) saturate(1)' },
    ],
  },

  // Gatotsu shock — thrust up, holds elevated, electricity builds, falls.
  // No wind-up; frame 0 is already the impact.
  gatotsu_shock_impact: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, -42px) rotate(-1deg)',    filter: 'brightness(3) saturate(0) hue-rotate(0deg)' },
      { offset: 0.06, transform: 'translate(0px, -40px) rotate(-0.7deg)',  filter: 'brightness(1.6) saturate(0.6) hue-rotate(0deg)' },
      { offset: 0.13, transform: 'translate(0px, -38px) rotate(-0.3deg)',  filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.22, transform: 'translate(0px, -38px) rotate(-0.2deg)',  filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.29, transform: 'translate(-1px, -38px) rotate(-0.3deg)', filter: 'brightness(2) saturate(0.4) hue-rotate(185deg)' },
      { offset: 0.34, transform: 'translate(1px, -37px) rotate(0.2deg)',   filter: 'brightness(1.4) saturate(1.8) hue-rotate(200deg)' },
      { offset: 0.40, transform: 'translate(-2px, -38px) rotate(-0.4deg)', filter: 'brightness(2.2) saturate(0.4) hue-rotate(185deg)' },
      { offset: 0.45, transform: 'translate(1px, -36px) rotate(0.2deg)',   filter: 'brightness(1.4) saturate(2) hue-rotate(195deg)' },
      { offset: 0.51, transform: 'translate(-1px, -37px) rotate(-0.2deg)', filter: 'brightness(2.5) saturate(0.3) hue-rotate(180deg)' },
      { offset: 0.56, transform: 'translate(2px, -35px) rotate(0.3deg)',   filter: 'brightness(1.5) saturate(1.8) hue-rotate(200deg)' },
      { offset: 0.63, transform: 'translate(0px, 10px) rotate(1deg)',      filter: 'brightness(1.2) saturate(1) hue-rotate(60deg)' },
      { offset: 0.71, transform: 'translate(0px, -10px) rotate(-0.6deg)',  filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.78, transform: 'translate(0px, 5px) rotate(0.4deg)',     filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.85, transform: 'translate(0px, -4px) rotate(-0.3deg)',   filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.91, transform: 'translate(0px, 2px) rotate(0.2deg)',     filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 0.96, transform: 'translate(0px, -1px) rotate(0deg)',      filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',           filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
    ],
  },

  // Gatotsu 2 — deeper thrust, driven further up, bigger snap-back
  // overshoot and slower-decaying oscillation than plain gatotsu.
  gatotsu_2_thrust: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, -42px) rotate(-1deg)',   filter: 'brightness(4) saturate(0)' },
      { offset: 0.12, transform: 'translate(0px, -38px) rotate(-0.7deg)', filter: 'brightness(2.5) saturate(0.1)' },
      { offset: 0.24, transform: 'translate(0px, -34px) rotate(-0.5deg)', filter: 'brightness(1.8) saturate(0.4)' },
      { offset: 0.34, transform: 'translate(0px, -28px) rotate(-0.3deg)', filter: 'brightness(1.3) saturate(0.7)' },
      { offset: 0.46, transform: 'translate(0px, 10px) rotate(1deg)',     filter: 'brightness(1.1) saturate(0.9)' },
      { offset: 0.57, transform: 'translate(0px, -12px) rotate(-0.6deg)', filter: 'brightness(1) saturate(1)' },
      { offset: 0.66, transform: 'translate(0px, 6px) rotate(0.4deg)',    filter: 'brightness(1) saturate(1)' },
      { offset: 0.75, transform: 'translate(0px, -5px) rotate(-0.3deg)',  filter: 'brightness(1) saturate(1)' },
      { offset: 0.83, transform: 'translate(0px, 3px) rotate(0.2deg)',    filter: 'brightness(1) saturate(1)' },
      { offset: 0.91, transform: 'translate(0px, -1px) rotate(-0.1deg)',  filter: 'brightness(1) saturate(1)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',          filter: 'brightness(1) saturate(1)' },
    ],
  },

  // Kuzu Ryusen — nine-headed dragon flash, 9 rapid vital-point strikes
  // ending in one bigger decisive blow. One continuous preset.
  kuzu_ryusen_barrage: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    transform: 'translate(-3px, -2px) rotate(-1deg)',  filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.05, transform: 'translate(1px, 1px) rotate(0.5deg)',   filter: 'brightness(1.2) saturate(0.7)' },
      { offset: 0.11, transform: 'translate(3px, -1px) rotate(1deg)',    filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.16, transform: 'translate(-1px, 2px) rotate(-0.5deg)', filter: 'brightness(1.2) saturate(0.7)' },
      { offset: 0.22, transform: 'translate(-4px, 2px) rotate(-1.5deg)', filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.27, transform: 'translate(2px, -2px) rotate(0.5deg)',  filter: 'brightness(1.15) saturate(0.8)' },
      { offset: 0.33, transform: 'translate(2px, -3px) rotate(1deg)',    filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.38, transform: 'translate(-2px, 1px) rotate(-0.5deg)', filter: 'brightness(1.15) saturate(0.8)' },
      { offset: 0.44, transform: 'translate(-2px, -1px) rotate(-1deg)',  filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.49, transform: 'translate(1px, 2px) rotate(0.5deg)',   filter: 'brightness(1.15) saturate(0.8)' },
      { offset: 0.55, transform: 'translate(4px, 1px) rotate(1.5deg)',   filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.60, transform: 'translate(-2px, -1px) rotate(-0.5deg)', filter: 'brightness(1.1) saturate(0.9)' },
      { offset: 0.66, transform: 'translate(-3px, 3px) rotate(-1deg)',   filter: 'brightness(1.35) saturate(0.1)' },
      { offset: 0.71, transform: 'translate(2px, -1px) rotate(0.5deg)',  filter: 'brightness(1.1) saturate(0.9)' },
      { offset: 0.77, transform: 'translate(3px, -2px) rotate(1deg)',    filter: 'brightness(1.5) saturate(0.1)' },
      { offset: 0.82, transform: 'translate(-1px, 1px) rotate(-0.3deg)', filter: 'brightness(1.05) saturate(1)' },
      { offset: 0.85, transform: 'translate(-5px, -4px) rotate(-2deg)',  filter: 'brightness(3.2) saturate(0)' },
      { offset: 0.93, transform: 'translate(2px, 3px) rotate(1deg)',     filter: 'brightness(1.5) saturate(0.4)' },
      { offset: 1,    transform: 'translate(0, 0) rotate(0deg)',         filter: 'brightness(1) saturate(1)' },
    ],
  },

  // Still Wind — gentle rise-and-settle breathing pulse, pale cyan bloom to
  // match the pixi wisps. Scales INWARD (contracts) rather than blooming
  // outward — reads as the card drawing the wind in, not swelling. One
  // breathing cycle (450ms); the timeline entry's `iterations` decides how
  // many breaths play.
  wind_lift: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,   transform: 'translateY(0px) scale(1)',      filter: 'brightness(1) saturate(1)' },
      { offset: 0.5, transform: 'translateY(-6px) scale(0.97)',  filter: 'brightness(1.3) saturate(1.15)' },
      { offset: 1,   transform: 'translateY(0px) scale(1)',      filter: 'brightness(1) saturate(1)' },
    ],
  },
};

export default SAMURAI_PRESETS;
