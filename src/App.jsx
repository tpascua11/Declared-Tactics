// ============================================================
//  App — phase router
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { PlayerProvider } from './context/PlayerContext';
import GameCanvas from './components/shared/GameCanvas';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import BattleScreen from './screens/BattleScreen';
import MapScreen from './screens/MapScreen';
import CardShowerTransition from './components/shared/CardShowerTransition';
import { introMusic } from './assets/MUSIC/index';

const INTRO_PHASES = new Set(['TITLE', 'CHARACTER_SELECT']);
const TRANSITION_PHASES = new Set(['TITLE', 'CHARACTER_SELECT', 'MAP']);
const SHOWER_MIDPOINT = 1500;
const SHOWER_DONE     = 3000;

// Module-level singleton so HMR re-mounts don't spawn a second instance.
let _introAudio = null;
function getIntroAudio() {
  if (!_introAudio) {
    _introAudio = new Audio(introMusic);
    _introAudio.loop = true;
    _introAudio.volume = 0.2;
  }
  return _introAudio;
}

function PhaseRouter() {
  const { gs, dispatch } = useGame();
  const [displayedPhase, setDisplayedPhase] = useState(gs.phase);
  const [showShower, setShowShower] = useState(false);
  const displayedPhaseRef = useRef(displayedPhase);

  useEffect(() => {
    displayedPhaseRef.current = displayedPhase;
  }, [displayedPhase]);

  useEffect(() => {
    const audio = getIntroAudio();
    if (INTRO_PHASES.has(gs.phase)) {
      audio.play().catch(() => {
        const resume = () => {
          audio.play().catch(() => {});
        };
        document.addEventListener('click',   resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
      });
    } else {
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
      screen = <TitleScreen onNewGame={() => dispatch({ type: 'START_NEW_GAME' })} />;
      break;
    case 'CHARACTER_SELECT':
      screen = <CharacterSelectScreen />;
      break;
    case 'MAP':
      screen = <MapScreen />;
      break;
    case 'QUEUE_SETUP':
    case 'BATTLE':
    case 'RESULT':
      screen = <BattleScreen />;
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
    </GameCanvas>
  );
}
