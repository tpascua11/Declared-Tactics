// ============================================================
//  Shared CSS Presets — used across multiple classes, or engine-wide
//  (not tied to any specific character class).
//  See css_presets/index.js for the "impact frame" concept + playPreset().
// ============================================================

export const SHARED_PRESETS = {
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

  // Fizzle — cancelled action, a quick opacity/brightness flicker.
  fizzle_flicker: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    opacity: 1,   filter: 'brightness(1)' },
      { offset: 0.30, opacity: 0.6, filter: 'brightness(1.4) saturate(0.5)' },
      { offset: 0.60, opacity: 0.3, filter: 'brightness(0.8) saturate(0)' },
      { offset: 1,    opacity: 1,   filter: 'brightness(1)' },
    ],
  },

  // Sidestep — evaded attack, a quick horizontal dodge-and-settle wobble.
  sidestep_dodge: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px)',   opacity: 1 },
      { offset: 0.12, transform: 'translate(-22px, 0px)', opacity: 0.25 },
      { offset: 0.28, transform: 'translate(28px, 0px)',  opacity: 0.2 },
      { offset: 0.44, transform: 'translate(-18px, 0px)', opacity: 0.3 },
      { offset: 0.60, transform: 'translate(14px, 0px)',  opacity: 0.5 },
      { offset: 0.76, transform: 'translate(-8px, 0px)',  opacity: 0.75 },
      { offset: 0.88, transform: 'translate(4px, 0px)',   opacity: 0.9 },
      { offset: 1,    transform: 'translate(0px, 0px)',   opacity: 1 },
    ],
  },

  // Enemy enter — drop-in with an overshoot settle, engine-wide (any
  // faction). Used when new enemies join the battlefield.
  enemy_enter_drop: {
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    keyframes: [
      { offset: 0,    opacity: 0,    transform: 'translateY(-220px) scale(0.88)', filter: 'brightness(3) saturate(0)' },
      { offset: 0.35, opacity: 0.85, transform: 'translateY(12px) scale(1.04)',   filter: 'brightness(1.8) saturate(0.5)' },
      { offset: 0.58, opacity: 1,    transform: 'translateY(-5px) scale(0.98)',   filter: 'brightness(1.3) saturate(1)' },
      { offset: 0.78, opacity: 1,    transform: 'translateY(3px) scale(1.01)',    filter: 'brightness(1.1) saturate(1)' },
      { offset: 1,    opacity: 1,    transform: 'translateY(0) scale(1)',         filter: 'brightness(1) saturate(1)' },
    ],
  },
};

export default SHARED_PRESETS;
