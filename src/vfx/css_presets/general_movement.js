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

  // No --from-x/--from-y on purpose: BattleScreen doesn't call
  // captureCurrentTransform yet (only VfxEditorScreen does), so a preset
  // meant for real battles has to start/end at rest instead of chaining.
  // distance/power stay unmultiplied against each other — applyDynamicVars
  // gives both a px unit, and px*px isn't a valid calc() length.
  snap: {
    easing: 'ease-out',
    keyframes: [
      { offset: 0,    transform: 'translate(0px, 0px)' },
      { offset: 0.28, transform: 'translate(0px, calc(var(--dir) * var(--distance)))' },
      { offset: 0.55, transform: 'translate(0px, calc(var(--dir) * -1 * var(--power)))' },
      { offset: 0.80, transform: 'translate(0px, calc(var(--dir) * 0.35 * var(--power)))' },
      { offset: 1,    transform: 'translate(0px, 0px)' },
    ],
  },
};

export default GENERAL_MOVEMENT_PRESETS;
