// ============================================================
//  FIGHTER CARDS
//  Pure data. No logic. Images stored as asset key strings —
//  resolved to imports via class_registry.js (localStorage-safe).
// ============================================================

export const FIGHTER_CARDS = [
  {
    id: 'heavy_slice',
    name: 'Heavy Slice',
    speed_mod: -10,
    tag_type: ['PHYSICAL', 'SLASH'],
    cost: {},
    icon: '⚔️',
    image: 'FOX_SUMMURAI_4',
    color: '#e94560',
    desc: 'A powerful slash attack.',
    animation: 'shake',
    animation_intensity: 1.5,
    tags: {
      self: [
        { tag_name: 'MOMENTUM', multiplier: 0.2, tier: 'advanced' },
      ],
      target: [
        { tag_name: 'DAMAGE', type: 'PHYSICAL', power: 50 },
      ],
    },
  },
  {
    id: 'quick_slice',
    name: 'Quick Slice',
    speed_mod: 10,
    tag_type: ['PHYSICAL', 'SLASH'],
    cost: {},
    icon: '🔪',
    image: 'FOX_SUMMURAI_21',
    color: '#ff6b35',
    desc: 'A fast light slash.',
    animation: 'shake',
    animation_intensity: 1.0,
    tags: {
      self: [],
      target: [
        { tag_name: 'DAMAGE', type: 'PHYSICAL', power: 25 },
      ],
    },
  },
  
  {
    id: 'mend',
    name: 'Mend',
    speed_mod: -50,
    tag_type: ['MAGIC'],
    cost: {},
    icon: '💖',
    image: 'FOX_SUMMURAI_40',
    color: '#4caf50',
    desc: 'Restore 100 HP.',
    tags: {
      self: [
        { tag_name: 'HEAL', power: 100 },
        { tag_name: 'REGEN', power: 25, duration: 3, reset: 'TICK_TURN' },
      ],
      target: [],
    },
  },
  {
    id: 'magic_charge',
    name: 'Magic Charge',
    speed_mod: 0,
    tag_type: ['WIZARD_PREP', 'SPELL', 'MAGIC', 'CHARGING'],
    cost: {},
    icon: '✨',
    image: 'FOX_SUMMURAI_3',
    color: '#7c3aed',
    desc: 'Charge next MAGIC attack by 20%. Restore 25 mana.',
    tags: {
      self: [
        { tag_name: 'MAGIC_CHARGE', multiplier: 0.2, consume: true, tier: 'advanced' },
        { tag_name: 'GAIN_RESOURCE', resource_type: 'MANA', power: 25 },
      ],
      target: [],
    },
  },
  {
    id: 'fuel_to_the_flames',
    name: 'Fuel to the Flames',
    speed_mod: 0,
    tag_type: ['WIZARD_PREP', 'SPELL', 'MAGIC', 'CHARGING'],
    cost: {},
    icon: '🔥',
    image: 'FOX_SUMMURAI_41',
    color: '#f97316',
    desc: 'Add +50 flat damage to next FIRE attack.',
    tags: {
      self: [
        { tag_name: 'FUEL_TO_THE_FLAMES', flat: 50 },
      ],
      target: [],
    },
  },
  {
    id: 'speed_up',
    name: 'Speed Up',
    speed_mod: 100,
    tag_type: ['PHYSICAL'],
    cost: {},
    icon: '💨',
    image: 'FOX_SUMMURAI_9',
    color: '#38bdf8',
    desc: 'Boost the speed of your next action by 50.',
    tags: {
      self: [
        { tag_name: 'SPEED_BOOST', amount: 150 },
      ],
      target: [],
    },
  },
  {
    id: 'flame_strike',
    name: 'Flame Strike',
    speed_mod: 0,
    tag_type: ['WIZARD_PREP', 'SPELL', 'MAGIC'],
    cost: { WIZARD_MANA: 100 },
    icon: '🔥',
    image: 'FOX_SUMMURAI_1',
    color: '#ef4444',
    desc: 'Strike target with fire for 150 damage.',
    animation: 'burn',
    animation_intensity: 1.2,
    tags: {
      self: [],
      target: [
        { tag_name: 'DAMAGE', type: 'FIRE', power: 150 },
        { tag_name: 'BURN', power: 33, duration: 3, reset: 'TICK_TURN' },
      ],
    },
  },
];
