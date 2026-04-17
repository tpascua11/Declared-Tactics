import './CharacterSelectScreen.css';
import { useState, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import {
  CLASS_ICON_SAMURAI, CLASS_ICON_WARRIOR, CLASS_ICON_FIGHTER, CLASS_ICON_MONK,
  CLASS_ICON_ROGUE, CLASS_ICON_TEMPLAR, CLASS_ICON_PALADIN, CLASS_ICON_WIZARD,
  PORTRAIT_SUMURAI, PORTRAIT_PALADIN, PORTRAIT_ROGUE,
  PORTRAIT_WARRIOR, PORTRAIT_FIGHTER, PORTRAIT_MONK,
  PORTRAIT_TEMPLAR, PORTRAIT_WIZARD,
} from '../assets/index';

function useTypewriter(text, speed = 18, delay = 500) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    let intervalId;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(intervalId);
      }, speed);
    }, delay);
    return () => { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, [text, speed, delay]);
  return displayed;
}

// ── Character data ───────────────────────────────────────────────
const CHARACTER_DATA = {
  samurai: {
    name: 'Samurai', classTitle: 'Way of the Blade', icon: CLASS_ICON_SAMURAI, portrait: PORTRAIT_SUMURAI,
    bgStart: '45, 20, 25', bgEnd: '30, 15, 20', accent: '200, 80, 80',
    description: 'Bound by honor and the ancient code of Bushido, these warriors walk the path of perfect discipline. Their steel sings with the weight of generations—each strike a meditation, each victory a testament to unwavering resolve.',
  },
  warrior: {
    name: 'Warrior', classTitle: 'Master of Arms', icon: CLASS_ICON_WARRIOR, portrait: PORTRAIT_WARRIOR,
    bgStart: '25, 30, 40', bgEnd: '18, 22, 32', accent: '130, 150, 180',
    description: 'Forged in countless battles, the Warrior stands as an unbreakable wall between allies and annihilation. No tactic too simple, no enemy too formidable—they face the tide of war with raw strength and indomitable will.',
  },
  fighter: {
    name: 'Fighter', classTitle: 'Versatile Combatant', icon: CLASS_ICON_FIGHTER, portrait: PORTRAIT_FIGHTER,
    bgStart: '40, 28, 18', bgEnd: '30, 20, 14', accent: '210, 140, 80',
    description: 'Adaptable, relentless, unpredictable—the Fighter masters no single style but excels in all. From tavern brawls to duels of honor, they write their legend in sweat, blood, and the scars of a hundred different disciplines.',
  },
  monk: {
    name: 'Monk', classTitle: 'Disciple of Spirit', icon: CLASS_ICON_MONK, portrait: PORTRAIT_MONK,
    bgStart: '20, 35, 28', bgEnd: '15, 26, 20', accent: '100, 170, 130',
    description: 'Through years of meditation and physical perfection, Monks channel inner energy into devastating force. They need no weapon—their body is the instrument, their mind the forge where flesh and spirit become one.',
  },
  rogue: {
    name: 'Rogue', classTitle: 'Shadow Walker', icon: CLASS_ICON_ROGUE, portrait: PORTRAIT_ROGUE,
    bgStart: '30, 22, 38', bgEnd: '22, 16, 30', accent: '155, 120, 185',
    description: 'In the spaces between light and darkness, Rogues find their truth. Masters of misdirection and precision strikes, they turn the battlefield into a dance where only they know the steps—and the blade always finds its mark.',
  },
  templar: {
    name: 'Templar', classTitle: 'Holy Enforcer', icon: CLASS_ICON_TEMPLAR, portrait: PORTRAIT_TEMPLAR,
    bgStart: '35, 30, 18', bgEnd: '26, 22, 14', accent: '220, 185, 110',
    description: 'Sworn to sacred duty, Templars blend martial prowess with divine authority. They are the sword arm of faith itself—judging, purging, and protecting with the weight of conviction that burns brighter than any earthly fire.',
  },
  paladin: {
    name: 'Paladin', classTitle: 'Beacon of Light', icon: CLASS_ICON_PALADIN, portrait: PORTRAIT_PALADIN,
    bgStart: '28, 32, 42', bgEnd: '20, 24, 32', accent: '190, 210, 235',
    description: 'Radiating hope in the darkest hours, Paladins stand as living embodiments of courage and compassion. Their oath is their strength—shielding the innocent, smiting the wicked, and inspiring all who witness their luminous example.',
  },
  wizard: {
    name: 'Wizard', classTitle: 'Arcane Scholar', icon: CLASS_ICON_WIZARD, portrait: PORTRAIT_WIZARD,
    bgStart: '32, 24, 42', bgEnd: '24, 18, 32', accent: '160, 130, 220',
    description: 'Keepers of forbidden knowledge and weavers of reality itself, Wizards perceive the threads of magic that bind all existence. With gesture and word, they reshape the impossible—scholars whose curiosity rivals the stars themselves.',
  },
};

