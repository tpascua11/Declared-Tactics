// ============================================================
//  App — phase router
// ============================================================

import { useEffect, useState, useCallback } from 'react';
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
  const [showTransition, setShowTransition] = useState(false);

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

  const handleMidpoint = useCallback(() => dispatch({ type: 'START_NEW_GAME' }), [dispatch]);
  const handleDone     = useCallback(() => setShowTransition(false), []);

  let screen;
  switch (gs.phase) {
    case 'TITLE':
      screen = <TitleScreen onNewGame={() => setShowTransition(true)} />;
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
      {showTransition && (
        <CardShowerTransition onMidpoint={handleMidpoint} onDone={handleDone} />
      )}
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
