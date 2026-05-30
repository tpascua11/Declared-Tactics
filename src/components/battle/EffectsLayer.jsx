import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function EffectsLayer() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      view: canvasRef.current,
      backgroundAlpha: 0,
      resizeTo: window,
      antialias: true,
      autoDensity: true,
    });
    appRef.current = app;

    return () => {
      app.destroy(false);
      appRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
}