const LEFT_CARDS  = ['samurai', 'warrior', 'fighter', 'monk'];
const RIGHT_CARDS = ['rogue', 'templar', 'paladin', 'wizard'];
const LEFT_EMPTY  = 3;
const RIGHT_EMPTY = 4;
const UNLOCKED    = new Set(['samurai']);

// ── Card component ───────────────────────────────────────────────
function CharacterCard({ id, index, selectedId, onSelect }) {
  const data   = CHARACTER_DATA[id];
  const locked = !UNLOCKED.has(id);
  return (
    <article
      className={`character-card${selectedId === id ? ' selected' : ''}${locked ? ' locked' : ''}`}
      data-character={id}
      style={{ '--card-index': index }}
      onClick={() => !locked && onSelect(id)}
    >
      <div className="select-indicator" />
      <div className="portrait-container">
        <img className="portrait-icon" src={data.icon} alt={data.name} />
      </div>
      <div className="character-label">
        <span className="character-name">{locked ? 'LOCKED' : data.name}</span>
      </div>
      {locked && <div className="locked-overlay" />}
    </article>
  );
}

const EMPTY_DESC = `The vessel does not hold the essence... the essence becomes the vessel. You will know joy only as your class knows joy. You will know pain only as your class knows pain. You will know victory only as your class knows victory. These are not separate journeys woven together, wandering soul. They are one thread, one fate, one truth revealed.\n\nDo not ask what class you shall be. Ask instead what you have always been, hiding behind a name you had not yet spoken. Speak it now. Live it now. Become it now.`;

