// ============================================================
//  PlayerContext — persistent player data across fights + sessions
//  Backed by localStorage under the key 'daq_player'.
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

const STORAGE_KEY = 'daq_player';

const PlayerContext = createContext(null);

// ── Load / Save ──────────────────────────────────────────────

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(playerData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
  } catch {
    // storage full or unavailable — fail silently
  }
}

// ── Helpers ──────────────────────────────────────────────────

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
    id: 'vrax',
    name: 'VRAX',
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
        current_hp:      classDef.base_health,
        unlocked_cards:  [],
        stat_boosts:     [],
        completed_levels: [],
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
      saveToStorage(playerData);
    } else {
      localStorage.removeItem(STORAGE_KEY);
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
