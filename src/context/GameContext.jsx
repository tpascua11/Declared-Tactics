// ============================================================
//  GameContext — provides gs and dispatch to the entire app
// ============================================================

import { createContext, useContext, useReducer } from 'react';
import { battleReducer } from '../battle/reducer';
import { buildInitialState } from '../battle/initialState';
import { usePlayer } from './PlayerContext';
import { getActiveSlot, readSlot } from '../data/saveSlots';

const GameContext = createContext(null);

function initGameState() {
  try {
    return buildInitialState(undefined, readSlot(getActiveSlot()));
  } catch {
    return buildInitialState();
  }
}

export function GameProvider({ children }) {
  const [gs, dispatch] = useReducer(battleReducer, undefined, initGameState);
  const { playerData } = usePlayer();

  const goToBattle = (scenario, sourceLevel = null, returnPhase = null) => {
    dispatch({ type: 'GO_TO_BATTLE', payload: { playerData, scenario, sourceLevel, returnPhase } });
  };

  const onBattleEnd = (currentHP, victory) => {
    dispatch({ type: 'BATTLE_END', payload: { currentHP, victory } });
  };

  const retry = () => dispatch({ type: 'RETRY' });
  const restartBattle = () => dispatch({ type: 'RESTART_BATTLE', payload: { playerData } });

  return (
    <GameContext.Provider value={{ gs, dispatch, goToBattle, onBattleEnd, retry, restartBattle }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