function TypewriterText({ text, className, style }) {
  const displayed = useTypewriter(text);
  return (
    <p className={className} style={style}>
      {displayed.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}
    </p>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function CharacterSelectScreen() {
  const { dispatch } = useGame();
  const { playerData, playerDispatch } = usePlayer();

  const [selectedId, setSelectedId]       = useState('samurai');
  const [showcasedId, setShowcasedId]     = useState('samurai');
  const [isTransitioning, setTransitioning] = useState(false);
  const [fadeOut, setFadeOut]             = useState(false);
  const [pendingMap, setPendingMap] = useState(false);

  // Preload all portraits on mount so swaps are instant
  useEffect(() => {
    Object.values(CHARACTER_DATA).forEach(({ portrait }) => {
      if (portrait) { const img = new Image(); img.src = portrait; }
    });
  }, []);

  // Step 2: once CONFIRM_CLASS has resolved and playerData is ready, go to map
  useEffect(() => {
    if (pendingMap && playerData) {
      dispatch({ type: 'GO_TO_MAP' });
      setPendingMap(false);
    }
  }, [pendingMap, playerData, dispatch]);

  const showDescription = useCallback((id) => {
    if (isTransitioning) return;
    setTransitioning(true);
    setFadeOut(true);
    setTimeout(() => {
      setShowcasedId(id);
      setFadeOut(false);
      setTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    showDescription(id);
  }, [showDescription]);

  const showcaseData  = showcasedId ? CHARACTER_DATA[showcasedId] : null;
  const fadeStyle     = { opacity: fadeOut ? 0 : 1, transform: fadeOut ? 'scale(0.95)' : 'scale(1)', transition: 'opacity 0.15s ease, transform 0.15s ease' };
  const fadeTextStyle = { opacity: fadeOut ? 0 : 1, transform: fadeOut ? 'translateY(5px)' : 'translateY(0)', transition: 'opacity 0.15s ease, transform 0.15s ease' };

  return (
    <div className="char-select-screen">
      {/* Atmosphere */}
      <div className="atmosphere" />
      <div className="corners" />
      <div className="corners-bottom" />

      {/* Header */}
      <header className="cs-header">
        <h1 className="page-title">Choose Your Class</h1>
        <p className="page-subtitle">Select Your Path</p>
        <div className="header-divider">
          <div className="divider-line" />
          <div className="divider-diamond" />
          <div className="divider-line" />
        </div>
      </header>

      {/* Main */}
      <main className="character-selection-container">
        <div className="selection-layout">

          {/* Left panel */}
          <aside className="side-panel left-panel">
            {LEFT_CARDS.map((id, i) => (
              <CharacterCard key={id} id={id} index={i} selectedId={selectedId} onSelect={handleSelect} />
            ))}
            {Array.from({ length: LEFT_EMPTY }, (_, i) => (
              <div key={i} className="empty-slot" />
            ))}
          </aside>

          {/* Center showcase */}
          <section
            className="center-showcase"
            style={showcaseData ? {
              '--showcase-accent':   showcaseData.accent,
              '--showcase-bg-start': showcaseData.bgStart,
              '--showcase-bg-end':   showcaseData.bgEnd,
            } : {}}
          >
            <div className={`showcase-portrait${!showcaseData ? ' showcase-portrait--empty' : ''}`} style={fadeStyle}>
              {showcaseData && (
                showcaseData.portrait
                  ? <img className="showcase-portrait-img" src={showcaseData.portrait} alt={showcaseData.name} />
                  : <div className="large-portrait-placeholder">{showcaseData.icon}</div>
              )}
            </div>
            {!showcaseData && (
              <div className="showcase-info showcase-info--empty">
                <h2 className="showcase-name showcase-name--empty">Choose Your Path</h2>
                <TypewriterText text={EMPTY_DESC} className="showcase-description" />
              </div>
            )}
            {showcaseData && (
              <>
                <div className="showcase-info">
                  <h2 className="showcase-name" style={fadeTextStyle}>{showcaseData.name}</h2>
                  <p className="showcase-class" style={fadeTextStyle}>{showcaseData.classTitle}</p>
                  <TypewriterText text={showcaseData.description} className="showcase-description" style={fadeTextStyle} />
                </div>
                <button
                  className="start-button"
                  type="button"
                  onClick={() => {
                    // Step 1: build + persist the player — GO_TO_MAP fires once playerData is ready
                    playerDispatch({ type: 'CONFIRM_CLASS', classId: selectedId });
                    setPendingMap(true);
                  }}
                >
                  <span className="start-text">START</span>
                  <span className="start-glow" />
                </button>
              </>
            )}
          </section>

          {/* Right panel */}
          <aside className="side-panel right-panel">
            {RIGHT_CARDS.map((id, i) => (
              <CharacterCard key={id} id={id} index={LEFT_CARDS.length + i} selectedId={selectedId} onSelect={handleSelect} />
            ))}
            {Array.from({ length: RIGHT_EMPTY }, (_, i) => (
              <div key={i} className="empty-slot" />
            ))}
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="cs-footer">
        <span>Declared Tactics</span>
        <span>Avormore</span>
      </footer>
    </div>
  );
}
