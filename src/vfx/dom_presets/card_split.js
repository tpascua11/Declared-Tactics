// Spawner-family preset — entry contract + containment rule:
// todo/css_animation_philosophy.txt. Single cut only (see that file's
// discussion of why crossed/nested cuts are a separate, harder problem
// deferred for later).
//
// NOT a strobe like afterimage_trail: one spawn, at call time, done.
// Clips the card into two convex halves along a line through its
// center at `angle`, then flings each half away from that line and
// fades it out. This preset only spawns the two half-clones — it does
// not touch the real element's visibility. Hiding/fading the original
// card is the caller's job (a css.owner entry on the same timeline
// entry, scheduled at the same "start").

// Clips a convex polygon (rectangle corners) to the half-plane where
// dot(point - center, normal) has the given sign. Sutherland-Hodgman,
// single edge. `keepPositive` picks which side survives.
function clipToHalfPlane(points, center, normal, keepPositive) {
  const side = (p) => {
    const d = (p.x - center.x) * normal.x + (p.y - center.y) * normal.y;
    return keepPositive ? d >= 0 : d <= 0;
  };
  const intersect = (a, b) => {
    const da = (a.x - center.x) * normal.x + (a.y - center.y) * normal.y;
    const db = (b.x - center.x) * normal.x + (b.y - center.y) * normal.y;
    const t = da / (da - db);
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  };
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + points.length) % points.length];
    const currIn = side(curr);
    const prevIn = side(prev);
    if (currIn) {
      if (!prevIn) out.push(intersect(prev, curr));
      out.push(curr);
    } else if (prevIn) {
      out.push(intersect(prev, curr));
    }
  }
  return out;
}

// Rectangle [0,0]-[w,h] cut by a line through its center at `angleDeg`
// off horizontal. Returns the two half-polygons as clip-path
// percentage strings, plus each half's outward unit normal (for
// separation direction).
function splitRect(w, h, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const center = { x: w / 2, y: h / 2 };
  // Normal to the cut line — the axis the two halves fly apart along.
  const normal = { x: -Math.sin(rad), y: Math.cos(rad) };
  const corners = [
    { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h },
  ];
  const toClipPath = (poly) =>
    `polygon(${poly.map(p => `${(p.x / w) * 100}% ${(p.y / h) * 100}%`).join(', ')})`;
  return [
    { clipPath: toClipPath(clipToHalfPlane(corners, center, normal, true)), normal: { x: normal.x, y: normal.y } },
    { clipPath: toClipPath(clipToHalfPlane(corners, center, normal, false)), normal: { x: -normal.x, y: -normal.y } },
  ];
}

export function card_split(el, { angle = 0, separation = 80, rotation = 8, duration = 250, fadeDuration = 200, fadeEasing = 'ease-out', desaturate = 1 } = {}) {
  const live = [];

  if (el) {
    const rect = el.getBoundingClientRect();
    const transform = getComputedStyle(el).transform;
    const zIndex = getComputedStyle(el).zIndex || '1';
    // Same untransformed-anchor math as afterimage_trail's ghost stamp —
    // see that file for the derivation (rotation/scale never move the
    // center; observed AABB vs. own-matrix AABB isolates ancestor scale).
    const m = transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const ownAabbW = w * Math.abs(m.a) + h * Math.abs(m.c);
    const s = ownAabbW > 0 ? rect.width / ownAabbW : 1;
    const baseLeft = rect.left + rect.width / 2 - s * m.m41 - w / 2;
    const baseTop = rect.top + rect.height / 2 - s * m.m42 - h / 2;
    const baseTransform = transform === 'none' ? `scale(${s})` : `scale(${s}) ${transform}`;

    const halves = splitRect(w, h, angle);
    halves.forEach(({ clipPath, normal }, i) => {
      const clone = el.cloneNode(true);
      clone.removeAttribute('data-enemy-id');
      clone.removeAttribute('data-character-id');
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${baseLeft}px`,
        top: `${baseTop}px`,
        width: `${w}px`,
        height: `${h}px`,
        margin: '0',
        pointerEvents: 'none',
        clipPath,
        transform: baseTransform,
        zIndex,
        opacity: '1',
      });
      document.body.appendChild(clone);

      const dx = normal.x * separation;
      const dy = normal.y * separation;
      const rDeg = i === 0 ? rotation : -rotation;
      const moveEndOffset = duration / (duration + fadeDuration);
      const anim = clone.animate(
        [
          { transform: `${baseTransform} translate(0px, 0px) rotate(0deg)`, opacity: 1, filter: 'saturate(1)', offset: 0 },
          { transform: `${baseTransform} translate(${dx}px, ${dy}px) rotate(${rDeg}deg)`, opacity: 1, filter: `saturate(${desaturate})`, offset: moveEndOffset },
          { transform: `${baseTransform} translate(${dx}px, ${dy}px) rotate(${rDeg}deg)`, opacity: 0, filter: `saturate(${desaturate})`, offset: 1 },
        ],
        { duration: duration + fadeDuration, easing: fadeEasing, fill: 'forwards' }
      );
      const piece = { clone, anim };
      live.push(piece);
      anim.onfinish = () => {
        clone.remove();
        const idx = live.indexOf(piece);
        if (idx !== -1) live.splice(idx, 1);
      };
    });
  }

  return {
    // Nothing ongoing to stop — the split is a single spawn, not a
    // strobe. Kept for contract symmetry with other dom presets; live
    // pieces finish their own fade untouched.
    finish() {},
    // Hard stop (unmount only): remove any halves still mid-flight.
    cancel() {
      live.forEach(({ clone }) => clone.remove());
      live.length = 0;
    },
  };
}

export default card_split;
