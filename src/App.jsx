// ============================================================
//  App — phase router
// ============================================================

import { useEffect, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { PlayerProvider } from './context/PlayerContext';
import GameCanvas from './components/shared/GameCanvas';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import BattleScreen from './screens/BattleScreen';
import MapScreen from './screens/MapScreen';
import { introMusic } from './assets/MUSIC/index';

const INTRO_PHASES = new Set(['TITLE', 'CHARACTER_SELECT']);

function PhaseRouter() {
  const { gs } = useGame();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(introMusic);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
    }
    const audio = audioRef.current;
    if (INTRO_PHASES.has(gs.phase)) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [gs.phase]);

  switch (gs.phase) {
    case 'TITLE':
      return <TitleScreen />;
    case 'CHARACTER_SELECT':
      return <CharacterSelectScreen />;
    case 'MAP':
      return <MapScreen />;
    case 'QUEUE_SETUP':
    case 'BATTLE':
    case 'RESULT':
      return <BattleScreen />;
    default:
      return null;
  }
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
