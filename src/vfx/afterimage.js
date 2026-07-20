// Real multi-copy motion trail. Unlike css_presets (which only describe
// ONE element's own animation via calc()/keyframes), a true afterimage
// needs actual extra DOM nodes — a WAAPI preset can't spawn elements, only
// animate an existing one. spawnAfterimageTrail clones `el` `count` times,
// staggered `spacing` ms apart. Each clone's position is captured with
// getBoundingClientRect() AT ITS OWN SPAWN TIME, inside its setTimeout —
// not once upfront — because `el` is actively mid-flight (translateY via
// WAAPI) while these timers are pending, so a later spawn genuinely
// captures a further-along position. That's what makes the ghosts trail
// along the whole path instead of clustering at the launch point.

// Pending spawn timers — exposed so a screen unmount can cancel them,
// mirroring the animClearTimersRef pattern BattleScreen already uses.
const afterimageTimers = [];

export function spawnAfterimageTrail(el, { count = 3, spacing = 60, fadeDuration = 300, opacity = 0.45 } = {}) {
  if (!el) return;
  const zIndex = getComputedStyle(el).zIndex || '1';

  for (let i = 0; i < count; i++) {
    const spawnDelay = i * spacing;
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const clone = el.cloneNode(true);
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
        { duration: fadeDuration, easing: 'ease-out', fill: 'forwards' }
      );
      anim.onfinish = () => clone.remove();
    }, spawnDelay);
    afterimageTimers.push(timer);
  }
}

export function clearAfterimageTimers() {
  afterimageTimers.forEach(clearTimeout);
  afterimageTimers.length = 0;
}
