// Runs scenarios for a campaign: the location menu, the scenario's pages, the hand-off to a
// battle and the resume after it, and the final COMMIT_SCENARIO. Draws nothing: returns props
// for two EventModals (or null when that modal is not open).
// Design: todo/world_design.md (Scenario run, Battle in a scenario).

import { useState, useMemo, useEffect } from 'react';
import { usePlayer, isScenarioCleared } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { buildScenarioPages, buildScenarioCommit } from './scenarioPages';
import { meetsRequires } from './requires';

const RETURN_PHASE = 'WORLD_MAP_TEST';
const BATTLE_OUTCOME_FLAGS = ['battle_won', 'battle_lost'];

const withBattleOutcome = (runFlags, victory) =>
  [...runFlags.filter(f => !BATTLE_OUTCOME_FLAGS.includes(f)), victory ? 'battle_won' : 'battle_lost'];

// skipBattle (dev only): null = fight normally, 'win' / 'loss' = skip the fight and continue as if it ended that way.
export function useScenarioRunner(campaign, skipBattle = null) {
  const { playerData, playerDispatch } = usePlayer();
  const { gs, dispatch, goToBattle } = useGame();

  // ── Location menu: the location's scenarios as a choice page ──
  const [enteredLocationId, setEnteredLocationId] = useState(null);
  const enteredLocation = enteredLocationId ? campaign.locations[enteredLocationId] : null;
  // Only scenarios whose `requires` are met show up; menu option i maps to enteredScenarioIds[i].
  // Order: not cleared, then REPEATABLE (cleared but replayable), then CLEARED (disabled); each group keeps the location's order.
  const enteredScenarioIds = useMemo(() => {
    if (!enteredLocation) return [];
    const available = enteredLocation.scenarios.filter(id => meetsRequires(campaign.scenarios[id].requires, playerData));
    const isCleared = (id) => isScenarioCleared(playerData, id);
    const isRepeatable = (id) => isCleared(id) && campaign.scenarios[id].replayable;
    return [
      ...available.filter(id => !isCleared(id)),
      ...available.filter(isRepeatable),
      ...available.filter(id => isCleared(id) && !isRepeatable(id)),
    ];
  }, [campaign, enteredLocation, playerData]);
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
  // run = { scenarioId, sceneImage, startIndex?, runFlags? }: the scenario being played, or null. It plays in
  // segments split at `battle` events: the fight leaves the screen, and on return the effect below resumes
  // at the event after it. `segment` is the pages of the part currently shown.
  // The scene image is captured at pick time: the menu (and enteredLocation) is gone mid-run.
  // runFlags are the temporary flags of this run ('battle_won' / 'battle_lost'); they travel through the
  // fight and are never saved.
  const [run, setRun] = useState(null);
  const runScenarioId = run?.scenarioId;
  const runScenario = runScenarioId ? campaign.scenarios[runScenarioId] : null;
  const segment = useMemo(
    () => (runScenario ? buildScenarioPages(runScenario, playerData, run.startIndex ?? 0, run.runFlags ?? []) : null),
    [runScenario, playerData, run?.startIndex, run?.runFlags]
  );

  const finishSegment = (completed) => {
    if (completed && segment.battle) {
      const { battleId, resumeIndex } = segment.battle;
      if (skipBattle) {
        setRun({
          scenarioId: runScenarioId,
          sceneImage: run.sceneImage,
          startIndex: resumeIndex,
          runFlags: withBattleOutcome(run.runFlags ?? [], skipBattle === 'win'),
        });
        return;
      }
      goToBattle(
        campaign.battles[battleId],
        { scenarioId: runScenarioId, sceneImage: run.sceneImage, locationId: enteredLocationId, resumeIndex, runFlags: run.runFlags ?? [] },
        RETURN_PHASE
      );
    } else if (completed) {
      playerDispatch({
        type: 'COMMIT_SCENARIO',
        scenarioId: runScenarioId,
        commit: buildScenarioCommit(runScenario, playerData, run.runFlags ?? []),
      });
    }
    setRun(null);
  };

  // A segment with no pages (e.g. a battle as the first event) has nothing to show: finish it immediately.
  useEffect(() => {
    if (segment && segment.pages.length === 0) finishSegment(true);
  }, [run]);

  // Back from a fight started by a scenario: the scenario always continues, with exactly one of
  // 'battle_won' / 'battle_lost' set for its `if` events to read.
  useEffect(() => {
    const resume = gs.sourceLevel;
    if (!gs.battleResult || !resume?.scenarioId) return;
    const runFlags = withBattleOutcome(resume.runFlags ?? [], gs.battleResult.victory);
    setRun({ scenarioId: resume.scenarioId, sceneImage: resume.sceneImage, startIndex: resume.resumeIndex, runFlags });
    setEnteredLocationId(resume.locationId ?? null);
    dispatch({ type: 'CLEAR_BATTLE_RESULT' });
  }, []);

  // modalKey is for the caller's `key=` (a `key` inside a spread props object triggers a React warning).
  const menuModal = enteredLocation && {
    modalKey: enteredLocationId,
    pages: menuPages,
    title: enteredLocation.title.toUpperCase(),
    sceneImage: enteredLocation.scene_image,
    onChoose: (i) => setRun({ scenarioId: enteredScenarioIds[i], sceneImage: enteredLocation.scene_image }),
    onDone: () => setEnteredLocationId(null),
  };

  const runModal = segment && segment.pages.length > 0 && {
    modalKey: `${runScenarioId}:${run.startIndex ?? 0}`,
    pages: segment.pages,
    title: runScenario.name,
    sceneImage: run.sceneImage,
    onDone: finishSegment,
  };

  // One modal for menu + run: the menu's choice page is followed by the picked scenario's pages, so the shell
  // stays mounted. After a fight the location is restored too, and the modal opens past the menu page (startPageIndex)
  // on the first resumed page. Without a location (older saves) only the resumed segment shows.
  const eventModal = (enteredLocation || (segment && segment.pages.length > 0)) && {
    modalKey: enteredLocationId ?? `${runScenarioId}:${run.startIndex ?? 0}`,
    pages: enteredLocation
      ? (segment ? [...menuPages, ...segment.pages] : menuPages)
      : segment.pages,
    title: runScenario ? runScenario.name : enteredLocation.title.toUpperCase(),
    sceneImage: run?.sceneImage ?? enteredLocation?.scene_image,
    defaultLeftSpeaker: { source: 'class', id: playerData.class_id },
    startPageIndex: enteredLocation && run?.startIndex > 0 ? menuPages.length : 0,
    onChoose: enteredLocation && !run ? menuModal.onChoose : undefined,
    // After the last page: finish the segment (commit, or leave for a battle). Returns the page to show next, or
    // false to close: the menu (0) when the scenario ended normally, the first resumed page when a skipped fight
    // continues, false for `exit`, a real fight, or no location. An empty segment was already finished by the
    // effect above; finishing it again would re-enter the battle.
    onEnd: () => {
      if (segment && segment.pages.length > 0) finishSegment(true);
      if (!enteredLocation || !segment || segment.exit) return false;
      if (segment.battle) return skipBattle ? menuPages.length : false;
      return 0;
    },
    // The modal closed: LEAVE (completed = false, commits nothing) or an end that did not stay open.
    onDone: (completed) => {
      if (!completed) setRun(null);
      setEnteredLocationId(null);
    },
  };

  return {
    openLocation: setEnteredLocationId,
    eventModal: eventModal || null,
    menuModal: menuModal || null,
    runModal: runModal || null,
  };
}
