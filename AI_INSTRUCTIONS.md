================================================================================
  AI INSTRUCTIONS — Avormore: Declared Tactics
  Read this before making any changes to the project.
================================================================================

--------------------------------------------------------------------------------
  GAME STATE — HOW TO ACCESS IT
--------------------------------------------------------------------------------

Game state (gs) and dispatch live in React Context.
NEVER pass gs or dispatch as props. ALWAYS use the hook:

  import { useGame } from '../context/GameContext';
  const { gs, dispatch } = useGame();

This works in any screen or component in the tree.


--------------------------------------------------------------------------------
  ADDING A NEW SCREEN
--------------------------------------------------------------------------------

1. Create the screen file:
     src/screens/[ScreenName].jsx

2. Add the phase case to PhaseRouter in src/App.jsx:
     case 'PHASE_NAME':
       return <ScreenName />;

3. Inside the screen, use useGame() — no props needed:
     const { gs, dispatch } = useGame();

4. Screen-specific components go in:
     src/components/[domain]/
     e.g. src/components/map/, src/components/shop/

5. Reusable UI shared across screens goes in:
     src/components/shared/


--------------------------------------------------------------------------------
  REDUCER RULES
--------------------------------------------------------------------------------

src/battle/reducer.js is for GAME STATE TRANSITIONS only:
  - Player interactions (queue, target, execute)
  - Battle logic (steps, cleanup, win/loss)

DO NOT add animation state to the reducer.
Animation state (shake, fizzle, sprite effects) belongs as
local useState inside the screen component that owns it.

The two temporary exceptions (STOP_SHAKE, STOP_FIZZLE) will be
removed from the reducer when BattleScreen animation is refactored.


--------------------------------------------------------------------------------
  INITIALSTATE — KNOWN TEMPORARY HARDCODING
--------------------------------------------------------------------------------

src/battle/initialState.js currently hardcodes:
  - CURRENT_ENCOUNTER — the enemy lineup
  - SAMURAI            — the player class

These are placeholders. When MapScreen and CharacterSelectScreen
are built, buildInitialState(selectedEncounter, selectedClass)
will receive dynamic data from the player's choices.

DO NOT extend the hardcoded values. Leave them as-is until
the map and class select screens drive them.


--------------------------------------------------------------------------------
  FOLDER STRUCTURE RULES
--------------------------------------------------------------------------------

src/
├── App.jsx                        — phase router only, ~20 lines
├── context/
│   └── GameContext.jsx            — GameProvider + useGame()
├── screens/                       — one file per top-level screen
│   ├── BattleScreen.jsx
│   ├── TitleScreen.jsx
│   ├── CharacterSelectScreen.jsx
│   ├── MapScreen.jsx
│   ├── PlayerMenuScreen.jsx
│   └── ResultScreen.jsx
├── components/
│   ├── battle/                    — battle-specific components
│   ├── shared/                    — reusable UI across screens
│   └── [domain]/                  — add per screen as needed
├── battle/
│   ├── reducer.js                 — battleReducer
│   ├── initialState.js            — buildInitialState, buildEnemyQueue
│   ├── engine/
│   ├── handlers/
│   └── registry/
├── assets/
│   ├── ENEMY/
│   ├── FOX_SAMURAI/
│   ├── PLAYER_PORTRAITS/
│   └── STATUS/
└── data/
    ├── cards/
    ├── characters/
    └── classes/


--------------------------------------------------------------------------------
  PENDING REFACTORS — DO NOT FORGET
--------------------------------------------------------------------------------

- VraxPortrait → rename to PlayerPortrait, make portrait dynamic per class
- STOP_SHAKE / STOP_FIZZLE → move out of reducer into BattleScreen local state
- initialState.js → replace hardcoded encounter/class with map/class select data


================================================================================
