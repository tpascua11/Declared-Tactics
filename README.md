# Declared Tactics

<img width="1959" height="1114" alt="image" src="https://github.com/user-attachments/assets/ab1ba285-f361-428d-82d9-06566ddc4ced" />

Turn-based combat where each unit queues up to three actions in a fixed sequence (first, second, third), committing their plan at the start of the turn. Actions resolve one step at a time across all units, with speed dynamically determining which action executes next. Because actions can modify speed, status, and battlefield conditions, execution order can shift mid-turn, causing queued actions to play out differently than planned.

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Queue Setup** — Select cards from your hand to fill your action queue (up to 3 slots).
2. **Battle** — Hit execute. Actions resolve in speed order — faster cards go first.
3. **Result** — Win by reducing the enemy to 0 HP. Lose if VRAX falls first.

## Cards

| Card | Speed | Type | Effect |
|------|-------|------|--------|
| Heavy Slice | 90 | Physical / Slash | 50 damage + gain Momentum |
| Quick Slice | 110 | Physical / Slash | 25 damage (fast) |
| Mend | 50 | Magic | Restore 100 HP |
| Magic Charge | 100 | Magic / Charging | Boost next magic attack by 20%, restore 25 mana |
| Fuel to the Flames | 100 | Magic / Charging | Add +50 flat damage to next fire attack |
| Speed Up | 200 | Physical | Boost next action speed by 150 |
| Flame Strike | 100 | Magic / Spell | 150 fire damage (costs 100 mana) |

## Architecture

```
src/
  App.jsx                        # Root component, reducer, battle loop
  battle/
    engine/battle_engine.js      # Core logic: speed, interactions, execution
    handlers/                    # Tag effect handlers (damage, heal, speed, etc.)
    registry/                    # Battle and UI effect registries
  components/
    ActionQueue.jsx              # Queue slots + execute button
    BattleQueue.jsx              # Mid-battle queue display
    BattleLog.jsx                # Draggable floating battle log
    EnemyZone.jsx                # Enemy display + shake animation
    Hand.jsx                     # Card hand
    TagPool.jsx                  # Active tag pool display
    VraxPortrait.jsx             # Player portrait + stats
  data/
    cards/fighter_cards.js       # Card definitions
    characters/vrax.js           # VRAX (player) character
    characters/enemies.js        # Enemy characters (Stone Golem, etc.)
```

### Game Loop

`QUEUE_SETUP` → `BATTLE` → `RESULT`

The battle loop runs via a 700ms `setTimeout` in `useEffect`. Each tick dispatches `BATTLE_STEP`, which advances one action through the engine.

### Battle Engine

Actions are sorted by `calc_speed` (base speed + slot bonus). On each step:

1. **SpeedCheck** — sort all pending actions by speed
2. **InteractionCheck** — detect clashes or nullifications between opposing actions
3. **ExecuteAction** — apply tags (damage, heal, buffs, etc.) to targets
4. **Cleanup** — remove resolved actions, apply end-of-turn effects

### Tags

Effects are communicated via tags stored on characters (`active_tag_pool`). Cards declare tags for `self` and `target`. Handlers in `src/battle/handlers/` process each tag type.

## Tech Stack

- React 18
- Tailwind CSS 3
- Create React App
