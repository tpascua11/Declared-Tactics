# Declared Tactics

<img width="1959" height="1114" alt="image" src="https://github.com/user-attachments/assets/ab1ba285-f361-428d-82d9-06566ddc4ced" />

A turn-based tactical simulation engine where players commit action queues against enemies with fixed patterns, then watch the plan resolve in real-time. Built on a data-driven rules engine with a phase-based execution pipeline. Cards and abilities are pure data — behavior is declared, not hardcoded. A self-registering tag system routes effects through ordered lifecycle phases, so new mechanics slot in without touching core engine logic.

**Playable demo:** https://ted-game-declared-tactics.netlify.app/

---

## How a Turn Works

1. **Queue Setup** — You select up to 3 cards from your hand and commit them to slots before the turn begins. The enemy does the same.
2. **Speed Resolution** — All queued actions across all units are sorted by `calc_speed`. Speed is based on the card's base speed minus a slot penalty (later slots are slower). Speed buffs and stances shift this order.
3. **Action Execution** — Actions fire one at a time in speed order. Each action runs through a multi-phase pipeline that handles buffs, defender reactions, damage, and status effects.
4. **End of Turn** — Tags tick down or expire. `action_count` resets. The next turn begins.

---

## Immersive Presentation

Each action in the battle sequence is a coordinated moment — not just a state update.

### Animation Registry

Every card can reference a named animation (`animation: 'stream_slash'`). The registry maps that name to:

- A **CSS keyframe class** played on the target or player portrait
- A **sound effect** (or layered multi-sound sequence with individual delays and volumes)
- A **floating damage number** with per-effect coloring and timing
- A future-ready slot for sprite sheets and particle presets

```js
stream_slash: {
  cssClass: 'animate-heavy_shake',
  duration: 500,
  sfx: [
    { src: sfx('STREAM_SLASH.wav'), delay: 125, volume: 0.5 },
    { src: sfx('HARD_SWING_1.wav'), delay: 0,   volume: 0.5 },
  ],
  floatingNumber: { color: '#449bff' },
},
```

Adding a new effect is three steps: write a `@keyframes` rule, add an entry to the registry, set `animation` on the card.

### Web Audio API — Zero-Latency Playback

Sound effects are pre-decoded at module load time using `decodeAudioData()` — converting each file into a raw PCM buffer before any action fires. When an action resolves, playback is instant: no fetch, no browser decode delay.

```
Module load → fetch .wav → decodeAudioData() → cached PCM buffer
Action fires → createBufferSource() → source.start() → instant playback
```

`HTMLAudioElement` loads lazily and decodes on first play. This system does it upfront so every sound hits clean.

---

## Core Mechanics

### Speed & Slot Penalty

Each card has a base speed. The second and third slots in a queue take a cumulative speed penalty, so front-loading fast cards matters. Speed-modifying cards (like **Shinsoku**) can push a slower card to the front, but the boost itself must fire first — making queue order a core decision.

### Tags & the Tag Pool

All status effects, buffs, and debuffs live as **tags** on characters in `active_tag_pool`. Cards declare which tags they apply to `self` or `target`. Tags are processed by phase — the engine runs each tag through the relevant lifecycle phase when it matters.

Tags have **traits** (e.g. `EVASION`, `STANCE`) that other cards can interact with — allowing attacks to bypass, exploit, or counter specific defensive states.

### Stances & Dodge Windows

Stance cards (like **Quick Steps**) give a character a dodge window based on the speed they resolved at. Any incoming attack whose `calc_speed` falls within that window is evaded — but the stance is bypassed by attacks that declare an interaction against `EVASION` or `STANCE` traits.

### Buff Stacking

Charge buffs like **Battojutsu** and **Magic Charge** stack on the tag pool and are consumed when the next qualifying attack fires. Missing an attack while charged spends the buff — timing your commit matters.

### Resources

