import * as PIXI from 'pixi.js';

function lerp(a, b, t) { return a + (b - a) * t; }

// Kept separate from ThumosInterpreter's identical copy on purpose —
// ThumosInterpreter is meant to be portable to other apps, so nothing
// else in vfx/ should depend on it, and it shouldn't depend on anything else.
const DRAW_FNS = {
  square:    (g, sz, c) => g.rect(-sz/2, -sz/2, sz, sz).fill(c),
  circle:    (g, sz, c) => g.circle(0, 0, sz/2).fill(c),
  spark:     (g, sz, c) => g.rect(-sz, -sz*0.15, sz*2, sz*0.3).fill(c),
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

    // Full-viewport dark tint, drawn under the particles — redrawn each tick
    // so it tracks window resizes without a separate resize listener.
    const tintGfx = config.tint ? new PIXI.Graphics() : null;
    if (tintGfx) container.addChild(tintGfx);

    const makeParticle = (initY) => {
      const sz = lerp(config.sizeMin ?? 3, config.sizeMax ?? 8, Math.random());
      const g = new PIXI.Graphics();
      drawParticle(g, sz, 0xffffff);
      g.alpha = config.opacity ?? 0.85;
      const baseX = Math.random() * width;
      g.x = baseX;
      g.y = initY;
      container.addChild(g);
      particles.push({
        g, baseX,
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
      }
      for (const p of particles) {
        p.g.y += p.vy * dt;
        p.g.x = p.baseX + Math.sin(p.g.y * (config.waveFreq ?? 0.6) * 0.02 + p.wavePhase) * (config.waveAmp ?? 20);
        if (p.g.y > h + 10) {
          p.g.y = -10;
          p.baseX = Math.random() * w;
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
