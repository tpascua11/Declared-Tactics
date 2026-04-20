// ============================================================
//  battleReducer — all battle state transitions
//
// ============================================================

import { DEBUG_HAND_COST } from '../debug';
import {
  calcSpeed,
  getEffectiveActionSlots,
  SpeedCheckAllAvailableActions,
  InteractionCheck,
  ExecuteAction,
  ActionCleanup,
  TurnResultCleanup,
  runPhaseOnTurnStart,
} from './engine/battle_engine';
import { effectiveResourceAtExecution } from './engine/preview_utils';
import { buildEnemyQueue, buildInitialState, buildStageEnemies, MAX_ENEMIES } from './initialState';
import EMBER_KEEP from '../data/scenarios/ember_keep.json';
import { CLASS_REGISTRY } from '../data/classes/class_registry';

// Called when all active enemies are still dead after bench replacement.
// Advances to the next stage, or returns a WIN result if nothing remains.
// Bench replacement itself is handled before this call in BATTLE_STEP.
function advanceStageOrWin(state, logs) {
  const { currentStageIndex = 0, scenario } = state;

  const nextStageIndex = currentStageIndex + 1;
  if (scenario?.stages?.[nextStageIndex]) {
    const nextIds   = scenario.stages[nextStageIndex].enemies ?? [];
    const newActive = buildStageEnemies(nextIds.slice(0, MAX_ENEMIES), nextStageIndex, 0);
    const newBench  = buildStageEnemies(nextIds.slice(MAX_ENEMIES),    nextStageIndex, MAX_ENEMIES);

    // Apply short_rest to the player before the next stage
    const playersBefore = state.characters.filter(c => c.faction === 'player');
    const restResults = playersBefore.map(p => {
      const restored = JSON.parse(JSON.stringify(p));
      const classDef = CLASS_REGISTRY[restored.class_id];
      return classDef?.short_rest ? classDef.short_rest(restored) : { player: restored, logs: [] };
    });
    const restedPlayers = restResults.map(r => r.player);
    const restLogs = restResults.flatMap(r => r.logs);

    const newChars = [
      ...restedPlayers,
      ...newActive,
    ].map(c => ({ ...c, queue: [] }));

    return {
      ...state,
      characters: newChars,
      enemyBench: newBench,
      currentStageIndex: nextStageIndex,
      phase: 'QUEUE_SETUP',
      logs: [...logs, { msg: `━━━ REST ━━━`, type: 'info' }, ...restLogs, { msg: `⚔️  STAGE ${nextStageIndex + 1} BEGINS!`, type: 'info' }],
      activeEnemyId: null,
      pendingAnimation: newActive.map(e => ({ type: 'enemy_enter', targetId: e.id })),
      lastTargetId: newChars.find(c => c.faction === 'enemy' && c.health > 0)?.id ?? null,
    };
  }

  return {
    ...state,
    phase: 'RESULT',
    result: 'WIN',
    pendingAnimation: [],
    logs: [...logs, { msg: '🏆 VICTORY! ALL ENEMIES DEFEATED!', type: 'heal' }],
  };
}