Classes can have custom resources (e.g. the **Samurai's Battle Spirit**) that gate high-cost abilities. Resources are defined per-class, tracked in state, deducted at execution time, and rendered with custom resource bar components.

### AOE

AOE actions run each defender through the full pipeline independently — mitigation, dodge, and status effects resolve separately per target.

### INTERRUPT

Actions with the `INTERRUPT` property suppress the slower opposing action if they win the speed race — skipping it entirely for that turn.

---

## Combat Pipeline

Every action that reaches execution runs through this phase sequence:

```
PRE_ACTION        — tag-based gates + resource check (fizzle if cost unmet)
  ↓
Resource Deduct   — costs paid at execution time, not queue time
  ↓
Retarget          — if original target is dead, redirects to same-faction living unit
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
INJECT_MULT       — multiplicative damage boosts from owner buffs (Battojutsu, Momentum)
  ↓
INJECT_FLAT       — flat damage additions
  ↓
[per target — runs independently for AOE]
  DAMAGE_REDUCE   — defender mitigation tags
  temp_hp absorb  — temp HP absorbs first, then real HP
  Status Apply    — non-DELIVERY target tags applied as conditions
  ON_RECEIVE      — defender tags that react after being hit
  ↓
SELF TAGS         — buffs, heals, and stances applied to the action owner
  ↓
POST_ATTACK       — owner tags that fire after the action fully resolves
```

Turn boundaries also run:

```
ON_TURN_START     — per-character, fires before any action this turn
END_OF_TURN       — per-character, tick durations, expire reset tags
```

---

## Tag System

Tags are self-registering. Each handler file calls `registerTag(tag_name, entry)` and declares:

- **`phases`** — which pipeline phases this tag participates in
- **`traits`** — semantic labels other actions can match against (e.g. `EVASION`, `STANCE`)
- **`reset`** — when the tag expires: `END_OF_TURN`, `TICK_TURN`, `ON_OWNER_ACTION`, or any combination
- **`onApply`** — optional stacking logic (e.g. BATTOJUTSU increments `stack_count` rather than duplicating)
- **`handlers`** — one pure function per phase the tag participates in

Tags are the only extension point you need for new mechanics. To add a new effect: write a handler file, call `registerTag()`, add one import to `src/battle/handlers/index.js`.

Handler categories in the codebase:

| File | Tags |
|------|------|
| `delivery_handlers.js` | DAMAGE, HEAL — build payload damages |
| `injector_handlers.js` | MOMENTUM, BATTOJUTSU, SPEED_BOOST, MAGIC_CHARGE, FUEL — modify payload |
| `incoming_handlers.js` | QUICK_STEPS, HARAI — defender-side cancels |
| `elemental_handlers.js` | BURN, FREEZE, ELECTRIFIED — status effects |
| `turn_phase_handlers.js` | REGEN, STILL_WIND, UNDER_THE_SUN — tick/passive effects |
| `speed_handlers.js` | SPEED_CALC phase modifications |
| `passive_handlers.js` | Permanent class passives |
| `class_specific_handler.js` | GAIN_RESOURCE, class resource logic |

---

## Screen Flow

```
TitleScreen → CharacterSelectScreen → MapScreen → BattleScreen → ResultScreen
                                                               ↘ GameFinishScreen (campaign end)
```

Each screen is a self-contained component. `App.jsx` is a pure phase router — it renders one screen based on `phase` from `GameContext`.

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
  screens/                             # One file per top-level screen
  battle/
    reducer.js                         # All state transitions
    initialState.js                    # buildInitialState, encounter config
    engine/battle_engine.js            # Core pipeline: speed, phases, execution, cleanup
    animationRegistry.js               # Animation → CSS + SFX + floating number config
    handlers/                          # Self-registering tag handlers (one file per concern)
    registry/battle_registry.js        # Tag registry (pure container, no imports)
  components/battle/                   # Battle-specific UI components
  data/
    cards/                             # Card definitions by class
    characters/                        # Player + enemy character definitions
    classes/                           # Class definitions (stats, resources, deck, short_rest)
    scenarios/                         # Enemy group + encounter configs
    maps/                              # Map data
  assets/
    SOUND EFFECTS/                     # Drop a .wav here — webpack bundles it, registry picks it up
```

---

## Tech Stack

- React 18
- Tailwind CSS 3
- Web Audio API (pre-decoded PCM buffer playback)
- Create React App

---

## Roadmap

- **CLASH system** — simultaneous opposing actions cancel each other out (architecture stubbed, design + refactor pending)
- Refactor `JSON.parse(JSON.stringify(...))` deep copies in reducer.js to use Immer for cleaner, safer state mutations
- **Next class** — design and implement a second playable class that introduces the next layer of core mechanics
