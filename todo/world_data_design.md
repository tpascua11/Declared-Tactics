# World Data Redesign

Status: design only, nothing implemented. Replaces the index-ordered `levels[]` in
`src/data/maps/PATH_OF_THE_SAMURAI*.json` (consumed by `MapScreen.jsx`, `WinModal.jsx`).
Target UI: `WorldMapScreen2.jsx` (free-placed location cards on the Sunsword art).

## Layers

```
CAMPAIGN ──► WORLD (map) ──► LOCATION ──► SCENARIO ──► BATTLE
                                              └──────► DIALOG
```

Every layer points DOWN by string id. Nothing points up. Registries are keyed by `id`
(same pattern as `SCENARIO_REGISTRY` / `DIALOG_REGISTRY`), built PER CAMPAIGN (see File layout).

**CAMPAIGN** is an independent playthrough: it holds several worlds, shares nothing with other
campaigns, and has its own save. `campaign.json`: `{ "id": "path_of_the_samurai",
"name": "PATH OF THE SAMURAI", "worlds": ["Sunsword", "Dreamhelf"] }`. The MAP below is the
per-world file (`map.json`).

**Rename:** today's `src/data/scenarios/*.json` (enemy group + modifiers) become
**battles**. "Scenario" is redefined as the story/event box below.

## MAP

```json
{ "id": "sunsword", "name": "SUNSWORD", "background": "Sunsword7",
  "locations": ["snow_iron_gate", "tree_trail"] }
```

## LOCATION — where it is, what is playable there

```json
{ "id": "snow_iron_gate", "title": "Snow Iron Gate",
  "pos": { "x": 320, "y": 180 }, "icon": "Snow_Iron_Gate",
  "requires": [],
  "scenarios": [
    { "mode": "sequence", "requires": ["met_turtle_elder"],
      "ids": ["gate_1", "gate_2", "gate_3"] },
    { "mode": "pool", "requires": [],
      "ids": ["gate_scout", "gate_rest"] }
  ] }
```

- `scenarios` is a list of GROUPS. A location may mix any number of groups.
- Group `mode` (closed set, add a mode only when a real case needs it):
  - `sequence`: only the first uncleared scenario in `ids` is shown; each entry implicitly
    requires the one before it. The implied rule lives on the location, not the scenario
    file, so the validator and reachability simulator MUST understand it.
  - `pool`: every scenario whose `requires` are met is shown, any order.
- Cleared scenarios are hidden (unless `replayable`).
- Group `requires` gates the whole group (avoids copying one flag onto every scenario).
- Scenario files do not know their group or position; the location owns the grouping.
  A scenario id must not appear in two groups.
- Three gate levels, all AND: location `requires` -> group `requires` -> scenario
  `requires` (plus "first uncleared" for a sequence). Validator and simulator evaluate all
  three. Scan tool / debug panel should report, for a hidden scenario, which level is
  failing.
- No shorthand: `scenarios` is ALWAYS a list of groups, even for a single scenario. One
  shape keeps the loader, validator, scan, and simulator simple and AI-authored files uniform.
- No stored state. Status (locked / available / cleared badge) is computed at render time.
- Gates elsewhere must reference scenario ids or story flags, never "location cleared".

## SCENARIO — the event box (ordered game_events)

```json
{ "id": "gate_ferret_ambush", "name": "SNOW IRON GATE",
  "desc": "...", "clear_desc": "...",
  "replayable": false,
  "requires": [],
  "game_events": [
    { "type": "dialog", "dialog_id": "gate_intro" },
    { "type": "battle", "battle_id": "rabbit_and_boar_level_1" },
    { "type": "dialog", "dialog_id": "gate_clear" },
    { "type": "reward", "gold": 20, "unlock_cards": { "samurai": ["quick_steps"] } },
    { "type": "set_flag", "flag": "met_turtle_elder" }
  ] }
```

- Model: RPG Maker-style command list. `game_events` are the list of commands that tell the
  game what happens (dialog shows up, stat growth, go to a new map location, start a fight,
  set a flag); each calls a function the game itself defines. One handler per game_event
  type; runner is dumb, data decides flow. Add game_event types only when a real scenario
  needs one. No conditionals or
  variables until unavoidable.
