import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

function spawnBurst(app, x, y) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffffff);
  g.drawCircle(0, 0, 30);
  g.endFill();
  g.x = x;
  g.y = y;
  app.stage.addChild(g);

  let life = 0.6;
  const tick = (delta) => {
    life -= delta / 60;
    g.alpha = Math.max(0, life / 0.6);
    if (life <= 0) {
      app.stage.removeChild(g);
      g.destroy();
      app.ticker.remove(tick);
    }
  };
  app.ticker.add(tick);
}

export default function EffectsLayer() {
  const appRef = useRef(null);

  useEffect(() => {
    if (appRef.current) return;

    const app = new PIXI.Application({
      backgroundAlpha: 0,
      resizeTo: window,
      autoDensity: true,
    });

    Object.assign(app.view.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '100',
    });

    // Appended to document.body so position:fixed is relative to the viewport,
    // not the CSS-transformed GameCanvas ancestor.
    document.body.appendChild(app.view);
    appRef.current = app;

    const onParticle = (e) => spawnBurst(app, e.detail.x, e.detail.y);
    window.addEventListener('battle-particle', onParticle);

    return () => {
      window.removeEventListener('battle-particle', onParticle);
      document.body.removeChild(app.view);
      app.destroy(true);
      appRef.current = null;
    };
  }, []);

  return null;
}
