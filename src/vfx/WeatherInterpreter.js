import * as PIXI from 'pixi.js';

function lerp(a, b, t) { return a + (b - a) * t; }

// Kept separate from ThumosInterpreter's identical copy on purpose —
// ThumosInterpreter is meant to be portable to other apps, so nothing
// else in vfx/ should depend on it, and it shouldn't depend on anything else.
const DRAW_FNS = {
  square:    (g, sz, c) => g.rect(-sz/2, -sz/2, sz, sz).fill(c),
  circle:    (g, sz, c) => g.circle(0, 0, sz/2).fill(c),
  spark:     (g, sz, c) => g.rect(-sz, -sz*0.06, sz*2, sz*0.12).fill(c),
  star:      (g, sz, c) => g.star(0, 0, 4, sz, sz * 0.4, Math.PI / 4).fill(c),
  snowflake: (g, sz, c) => g.star(0, 0, 6, sz, sz * 0.35, 0).fill(c),
};

// Continuous full-viewport ambient emitter (snow, rain, ...), driven by
// WEATHER_REGISTRY configs. Particles recycle to the top once they fall
// past the bottom of the screen and keep going until stop() is called —
// unlike ThumosInterpreter's one-shot bursts, which are timed and anchored
// to a target/owner position.
export class WeatherInterpreter {
  constructor(app) {
    this._app = app;
    this._layer = null;
  }

  play(config) {
    this.stop();
    const drawParticle = DRAW_FNS[config.shape] ?? DRAW_FNS.snowflake;
    const container = new PIXI.Container();
    this._app.stage.addChild(container);

    const width  = this._app.screen.width;
    const height = this._app.screen.height;
    const particles = [];

    // angle: degrees off straight-down, positive leans the fall to the right
    // (e.g. rain blown sideways). Horizontal drift is derived from how far a
    // particle has fallen since its last (re)spawn, not accumulated velocity,
    // so it resets cleanly whenever a particle recycles to the top.
    const angleRad = (config.angle ?? 0) * Math.PI / 180;
    // How far a full-height fall drifts sideways at this angle — particles
    // spawn across this wider band so the screen has no empty edge once
    // drift is applied, and rotate to visually point along their fall line.
    const driftSpan = height * Math.abs(Math.tan(angleRad));
    const rotation = Math.PI / 2 - angleRad;

    // Full-viewport dark tint, drawn under the particles — redrawn each tick
    // so it tracks window resizes without a separate resize listener.
    // holeGfx sits directly above it with blendMode 'erase': when a particle
    // config sets glowRadius, each particle punches a soft pool of light out
    // of the tint at its own live position (a few concentric erase circles
    // of falling alpha — cheap falloff, avoids rebuilding a gradient texture
    // every frame). No external position source needed, unlike the DOM-card
    // version in todo/shining_in_the_dark.txt — particles already know where
    // they are.
    const tintGfx = config.tint ? new PIXI.Graphics() : null;
    const holeGfx = config.tint ? new PIXI.Graphics() : null;
    if (tintGfx) container.addChild(tintGfx);
    if (holeGfx) { holeGfx.blendMode = 'erase'; container.addChild(holeGfx); }

    const makeParticle = (initY) => {
      const sz = lerp(config.sizeMin ?? 3, config.sizeMax ?? 8, Math.random());
      const g = new PIXI.Graphics();
      drawParticle(g, sz, config.color ?? 0xffffff);
      if (config.additive) g.blendMode = 'add';
      g.alpha = config.opacity ?? 0.85;
      g.rotation = rotation;
      const baseX = Math.random() * (width + 2 * driftSpan) - driftSpan;
      g.x = baseX;
      g.y = initY;
      container.addChild(g);
      particles.push({
        g, baseX, spawnY: initY,
        vy: lerp(config.speedMin ?? 30, config.speedMax ?? 80, Math.random()),
        wavePhase: Math.random() * Math.PI * 2,
      });
    };

    for (let i = 0; i < (config.count ?? 60); i++) makeParticle(Math.random() * height);

    let last = performance.now();
    const tickerFn = () => {
      const now = performance.now();
      const dt = Math.min((now - last) * 0.001, 0.05);
      last = now;
      const w = this._app.screen.width, h = this._app.screen.height;
      if (tintGfx) {
        tintGfx.clear();
        tintGfx.rect(0, 0, w, h).fill({ color: config.tint.color, alpha: config.tint.opacity });
        holeGfx.clear();
        if (config.glowRadius) {
          const r = config.glowRadius;
          for (const p of particles) {
            holeGfx.circle(p.g.x, p.g.y, r).fill({ color: 0xffffff, alpha: 0.35 });
            holeGfx.circle(p.g.x, p.g.y, r * 0.6).fill({ color: 0xffffff, alpha: 0.4 });
            holeGfx.circle(p.g.x, p.g.y, r * 0.3).fill({ color: 0xffffff, alpha: 0.35 });
          }
        }
      }
      for (const p of particles) {
        p.g.y += p.vy * dt;
        const drift = (p.g.y - p.spawnY) * Math.tan(angleRad);
        const sway  = Math.sin(p.g.y * (config.waveFreq ?? 0.6) * 0.02 + p.wavePhase) * (config.waveAmp ?? 0);
        p.g.x = p.baseX + drift + sway;
        if (p.g.y > h + 10) {
          p.g.y = -10;
          p.spawnY = -10;
          p.baseX = Math.random() * (w + 2 * driftSpan) - driftSpan;
        }
      }
    };
    this._app.ticker.add(tickerFn);
    this._layer = { container, tickerFn };
  }

  stop() {
    if (!this._layer) return;
    this._app.ticker.remove(this._layer.tickerFn);
    this._app.stage.removeChild(this._layer.container);
    this._layer.container.destroy({ children: true });
    this._layer = null;
  }
}
