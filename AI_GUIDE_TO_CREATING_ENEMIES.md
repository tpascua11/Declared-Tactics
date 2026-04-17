# 🎮 AI Guide: Creating Enemies, Scenarios & Maps

> Quick reference for building battle content. Keep it simple — look at existing files for examples.

---

## Where Everything Lives

### Enemies & Battle
- **Enemy definitions:** `src/data/enemies/factions/*.json` (one JSON per faction)
- **Enemy registry:** `src/data/enemies/enemy_registry.js` (auto-loads all faction JSONs — just drop files in)
- **Enemy AI logic:** `src/battle/engine/enemy_ai.js` (Simple + Conditional patterns)
- **Battle engine:** `src/battle/engine/battle_engine.js` (core loop, phase pipeline)
- **Tag handlers:** `src/battle/handlers/*.js` (one file per category)
- **Tag registry:** `src/battle/registry/battle_registry.js`

### Player System
- **Player builder:** `src/data/player.js`
- **Class definitions:** `src/data/classes/samurai.js`, `fighter.js`, `wizard.js`
- **Card pools:** `src/data/cards/samurai_cards.js`, `fighter_cards.js`
- **Class registry:** `src/data/classes/class_registry.js`

### Scenarios & Maps
- **Scenario files:** `src/data/scenarios/*.json` (auto-loaded — just drop files in)
- **Scenario registry:** `src/data/maps/scenario_registry.js`
- **Map files:** `src/data/maps/*.json`
- **Map screen:** `src/screens/MapScreen.jsx`

### Assets
- **Asset index:** `src/assets/index.js` (all portrait/image keys live here)

---

## How Enemies Work

Enemies are JSON objects in faction files. Actions are **embedded directly** in the enemy — no separate card system.

### Simple Enemy (random action each turn)

```json
{
  "id": "ferret_sumurai",
  "name": "Ferret Sumurai",
  "portrait": "PORTRAIT_FERRET",
  "icon": "🗡️",
  "base_health": 180,
  "base_speed": 80,
  "faction": "samurai_sumurai",
  "resources": [],
  "permanent_tags": [],
  "combat_start_tags": [],
  "total_action_slots": 1,
  "ai_pattern": "simple",
  "base_actions": [
    {
      "name": "Quick Slash",
      "speed_mod": 5,
      "tag_type": ["PHYSICAL", "SLASH"],
      "tags": {
        "self": [],
        "target": [
          { "tag_name": "DAMAGE", "type": "PHYSICAL", "power": 35 }
        ]
      }
    },
    {
      "name": "Heavy Strike",
      "speed_mod": -15,
      "tag_type": ["PHYSICAL", "SLASH"],
      "tags": {
        "self": [
          { "tag_name": "MOMENTUM", "multiplier": 0.15, "tier": "advanced" }
        ],
        "target": [
          { "tag_name": "DAMAGE", "type": "PHYSICAL", "power": 65 }
        ]
      }
    }
  ]
}
```

### Conditional Enemy (smart decisions)

Uses `action_library` (named actions) + `action_sets` (priority list with conditions). Engine checks top-to-bottom, first match wins.

```json
{
  "id": "wolf_elite",
  "name": "Wolf Elite",
  "portrait": "PORTRAIT_WOLF",
  "icon": "🐺",
  "base_health": 450,
  "base_speed": 95,
  "faction": "samurai_sumurai",
  "resources": [
    { "type": "RAGE", "max": 100, "starting": 0 }
  ],
  "permanent_tags": [],
  "combat_start_tags": [],
  "total_action_slots": 2,
  "ai_pattern": "conditional",
  "action_library": {
    "howl": {
      "name": "Pack Howl",
      "speed_mod": 10,
      "tag_type": ["BUFF"],
      "tags": {
        "self": [{ "tag_name": "GAIN_RESOURCE", "resource_type": "RAGE", "power": 20 }],
        "target": []
      }
    },
    "bite": {
      "name": "Savage Bite",
      "speed_mod": -5,
      "tag_type": ["PHYSICAL"],
      "tags": {
        "self": [],
        "target": [{ "tag_name": "DAMAGE", "type": "PHYSICAL", "power": 80 }]
      }
    }
  },
  "action_sets": [
    { "action_id": "howl", "condition": "RESOURCE_BELOW", "params": { "resource": "RAGE", "threshold": 30 } },
    { "action_id": "bite" }
  ]
}
```

### Key Enemy Fields

| Field | What It Means |
|-------|--------------|
| `id` | Unique ID — used in scenarios to spawn this enemy |
| `base_health` | Max HP (player Samurai=750, Fighter=350, Wizard=250) |
| `base_speed` | Speed stat (player=100). Higher = acts first |
| `total_action_slots` | Actions per turn (1=minion, 2=elite, 3=boss) |
| `ai_pattern` | `"simple"` (random) or `"conditional"` (smart) |
| `resources` | Resource pools like `[{ "type": "RAGE", "max": 100, "starting": 0 }]` |
| `permanent_tags` | Always-active tags (e.g. `RAGE_ON_HIT`) |
| `combat_start_tags` | One-time tags injected at battle start |

### Action Fields

| Field | What It Means |
|-------|--------------|
| `name` | Display name in battle log |
| `speed_mod` | Added to base_speed for this action |
| `tag_type` | Type strings like `["PHYSICAL", "SLASH"]` |
| `tags.self` | Tags applied to the enemy itself |
| `tags.target` | Tags applied to the player |

### Available AI Conditions (for conditional pattern)

