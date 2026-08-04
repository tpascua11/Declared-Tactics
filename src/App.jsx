// ============================================================
//  App — phase router
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { GAME_TITLE } from './config';
import { GameProvider, useGame } from './context/GameContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import GameCanvas from './components/shared/GameCanvas';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import BattleScreen from './screens/BattleScreen';
import MapScreen from './screens/MapScreen';
import GameFinishScreen from './screens/GameFinishScreen';
import VfxEditorScreen from './screens/VfxEditorScreen';
import DialogEditorScreen from './screens/DialogEditorScreen';
import CardShowerTransition from './components/shared/CardShowerTransition';
import EffectsLayer from './components/battle/EffectsLayer';
import { introMusic } from './assets/Music/index';
import { useMusicVolume, getMusicVolume } from './hooks/useMusic';
import * as ASSETS from './assets';

const INTRO_PHASES = new Set(['TITLE', 'CHARACTER_SELECT']);
const TRANSITION_PHASES = new Set(['TITLE', 'CHARACTER_SELECT', 'MAP', 'GAME_FINISH']);
const SHOWER_MIDPOINT = 1500;
const SHOWER_DONE     = 3000;

document.title = GAME_TITLE;

// On HMR, module re-evaluation hits this and kills any stale instance.
if (window._introAudio) { window._introAudio.pause(); window._introAudio = null; }

function getIntroAudio() {
  if (!window._introAudio) {
    window._introAudio = new Audio(introMusic);
    window._introAudio.loop = true;
    window._introAudio.volume = Math.min(1, 0.2 * getMusicVolume());
  }
  return window._introAudio;
}

function PhaseRouter() {
  const { gs, dispatch } = useGame();
  const { playerData } = usePlayer();
  const [displayedPhase, setDisplayedPhase] = useState(gs.phase);
  const [showShower, setShowShower] = useState(false);
  const displayedPhaseRef = useRef(displayedPhase);

  useEffect(() => {
    displayedPhaseRef.current = displayedPhase;
  }, [displayedPhase]);

  useEffect(() => {
    Object.values(ASSETS).forEach(val => {
      if (typeof val === 'string' && val.startsWith('/static/media/')) {
        const img = new Image();
        img.src = val;
      }
    });
  }, []);

  const introAllowed = useRef(false);
  const [masterVolume] = useMusicVolume();

  useEffect(() => {
    getIntroAudio().volume = Math.min(1, 0.2 * masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    const audio = getIntroAudio();
    if (INTRO_PHASES.has(gs.phase)) {
      introAllowed.current = true;
      const resume = () => { if (introAllowed.current) audio.play().catch(() => {}); };
      audio.play()
        .then(() => { if (!introAllowed.current) { audio.pause(); audio.currentTime = 0; } })
        .catch(() => {
          if (!introAllowed.current) return;
          document.addEventListener('click',   resume, { once: true });
          document.addEventListener('keydown', resume, { once: true });
        });
      return () => {
        introAllowed.current = false;
        document.removeEventListener('click',   resume);
        document.removeEventListener('keydown', resume);
      };
    } else {
      introAllowed.current = false;
      audio.pause();
      audio.currentTime = 0;
    }
  }, [gs.phase]);

  useEffect(() => {
    if (gs.phase === displayedPhaseRef.current) return;

    const prev = displayedPhaseRef.current;
    const shouldTransition = TRANSITION_PHASES.has(prev) || TRANSITION_PHASES.has(gs.phase);

    if (shouldTransition) {
      const target = gs.phase;
      setShowShower(true);
      const midT  = setTimeout(() => setDisplayedPhase(target), SHOWER_MIDPOINT);
      const doneT = setTimeout(() => setShowShower(false),      SHOWER_DONE);
      return () => { clearTimeout(midT); clearTimeout(doneT); };
    } else {
      setDisplayedPhase(gs.phase);
    }
  }, [gs.phase]);

  let screen;
  switch (displayedPhase) {
    case 'TITLE':
      screen = (
        <TitleScreen
          onNewGame={() => { introAllowed.current = false; dispatch({ type: 'START_NEW_GAME' }); }}
          hasSave={!!playerData}
          onContinue={() => { introAllowed.current = false; dispatch({ type: 'GO_TO_MAP' }); }}
        />
      );
      break;
    case 'CHARACTER_SELECT':
      screen = <CharacterSelectScreen />;
      break;
    case 'MAP':
      screen = <MapScreen />;
      break;
    case 'GAME_FINISH':
      screen = <GameFinishScreen />;
      break;
    case 'QUEUE_SETUP':
    case 'BATTLE':
    case 'RESULT':
      screen = <BattleScreen />;
      break;
    case 'VFX_EDITOR':
      screen = <VfxEditorScreen />;
      break;
    case 'DIALOG_EDITOR':
      screen = <DialogEditorScreen />;
      break;
    default:
      screen = null;
  }

  return (
    <>
      {screen}
      {showShower && <CardShowerTransition />}
    </>
  );
}

export default function App() {
  return (
    <GameCanvas>
      <PlayerProvider>
        <GameProvider>
          <PhaseRouter />
        </GameProvider>
      </PlayerProvider>
      <EffectsLayer />
    </GameCanvas>
  );
}
