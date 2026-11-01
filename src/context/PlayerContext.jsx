// ============================================================
//  PlayerContext — persistent player data across fights + sessions
//  Backed by the active save slot (src/data/saveSlots.js).
//
//  WHAT WE STORE (minimal — IDs and deltas only, never full objects):
//    class_id        → string, e.g. 'samurai'
//    unlocked_cards  → array of card IDs the player has unlocked beyond their starting deck
//    stat_boosts     → array of { stat, amount } deltas applied on top of class base stats
//    completed_levels → array of cleared level IDs from the map
//
//  WHAT WE DERIVE AT RUNTIME (never stored):
//    portrait        → CLASS_REGISTRY[class_id].portrait
//    base cards      → CLASS_REGISTRY[class_id].cards
//    full deck       → classDef.starting_cards + unlocked_cards, resolved from classDef.cards by ID
//    max_health      → CLASS_REGISTRY[class_id].base_health + sum of stat_boosts
//    icon, resources, permanent_tags, etc. → all from CLASS_REGISTRY
//
//  WHY: storing full card objects or asset URLs in localStorage breaks on
//  production builds (webpack hashes change). Storing only IDs means we always
//  resolve fresh data from the source of truth at runtime.
// ============================================================

import { createContext, useContext, useReducer, useEffect } from 'react';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { getActiveSlot, readSlot, writeSlot, clearSlot, importLegacySave } from '../data/saveSlots';

const DEFAULT_CAMPAIGN_ID = 'path_of_the_samurai';

const PlayerContext = createContext(null);

// ── Load / Save ──────────────────────────────────────────────

function loadFromStorage() {
  importLegacySave();
  return readSlot(getActiveSlot());
}

// ── Helpers ──────────────────────────────────────────────────

export const hasFlag = (playerData, flag) => (playerData?.flags ?? []).includes(flag);

// "Cleared" is an ordinary flag, written by a scenario's own `set_flag` event.
// Design: todo/world_design.md (Flags).
export const clearedFlag = (scenarioId) => `cleared:${scenarioId}`;

export const isScenarioCleared = (playerData, scenarioId) =>
  hasFlag(playerData, clearedFlag(scenarioId));

// Derives the full runtime player snapshot from stored minimal data.
// Call this whenever you need the full picture (e.g. GO_TO_BATTLE).
export function derivePlayerSnapshot(playerData) {
  const classDef = CLASS_REGISTRY[playerData.class_id];
  if (!classDef) return null;

  // Apply stat boosts on top of class base stats
  const maxHealth = (playerData.stat_boosts ?? [])
    .filter(b => b.stat === 'max_health')
    .reduce((total, b) => total + b.amount, classDef.base_health);

  const totalActionSlots = (playerData.stat_boosts ?? [])
    .filter(b => b.stat === 'total_action_slots')
    .reduce((total, b) => total + b.amount, classDef.total_action_slots);

  const allCardIds = [...new Set([...(classDef.starting_cards ?? []), ...(playerData.unlocked_cards ?? [])])];
  const resolvedCards = allCardIds.map(id => classDef.cards.find(c => c.id === id)).filter(Boolean);
  const cardOrder = classDef.card_order;
  const cards = cardOrder
    ? [...resolvedCards].sort((a, b) => {
        const ai = cardOrder.indexOf(a.id);
        const bi = cardOrder.indexOf(b.id);
        return (ai === -1 ? cardOrder.length : ai) - (bi === -1 ? cardOrder.length : bi);
      })
    : resolvedCards;

  return {
    id: 'varx',
    name: playerData.name ?? classDef.default_name,
    portrait:           classDef.portrait ?? null,
    victory_portrait:   classDef.victory_portrait ?? null,
    icon:               classDef.icon,
    faction:            'player',
    class_id:           classDef.id,
    health:             maxHealth,
    max_health:         maxHealth,
    temp_hp:            0,
    base_speed:         classDef.base_speed,
    resources: Object.fromEntries(
      classDef.resources.map(r => [r.type, { current: r.starting, max: r.max }])
    ),
    total_action_slots: totalActionSlots,
    active_tag_pool:    [...classDef.permanent_tags],
    combat_start_tags:  [...classDef.combat_start_tags],
    permanent_tags:     [...classDef.permanent_tags],
    cards,
    queue: [],
  };
}