export function battleReducer(state, action) {
  switch (action.type) {

    case 'ADD_TO_QUEUE': {
      const chars = JSON.parse(JSON.stringify(state.characters));
      const player = chars.find(c => c.faction === 'player');
      const filledCount = player.queue.filter(Boolean).length;
      if (filledCount >= getEffectiveActionSlots(player)) return state;
      const nullIdx = player.queue.findIndex(s => !s);
      const slotIndex = nullIdx !== -1 ? nullIdx : player.queue.length;
      const card = action.card;
      if (!DEBUG_HAND_COST) {
        for (const [resourceType, amount] of Object.entries(card.cost ?? {})) {
          if (!player.resources?.[resourceType]) return state;
          const effective = effectiveResourceAtExecution(resourceType, slotIndex, player.queue, player.resources);
          if (effective < amount) return state;
        }
      }
      const lastTarget = chars.find(c => c.id === state.lastTargetId && c.health > 0);
      const target = lastTarget ?? chars.find(c => c.faction === 'enemy' && c.health > 0);
      player.queue[slotIndex] = {
        ...card,
        owner_id: 'vrax',
        owner_name: player.name,
        target_id: target.id,
        payload_type: card.tag_type.includes('MAGIC') ? 'MAGIC' : 'PHYSICAL',
        calc_speed: calcSpeed(player.base_speed + (card.speed_mod ?? 0), slotIndex),
        priority_flag: null,
      };
      return { ...state, characters: chars, lastTargetId: target.id };
    }

    case 'CLEAR_SLOT': {
      const chars = JSON.parse(JSON.stringify(state.characters));
      const player = chars.find(c => c.faction === 'player');
      player.queue[action.index] = null;
      if (!DEBUG_HAND_COST) {
        let changed = true;
        while (changed) {
          changed = false;
          for (let i = 0; i < player.queue.length; i++) {
            const slot = player.queue[i];
            if (!slot) continue;
            const illegal = Object.entries(slot.cost ?? {}).some(([resourceType, amount]) => {
              const effective = effectiveResourceAtExecution(resourceType, i, player.queue, player.resources, i);
              return effective < amount;
            });
            if (illegal) { player.queue[i] = null; changed = true; }
          }
        }
      }
      return { ...state, characters: chars };
    }

    case 'START_BATTLE': {
      const chars = JSON.parse(JSON.stringify(state.characters));
      const battlePlayer = chars.find(c => c.faction === 'player');
      battlePlayer.queue = battlePlayer.queue.filter(Boolean);
      chars.filter(c => c.faction === 'enemy' && c.health > 0).forEach(e => { e.queue = buildEnemyQueue(e, battlePlayer); });
      const { newCharacters: startChars, logs: startLogs } = runPhaseOnTurnStart(chars, null);
      const turnStartLogs = [...state.logs, { msg: `━━━ TURN ${state.turn} BEGIN ━━━`, type: 'info' }, ...startLogs];
      const playerAfterStart = startChars.find(c => c.faction === 'player');
      const allEnemiesDeadAfterStart = startChars.filter(c => c.faction === 'enemy').every(e => e.health <= 0);
      if (playerAfterStart.health <= 0) {
        return { ...state, characters: startChars, phase: 'RESULT', result: 'LOSS', logs: [...turnStartLogs, { msg: '💀 VRAX HAS FALLEN.', type: 'dmg' }] };
      }
      if (allEnemiesDeadAfterStart) {
        return advanceStageOrWin({ ...state, characters: startChars }, turnStartLogs);
      }
      const firstSorted = SpeedCheckAllAvailableActions(startChars);
      const firstAction = firstSorted[0] ?? null;
      const firstOwner = firstAction ? startChars.find(c => c.id === firstAction.owner_id) : null;
      const firstTarget = firstAction ? startChars.find(c => c.id === firstAction.target_id) : null;
      const firstActiveEnemyId = firstOwner?.faction === 'enemy'
        ? firstAction.owner_id
        : firstTarget?.faction === 'enemy' ? firstAction.target_id : null;
      return { ...state, characters: startChars, phase: 'BATTLE', logs: turnStartLogs, activeEnemyId: firstActiveEnemyId, pendingAnimation: [] };
    }

    case 'BATTLE_STEP': {
      const sorted = SpeedCheckAllAvailableActions(state.characters);

      if (sorted.length === 0) {
        const { newState: cleanedState, logs: cleanLogs } = TurnResultCleanup({ ...state });
        const player = cleanedState.characters.find(c => c.faction === 'player');
        if (player.health <= 0) {
          return { ...cleanedState, phase: 'RESULT', result: 'LOSS', pendingAnimation: [], logs: [...state.logs, ...cleanLogs, { msg: '💀 VRAX HAS FALLEN.', type: 'dmg' }] };
        }

        const turnEndLogs = [...state.logs, ...cleanLogs, { msg: `━━━ TURN ${state.turn} END ━━━`, type: 'info' }];

        // 1-for-1 bench replacement: swap each dead enemy slot with the next bench entry.
        let benchCopy = [...(cleanedState.enemyBench ?? [])];
        const enterAnimIds = [];
        const nextChars = cleanedState.characters.map(c => {
          if (c.faction === 'enemy' && c.health <= 0 && benchCopy.length > 0) {
            const replacement = benchCopy.shift();
            enterAnimIds.push(replacement.id);
            return { ...replacement, queue: [] };
          }
          return { ...c, queue: [] };
        });

        const allEnemiesDead = nextChars.filter(c => c.faction === 'enemy').every(e => e.health <= 0);
        if (allEnemiesDead) {
          return advanceStageOrWin(
            { ...cleanedState, characters: nextChars, enemyBench: benchCopy, turn: state.turn + 1 },
            turnEndLogs,
          );
        }

        return {
          ...cleanedState,
          characters: nextChars,
          enemyBench: benchCopy,
          phase: 'QUEUE_SETUP',
          turn: state.turn + 1,
          logs: enterAnimIds.length > 0
            ? [...turnEndLogs, { msg: '⚡ REINFORCEMENTS ARRIVE!', type: 'info' }]
            : turnEndLogs,
          activeEnemyId: null,
          pendingAnimation: enterAnimIds.map(id => ({ type: 'enemy_enter', targetId: id })),
          lastTargetId: nextChars.find(c => c.faction === 'enemy' && c.health > 0)?.id ?? null,
        };
      }

      const actionA = sorted[0];
      const actionB = sorted[1] || null;
      const { resultA, resultB, log: interactionLog } = InteractionCheck(actionA, actionB);

      let newState = { ...state };
      const newLogs = [];

      if (interactionLog) newLogs.push(interactionLog);

      const { newState: afterExec, logs: execLogs, actualTargetId, aoeHits, fizzled, dodged, dodgerId, isSelfBuff, animationHint, animationSelf, animationIntensity, damageDealt } = ExecuteAction(actionA, resultA, newState);
      newState = afterExec;
      newLogs.push(...execLogs);

      newState = ActionCleanup(actionA, newState);

      if (resultB === 'NULLIFY' && actionB) {
        newState = ActionCleanup(actionB, newState);
        newLogs.push({ msg: `💨 "${actionB.name}" was nullified`, type: 'clash' });
      }

      newState = {
        ...newState,
        characters: newState.characters.map(c => {
          if (c.faction === 'player' || c.health > 0) return c;
          const remaining = c.queue.filter(a => a?.properties?.includes('GHOST'));
          return { ...c, queue: remaining };
        }),
      };

      const targetChar = actualTargetId ? newState.characters.find(c => c.id === actualTargetId) : null;
      const anyoneWasHit = targetChar && resultA !== 'NULLIFY';

      // Active enemy: look ahead to the NEXT action so the nudge shows before it fires
      // Resolve dead targets to a living enemy of the same faction (mirrors ExecuteAction retarget)
      const nextSorted = SpeedCheckAllAvailableActions(newState.characters);
      const nextAction = nextSorted[0] ?? null;
      const nextOwner = nextAction ? newState.characters.find(c => c.id === nextAction.owner_id) : null;
      const rawNextTarget = nextAction ? newState.characters.find(c => c.id === nextAction.target_id) : null;
      const nextTarget = rawNextTarget?.health <= 0
        ? newState.characters.find(c => c.faction === rawNextTarget.faction && c.health > 0) ?? null
        : rawNextTarget;
      const activeEnemyId = nextOwner?.faction === 'enemy'
        ? nextAction.owner_id
        : nextTarget?.faction === 'enemy' ? nextTarget.id : null;

      let pendingAnimation = [];
      if (dodged) {
        pendingAnimation.push({ type: 'sidestep', targetId: dodgerId, intensity: 1.0 });
      } else if (fizzled) {
        pendingAnimation.push({ type: 'fizzle', targetId: actionA.owner_id, intensity: 1.0, cardName: actionA.name });
      } else {
        if (isSelfBuff) {
          // Self-buff: animate on owner, optionally also on target if animation_self is set on target side
          pendingAnimation.push({ type: animationHint, targetId: actionA.owner_id, intensity: animationIntensity });
        } else if (anyoneWasHit) {
          if (aoeHits?.length > 0) {
            // AOE: one shake per hit enemy; SFX plays only on the first to avoid stacking
            aoeHits.forEach(({ targetId, damage }, i) => {
              pendingAnimation.push({ type: animationHint, targetId, intensity: animationIntensity, value: damage, skipSfx: i > 0 });
            });
          } else {
            // Single-target: animate on target
            pendingAnimation.push({ type: animationHint, targetId: actualTargetId, intensity: animationIntensity, value: damageDealt });
          }
          // Animate on self if card defines animation_self
          if (animationSelf) {
            pendingAnimation.push({ type: animationSelf, targetId: actionA.owner_id, intensity: animationIntensity });
          }
        }
      }

      return {
        ...newState,
        phase: 'BATTLE',
        stepCount: state.stepCount + 1,
        logs: [...state.logs, ...newLogs],
        pendingAnimation,
        activeEnemyId,
      };
    }

    case 'SELECT_TARGET':
      return { ...state, lastTargetId: action.targetId };

    case 'RETARGET_SLOT': {
      const chars = JSON.parse(JSON.stringify(state.characters));
      const player = chars.find(c => c.faction === 'player');
      const slot = player.queue[action.index];
      if (!slot) return state;
      player.queue[action.index] = { ...slot, target_id: action.targetId };
      return { ...state, characters: chars, lastTargetId: action.targetId };
    }

    case 'START_NEW_GAME':
      return { ...state, phase: 'CHARACTER_SELECT' };

    case 'GO_TO_MAP':
      return { ...state, phase: 'MAP' };

    case 'GO_TO_BATTLE': {
      // Builds a full fresh battle state from playerData + scenario.
      // playerData: minimal stored data from PlayerContext.
      // scenario: array of enemy definitions from the selected map node.
      // sourceLevel: { levelId } — which map level launched this fight.
      const { playerData, scenario, sourceLevel } = action.payload;
      const freshState = buildInitialState(scenario, playerData);
      return { ...freshState, phase: 'QUEUE_SETUP', sourceLevel: sourceLevel ?? null };
    }

    case 'BATTLE_END': {
      // Called by BattleScreen when fight is over.
      // MapScreen reads battleResult to apply rewards, HP carryover, progression.
      const { currentHP, victory } = action.payload;
      return { ...state, phase: 'MAP', battleResult: { currentHP, victory } };
    }

    case 'CLEAR_BATTLE_RESULT':
      return { ...state, battleResult: null };

    case 'GO_TO_GAME_FINISH':
      return { ...state, phase: 'GAME_FINISH' };

    // !! IMPORTANT — RESET must NOT rebuild the player from scratch once progression exists.
    // Player data is persistent across fights: unlocked cards, max_health upgrades,
    // total_action_slots, permanent_tags, etc. must survive between battles.
    // Only battle-scoped fields should reset per fight:
    //   - queue            → clear
    //   - active_tag_pool  → restore to permanent_tags only (not combat_start_tags)
    //   - resources.current → back to starting value (not max)
    //   - health           → back to max_health
    // buildInitialState is a temporary placeholder — replace this with a proper
    // between-fight reset that preserves the player's persistent state.
    case 'RESET':
      return buildInitialState(EMBER_KEEP);

    default:
      return state;
  }
}
