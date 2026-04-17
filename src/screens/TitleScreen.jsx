import { useState } from 'react';
import './TitleScreen.css';
import { useGame } from '../context/GameContext';
import CardShowerTransition from '../components/shared/CardShowerTransition';

// ── Particle configs (computed once at module load) ──────────────
const CARD_CONFIG = [
  { color: [212, 168,  75], left:  8, delay:   0, fallDuration: 14, swayDuration: 4.0, startRot:  -8, endRot:   5, maxOpacity: 0.50, size: [44, 62] },
  { color: [232, 197, 109], left: 22, delay:  -3, fallDuration: 17, swayDuration: 4.5, startRot:  12, endRot:  -6, maxOpacity: 0.45, size: [52, 72] },
  { color: [201, 166, 105], left: 76, delay:  -7, fallDuration: 13, swayDuration: 3.8, startRot:  -5, endRot:  10, maxOpacity: 0.40, size: [46, 64] },
  { color: [155, 139, 171], left: 45, delay:  -2, fallDuration: 16, swayDuration: 5.0, startRot:  15, endRot:  -8, maxOpacity: 0.48, size: [50, 70] },
  { color: [175, 159, 191], left: 88, delay:  -9, fallDuration: 19, swayDuration: 4.2, startRot: -10, endRot:   7, maxOpacity: 0.42, size: [42, 58] },
  { color: [140, 120, 165], left: 12, delay: -11, fallDuration: 15, swayDuration: 4.7, startRot:   7, endRot: -12, maxOpacity: 0.46, size: [48, 66] },
  { color: [108, 180, 190], left: 58, delay:  -5, fallDuration: 18, swayDuration: 5.2, startRot: -14, endRot:   9, maxOpacity: 0.44, size: [46, 64] },
  { color: [130, 200, 210], left: 33, delay: -13, fallDuration: 15, swayDuration: 3.9, startRot:  11, endRot:  -5, maxOpacity: 0.38, size: [44, 60] },
  { color: [195, 130, 150], left: 68, delay:  -8, fallDuration: 16, swayDuration: 4.4, startRot:  -7, endRot:  11, maxOpacity: 0.47, size: [50, 68] },
  { color: [215, 150, 170], left:  5, delay: -15, fallDuration: 20, swayDuration: 5.0, startRot:   9, endRot:  -9, maxOpacity: 0.41, size: [42, 58] },
  { color: [100, 170, 130], left: 82, delay:  -4, fallDuration: 17, swayDuration: 4.6, startRot: -12, endRot:   6, maxOpacity: 0.43, size: [46, 64] },
  { color: [120, 190, 145], left: 38, delay: -10, fallDuration: 14, swayDuration: 4.1, startRot:   6, endRot: -10, maxOpacity: 0.39, size: [44, 60] },
  { color: [180, 130, 100], left: 92, delay:  -6, fallDuration: 18, swayDuration: 4.8, startRot:  -9, endRot:   8, maxOpacity: 0.45, size: [48, 66] },
  { color: [200, 150, 120], left: 18, delay: -12, fallDuration: 15, swayDuration: 4.3, startRot:  13, endRot:  -7, maxOpacity: 0.42, size: [44, 62] },
  { color: [120, 150, 195], left: 52, delay:  -1, fallDuration: 19, swayDuration: 5.1, startRot: -11, endRot:  10, maxOpacity: 0.44, size: [50, 68] },
  { color: [140, 170, 215], left: 72, delay: -14, fallDuration: 16, swayDuration: 4.0, startRot:   8, endRot: -11, maxOpacity: 0.37, size: [42, 58] },
  { color: [220, 185, 110], left: 28, delay: -17, fallDuration: 21, swayDuration: 5.3, startRot:  -6, endRot:  12, maxOpacity: 0.35, size: [40, 56] },
  { color: [240, 208, 144], left: 62, delay: -19, fallDuration: 17, swayDuration: 4.5, startRot:  10, endRot:  -8, maxOpacity: 0.33, size: [38, 54] },
].map(cfg => ({ ...cfg, colorAlpha: 0.25 + Math.random() * 0.15 }));

const EMBER_CONFIG = [
  { left: 20, top: 80, color: '#d4a84b', delay: 0.0, duration: 11 },
  { left: 70, top: 85, color: '#e8c56d', delay: 2.0, duration: 13 },
  { left: 45, top: 75, color: '#c9956c', delay: 4.0, duration: 10 },
  { left: 85, top: 70, color: '#d4765a', delay: 1.0, duration: 14 },
  { left: 15, top: 65, color: '#ddb988', delay: 3.0, duration: 12 },
  { left: 55, top: 82, color: '#d4a84b', delay: 5.0, duration: 11 },
  { left: 35, top: 78, color: '#e0a87c', delay: 2.5, duration: 13 },
  { left: 65, top: 72, color: '#c98c64', delay: 4.5, duration: 12 },
  { left: 28, top: 88, color: '#bf6a4f', delay: 6.0, duration: 11 },
  { left: 78, top: 76, color: '#f0d090', delay: 3.5, duration: 14 },
];

export default function TitleScreen() {
  const { dispatch } = useGame();
  const [transitioning, setTransitioning] = useState(false);

  return (
    <div className="title-screen">
      {/* Overlays */}
      <div className="overlay-layer crt-warmth" />
      <div className="overlay-layer vignette" />

      {/* Falling cards */}
      <div className="particle-container cards-rain">
        {CARD_CONFIG.map((cfg, i) => (
          <div
            key={i}
            className="falling-card"
            style={{
              '--card-rgb':       cfg.color.join(','),
              '--card-color':     `rgba(${cfg.color.join(',')}, ${cfg.colorAlpha.toFixed(2)})`,
              '--fall-duration':  `${cfg.fallDuration}s`,
              '--sway-duration':  `${cfg.swayDuration}s`,
              '--start-rot':      `${cfg.startRot}deg`,
              '--end-rot':        `${cfg.endRot}deg`,
              '--max-opacity':    cfg.maxOpacity,
              '--delay':          `${cfg.delay}s`,
              left:               `${cfg.left}%`,
              width:              `${cfg.size[0]}px`,
              height:             `${cfg.size[1]}px`,
            }}
          />
        ))}
      </div>

      {/* Embers */}
      <div className="particle-container particles">
        {EMBER_CONFIG.map((cfg, i) => (
          <div
            key={i}
            className="ember"
            style={{
              '--ember-color':    cfg.color,
              '--ember-duration': `${cfg.duration}s`,
              '--delay':          `${cfg.delay}s`,
              left:               `${cfg.left}%`,
              top:                `${cfg.top}%`,
            }}
          />
        ))}
      </div>

      {/* Corner ornaments */}
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      {/* Main content */}
      <div className="screen">
        <div className="title-block">
          <div className="title-main">Declared Tactics</div>
          <div className="title-world">Avormore</div>
          <div className="title-divider">
            <div className="divider-line" />
            <div className="divider-diamond" />
            <div className="divider-line" />
          </div>
        </div>

        <nav className="menu">
          <button
            className="menu-btn"
            onClick={() => setTransitioning(true)}
          >
            New Game
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="title-footer">
        <span>v0.1.0</span>
        <span>© 2026</span>
      </div>

      {transitioning && (
        <CardShowerTransition onDone={() => dispatch({ type: 'START_NEW_GAME' })} />
      )}
    </div>
  );
}
