import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function EffectsLayer() {
  const containerRef = useRef(null);
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

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    return () => {
      app.destroy(true);
      appRef.current = null;
    };
  }, []);

  return <div ref={containerRef} />;
}
