import './TitleScreen.css';

// ── Particle configs (computed once at module load) ──────────────
const COLORS = [
  [212, 168,  75], [232, 197, 109], [201, 166, 105],
  [155, 139, 171], [175, 159, 191], [140, 120, 165],
  [108, 180, 190], [130, 200, 210], [195, 130, 150],
  [215, 150, 170], [100, 170, 130], [120, 190, 145],
  [180, 130, 100], [200, 150, 120], [120, 150, 195],
  [140, 170, 215], [220, 185, 110], [240, 208, 144],
];

function buildCardConfig() {
  const bg = [];
  const fg = [];

  // Seed cards: just 3 already mid-fall so the screen isn't completely bare
  for (let i = 0; i < 3; i++) {
    const color = COLORS[i % COLORS.length];
    bg.push({
      color,
      colorAlpha: 0.18 + Math.random() * 0.10,
      left: (i * 33 + Math.random() * 10) % 100,
      delay: -(3 + Math.random() * 6),
      fallDuration: 12 + Math.random() * 5,
      swayDuration: 3.5 + Math.random() * 2.0,
      startRot: (Math.random() - 0.5) * 28,
      endRot:   (Math.random() - 0.5) * 28,
      maxOpacity: 0.28 + Math.random() * 0.12,
      size: (w => [w, Math.round(w * 1.5)])(40 + Math.floor(Math.random() * 14)),
    });
  }

  // Storm wave: 95 bg cards spreading over 0→55 s with a gentle linear-ish curve
  // so density builds slowly and steadily before plateauing into a full downpour.
  for (let i = 0; i < 190; i++) {
    const color = COLORS[i % COLORS.length];
    const t     = i / 189;
    const delay = 4 + Math.pow(t, 0.75) * 116;
    bg.push({
      color,
      colorAlpha: 0.14 + Math.random() * 0.20,
      left: Math.random() * 100,
      delay,
      fallDuration: 9 + Math.random() * 6,
      swayDuration: 3.0 + Math.random() * 2.5,
      startRot: (Math.random() - 0.5) * 38,
      endRot:   (Math.random() - 0.5) * 38,
      maxOpacity: 0.26 + Math.random() * 0.28,
      size: (w => [w, Math.round(w * 1.5)])(36 + Math.floor(Math.random() * 20)),
    });
  }

  // Foreground cards: fewer, larger, more opaque — appear in front of title/menu.
  // Stagger their entry across the same buildup window so they join the storm gradually too.
  for (let i = 0; i < 36; i++) {
    const color = COLORS[i % COLORS.length];
    const t     = i / 35;
    const delay = 4 + Math.pow(t, 0.75) * 116;
    fg.push({
      color,
      colorAlpha: 0.28 + Math.random() * 0.18,
      left: Math.random() * 100,
      delay,
      fallDuration: 10 + Math.random() * 7,
      swayDuration: 3.5 + Math.random() * 2.5,
      startRot: (Math.random() - 0.5) * 30,
      endRot:   (Math.random() - 0.5) * 30,
      maxOpacity: 0.38 + Math.random() * 0.25,
      size: (w => [w, Math.round(w * 1.5)])(46 + Math.floor(Math.random() * 22)),
    });
  }

  return { bg, fg };
}

const { bg: BG_CARDS, fg: FG_CARDS } = buildCardConfig();

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

export default function TitleScreen({ onNewGame, hasSave, onContinue }) {

  return (
    <div className="title-screen">
      {/* Overlays */}
      <div className="overlay-layer crt-warmth" />
      <div className="overlay-layer vignette" />

      {/* Background falling cards (behind title) */}
      <div className="particle-container cards-rain">
        {BG_CARDS.map((cfg, i) => (
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
          {hasSave && (
            <button className="menu-btn" onClick={onContinue}>
              Continue
            </button>
          )}
          <button className="menu-btn" onClick={onNewGame}>
            New Game
          </button>
        </nav>
      </div>

      {/* Foreground falling cards (in front of title/menu) */}
      <div className="particle-container cards-rain-fg">
        {FG_CARDS.map((cfg, i) => (
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

      {/* Footer */}
      <div className="title-footer">
        <span>v0.1.0</span>
        <span>© 2026</span>
      </div>

    </div>
  );
}
