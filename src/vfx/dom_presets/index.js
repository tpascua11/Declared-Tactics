// ============================================================
//  DOM Presets — the spawner family (creates new DOM nodes, vs css
//  presets which animate the one existing element). Channel legend,
//  config.dom entry contract, containment rule:
//  todo/css_animation_philosophy.txt — read before adding a preset.
//  A dom preset is a FUNCTION (el, params) → { finish(), cancel() },
//  not a keyframes object like CSS_PRESETS. finish() = soft stop (no
//  more spawns, in-flight visuals self-remove) — the engine calls it
//  at the chain's real end. cancel() = hard removal — unmount only.
// ============================================================

import { afterimage_trail } from './afterimage_trail';

export const DOM_PRESETS = { afterimage_trail };

// Screens must call clearAllDomSpawns() on unmount.
const liveHandles = new Set();

// ALWAYS play dom presets through here, never the preset module
// directly — this enrolls the spawn in unmount cleanup. The engine
// holds the returned handle and finish()es it at the chain's real end.
// Either stop un-enrolls the handle; a finished spawn needs nothing
// from unmount cleanup (its visuals self-remove).
export function playDomPreset(name, el, params = {}) {
  const preset = DOM_PRESETS[name];
  if (!preset || !el) return null;
  const inner = preset(el, params);
  const handle = {
    finish() {
      liveHandles.delete(handle);
      inner.finish();
    },
    cancel() {
      liveHandles.delete(handle);
      inner.cancel();
    },
  };
  liveHandles.add(handle);
  return handle;
}

export function clearAllDomSpawns() {
  [...liveHandles].forEach(handle => handle.cancel());
}

export default DOM_PRESETS;
