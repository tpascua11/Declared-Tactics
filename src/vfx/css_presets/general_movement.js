// Class-agnostic movement bricks. Rules for every preset in this file:
// pure repositioning only (no rotate/filter/flavor), chain-safe
// (relative to --from-x/--from-y), all magnitudes from JSON entry
// params (applyDynamicVars). See todo/css_animation_philosophy.txt.

export const GENERAL_MOVEMENT_PRESETS = {
  // step-y is forward-relative (toward the opponent); step-x is raw
  // screen-space. Speed = the JSON entry's duration.
  basic_step: {
    easing: 'ease-out',
    fill: 'forwards',
    keyframes: [
      { offset: 0, transform: 'translate(var(--from-x), var(--from-y))' },
      { offset: 1, transform: 'translate(calc(var(--from-x) + var(--step-x, 0px)), calc(var(--from-y) + var(--dir) * var(--step-y, 0px)))' },
    ],
  },
};

export default GENERAL_MOVEMENT_PRESETS;