// ── Reducer ──────────────────────────────────────────────────

function playerReducer(state, action) {
  switch (action.type) {

    // Runs ONCE when the player picks their class at game start.
    // Only stores the minimal data needed — everything else is derived at runtime.
    case 'CONFIRM_CLASS': {
      const classDef = CLASS_REGISTRY[action.classId];
      if (!classDef) return state;
      return {
        class_id:        action.classId,
        name:            classDef.default_name,
        current_hp:      classDef.base_health,
        unlocked_cards:  [],
        stat_boosts:     [],
        completed_levels: [],
        save_version:    1,
        campaign_id:     action.campaignId ?? DEFAULT_CAMPAIGN_ID,
        flags:           [],
        gold:            0,
      };
    }

    // One write for flags + rewards, so a quit can never half-commit. Nothing is marked cleared
    // here: a scenario clears itself with a `set_flag` event (arrives as reward.flags).
    // Rewards carry no restriction here: whether a scenario can be played again is the
    // scenario's job (cleared / replayable / requires), so this always applies what it is given.
    case 'COMMIT_SCENARIO': {
      const { scenarioId, reward = {} } = action;
      const flags = reward.flags ?? [];
      const unlockedCards = reward.unlock_cards?.[state.class_id] ?? [];
      const statBoosts = reward.hp_upgrade
        ? [{ stat: 'max_health', amount: reward.hp_upgrade, level_id: scenarioId }]
        : [];
      return {
        ...state,
        flags:             [...new Set([...(state.flags ?? []), ...flags])],
        unlocked_cards:    [...new Set([...(state.unlocked_cards ?? []), ...unlockedCards])],
        stat_boosts:       [...(state.stat_boosts ?? []), ...statBoosts],
        gold:              (state.gold ?? 0) + (reward.gold ?? 0),
      };
    }

    // Called by MapScreen after a battle ends — updates HP and records result
    case 'APPLY_BATTLE_RESULT': {
      return { ...state, current_hp: null };
    }

    // Add an unlocked card ID to the player's deck (post-battle reward, etc.)
    case 'UNLOCK_CARD':
      return { ...state, unlocked_cards: [...(state.unlocked_cards ?? []), action.cardId] };

    // Apply a stat upgrade delta — stacks, never replaces. If level_id is provided,
    // acts as a one-time reward guard (same level can't grant the same stat twice).
    case 'UPGRADE_STAT': {
      if (action.level_id != null) {
        const already = (state.stat_boosts ?? []).some(b => b.stat === action.stat && b.level_id === action.level_id);
        if (already) return state;
      }
      return { ...state, stat_boosts: [...(state.stat_boosts ?? []), { stat: action.stat, amount: action.amount, level_id: action.level_id ?? null }] };
    }

    // Called by MapScreen to record level completion after a victory.
    case 'SAVE_MAP_PROGRESS': {
      const existing = state.completed_levels ?? [];
      if (existing.includes(action.levelId)) return state;
      return { ...state, completed_levels: [...existing, action.levelId] };
    }

    // Called when player enters a node — persists their last map position.
    case 'SAVE_LAST_LEVEL':
      return { ...state, last_level_id: action.levelId };

    // Wipe everything — called on true new game
    case 'NEW_GAME':
      return null;

    default:
      return state;
  }
}

// ── Provider ─────────────────────────────────────────────────

export function PlayerProvider({ children }) {
  const [playerData, playerDispatch] = useReducer(playerReducer, undefined, loadFromStorage);

  // Sync to localStorage whenever playerData changes
  useEffect(() => {
    if (playerData) {
      writeSlot(getActiveSlot(), playerData);
    } else {
      clearSlot(getActiveSlot());
    }
  }, [playerData]);

  return (
    <PlayerContext.Provider value={{ playerData, playerDispatch }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