- `desc` / `clear_desc` are plain prose fields (intro modal / WinModal text), NOT dialogs.
- `name` is required: a location with several scenarios needs per-choice labels.
- `dialog` game_events are optional (current levels have none).
- Rewards live in a `reward` game_event (end of scenario, or mid-scenario if wanted).
- **game_events are open to growth, nothing more is built now.** Rules that keep them
  extensible: every game_event is an object with a `type`; one handler per type, registered
  in a game_event registry (same pattern as the tag handlers), so data can only call
  functions the game defines; an unknown `type` is a validator error; game_events may later
  contain game_event lists. Dialog files will use this SAME game_event vocabulary when they
  need branching (a `say` game_event plus the shared ones), never a second mechanism.
- **Reserved for later (do not build until a real scenario needs it):** an `if` game_event
  `{ "type": "if", "requires": [...], "then": [game_events], "else": [game_events] }` using the
  existing `requires` list as the condition. Nested game_event lists, NO jumps and no index
  skipping. Optional game_event-level `requires` (skip that game_event when unmet). Loose depth cap (about 3) for testability,
  since each branch multiplies the paths to test. Choices (`choice` with per-option `requires`
  and `effects`) follow the same guarded-entries idea.
- `requires` gates whether the scenario appears inside an open location.

## BATTLE — pure definition (today's scenario files)

```json
{ "id": "rabbit_and_boar_level_1", "name": "Ferrets And Boars",
  "battle_background": "SNOW_BATTLE_FIELD_WIDE",
  "stages": [ { "enemies": ["ferret_samurai", "ferret_samurai"] } ],
  "music": "WAY_OF_THE_SAMURAI_BATTLE_1",
  "defeat_tip": "..." }
```

- `defeat_tip` lives here (battle owns its defeat message); moved from the old level.
- Empty `rewards: {}` is removed; rewards moved to the scenario `reward` game_event.
- `BattleScreen` / `buildInitialState` keep taking this file unchanged: the battle black-box
  boundary stays intact.

## DIALOG — unchanged

`src/data/dialogs/*.json`: `id`, `mapIcon`, `title`, `lines: [{ speaker: {source, id}, text }]`.

## Flags

A flag is a plain string. The game treats the name as opaque; meaning comes from who sets
it (`set_flag`) and who reads it (`requires`). Flags stay boolean (counters are a different
thing).

- **Set-only by default.** `set_flag` turns a flag on and nothing turns it off.
- **Toggleable exceptions.** A flag that may return to false is marked `"toggleable": true`
  in the flag registry, and only `clear_flag` game_events may target it. Validator rejects
  `clear_flag` on any other flag.
