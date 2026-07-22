# Avormore: Declared Tactics (daq-game)

Turn-based battle card game. React 18 + Tailwind CSS (Create React App).

## Commands

- `npm start` — dev server. NEVER run this yourself; the user runs it and verifies changes in their own session.
- `npm run build` — production build

## Workflow

Work in small steps: one file (or one logical decision) per turn, then pause
so the user can react — even when a multi-file plan was already approved.
Approval of a plan is not approval to execute it all at once.

IMPORTANT — Memory: NEVER write to memory unless the user says to.
Ask first, every time.

## Documentation philosophy

Code and comments in this repo are written for AI readers first, humans second.
The code carries the *what* (self-descriptive names, visible defaults, no
unexplained magic numbers); comments exist only to confirm non-obvious
inference and point to the doc holding the non-derivable why. Never restate
what the code already proves. Worked examples live as runnable files, not
comments.

## Architecture

`src/index.js` → `src/App.jsx`. App = `GameCanvas > PlayerProvider > GameProvider > PhaseRouter` plus a global `EffectsLayer`. PhaseRouter switches screens on `gs.phase` and plays a card-shower transition between menu-tier phases.

**Phases:** `TITLE` → `CHARACTER_SELECT` → `MAP` → (`QUEUE_SETUP` → `BATTLE` → `RESULT`, all rendered by BattleScreen) → back to `MAP` → `GAME_FINISH`. Plus `VFX_EDITOR` (dev tool).

**Two contexts, two lifetimes:**
- `src/context/PlayerContext.jsx` — persistent player data (class, deck, hp, map progress), saved to localStorage. `usePlayer()`.
- `src/context/GameContext.jsx` — battle-scoped state (`gs`), reset each fight, hydrated FROM playerData (never from class registry directly). `useGame()`.
- Components always use these hooks — never prop drilling.

### Directory map

| Path | Purpose |
|------|---------|
| `src/screens/` | One file per phase. `BattleScreen.jsx` is the battle black box: all battle UI + the loop (setTimeout-paced `BATTLE_STEP`s); talks to the rest of the game only via playerData/scenario in, battle result out. |
| `src/battle/reducer.js` | All game state transitions (battle + phase navigation) |
| `src/battle/initialState.js` | `buildInitialState(scenario, class)` |
| `src/battle/engine/` | `battle_engine.js` (speed calc, interaction check, execute, cleanup), `enemy_ai.js`, `preview_utils.js` |
| `src/battle/handlers/` | Tag effect handlers, one file per category (elemental, defense, speed, …), registered via `index.js` |
| `src/battle/registry/` | battle/aura/ui registries |
| `src/data/classes/` | `class_registry.js` + per-class definitions |
| `src/data/cards/` | Per-class card decks |
| `src/data/characters/` | Enemy definitions, grouped by faction folder |
| `src/data/scenarios/` | Encounter JSONs (enemy group + modifiers), selected on MapScreen |
| `src/data/maps/` | Map node layouts |
| `src/components/battle/`, `map/`, `resources/` | Screen-specific components |
| `src/components/shared/` | Cross-screen UI: `GameCanvas`, transitions, `zLayers.js` (global stacking layers) |
| `src/vfx/` | Entire animation system — see below |
| `src/pixi/` | PIXI particle rendering, driven by `src/vfx/ThumosInterpreter.js` |

### VFX system (`src/vfx/`)

JSON-timeline model: `animation_data/<class|shared>/<name>.json` decides which
presets play, when, on whom; `css_presets/` holds reusable keyframe bricks
(played only via `playPreset()` in `css_presets/index.js`); `pixi_data/` +
`ThumosInterpreter.js` is the separate PIXI particle channel; `afterimage.js`
is its own cloned-DOM channel. `animation_data/animation_development/` holds
runnable test/prototype JSONs — the worked examples for each mechanism.

Read before touching: `todo/css_animation_philosophy.txt` (composition
principles — the --dir/--distance/--from-x,y connectors, chaining rules) and
`todo/css_preset_guide_line.txt` (WAAPI mechanics/gotchas). The test of the
system: a new attack must be buildable as a pure JSON diff, zero code changes.
Movement footwork = chains of `basic_step` (`css_presets/general_movement.js`),
not new per-attack presets.

## Conventions

- Adding a screen: file in `src/screens/`, case in PhaseRouter, state via hooks, screen-specific components in `src/components/<domain>/`.
- Animation/visual state (shake, fizzle) = local `useState` in the screen, never in the reducer.
- Deep copy before mutations (`structuredClone` / `JSON.parse(JSON.stringify())`). Shallow-copying a tag pool before running `onApply` handlers silently corrupts real character state — preview/simulation paths must clone tag objects.
- `SPEED_CALC` tag handlers return a numeric modifier; they must never mutate `action.calc_speed` or tag state (speed checks run for ALL characters every step — mutation compounds).
- Tags live on characters as `active_tag_pool` arrays. Actions carry `owner_id`, `target_id`, `payload_type` (`PHYSICAL`|`MAGIC`), `calc_speed`, `priority_flag`.
- z-index escapes above a global layer (`zLayers.js`) wrap only the one element that needs it, never a shared ancestor.
