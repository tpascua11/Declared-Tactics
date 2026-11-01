# World Design (current)

What is built and how it works. Replaces `world_data_design.md` and
`location-scaneario-structure-thought-design.txt` (both now old; see the end).
Open battle questions stay in `battle_outcome_flow.txt` (still valid).
Check data with `node tools/validate_campaigns.js`.

## Layers

```
CAMPAIGN -> WORLD (map) -> LOCATION -> SCENARIO -> BATTLE
```

- Each layer points down by id. Nothing points up. Never reference folder names.
- A scenario is a script of `game_events`. Dialog, rewards, flags and fights are events inside it, not layers.
- Data files never change at runtime. All progress lives in the save.

## Files

```
src/data/campaigns/<Campaign>/
  campaign.json
  worlds/<World>/
    map.json   flags.json
    locations/   scenarios/   battles/
```

`_Template/` is a copy-me campaign. Ids are unique per type within a campaign.

```json
// campaign.json: worlds = map ids
{ "id": "path_of_the_samurai", "name": "PATH OF THE SAMURAI", "worlds": ["sunsword"] }

// map.json
{ "id": "sunsword", "name": "SUNSWORD", "background": "Sunsword6",
  "locations": ["snow_iron_gate", "snowy_field_den"] }

// location
{ "id": "snow_iron_gate", "title": "Snow Iron Gate", "pos": { "x": 320, "y": 180 },
  "icon": "World_Icon_1", "scene_image": "samurai_battlefield_9",
  "requires": [],
  "scenarios": ["gate_ferret_ambush", "tree_trail"] }

// scenario
{ "id": "tree_trail", "name": "TREE TRAIL", "replayable": false,
  "requires": [{ "cleared": "gate_ferret_ambush" }],
  "game_events": [
    { "type": "dialog", "lines": [ { "speaker": { "source": "narrator" }, "text": "..." } ] },
    { "type": "reward", "gold": 20 },
    { "type": "set_flag", "flag": "cleared:tree_trail" } ] }

// flags.json: story flags only
{ "met_turtle_elder": { "desc": "Spoke to the turtle elder." } }
```

## What each field does

| File | Used by the engine | Not read yet |
|---|---|---|
| map | `background`, `locations` | `name` |
| location | `title`, `pos`, `icon`, `scene_image`, `requires`, `scenarios` | |
| scenario | `name`, `replayable`, `requires`, `game_events` | `desc`, `clear_desc` |

`scenarios` on a location is a flat list. Its order is the menu order. It does not gate anything.

## requires (availability)

- A list, AND only. Every entry must hold.
- An entry is a flag name, or `{ "cleared": "<scenario id>" }` (same as the flag `cleared:<id>`).
- Checked in three places: a location on the map, a scenario in the Enter menu, an `if` event.
- Not met means hidden. Order and unlocking are done only with `requires`; there is no sequence mode.

## game_events (built)

| type | does |
|---|---|
| `dialog` | shows `lines` (`speaker` + `text`) as pages |
| `reward` | `gold`, `unlock_cards` per class; shown as a reward page, applied at the end |
| `set_flag` | adds a flag to the save, applied at the end; shows nothing |
| `battle` | leaves for a fight, then resumes at the next event (top level only, not inside `if`) |
| `if` | `{ requires, then, else }`; runs one branch; nests up to 3 deep |

An unknown `type` throws. Add a type only when a real scenario needs it.

## Flags

- The save has one flat list of strings: `flags`. No flags live on scenarios or locations.
- The engine never sets a flag by itself. Something authored sets it (`set_flag`), something authored reads it (`requires`, `if`).
- Cleared is a flag: a scenario clears itself with `set_flag` `cleared:<its id>`, written on the path that counts as success. A lost fight just does not write it.
- Declared flags: story flags go in `flags.json`. `cleared:<id>` is valid when that scenario exists. Anything else is a validator error.
- Temporary run flags: `battle_won` and `battle_lost`, set after a fight and only for the rest of that run. Never saved, never declared.
- Names are the contract with saves. Renaming one after players have saves needs a rename map and a `save_version` bump. Before the first public build, rename freely.

## Scenario run

1. Enter on a location opens a menu of its scenarios (those whose `requires` hold).
2. Cleared and `replayable: false` shows disabled "CLEARED". Cleared and `replayable: true` shows "REPEATABLE".
3. The scenario plays as pages in the event modal. Leave or closing early commits nothing.
4. At the end, one `COMMIT_SCENARIO` applies gold, cards and flags together.

Rewards have no restriction of their own. Whether a scenario can be played again is decided by the menu (`replayable` plus the cleared flag). `hp_upgrade` stacks on every commit and will need a `once` on the reward.

## Battle in a scenario

- The fight leaves the map and returns to `WORLD_MAP_TEST`. The scenario then continues.
- After the fight it has exactly one temporary flag: `battle_won` or `battle_lost`.
- A scenario decides everything else with `if`: rewards, dialog, and whether to write its cleared flag.
- The `ferret_fight` scenario is the worked example.
- Open items: `battle_outcome_flow.txt`.

## Save

Slot `daq_save_1` .. `daq_save_10`, active slot in `daq_active_slot`. Each save has its own `campaign_id`.
Fields used here: `save_version`, `campaign_id`, `flags`, `gold`, `unlocked_cards`, `stat_boosts`.
`cleared_scenarios` no longer exists. Old test saves: use RESET EVERYTHING.

## Not built

- `clear_flag` and `toggleable` flags.
- `choice` as a game_event (the Enter menu is a choice page inside the event modal, not data).
- `shared/` content, and cross-world references.
- Battle loot, enemy drops, and outcome flags such as "took no damage".
- Group modes (`sequence`, `pool`). Removed on purpose.
- Save slot screen. Campaign select.

## Open

- `pos` units: pixels (canvas is 1920 wide) or a fraction of the map image.
- `scene_image` for locations is a placeholder.
- Map icons and backgrounds are looked up in a hand-written table in `WorldMapScreen2.jsx`; a new one needs code.
- `desc` and `clear_desc`: keep as prose for later or remove.
- When the old game goes away: `MapScreen.jsx`, the old map JSON, `DialogModal`, `DIALOG_REGISTRY` and legacy save import.

## Old docs

- `world_data_design.md`: old. Still describes groups, `sequence`/`pool` modes, automatic clearing and `cleared_scenarios`. Use this doc instead. Still useful from it: the save slots section, the file layout section, the tooling ideas and the RPG lessons.
- `location-scaneario-structure-thought-design.txt`: old thinking. Its DECISION block is what this doc records.
- `battle_outcome_flow.txt`: current, except item 1 (answered: a scenario writes its cleared flag only on the win path) and item 7 (this doc replaces it).
