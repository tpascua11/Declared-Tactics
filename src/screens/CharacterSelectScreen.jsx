import './CharacterSelectScreen.css';
import '../components/shared/shine-btn.css';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { playUiSfx, sfx, playSelectSfx } from '../battle/animationRegistry';
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
    name: 'Samurai', classTitle: 'Battle Spirit', icon: CLASS_ICON_SAMURAI, portrait: PORTRAIT_SUMURAI,
    bgStart: '45, 20, 25', bgEnd: '30, 15, 20', accent: '200, 80, 80',
    description: 'No orders. No master. No memory of a life before the road. The Samurai walks anyway, drawn forward by something that has no name and asks for no reason. It burns in the chest whether the mind wants it to or not. Some warriors train for years to find that fire. This one just woke up with it, and kept moving.',
    tooltip: 'Battle Spirit — The longer the Samurai endures in battle, the more their Battle Spirit rises. Spend it to unleash devastating slashes that grow stronger with every blow survived.',
  },
  warrior: {
    name: 'Warrior', classTitle: 'Temper', icon: CLASS_ICON_WARRIOR, portrait: PORTRAIT_WARRIOR,
    bgStart: '25, 30, 40', bgEnd: '18, 22, 32', accent: '130, 150, 180',
    description: 'Every battle leaves a mark. The Warrior knows this better than anyone. They have the scars to prove it, inside and out. What keeps them going is not glory or purpose or some promise waiting at the end of the road. Something builds in them with every fight, every hit taken, every enemy that made them work for it. It grows. It hardens. And lately, standing over a finished battle, catching their breath, the Warrior keeps noticing something they cannot quite name',
    tooltip: 'Class mechanic coming soon.',
  },
  fighter: {
    name: 'Fighter', classTitle: 'Guts', icon: CLASS_ICON_FIGHTER, portrait: PORTRAIT_FIGHTER,
    bgStart: '40, 28, 18', bgEnd: '30, 20, 14', accent: '210, 140, 80',
    description: "He has never been the best at anything. That used to bother him more than it does now. Somewhere along the way he stopped measuring himself against the ones who had a gift and started measuring himself against yesterday. What he knows is that every time something should have stopped him and didn't, something in him got a little harder to stop. Lately it has been showing up faster than the thing trying to put him down.",
    tooltip: 'Class mechanic coming soon.',
  },
  monk: {
    name: 'Monk', classTitle: 'Flow', icon: CLASS_ICON_MONK, portrait: PORTRAIT_MONK,
    bgStart: '20, 35, 28', bgEnd: '15, 26, 20', accent: '100, 170, 130',
    description: 'Not the most graceful fighter in the room. Not yet. But something keeps pulling him back into it, past the bruises and the losses and the moments that should have been enough to quit. Every now and then the chaos settles, just for a second, into something that feels less like brawling and more like breathing. He does not have a word for it yet. But he knows what it feels like. And he wants more.',
    tooltip: 'Class mechanic coming soon.',
  },
  rogue: {
    name: 'Rogue', classTitle: 'Stride', icon: CLASS_ICON_ROGUE, portrait: PORTRAIT_ROGUE,
    bgStart: '30, 22, 38', bgEnd: '22, 16, 30', accent: '155, 120, 185',
    description: "She doesn't know where she's going. That stopped feeling like a problem a while ago, which might be its own kind of problem. When she moves, something moves with her. Not behind her, not ahead, just with. Like the space between places has a current and she found it without looking. Lately it has been pulling harder than usual. Toward something. She doesn't know what.",    tooltip: 'Class mechanic coming soon.',
  },
  templar: {
    name: 'Templar', classTitle: 'Brazier', icon: CLASS_ICON_TEMPLAR, portrait: PORTRAIT_TEMPLAR,
    bgStart: '35, 30, 18', bgEnd: '26, 22, 14', accent: '220, 185, 110',
    description: "He knows what he is supposed to feel. That is not the same as feeling it, but the difference has always been small enough not to matter. Something in his chest burns at the right moments, responds correctly to the things it is supposed to respond to. He was made well. What he cannot account for is the heat that stays after it should have gone. He does not know if that is a flaw or an emergence. He is not sure those are different things.",
    tooltip: 'Class mechanic coming soon.',
  },
  paladin: {
    name: 'Paladin', classTitle: 'Chalice', icon: CLASS_ICON_PALADIN, portrait: PORTRAIT_PALADIN,
    bgStart: '28, 32, 42', bgEnd: '20, 24, 32', accent: '190, 210, 235',
    description: 'Nobody appointed him. Nobody handed him a destiny with a ribbon on it. He decided. That is the part that keeps him awake, wondering if deciding is enough, if wanting it this badly means something or nothing. The old ones had gods to confirm them. He has only himself. And whatever it is that fills when he chooses to believe it. Which is everything, until the doubt comes back',
    tooltip: 'Class mechanic coming soon.',
  },
  wizard: {
    name: 'Wizard', classTitle: 'Oculus', icon: CLASS_ICON_WIZARD, portrait: PORTRAIT_WIZARD,
    bgStart: '32, 24, 42', bgEnd: '24, 18, 32', accent: '160, 130, 220',
    description: "He has been doing this longer than most people have been alive. There is always another spell to learn, another theory to pull apart, another quiet hour watching magic do something it was not supposed to do. He never got tired of it. That part still surprises him. There is something underneath all of it. A secret the magic keeps almost telling him. He has been chasing it his whole life without meaning to. Something feels different lately. He does not know what that means yet.",
    tooltip: 'Class mechanic coming soon.',
  },
};

