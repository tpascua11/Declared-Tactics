// Runs scenarios for a campaign: the location menu, the scenario's pages, the hand-off to a
// battle and the resume after it, and the final COMMIT_SCENARIO. Draws nothing: returns props
// for two EventModals (or null when that modal is not open).
// Design: todo/world_design.md (Scenario run, Battle in a scenario).

import { useState, useMemo, useEffect } from 'react';
import { usePlayer, isScenarioCleared } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { buildScenarioPages, buildScenarioReward } from './scenarioPages';
import { meetsRequires } from './requires';

const RETURN_PHASE = 'WORLD_MAP_TEST';
const BATTLE_OUTCOME_FLAGS = ['battle_won', 'battle_lost'];

export function useScenarioRunner(campaign) {
  const { playerData, playerDispatch } = usePlayer();
  const { gs, dispatch, goToBattle } = useGame();

  // ── Location menu: the location's scenarios as a choice page ──
  const [enteredLocationId, setEnteredLocationId] = useState(null);
  const enteredLocation = enteredLocationId ? campaign.locations[enteredLocationId] : null;
  // Only scenarios whose `requires` are met show up; menu option i maps to enteredScenarioIds[i].
  const enteredScenarioIds = useMemo(
    () => (enteredLocation
      ? enteredLocation.scenarios.filter(id => meetsRequires(campaign.scenarios[id].requires, playerData))
      : []),
    [campaign, enteredLocation, playerData]
  );
  const menuPages = useMemo(() => {
    if (!enteredLocation) return [];
    return [{
      type: 'choice',
      header: enteredLocation.title.toUpperCase(),
      options: enteredScenarioIds.map(id => {
        const { name, replayable } = campaign.scenarios[id];
        const cleared = isScenarioCleared(playerData, id);
        return {
          label: name,
          disabled: cleared && !replayable,
          sublabel: cleared ? (replayable ? 'REPEATABLE' : 'CLEARED') : undefined,
        };
      }),
    }];
  }, [campaign, enteredLocation, enteredScenarioIds, playerData]);

  // ── The running scenario ──
  // playing = { scenarioId, sceneImage, startIndex?, runFlags? }. A scenario runs in segments split at
  // `battle` events: the fight leaves the screen, and on return the effect below resumes at the event
  // after it. The scene image is captured at pick time: the menu (and enteredLocation) is gone mid-play.
  // runFlags are the temporary flags of this run ('battle_won' / 'battle_lost'); they travel through the
  // fight and are never saved.
  const [playing, setPlaying] = useState(null);
  const playingScenarioId = playing?.scenarioId;
  const playingScenario = playingScenarioId ? campaign.scenarios[playingScenarioId] : null;
  const playingSegment = useMemo(
    () => (playingScenario ? buildScenarioPages(playingScenario, playerData, playing.startIndex ?? 0, playing.runFlags ?? []) : null),
    [playingScenario, playerData, playing?.startIndex, playing?.runFlags]
  );

  const finishPlaying = (completed) => {
    if (completed && playingSegment.battle) {
      const { battleId, resumeIndex } = playingSegment.battle;
      goToBattle(
        campaign.battles[battleId],
        { scenarioId: playingScenarioId, sceneImage: playing.sceneImage, resumeIndex, runFlags: playing.runFlags ?? [] },
        RETURN_PHASE
      );
    } else if (completed) {
      playerDispatch({
        type: 'COMMIT_SCENARIO',
        scenarioId: playingScenarioId,
        reward: buildScenarioReward(playingScenario, playerData, playing.runFlags ?? []),
      });
    }
    setPlaying(null);
  };

  // A segment with no pages (e.g. a battle as the first event) has nothing to show: finish it immediately.
  useEffect(() => {
    if (playingSegment && playingSegment.pages.length === 0) finishPlaying(true);
  }, [playing]);

  // Back from a fight started by a scenario: the scenario always continues, with exactly one of
  // 'battle_won' / 'battle_lost' set for its `if` events to read.
  useEffect(() => {
    const resume = gs.sourceLevel;
    if (!gs.battleResult || !resume?.scenarioId) return;
    const outcomeFlag = gs.battleResult.victory ? 'battle_won' : 'battle_lost';
    const runFlags = [...(resume.runFlags ?? []).filter(f => !BATTLE_OUTCOME_FLAGS.includes(f)), outcomeFlag];
    setPlaying({ scenarioId: resume.scenarioId, sceneImage: resume.sceneImage, startIndex: resume.resumeIndex, runFlags });
    dispatch({ type: 'CLEAR_BATTLE_RESULT' });
  }, []);

  // modalKey is for the caller's `key=` (a `key` inside a spread props object triggers a React warning).
  const menuModal = enteredLocation && {
    modalKey: enteredLocationId,
    pages: menuPages,
    title: enteredLocation.title.toUpperCase(),
    mapIcon: enteredLocation.scene_image,
    onChoose: (i) => setPlaying({ scenarioId: enteredScenarioIds[i], sceneImage: enteredLocation.scene_image }),
    onDone: () => setEnteredLocationId(null),
  };

  const runModal = playingSegment && playingSegment.pages.length > 0 && {
    modalKey: `${playingScenarioId}:${playing.startIndex ?? 0}`,
    pages: playingSegment.pages,
    title: playingScenario.name,
    mapIcon: playing.sceneImage,
    onDone: finishPlaying,
  };

  return { openLocation: setEnteredLocationId, menuModal: menuModal || null, runModal: runModal || null };
}
