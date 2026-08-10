// ============================================================
//  GameCanvas — 1920×1080 scaled canvas, centered on any screen
//
//  Future: accept an `expanded` prop (or read from a context)
//  to allow the user to override the scale cap and go fullscreen.
// ============================================================

import { useState, useEffect } from 'react';

export default function GameCanvas({ children }) {
  const [scale, setScale] = useState(
    () => Math.min(1, window.innerWidth / 1920, window.innerHeight / 1080)
  );

  useEffect(() => {
    const onResize = () =>
      setScale(Math.min(1, window.innerWidth / 1920, window.innerHeight / 1080));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000000', position: 'relative' }}>
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          position: 'absolute',
          top: '50%',
          left: '50%',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 24px rgba(255, 255, 255, 0.08)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
