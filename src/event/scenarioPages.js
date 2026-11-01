// Turns a scenario's game_events into EventModal pages (todo/world_design.md: game_events).
// Handled types: dialog, reward, set_flag (no page; collected by buildScenarioCommit), battle (stops a segment), exit (stops the run and closes the modal), change_scene (no page; stamped on the pages after it as `scene`), if (expanded here). clear_flag is not handled yet.
//
// runFlags = temporary flags of the current scenario run (e.g. 'battle_won' / 'battle_lost'); never saved.

import { meetsRequires } from './requires';

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

  set_flag: () => [],
};

// Replaces an `if` event with the events of the branch that applies; other events pass through.
function expandEvent(event, playerData, runFlags, depth = 0) {
  if (event.type !== 'if') return [event];
  if (depth >= MAX_IF_DEPTH) throw new Error('`if` game_events nested deeper than ' + MAX_IF_DEPTH);
  const branch = meetsRequires(event.requires, playerData, runFlags) ? event.then : (event.else ?? []);
  return branch.flatMap(inner => expandEvent(inner, playerData, runFlags, depth + 1));
}

// The commit a finished scenario hands to COMMIT_SCENARIO: the `reward` events of the branches
// that applied (given the final runFlags), merged, plus `flags` from the `set_flag` events of those branches.
export function buildScenarioCommit(scenario, playerData, runFlags = []) {
  const expandedEvents = scenario.game_events.flatMap(event => expandEvent(event, playerData, runFlags));
  const exitIndex = expandedEvents.findIndex(event => event.type === 'exit');
  const appliedEvents = exitIndex === -1 ? expandedEvents : expandedEvents.slice(0, exitIndex);
  const flags = appliedEvents.filter(event => event.type === 'set_flag').map(event => event.flag);
  return appliedEvents
    .filter(event => event.type === 'reward')
    .reduce((total, { type, gold = 0, ...rest }) => ({
      ...total,
      ...rest,
      gold: total.gold + gold,
      unlock_cards: { ...total.unlock_cards, ...rest.unlock_cards },
    }), { gold: 0, unlock_cards: {}, flags });
}

// Plays game_events from startIndex until a top-level `battle` event or the end.
// Returns { pages, battle, exit }: battle is { battleId, resumeIndex } when the run stops at a fight
// (resumeIndex = the event after it), otherwise null. A `battle` inside an `if` is not supported.
// exit is true when an `exit` event ended the run (events after it are not played).
// Every page carries `scene`: the image set by the latest `change_scene` (undefined until one runs, then the modal
// keeps the location's scene). On a resume the events before startIndex are walked again to rebuild it.
export function buildScenarioPages(scenario, playerData, startIndex = 0, runFlags = []) {
  const pages = [];
  let scene;
  for (const earlierEvent of scenario.game_events.slice(0, startIndex)) {
    for (const event of expandEvent(earlierEvent, playerData, runFlags)) {
      if (event.type === 'change_scene') scene = event.image;
    }
  }
  for (let i = startIndex; i < scenario.game_events.length; i++) {
    const topEvent = scenario.game_events[i];
    for (const event of expandEvent(topEvent, playerData, runFlags)) {
      if (event.type === 'exit') return { pages, battle: null, exit: true };
      if (event.type === 'change_scene') { scene = event.image; continue; }
      if (event.type === 'battle') {
        if (topEvent.type === 'if') throw new Error(`\`battle\` inside \`if\` is not supported (scenario "${scenario.id}")`);
        return { pages, battle: { battleId: event.battle_id, resumeIndex: i + 1 }, exit: false };
      }
      const build = PAGE_BUILDERS[event.type];
      if (!build) throw new Error(`Unknown game_event type "${event.type}" in scenario "${scenario.id}"`);
      pages.push(...build(event, playerData).map(page => ({ ...page, scene })));
    }
  }
  return { pages, battle: null, exit: false };
}
