// ============================================================
//  SAMURAI CARDS
//  Pure data. No logic. Images stored as asset key strings —
//  resolved to imports via class_registry.js (localStorage-safe).
// ============================================================

export const SAMURAI_CARDS = [
  {
    id: 'heavy_slice',
    name: 'Heavy Slices',
    speed_mod: -10,
    tag_type: ['PHYSICAL', 'SLASH'],
    cost: {},
    icon: '⚔️',
    image: 'FOX_SUMMURAI_HEAVY_STRIKE',
    color: '#f97316',
    desc: '140 damage. Each hit grants Momentum (+20% next attack). Lasts until end of turn.',
    animation: 'dual_heavy_slice',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'MOMENTUM', multiplier: 0.2, tier: 'advanced' },
      ],
      target: [
        { tag_name: 'DAMAGE', type: 'PHYSICAL', power: 140 },
      ],
    },
  },
  {
    id: 'stream_slash',
    name: 'Stream Slash',
    speed_mod: 0,
    tag_type: ['PHYSICAL', 'SLASH'],
    cost: { BATTLE_SPIRIT: 1 },
    icon: '⚔️',
    image: 'FOX_SUMMURAI_STREAM_SLASH',
    color: '#38bdf8',
    desc: '150 damage. Bypasses evasion (+50% damage to evasive targets). Each hit grants Momentum.',
    tag_interactions: [
      { traits: ['EVASION'], bypass: true, bonus_multiplier: 0.5 },
    ],
    animation: 'stream_slash',
    animation_intensity: 0.7,
    tags: {
      self: [
        { tag_name: 'MOMENTUM', multiplier: 0.5, tier: 'advanced' },
      ],
      target: [
        { tag_name: 'DAMAGE', type: 'PHYSICAL', power: 150 },
      ],
    },
  },

  {
    id: 'mend',
    name: 'Mend',
    speed_mod: 0,
    tag_type: ['MAGIC'],
    cost: { BATTLE_SPIRIT: 3 },
    icon: '💖',
    image: 'FOX_SUMMURAI_MEND',
    color: '#4caf50',
    desc: 'Restore 250 HP and regen 33 HP/turn for 3 turns. Costs 3 Battle Spirit.',
    animation: 'green_marching_ants',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'HEAL', power: 250 },
        { tag_name: 'REGEN', power: 33, duration: 3, reset: 'TICK_TURN' },
      ],
      target: [],
    },
  },
  {
    id: 'speed_up',
    name: 'Shinsoku',
    speed_mod: 20,
    ignores_slot_penalty: true,
    tag_type: ['PHYSICAL'],
    properties: ['SPEED_ACTION'],
    cost: {},
    icon: '💨',
    image: 'FOX_SHINSOKU',
    color: '#38bdf8',
    desc: '+20 speed to your next action. Ignores slot penalty. Does not trigger Still Wind.',
    animation: 'speed_dash_player',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'SPEED_BOOST', amount: 20, max_stacks: 3 },
      ],
      target: [],
    },
  },
  {
    id: 'flame_strike',
    name: 'Flame Strike',
    speed_mod: 0,
    tag_type: ['SPELL', 'MAGIC'],
    cost: { BATTLE_SPIRIT: 3 },
    icon: '🔥',
    image: 'FOX_SUMMURAI_FLAME_STRIKE',
    color: '#ef4444',
    desc: '400 fire damage. Applies Burn. Costs 3 Battle Spirit.',
    animation: 'flame_strike',
    animation_intensity: 1.2,
    tags: {
      self: [],
      target: [
        { tag_name: 'DAMAGE', type: 'FIRE', power: 400 },
        { tag_name: 'BURN', power: 75, duration: 3, reset: 'TICK_TURN' },
      ],
    },
  },
  {
    id: 'freeze_slash',
    name: 'Freeze Slash',
    speed_mod: -10,
    tag_type: ['PHYSICAL', 'SLASH', 'FROST'],
    cost: { BATTLE_SPIRIT: 5 },
    icon: '❄️',
    image: 'FOX_SUMMURAI_FREEZE_SLASH',
    color: '#38bdf8',
    desc: '300 frost damage. Applies Freeze — reduces enemy actions (-2 at 3+ stacks). Costs 5 Battle Spirit.',
    animation: 'ice_slash',
    animation_intensity: 1.0,
    tags: {
      self: [],
      target: [
        { tag_name: 'DAMAGE', type: 'FROST', power: 300 },
        { tag_name: 'FREEZE', stacks: 3 },
      ],
    },
  },
  {
    id: 'battojutsu',
    name: 'Battojutsu',
    speed_mod: 0,
    tag_type: ['PHYSICAL', 'SLASH'],
    cost: {},
    icon: '🔦',
    image: 'FOX_SUMMURAI_BATTOJUTSU',
    color: '#c084fc',
    desc: 'Stance: next attack deals +75% damage, then consumes. Each extra use or non-attack adds a stack (+10% each).',
    animation: 'sumurai_sheath',
    animation_intensity: 1.2,
    tags: {
      self: [
        { tag_name: 'BATTOJUTSU', multiplier: 0.65, tier: 'advanced' },
      ],
      target: [],
    },
  },
  {
    id: 'quick_steps',
    name: 'Quick Steps',
    speed_mod: 0,
    tag_type: ['PHYSICAL', 'STANCE'],
    cost: {},
    icon: '👣',
    image: 'FOX_QUICK_STEPS',
    color: '#a5f3fc',
    desc: 'Dodge stance: evade all attacks within -10 speed of this action. Ends after your next action.',
    animation: 'run_circle',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'QUICK_STEPS', dodge_range: 10, reset: ['ON_OWNER_ACTION', 'END_OF_TURN'] },
      ],
      target: [],
    },
  },
  {
    id: 'still_wind',
    name: 'Still Wind',
    speed_mod: 0,
    tag_type: ['SPIRITUAL', 'STANCE'],
    cost: {},
    icon: '🌬️',
    image: 'FOX_SUMMURAI_STILL_WIND',
    color: '#e879f9 ',
    desc: 'Gain 1 Battle Spirit. Earn +1 Spirit per action for 3 actions. Breaks if you take damage. Does not trigger on speed actions.',
    animation: 'buff',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'GAIN_RESOURCE', resource_type: 'BATTLE_SPIRIT', power: 1 },
        { tag_name: 'STILL_WIND', stacks: 3 },
      ],
      self_if: [
        {
          owner_has: 'STILL_WIND',
          tags: [
            { tag_name: 'HEAL', power: 50 },
            { tag_name: 'STILL_WIND', stacks: 3 },
          ],
        },
      ],
      target: [],
    },
  },
  {
    id: 'storm_strike',
    name: 'Storm Strike',
    speed_mod: 0,
    tag_type: ['PHYSICAL', 'SLASH', 'STORM'],
    cost: { BATTLE_SPIRIT: 3 },
    properties: ['AOE'],
    icon: '⚡',
    image: 'FOX_STORM_STRIKE',
    color: '#818cf8',
    desc: '150 lightning damage to all enemies. Applies Electrified (-20 speed for 3 turns). Costs 3 Battle Spirit.',
    animation: 'storm_strike',
    animation_intensity: 1.2,
    tags: {
      self: [],
      target: [
        { tag_name: 'DAMAGE', type: 'PHYSICAL', power: 150 },
        { tag_name: 'ELECTRIFIED', stacks: 4 },
      ],
    },
  },
  {
    id: 'harai',
    name: 'Harai',
    speed_mod: 20,
    tag_type: ['SPIRITUAL', 'STANCE'],
    cost: { BATTLE_SPIRIT: 1 },
    icon: '🌿',
    image: 'FOX_GUARD_STANCE',
    color: '#6ee7b7',
    desc: 'Clears all debuffs. Reduce incoming damage by 75% until your next action or end of turn. Costs 1 Battle Spirit.',
    animation: 'harai',
    animation_intensity: 1.0,
    tags: {
      self: [
        { tag_name: 'HARAI', reset: ['ON_OWNER_ACTION', 'END_OF_TURN'] },
      ],
      target: [],
    },
  },
];
