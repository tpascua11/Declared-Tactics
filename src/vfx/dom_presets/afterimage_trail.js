// Spawner-family preset — entry contract + containment rule:
// todo/css_animation_philosophy.txt. "start" is deliberately not
// handled here; the engine schedules entry.start, same division of
// labor as css timeline entries.
//
// DISTANCE SAMPLER, not a clock: ghosts spawn per `spacing` px of the
// element's OBSERVED travel (getBoundingClientRect each frame — never
// the css channel's config). Timing's entire footprint is `duration`,
// which only stops the watcher loop; it shapes nothing. A stationary
// element spawns nothing. Every ghost is self-terminating (fades, then
// removes itself) — no engine bookkeeping of nodes, only of the loop.
//
// A ghost is a FRAME CAPTURE: layout-size box anchored at the card's
// untransformed center, with the whole computed transform matrix stamped
// on as-is — so mid-flight rotation/scale/skew replay for free, nothing
// decomposed per-property. Travel is measured between CENTERS because
// rotation inflates the AABB and drifts its corner without any motion.

export function afterimage_trail(el, { duration = 400, spacing = 40, count = 5, fadeDuration = 300, fadeEasing = 'ease-out', opacity = 0.45 } = {}) {
  const live = []; // oldest-first ghosts still on screen
  let rafId = null;

  if (el) {
    const zIndex = getComputedStyle(el).zIndex || '1';

    const spawn = ({ rect, transform }) => {
      const clone = el.cloneNode(true);
      // Ghosts must never be findable as real characters.
      clone.removeAttribute('data-enemy-id');
      clone.removeAttribute('data-character-id');
      // Rotation/scale about the default center origin never move the
      // center — only translation (m41/m42) does. So observed center minus
      // translation = untransformed anchor, and the matrix re-applies
      // cleanly on top with nothing double-counted. offsetWidth/Height,
      // not rect.width/height: the rect is the transform-inflated AABB.
      const m = transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // The ghost hangs on document.body, OUTSIDE GameCanvas's fit-scale
      // wrapper, and the card's own matrix can't see that ancestor scale —
      // but the rect can: observed AABB width over the AABB width the own
      // matrix alone would produce. Assumes the ancestor scale is uniform
      // (GameCanvas's is). Everything screen-space gets multiplied by it:
      // the composed transform and the translation inside the anchor math.
      const ownAabbW = w * Math.abs(m.a) + h * Math.abs(m.c);
      const s = ownAabbW > 0 ? rect.width / ownAabbW : 1;
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${rect.left + rect.width / 2 - s * m.m41 - w / 2}px`,
        top: `${rect.top + rect.height / 2 - s * m.m42 - h / 2}px`,
        width: `${w}px`,
        height: `${h}px`,
        margin: '0',
        pointerEvents: 'none',
        transform: transform === 'none' ? `scale(${s})` : `scale(${s}) ${transform}`,
        zIndex,
        opacity: '0',
      });
      document.body.appendChild(clone);
      const anim = clone.animate(
        [{ opacity }, { opacity: 0 }],
        { duration: fadeDuration, easing: fadeEasing, fill: 'forwards' }
      );
      const ghost = { clone, anim };
      live.push(ghost);
      anim.onfinish = () => {
        clone.remove();
        const i = live.indexOf(ghost);
        if (i !== -1) live.splice(i, 1);
      };
      // count = hard cap on ghosts alive at once — evict by jumping the
      // oldest to the end of its own fade (its onfinish still cleans up).
      while (live.length > count) live.shift().anim.finish();
    };

    const sample = () => ({
      rect: el.getBoundingClientRect(),
      transform: getComputedStyle(el).transform,
    });

    let last = sample();
    let departed = false;
    const deadline = performance.now() + duration;

    const tick = (now) => {
      if (now >= deadline) {
        rafId = null;
        return;
      }
      const cur = sample();
      const traveled = Math.hypot(
        (cur.rect.left + cur.rect.width / 2) - (last.rect.left + last.rect.width / 2),
        (cur.rect.top + cur.rect.height / 2) - (last.rect.top + last.rect.height / 2)
      );
      if (!departed && traveled >= 1) {
        // Departure ghost — left where the body WAS at the first sign of
        // movement, not spacing-px later (the old t=0 spawn's one virtue,
        // kept without spawning on a card that never moves at all).
        departed = true;
        spawn(last);
      }
      if (traveled >= spacing) {
        last = cur;
        spawn(cur);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  const stopWatcher = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  };

  return {
    // Soft stop: watcher off, living ghosts finish dying on their own —
    // exactly what happens when the duration window lapses naturally.
    finish() {
      stopWatcher();
    },
    // Hard stop (unmount only): the screen the ghosts float over is gone.
    cancel() {
      stopWatcher();
      live.forEach(({ clone }) => clone.remove());
      live.length = 0;
    },
  };
}

export default afterimage_trail;
