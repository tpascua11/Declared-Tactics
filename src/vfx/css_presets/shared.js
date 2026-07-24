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
  // Shared by samurai_sheath (Battojutsu) and the generic buff animation.
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
  // Darts front-loaded (done by ~0.46) so the ghost-to-solid fade gets the
  // back ~54% of the run — a longer lingering recovery at the same total.
  sidestep_dodge: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px)',   opacity: 1 },
      { offset: 0.10, transform: 'translate(-30px, 0px)', opacity: 0.25 },
      { offset: 0.22, transform: 'translate(36px, 0px)',  opacity: 0.2 },
      { offset: 0.34, transform: 'translate(-24px, 0px)', opacity: 0.3 },
      { offset: 0.46, transform: 'translate(18px, 0px)',  opacity: 0.35 },
      { offset: 0.66, transform: 'translate(-10px, 0px)', opacity: 0.55 },
      { offset: 0.84, transform: 'translate(5px, 0px)',   opacity: 0.8 },
      { offset: 1,    transform: 'translate(0px, 0px)',   opacity: 1 },
    ],
  },

  // box-shadow (not border-color) because every card sets its own resting
  // border-color inline — box-shadow can start/end at 0 alpha regardless
  // of that base color. NOT inset — the card's portrait <img> is
  // absolute/inset-0 and would hide an inset shadow underneath it.
  // Second box-shadow layer is the "bounce-off" ripple, tinted faintly
  // steel-blue so it reads as metal rather than generic light.
  steel_deflect_ring: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    boxShadow: '0 0 0px 0px rgba(255,255,255,0),    0 0 0px 0px rgba(210,230,255,0)' },
      { offset: 0.03, boxShadow: '0 0 6px 8px rgba(255,255,255,1),    0 0 4px 6px rgba(210,230,255,0.9)' },
      { offset: 0.12, boxShadow: '0 0 0px 5px rgba(255,255,255,0.95), 0 0 2px 20px rgba(210,230,255,0.4)' },
      { offset: 0.30, boxShadow: '0 0 0px 5px rgba(255,255,255,0.95), 0 0 0px 38px rgba(210,230,255,0)' },
      { offset: 0.75, boxShadow: '0 0 0px 5px rgba(255,255,255,0.95), 0 0 0px 38px rgba(210,230,255,0)' },
      { offset: 1,    boxShadow: '0 0 0px 0px rgba(255,255,255,0),    0 0 0px 38px rgba(210,230,255,0)' },
    ],
  },

  // Steel deflect recoil — single damped nudge, the card physically
  // absorbing the blow. Deliberately NOT heavy_shake (that reads as "took
  // damage"); one compress + tiny overshoot + settle. Runs as its own short
  // timeline entry (~180ms) alongside steel_deflect_ring — transform vs
  // boxShadow, so the two WAAPI animations don't fight.
  steel_deflect_recoil: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'scale(1) translate(0px, 0px)' },
      { offset: 0.18, transform: 'scale(0.96) translate(2px, 1px)' },
      { offset: 0.55, transform: 'scale(1.01) translate(0px, 0px)' },
      { offset: 1,    transform: 'scale(1) translate(0px, 0px)' },
    ],
  },

  // Steel deflect flash — white ::before wash, the metallic "clang" glint
  // on the card face at the impact frame. Starts already bright at offset 0
  // (impact, no ease-in) and just decays — harai_flash shape, but white and
  // front-loaded. Runs as its own short timeline entry (~140ms).
  steel_deflect_flash: {
    easing: 'ease-out',
    pseudoElement: '::before',
    keyframes: [
      { offset: 0, opacity: 0.55, background: '#ffffff' },
      { offset: 1, opacity: 0,    background: '#ffffff' },
    ],
  },

  // Attack lunge — attacker leans toward its target a bit and settles back.
  // Uses --dir (set per-element from faction, see vfx/direction.js) so one
  // preset serves both player and enemy instead of a hand-mirrored pair.
  attack_lunge: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translateY(0px)' },
      { offset: 0.35, transform: 'translateY(calc(var(--dir) * 22px))' },
      { offset: 1,    transform: 'translateY(0px)' },
    ],
  },

  // Like attack_lunge, but distance comes from --distance (a `distance`
  // field on the JSON entry) instead of a hardcoded number.
  dynamic_lunge: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translateY(0px)' },
      { offset: 0.35, transform: 'translateY(calc(var(--dir) * var(--distance)))' },
      { offset: 1,    transform: 'translateY(0px)' },
    ],
  },

  // Straight through — split into 2 chained timeline entries (see
  // straight_through.json's css.owner) instead of one preset with a
  // teleport-via-close-offsets trick: that version shared one easing
  // across both legs, so whichever curve made the exit feel right (fast
  // launch, ease-in) made the return spend most of its time still
  // off-screen before rushing into view right at the very end — the
  // trailing afterimages had nothing visible to land on for most of the
  // return. Splitting gives the return its own ease-out (fast start, so
  // it's back in view immediately) independent of the exit's ease-in.

  // 1. Exit — rushes off-screen (150vh, viewport-relative, clears any
  // window size) toward --dir and holds there (fill:'forwards') until the
  // return preset's own first keyframe takes over the transform — no gap,
  // so no visible snap-back to origin in between.
  straight_through_exit: {
    easing: 'ease-in',
    fill: 'forwards',
    keyframes: [
      { offset: 0, transform: 'translateY(0px)' },
      { offset: 1, transform: 'translateY(calc(var(--dir) * 150vh))' },
    ],
  },

  // 2. Return — starts already at the OPPOSITE edge (-150vh): taking over
  // the transform the instant this preset starts IS the teleport, no
  // interpolation needed. Ends back at rest, so default fill:'none' is
  // fine — no cleanup needed, same reasoning as every other preset.
  straight_through_return: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0, transform: 'translateY(calc(var(--dir) * -150vh))' },
      { offset: 1, transform: 'translateY(0px)' },
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
