import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { ThumosInterpreter } from '../../vfx/ThumosInterpreter';
import PIXI_DATA from '../../vfx/pixi_data';

// ── Reference: manual spawnBurst (pre-ThumosInterpreter) ──────
function spawnBurst(app, x, y) {
  const COLORS = [0xff4444, 0xff8844, 0xffcc44, 0xffffff, 0xff6622];
  const COUNT = 45;
  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    const g = new PIXI.Graphics();
    const size = 2.5 + Math.random() * 5;
    g.circle(0, 0, size).fill(COLORS[Math.floor(Math.random() * COLORS.length)]);
    g.x = x; g.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 280;
    const maxLife = 0.55 + Math.random() * 0.45;
    particles.push({ g, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: maxLife, maxLife });
    app.stage.addChild(g);
  }
  const tick = (delta) => {
    const dt = delta / 60;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.g.x += p.vx * dt; p.g.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt;
      p.g.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) { app.stage.removeChild(p.g); p.g.destroy(); particles.splice(i, 1); }
    }
    if (particles.length === 0) app.ticker.remove(tick);
  };
  app.ticker.add(tick);
}

export default function EffectsLayer() {
  const appRef = useRef(null);
  const interpreterRef = useRef(null);

  useEffect(() => {
    if (appRef.current) return;

    let cancelled = false;
    let onPlay;
    const app = new PIXI.Application();

    app.init({
      backgroundAlpha: 0,
      resizeTo: window,
      autoDensity: true,
    }).then(() => {
      if (cancelled) { app.destroy(true); return; }

      Object.assign(app.canvas.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '100',
        background: 'transparent',
      });

      // Appended to document.body so position:fixed is relative to the viewport,
      // not the CSS-transformed GameCanvas ancestor.
      document.body.appendChild(app.canvas);
      appRef.current = app;
      interpreterRef.current = new ThumosInterpreter(app);

      onPlay = (e) => {
        const { x, y, animType, json: inlineJson } = e.detail;
        const json = inlineJson ?? PIXI_DATA[animType];
        if (json) interpreterRef.current.play(json, x, y);
        else spawnBurst(app, x, y);
      };
      window.addEventListener('play-thumos-animation', onPlay);
    });

    return () => {
      cancelled = true;
      if (onPlay) window.removeEventListener('play-thumos-animation', onPlay);
      interpreterRef.current?.stop();
      if (appRef.current) {
        try {
          if (app.canvas) app.canvas.style.display = 'none';
          if (app.canvas?.parentNode) document.body.removeChild(app.canvas);
        } catch (_) {}
        app.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return null;
}
