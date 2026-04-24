# Declared Tactics

<img width="1959" height="1114" alt="image" src="https://github.com/user-attachments/assets/ab1ba285-f361-428d-82d9-06566ddc4ced" />

A turn-based tactical system where players commit action queues against enemies with fixed patterns, then watch the plan resolve. Built on a data-driven rules engine with a phase-based execution pipeline. Cards and abilities are pure data. Behavior is declared, not hardcoded. A self-registering tag system routes effects through ordered lifecycle phases, allowing new mechanics to be added without touching the core engine.

**Playable demo:** https://ted-game-declared-tactics.netlify.app/

---

## How a Turn Works

1. **Queue Setup** — You select up to 3 cards from your hand. Each card is committed to a slot (first, second, third) before the turn begins. The enemy does the same.
2. **Speed Resolution** — All queued actions across all units are sorted by `calc_speed`. Speed is based on the card's base speed minus a slot penalty (later slots are slower). Speed buffs and stances can shift this order.
3. **Action Execution** — Actions fire one at a time in speed order. Each action runs through a multi-phase pipeline that handles buffs, defender reactions, damage, and status effects.
4. **End of Turn** — Remaining tags tick down or expire. `action_count` resets. The next turn begins.

---

## Core Mechanics

### Speed & Slot Penalty
Each card has a base speed. The second and third slots in a queue take a cumulative speed penalty, so front-loading fast cards matters. Speed-modifying cards (like **Speed Boost**) can be used to push a slower card to the front, but the boost itself must fire first — making queue order a core decision.

### Tags & the Tag Pool
All status effects, buffs, and debuffs live as **tags** on characters in `active_tag_pool`. Cards declare which tags they apply to `self` or `target`. Tags are processed by phase — the combat engine runs each tag through the relevant phase of the pipeline on the turn it matters.

Tags have **traits** (e.g. `EVASION`, `STANCE`) that other cards can interact with — allowing attacks to bypass, exploit, or counter specific defensive states.

### Stances & Dodge Windows
Stance cards (like **Quick Steps**) give a character a dodge window based on the speed they resolved at. Any incoming attack whose `calc_speed` falls within that window is evaded — but the stance is bypassed by attacks that declare an interaction against `EVASION` or `STANCE` traits.

### Buff Stacking
Charge buffs like **Battojutsu** and **Magic Charge** stack on the tag pool and are consumed when the next qualifying attack fires. Missing an attack while Battojutsu is active spends the buff — timing your commit matters.

### AOE
AOE actions run each defender through the full pipeline independently — mitigation, dodge, and status effects resolve separately per target.

### INTERRUPT
Actions with the `INTERRUPT` property suppress the slower opposing action if they are faster — skipping it entirely for that turn.

---

## Combat Pipeline

Every action that reaches execution runs through this phase sequence:

```
PRE_ACTION        — tag-based gates + resource check (fizzle if cost unmet)
  ↓
Resource Deduct   — costs paid at execution time, not queue time
  ↓
ON_INCOMING       — defender-side gate (dodge, parry, etc.)
                    if cancelled → attacker fires ON_MISS
  ↓
Tag Interaction   — bonus multipliers if action exploits a defender trait
  ↓
IMBUE             — owner tags that modify the payload type or properties
  ↓
DELIVERY          — card's target tags build the damage list
  ↓
INJECT_MULT       — multiplicative damage boosts from owner buffs (Magic Charge, Battojutsu, Momentum)
  ↓
INJECT_FLAT       — flat damage additions (Fuel to the Flames)
  ↓
[per target]
  DAMAGE_REDUCE   — defender mitigation tags
  Health Deduct   — temp_hp absorbs first, then real HP
  Status Apply    — non-DELIVERY target tags applied as conditions
  ON_RECEIVE      — defender tags that react after being hit
  ↓
SELF TAGS         — buffs/heals applied to the action owner
  ↓
POST_ATTACK       — owner tags that fire after the action resolves
```

---

## Tag System

Tags are self-registering. Each handler file calls `registerTag(tag_name, entry)` and declares:

- **`phases`** — which pipeline phases this tag participates in
- **`traits`** — semantic labels that other actions can interact with (e.g. `EVASION`, `STANCE`)
- **`reset`** — when the tag expires: `END_OF_TURN`, `TICK_TURN`, or `ON_OWNER_ACTION`
- **`onApply`** — optional stacking logic (e.g. MAGIC_CHARGE increments `stack_count` instead of duplicating)
- **`handlers`** — one function per phase

To add a new tag: create a handler file, call `registerTag()`, and add one import to `src/battle/handlers/index.js`.

---

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

```
src/
  App.jsx                              # Pure phase router
  context/GameContext.jsx              # Global game state via useReducer + useGame() hook
  screens/BattleScreen.jsx             # Battle UI, loop, animations
  battle/
    reducer.js                         # All state transitions
    initialState.js                    # buildInitialState, encounter config
    engine/battle_engine.js            # Core pipeline: speed, phases, execution, cleanup
    handlers/                          # Self-registering tag handlers (one file per concern)
    registry/battle_registry.js        # Tag registry (pure container, no imports)
  components/battle/                   # Battle-specific UI components
  data/
    cards/                             # Card definitions by class
    characters/                        # Player + enemy character definitions
    scenarios/                         # Enemy group + encounter configs
    maps/                              # Map data
```

### Game Phases

`QUEUE_SETUP` → `BATTLE` → `RESULT`

---

## Tech Stack

- React 18
- Tailwind CSS 3
- Create React App

---

## Roadmap / TODO

- **CLASH system** — simultaneous opposing actions cancel each other out (architecture stubbed, design pending)
- Map screen — navigate between encounters
- Class select screen
- Title screen
- Persistent player state (PlayerContext + localStorage)
- Dynamic player portrait per class
- Refactor `JSON.parse(JSON.stringify(...))` deep copies in reducer.js to use Immer (`npm install immer`)
