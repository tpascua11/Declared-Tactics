// Turns a scenario's game_events into EventModal pages (todo/world_data_design.md: SCENARIO).
// Handled types: dialog, reward, battle (stops a segment), if (expanded here). set_flag / clear_flag are not handled yet.
//
// runFlags = temporary flags of the current scenario run (e.g. 'battle_won' / 'battle_lost'); never saved.

import { hasFlag, isScenarioCleared } from '../context/PlayerContext';

const MAX_IF_DEPTH = 3;

const PAGE_BUILDERS = {
  dialog: (event) => event.lines.map(line => ({ type: 'line', ...line })),

  reward: (event, playerData) => {
    const cardIds = event.unlock_cards?.[playerData?.class_id] ?? [];
    if (cardIds.length === 0) return [{ type: 'reward', gold: event.gold }];
    return cardIds.map((cardId, i) => ({
      type: 'reward',
      gold: i === 0 ? event.gold : undefined,
      classId: playerData.class_id,
      cardId,
    }));
  },
};

// `requires` entries: a flag name, or { cleared: scenario_id }. AND-only.
function meetsRequires(requires = [], playerData, runFlags) {
  return requires.every(entry =>
    typeof entry === 'string'
      ? runFlags.includes(entry) || hasFlag(playerData, entry)
      : isScenarioCleared(playerData, entry.cleared)
  );
}

// Replaces an `if` event with the events of the branch that applies; other events pass through.
function expandEvent(event, playerData, runFlags, depth = 0) {
  if (event.type !== 'if') return [event];
  if (depth >= MAX_IF_DEPTH) throw new Error('`if` game_events nested deeper than ' + MAX_IF_DEPTH);
  const branch = meetsRequires(event.requires, playerData, runFlags) ? event.then : (event.else ?? []);
  return branch.flatMap(inner => expandEvent(inner, playerData, runFlags, depth + 1));
}

// The reward a finished scenario hands to COMMIT_SCENARIO: the `reward` events of the branches
// that applied (given the final runFlags), merged.
export function buildScenarioReward(scenario, playerData, runFlags = []) {
  return scenario.game_events
    .flatMap(event => expandEvent(event, playerData, runFlags))
    .filter(event => event.type === 'reward')
    .reduce((total, { type, gold = 0, ...rest }) => ({
      ...total,
      ...rest,
      gold: total.gold + gold,
      unlock_cards: { ...total.unlock_cards, ...rest.unlock_cards },
    }), { gold: 0, unlock_cards: {} });
}

// Plays game_events from startIndex until a top-level `battle` event or the end.
// Returns { pages, battle }: battle is { battleId, resumeIndex } when the run stops at a fight
// (resumeIndex = the event after it), otherwise null. A `battle` inside an `if` is not supported.
export function buildScenarioPages(scenario, playerData, startIndex = 0, runFlags = []) {
  const pages = [];
  for (let i = startIndex; i < scenario.game_events.length; i++) {
    const topEvent = scenario.game_events[i];
    for (const event of expandEvent(topEvent, playerData, runFlags)) {
      if (event.type === 'battle') {
        if (topEvent.type === 'if') throw new Error(`\`battle\` inside \`if\` is not supported (scenario "${scenario.id}")`);
        return { pages, battle: { battleId: event.battle_id, resumeIndex: i + 1 } };
      }
      const build = PAGE_BUILDERS[event.type];
      if (!build) throw new Error(`Unknown game_event type "${event.type}" in scenario "${scenario.id}"`);
      pages.push(...build(event, playerData));
    }
  }
  return { pages, battle: null };
}