- **Flag registry (definitions).** Every flag is defined once, with a description and an
  optional toggleable marker:
  `{ "met_turtle_elder": { "desc": "Spoke to the turtle elder at the shrine." },
     "turtle_at_shrine": { "desc": "Turtle is currently at the shrine.", "toggleable": true } }`
  Files: `<Campaign>/worlds/<World>/flags.json` and `<Campaign>/shared/flags.json`, loaded
  into ONE registry per campaign (flag names are unique within a campaign; validator checks
  duplicates across that campaign's files). Two campaigns may reuse the same flag name.
  The registry is static data and lives with the data files, NOT in `PlayerContext`:
  `PlayerContext` stores only the values (`flags` list), the registry holds the meaning
  (same ids-in-save / definitions-in-registry pattern as `CLASS_REGISTRY`).
  Validator rejects any `set_flag`, `clear_flag`, or `requires` naming an unregistered flag.
- **Absence = off.** A flag not in the save's `flags` list is false; `false` is never stored.
  Registered-but-unset is the normal off state; unregistered is a validator error.
  `requires` is AND-only, so a gate cannot yet test for a flag being OFF. If a real case
  appears, add `{ "not": "<flag>" }` (existing AND lists stay valid).
- **game_event shapes** (literal names so they stay greppable):
  `{ "type": "set_flag", "flag": "met_turtle_elder" }`
  `{ "type": "clear_flag", "flag": "turtle_at_shrine" }`
- **Naming.** Specific, descriptive, lowercase with underscores, spelled identically
  everywhere. Permanent flags name a past event (`met_turtle_elder`); toggleable flags name
  a current state (`turtle_at_shrine`). Never `button1`-style names.
- **Owner prefix: optional.** Use one where an owner is obvious, with exactly one dot
  (`turtle.met_elder`), for JSON readability only. The game does not interpret the dot.
  Flags with no single owner stay plain (`dragon_warning_seen`). Not enforced; revisit if
  collisions appear.
- **Self flags.** A scenario's or location's own extra flag uses its id as the owner prefix
  (`gate_ferret_ambush.spared_scout`). Completion needs no flag (see State).
- `requires` entries: a flag name or `{ "cleared": "<scenario_id>" }`. AND-only for now.
  Facts from other campaigns arrive as ordinary flags via `campaign.json` `imports`
  (snapshot at start, see State), never as a cross-campaign `requires` form.
- Flat strings, never nested objects, so every use is literally searchable.

## State and storage

Single source of truth: the player save in `PlayerContext` (persisted to localStorage).
World JSON is read-only definition and never holds progress.

```json
{ "save_version": 1,
  "campaign_id": "path_of_the_samurai",
  "cleared_scenarios": ["gate_ferret_ambush"],
  "flags": ["met_turtle_elder", "gate_ferret_ambush.spared_scout"] }
```

A save belongs to exactly ONE campaign (`campaign_id`); `cleared_scenarios` and `flags` are
only meaningful against that campaign's registries, so ids never collide across campaigns.
Starting a new campaign = new playthrough (progress fields reset).

**Cross-campaign reads (one-way, read-only, SNAPSHOT at start).** A campaign may LOOK at other
campaigns' saves, but only ONCE, at campaign start. It never writes to them, and no items/deck
are copied; only derived true/false facts become flags in the NEW campaign's own save.
- Declared in the new campaign's `campaign.json`:
  `"imports": [ { "from": "path_of_the_samurai", "flag": "defeated_dragon",
                  "as": "start_defeated_dragon" },
                { "from": "path_of_the_samurai", "cleared": "samurai_boss",
                  "as": "start_cleared_samurai_boss" } ]`
  At campaign start each import is evaluated against the other campaign's save; if true, the
  `as` flag is set in the new save. After that the new campaign gates on ordinary flags
  (`requires: ["start_defeated_dragon"]`), so it depends only on its own save and cannot
  change mid-playthrough if the old campaign is replayed or reset.
- `flag` / `cleared` names are checked against THE OTHER campaign's registries; each `as`
  flag must be registered in the NEW campaign's flag registry. Treat flags that another
  campaign imports as a stable interface (renaming one breaks the importer; validator checks).
- Helper `readCampaignSave(campaign_id)` reads another campaign's save from localStorage
  WITHOUT loading it into the active `PlayerContext` state. A missing save means "nothing is
  set" (no `as` flags get set); older `save_version` shapes are read via the needed fields
  with defaults.
- No two-way links: the import graph between campaigns must be acyclic (a campaign may only
  import from campaigns that exist independently of it; validator flags A imports B and
  B imports A).
- Each campaign's save lives under its own localStorage key (`daq_player_<campaign_id>`), so
  starting or resetting one campaign never touches another's save.

| State | Set by | Used for |
|---|---|---|
| `cleared_scenarios` | Automatic when a scenario's last game_event finishes (no authored game_event) | Hide completed, gate on a specific fight |
| `flags` | `set_flag` / `clear_flag` game_events only (authored) | Story facts and scenario/location self flags |

- Location state is not stored. Status (locked / available / cleared badge) is computed at
  render time from `requires` and `cleared_scenarios`.
- All writes are `PlayerContext` reducer actions dispatched via `playerDispatch`, called only
  by the scenario runner. Reads go through helpers exported next to `derivePlayerSnapshot`
  (`hasFlag`, cleared check).
- World progress lives in the SAME `PlayerContext` state as character data (one store per
  campaign save); not split into a separate PlayerWorld store. The localStorage key is
  per campaign (`daq_player_<campaign_id>`), replacing today's single `daq_player`, so
  `NEW_GAME` removes only the active campaign's key.
- No second copy of flags in `GameContext`, `BattleScreen`, or component state.
  `BattleScreen` stays a black box (battle in, result out) and never sets story flags.
- `save_version` exists from the start so the save shape can be migrated later.

### Mapping onto current `PlayerContext.jsx` (checked against the file)

- State is a `useReducer`, saved to localStorage by a `useEffect` after EVERY state change.
- `completed_levels` -> `cleared_scenarios`; `last_level_id` -> last location id
  (`SAVE_LAST_LEVEL` equivalent).
- Add `save_version`, `flags`, `cleared_scenarios` to the object built in `CONFIRM_CLASS`
  (it builds a fresh state, so new fields must be initialised there). Loader currently
  parses storage with no checks; old saves are abandoned (new storage key or discard).
- `UPGRADE_STAT` already has a one-time guard keyed by `level_id`; reuse it keyed by scenario
  id. `UNLOCK_CARD` does not dedupe, but the deck derivation does (`new Set`).
- Gold: old map rewards include gold but the player state has no gold field, so it is not
  persisted today. The `reward` handler needs a home for it (and a guard, since gold is
  additive and not naturally idempotent) or the field is dropped.
- `NEW_GAME` returns `null`, which wipes flags and cleared scenarios too.

### Commit rule

A scenario commits `cleared_scenarios`, its flags, and its rewards TOGETHER when its last
game_event finishes, in a single save write. Because state is saved after every change, this means
ONE reducer action (e.g. `COMMIT_SCENARIO`) that applies the cleared mark, flags, and rewards
in one step. Separate dispatches would allow a half-committed save if the game quits between
them. Quitting or losing mid-scenario commits nothing and a
retry starts clean. This prevents duplicate rewards and half-set story state.
Open: if a flag set early in a scenario must be visible to a later game_event of the same
scenario, the runner checks its pending list as well as the save.

## Tooling (later, after the schema settles)

- **Validator / scan:** dangling `battle_id` / `dialog_id` / `scenario_id`; flags read but
  never set; set but never read; `clear_flag` on a non-toggleable flag. Given a flag name,
  list every setter, clearer, and reader.
- **Reachability simulator:** start with no flags, repeatedly take any scenario whose
  `requires` are met; every scenario and the ending must become reachable. Unreachable =
  soft lock or typo.
- **Random-order fuzzer:** same simulator, random order, checking invariants (no reward
  granted twice, game can always still finish).
- **Debug panel (dev only):** set/clear flags, mark scenarios cleared, jump to a location.
  Also the recovery path for a stuck save.
- **Scenario viewer:** read-only view generated from the JSON (indented outline first, maybe a
  dev screen or flowchart later) so nested game_events stay readable; shares the validator's tree
  walk. The JSON stays the source of truth.

## Lessons carried over from other RPGs (Skyrim, BG3, Wrath of the Righteous)

Recurring bug classes: out-of-order play, soft locks, never-set or misspelled flags,
old saves breaking after a patch, duplicate/missing rewards, stale references. The rules
above (id-based references, explicit `requires`, gates on scenario completion not losable
items, validator, `save_version`, commit rule) target these. Heavier machinery (event
sourcing, hierarchical state machines, visual graph editors) is deliberately skipped at
this project's size.

## File layout (by campaign, then world, not by type)

```
src/data/campaigns/
  PathOfTheSamurai/
    campaign.json
    worlds/
      Sunsword/
        map.json
        flags.json
        locations/
        scenarios/
        battles/
        dialogs/
      Dreamhelf/
        ...
    shared/          # content used by 2+ worlds of THIS campaign
  AnotherCampaign/
    ...
```

- One folder per campaign, one per world inside it, holding the whole tree
  (map -> locations -> scenarios -> battles/dialogs), mirroring the data hierarchy. Adding,
  reviewing, restarting, or deleting a world or campaign is one folder. Easier for humans to
  review and for AI to author with a small, focused scope.
- Registries are keyed by `id` and built PER CAMPAIGN: the loader scans each campaign's folder
  by folder name (e.g. `require.context('./campaigns', true, /\/battles\/.*\.json$/)`, then
  groups the results by the campaign folder in the path), giving
  `registries[campaign_id].{battles, scenarios, locations, dialogs, flags}`. The game uses the
  active campaign's registries only. Within a campaign, all worlds' battles (or scenarios,
  locations, dialogs) are visible at once. Same for validator/scan globs, run per campaign.
- Ids must be unique per type WITHIN a campaign; two campaigns may reuse an id. Validator
  checks duplicates per campaign.
- Cross-world references inside a campaign are technically possible; validator may flag them
  to keep worlds self-contained. Cross-CAMPAIGN references to DATA files are always an error;
  the only allowed cross-campaign link is the read-only snapshot `imports` in `campaign.json`
  (see State).
- Enemy/character/class definitions stay global in `src/data/characters/` and
  `src/data/classes/` (any campaign may use them).
- The old `src/data/scenarios/**` files (battle definitions) move into the matching
  `campaigns/PathOfTheSamurai/worlds/<World>/battles/`. Keep battle ids and scenario ids
  visibly distinct (`rabbit_and_boar_level_1` vs `gate_ferret_ambush`).

### `shared/` content (per campaign)

- Holds scenarios, battles, dialogs, and flags genuinely used by two or more worlds of the
  same campaign. Everything else stays in its own world; if `shared/` grows large the
  by-world grouping loses its point. Nothing is shared across campaigns.
- Used by id, like any other content: a location in any world lists a shared scenario id in
  its group; a scenario in any world may point to a shared battle or dialog.
- `shared/` is the one allowed place for cross-world references; the validator flags a
  world reaching into another world, but not into its campaign's `shared/`.
- Completion is per campaign save: `cleared_scenarios` is keyed by scenario id with one list
  per save, so a shared scenario is cleared once across the whole campaign and disappears
  everywhere (unless `replayable`). Right for one-time events. For "once per world", make one
  scenario per world with different ids and let them share a battle or dialog. Rule of
  thumb: share the battle/dialog, give each world its own scenario.

## Field migration from old `levels[]`

| Old field | New home |
|---|---|
| `id`, `name`, `map_icon` | Location (`id`, `title`, `icon`) |
| (none) | Location `pos`, `requires` |
| `desc`, `clear_desc` | Scenario |
| `scenario_id` | Scenario `battle` game_event |
| `reward` (gold, unlocks, hp_upgrade) | Scenario `reward` game_event |
| `defeat_tip` | Battle |
| `type` (COMBAT/BOSS) | Dropped; no real purpose yet |

## Known coupling to remove

- `MAP_DATA.levels[id]` indexing (id must equal array position).
- `playerLevel` as a single number progress marker.
- Two copies of `MAP_ICON_LOOKUP` (`MapScreen`, `WorldMapScreen2`).
- `WinModal` / `MapScreen` import `PATH_OF_THE_SAMURAI.json` directly.
- `iron_wastes_map.json` and `PATH_OF_THE_SAMURAI_V2.json` are unused.

## Decided

- Campaigns are independent: each holds several worlds, shares no worlds with other
  campaigns, has its own registries (ids unique per campaign), and its own save
  (`campaign_id` in the save, one localStorage key per campaign).
- Cross-campaign links are one-way, read-only, and a SNAPSHOT at campaign start: a campaign
  declares `imports` in `campaign.json`, evaluated once into ordinary flags in its own save.
  It never writes to another save, no items are copied, and no two-way connections (import
  graph acyclic). Build `readCampaignSave` and the import step only when a second campaign
  exists.
- The existing campaign is REBUILT in the new format, not converted from the old 21 `levels[]`.
  "Level" is no longer a concept: old levels are just scenarios.
- A scenario file is only an ordered list of game_event calls. How each game_event type behaves at
  runtime (`battle` defeat handling, `reward` fields such as `hp_upgrade`, pending-flag
  visibility within a scenario) is defined by that game_event type's handler, not by this schema.
- `scenarios` on a location is always a list of groups (no bare-id shorthand).
- Map `background` is a string key resolved through a registry (same pattern as icons).
- `requires` is AND-only. Add `any` / `not` only when a real scenario needs one; existing
  AND lists stay valid when that happens.

## Open

- Move old `src/data/scenarios/**` into `campaigns/PathOfTheSamurai/worlds/<World>/battles/`,
  build the per-campaign registries (battles first), repoint `scenario_registry.js` /
  `MapScreen` / `initialState` refs (code step, do as one self-contained change so the game
  keeps running).
- How a campaign is chosen/started (title or character select?).
- Readers of the old map JSON (`MapScreen`, `WinModal`): implementation work, to check
  against `PlayerContext.jsx`. No save migration needed: old saves are abandoned (starting
  anew); `save_version` still starts at 1 for future changes.
- How the map screen displays a `sequence` once its scenarios are cleared but replayable.
- Location `pos` units: pixels (the current `WorldMapScreen2` canvas is 1920 wide) or
  percentages of the map image (scales with the art). Decide when placing the first locations.
- Definitive game_event type list and each game_event's parameters. Known so far: `dialog`,
  `battle`, `reward`, `set_flag`, `clear_flag`. Behavior is defined by each game_event type's
  handler; write the
  parameter list as the handlers are built.
