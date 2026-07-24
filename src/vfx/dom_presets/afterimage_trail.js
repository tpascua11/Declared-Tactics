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

export function afterimage_trail(el, { duration = 400, spacing = 40, count = 5, fadeDuration = 300, fadeEasing = 'ease-out', opacity = 0.45 } = {}) {
  const live = []; // oldest-first ghosts still on screen
  let rafId = null;

  if (el) {
    const zIndex = getComputedStyle(el).zIndex || '1';

    const spawn = (rect) => {
      const clone = el.cloneNode(true);
      // Ghosts must never be findable as real characters.
      clone.removeAttribute('data-enemy-id');
      clone.removeAttribute('data-character-id');
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        pointerEvents: 'none',
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

    let lastRect = el.getBoundingClientRect();
    let departed = false;
    const deadline = performance.now() + duration;

    const tick = (now) => {
      if (now >= deadline) {
        rafId = null;
        return;
      }
      const rect = el.getBoundingClientRect();
      const traveled = Math.hypot(rect.left - lastRect.left, rect.top - lastRect.top);
      if (!departed && traveled >= 1) {
        // Departure ghost — left where the body WAS at the first sign of
        // movement, not spacing-px later (the old t=0 spawn's one virtue,
        // kept without spawning on a card that never moves at all).
        departed = true;
        spawn(lastRect);
      }
      if (traveled >= spacing) {
        lastRect = rect;
        spawn(rect);
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
