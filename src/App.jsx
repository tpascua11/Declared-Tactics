// ============================================================
//  App — phase router
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import GameCanvas from './components/shared/GameCanvas';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import BattleScreen from './screens/BattleScreen';
import MapScreen from './screens/MapScreen';
import GameFinishScreen from './screens/GameFinishScreen';
import CardShowerTransition from './components/shared/CardShowerTransition';
import { introMusic } from './assets/MUSIC/index';

const INTRO_PHASES = new Set(['TITLE', 'CHARACTER_SELECT']);
const TRANSITION_PHASES = new Set(['TITLE', 'CHARACTER_SELECT', 'MAP', 'GAME_FINISH']);
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
  const { playerData } = usePlayer();
  const [displayedPhase, setDisplayedPhase] = useState(gs.phase);
  const [showShower, setShowShower] = useState(false);
  const displayedPhaseRef = useRef(displayedPhase);

  useEffect(() => {
    displayedPhaseRef.current = displayedPhase;
  }, [displayedPhase]);

  const introAllowed = useRef(false);

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