| Condition | When True |
|-----------|----------|
| `RESOURCE_BELOW` | `{ resource, threshold }` — resource < threshold |
| `RESOURCE_ABOVE` | `{ resource, threshold }` — resource > threshold |
| `HEALTH_BELOW` | `{ threshold }` — HP% below threshold (0.0–1.0) |
| `HEALTH_ABOVE` | `{ threshold }` — HP% above threshold (0.0–1.0) |
| `HAS_TAG` | `{ tag_name }` — has this tag active |
| `TAG_MISSING` | `{ tag_name }` — doesn't have this tag |
| `TURN_NUMBER` | `{ operator, value }` — compare turn number |
| `RANDOM` | `{ chance }` — random roll (0.0–1.0) |

Check `src/battle/engine/enemy_ai.js` for exact implementations.

---

## Common Tags Quick Reference

These are the tags you'll use most in enemy actions. Full details in `src/battle/handlers/`.

| Tag | What It Does | Example Usage |
|-----|-------------|---------------|
| `DAMAGE` | Deals typed damage | `{ "tag_name": "DAMAGE", "type": "FIRE", "power": 120 }` |
| `HEAL` | Restores HP | `{ "tag_name": "HEAL", "power": 100 }` |
| `BURN` | DoT (fire damage/turn) | `{ "tag_name": "BURN", "power": 40, "duration": 3, "reset": "TICK_TURN" }` |
| `REGEN` | HoT (heal/turn) | `{ "tag_name": "REGEN", "power": 30, "duration": 3, "reset": "TICK_TURN" }` |
| `FREEZE` | Slows by -5/stack | `{ "tag_name": "FREEZE", "stacks": 5 }` |
| `MOMENTUM` | ×(1+mult) next damage | `{ "tag_name": "MOMENTUM", "multiplier": 0.2, "tier": "advanced" }` |
| `GAIN_RESOURCE` | Adds to resource | `{ "tag_name": "GAIN_RESOURCE", "resource_type": "RAGE", "power": 15 }` |
| `SPEED_BOOST` | +speed next action | `{ "tag_name": "SPEED_BOOST", "amount": 40 }` |
| `MAGIC_CHARGE` | ×(1+mult) next MAGIC dmg | `{ "tag_name": "MAGIC_CHARGE", "multiplier": 0.2, "consume": true, "tier": "advanced" }` |
| `BATTOJUTSU` | ×(1+mult) next attack | `{ "tag_name": "BATTOJUTSU", "multiplier": 0.65, "tier": "advanced" }` |
| `FUEL_TO_THE_FLAMES` | +flat FIRE dmg next | `{ "tag_name": "FUEL_TO_THE_FLAMES", "flat": 50 }` |
| `QUICK_STEPS` | Dodge stance | `{ "tag_name": "QUICK_STEPS", "dodge_range": 10 }` |
| `STEEL_WILL` | -75% damage reduction | `{ "tag_name": "STEEL_WILL", "reset": "ON_OWNER_ACTION" }` |

### Damage Types
`PHYSICAL`, `FIRE`, `FROST`, `MAGIC`

---

## How Scenarios Work

Scenarios live in `src/data/scenarios/*.json`. Auto-loaded — just create the file.

```json
{
  "id": "ferret_group",
  "name": "Ferret Squad",
  "battle_background": "SNOW_BATTLE_FIELD_WIDE",
  "stages": [
    { "enemies": ["ferret_sumurai", "ferret_sumurai", "ferret_sumurai"] }
  ],
  "music": "WAY_OF_THE_SUMURAI_BATTLE_1",
  "rewards": {}
}
```

- `stages[].enemies` — array of enemy IDs. Duplicates = multiple of that enemy.
- Referenced by map levels via `scenario_id`.

---

## How Maps Work

Maps live in `src/data/maps/*.json`. The active map is imported in `MapScreen.jsx` (line 4).

```json
{
  "id": "path_of_the_sumurai",
  "name": "PATH OF THE SUMURAI",
  "cols": 5,
  "rows": 1,
  "zones": [
    {
      "id": 0,
      "name": "IRON GATE",
      "type": "COMBAT",
      "map_icon": "CITADEL_1",
      "levels": [
        {
          "desc": "First contact.",
          "reward": { "general": { "type": "gold", "amount": 20 }, "unlocks": [{ "class": "samurai", "card_ids": ["freeze_slash"] }] },
          "scenario_id": "zone1_level1"
        }
      ]
    }
  ]
}
```

### Zone Types
- **COMBAT** / **CHALLENGE** / **BOSS** → requires `scenario_id`, launches battle
- **EXPLORE** / **RESTORE** / **SHOP** → auto-clears, no battle

### Progression
- Zone 0 always starts available
- Levels unlock sequentially within a zone
- Clearing all levels in a zone unlocks its grid neighbors (up/down/left/right)

### Rewards
```json
"reward": {
  "general": { "type": "gold", "amount": 20 },
  "unlocks": [{ "class": "samurai", "card_ids": ["stream_slash"] }]
}
```
Or just a string for display text: `"reward": "+30 Gold"`

---

## Quick Checklist: Adding a New Enemy

1. Open the right faction file in `src/data/enemies/factions/`
2. Add your enemy object to the `enemies` array
3. Make sure `portrait` key exists in `src/assets/index.js`
4. Create a scenario in `src/data/scenarios/` that uses the enemy ID
5. Add the scenario to a map zone level via `scenario_id`
6. Done — everything auto-loads

## Quick Checklist: Adding a New Tag Handler

1. Create or add to a file in `src/battle/handlers/`
2. Import `registerTag` from `../registry/battle_registry`
3. Define your handler function(s) for specific phases
4. Call `registerTag('TAG_NAME', { phases: [...], handlers: { PHASE: fn } })`
5. Now you can use that tag name in enemy actions and player cards