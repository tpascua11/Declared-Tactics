// ============================================================
//  Enemy Samurai CSS Presets — attack approaches specific to enemy
//  samurai variants (currently: ferret). See css_presets/index.js for
//  the "impact frame" concept + playPreset().
// ============================================================

export const ENEMY_SAMURAI_PRESETS = {
  // Ferret pounce — split into 3 chained timeline entries (see
  // ferret_slice.json's css.owner) instead of one preset, because
  // playPreset() bakes a single easing onto every keyframe: one shared
  // preset can't give the forward snap and the return drift genuinely
  // different curves, only different durations. Splitting means each
  // phase gets its own easing.

  // 1. Side-to-side wiggle, settles back to center.
  ferret_wiggle: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,     transform: 'translate(0px, 0px)' },
      { offset: 0.290, transform: 'translate(-50px, 0px)' },
      { offset: 0.581, transform: 'translate(50px, 0px)' },
      { offset: 0.839, transform: 'translate(-31px, 0px)' },
      { offset: 1,     transform: 'translate(0px, 0px)' },
    ],
  },

  // 2. Fast forward snap toward --dir — short duration + ease-out (bursts
  // immediately, decelerates right into the hit) is what actually reads
  // as "snappy", not just a short duration on its own.
  ferret_lunge_snap: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0, transform: 'translate(0px, 0px)' },
      { offset: 1, transform: 'translate(0px, calc(var(--dir) * 26px))' },
    ],
  },

  // 3. Slow drift back to rest after the snap.
  ferret_return: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, transform: 'translate(0px, calc(var(--dir) * 26px))' },
      { offset: 1, transform: 'translate(0px, 0px)' },
    ],
  },

  // Ferret flame slash approach — 3 chained timeline entries (see
  // ferret_flame_slash.json's css.owner), same reasoning as ferret_pounce's
  // split: one preset can't give each phase its own easing.

  // 1. Zig-zag: forward-left, then forward-right, ending recentered on X
  // but already advanced forward — the follow-up lunge continues from here,
  // not from (0,0), so their translate values must match at the boundary.
  ferret_zigzag: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px)' },
      { offset: 0.35, transform: 'translate(-90px, calc(var(--dir) * 28px))' },
      { offset: 0.70, transform: 'translate(90px, calc(var(--dir) * 56px))' },
      { offset: 1,    transform: 'translate(0px, calc(var(--dir) * 56px))' },
    ],
  },

  // 2. Fast final snap forward, starting from the zigzag's ending offset —
  // this is the bigger finishing lunge the flame impact lands on.
  ferret_flame_lunge: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0, transform: 'translate(0px, calc(var(--dir) * 56px))' },
      { offset: 1, transform: 'translate(0px, calc(var(--dir) * 82px))' },
    ],
  },

  // 3. Slow drift back to rest after the flame lunge lands.
  ferret_flame_return: {
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, transform: 'translate(0px, calc(var(--dir) * 82px))' },
      { offset: 1, transform: 'translate(0px, 0px)' },
    ],
  },
};

export default ENEMY_SAMURAI_PRESETS;