const LEFT_CARDS  = ['samurai', 'warrior', 'fighter', 'monk'];
const RIGHT_CARDS = ['rogue', 'templar', 'paladin', 'wizard'];
const LEFT_EMPTY  = 3;
const RIGHT_EMPTY = 4;
const PLAYABLE    = new Set(['samurai']);

// ── Card component ───────────────────────────────────────────────
function CharacterCard({ id, index, selectedId, onSelect, previewMode }) {
  const data   = CHARACTER_DATA[id];
  const locked = !PLAYABLE.has(id) && !previewMode;
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
        <span className="character-name">{data.name}</span>
        {locked && <span className="unwritten-label">Unwritten</span>}
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
  const { playerDispatch } = usePlayer();

  const [selectedId, setSelectedId]         = useState('samurai');
  const [showcasedId, setShowcasedId]       = useState('samurai');
  const [isTransitioning, setTransitioning] = useState(false);
  const [fadeOut, setFadeOut]               = useState(false);
  const [previewMode, setPreviewMode]       = useState(false);
  const holdTimer = useRef(null);
  // Preload all portraits on mount so swaps are instant
  useEffect(() => {
    Object.values(CHARACTER_DATA).forEach(({ portrait }) => {
      if (portrait) { const img = new Image(); img.src = portrait; }
    });
  }, []);

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
    playSelectSfx();
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
              <CharacterCard key={id} id={id} index={i} selectedId={selectedId} onSelect={handleSelect} previewMode={previewMode} />
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
                {PLAYABLE.has(selectedId) ? (
                  <button
                    className="start-button shine-btn"
                    type="button"
                    onClick={() => {
                      playUiSfx(sfx('START_1.wav'), 0.7);
                      playerDispatch({ type: 'CONFIRM_CLASS', classId: selectedId });
                      dispatch({ type: 'GO_TO_MAP' });
                    }}
                  >
                    <span className="start-text">START</span>
                  </button>
                ) : (
                  <button className="start-button start-button--unwritten" type="button" disabled>
                    <span className="start-text">UNWRITTEN</span>
                  </button>
                )}
              </>
            )}
          </section>

          {/* Right panel */}
          <aside className="side-panel right-panel">
            {RIGHT_CARDS.map((id, i) => (
              <CharacterCard key={id} id={id} index={LEFT_CARDS.length + i} selectedId={selectedId} onSelect={handleSelect} previewMode={previewMode} />
            ))}
            {Array.from({ length: RIGHT_EMPTY }, (_, i) => (
              <div key={i} className="empty-slot" />
            ))}
          </aside>

        </div>
      </main>

      {/* Secret preview toggle */}
      <button
        className={`preview-toggle${previewMode ? ' preview-toggle--active' : ''}`}
        type="button"
        onMouseDown={() => { holdTimer.current = setTimeout(() => setPreviewMode(p => !p), 1000); }}
        onMouseUp={() => clearTimeout(holdTimer.current)}
        onMouseLeave={() => clearTimeout(holdTimer.current)}
      >
        {previewMode ? '[ HIDE SECRET PREVIEW ]' : '[ SECRET PREVIEW ]'}
      </button>

      {/* Footer */}
      <footer className="cs-footer">
        <span>Declared Tactics</span>
        <span>Avormore</span>
      </footer>
    </div>
  );
}
