// ============================================================
//  UI REGISTRY
//  Maps tag_name → { icon, color, statusIcon, describe(tag) }
//  describe(tag) returns a human-readable string for display.
//  This registry is UI-only — battle logic never touches it.
//
// ============================================================

import { STATUS_NATURE_1, STATUS_FROST_1, STATUS_FIRE_1, FOX_QUICK_STEPS, FOX_SUMMURAI_STILL_WIND, FOX_SUMMURAI_BATTOJUTSU, FOX_SUMMURAI_HEAVY_STRIKE,
         ENEMY_SPEED_UP, ENEMY_EVADE, STATUS_GOUKI_1,
 } from '../../assets';

export const ui_registry = {

  MAGIC_CHARGE: {
    icon: '✨',
    color: '#7c3aed',
    describe: (tag) => {
      const pct = Math.round(tag.multiplier * tag.stack_count * 100);
      return `+${pct}% next MAGIC hit`;
    },
  },

  MOMENTUM: {
    icon: '💨',
    statusIcon: FOX_SUMMURAI_HEAVY_STRIKE,
    color: '#ff6b35',
    describe: (tag) => {
      const pct = Math.round(tag.multiplier * tag.stack_count * 100);
      return `+${pct}% PHYSICAL damage`;
    },
  },

  FIRE_CHARGE: {
    icon: '🔥',
    color: '#ef4444',
    describe: (tag) => {
      const pct = Math.round(tag.multiplier * 100);
      return `+${pct}% next FIRE hit`;
    },
  },

  FUEL_TO_THE_FLAMES: {
    icon: '🌋',
    color: '#f97316',
    describe: (tag) => `+${tag.flat} flat FIRE damage`,
  },

  SPEED_BOOST: {
    icon: '⚡',
    statusIcon: ENEMY_SPEED_UP,
    color: '#eab308',
    describe: (tag) => {
      const base = `+${tag.amount} speed`;
      if (tag.mode === 'turns') return `${base} (${tag.duration}T)`;
      return base;
    },
  },

  COMBO_STACK: {
    icon: '⚔️',
    color: '#6b7280',
    describe: (tag) => {
      const n = tag.stack_count || 0;
      return `${n} hit${n !== 1 ? 's' : ''} combo`;
    },
  },

  FORWARD_INITIATIVE: {
    icon: '🎯',
    color: '#22c55e',
    describe: (tag) => {
      const n = tag.stack_count || 0;
      return `+${n} action slot${n !== 1 ? 's' : ''}`;
    },
  },

  FIRE_IMBUE: {
    icon: '🔥',
    color: '#dc2626',
    describe: () => 'Next hit becomes FIRE',
  },

  ICE_IMBUE: {
    icon: '❄️',
    color: '#38bdf8',
    describe: () => 'Next hit becomes ICE',
  },

  REGEN: {
    icon: '💚',
    statusIcon: STATUS_NATURE_1,
    color: '#22c55e',
    describe: (tag) => `+${tag.power} HP/turn`,
  },

  OLD_FREEZE: {
    icon: '🧊',
    statusIcon: STATUS_FROST_1,
    color: '#38bdf8',
    describe: (tag) => {
      const s = tag.stacks ?? 1;
      return `-${s * 5} speed (${s} stack${s !== 1 ? 's' : ''}, max 10)`;
    },
  },

  FREEZE: {
    icon: '🧊',
    statusIcon: STATUS_FROST_1,
    color: '#38bdf8',
    describe: (tag) => {
      const s = tag.stacks ?? 1;
      const actions = s >= 3 ? 2 : 1;
      return `-${actions} action${actions > 1 ? 's' : ''}, -10 speed (${s} stack${s !== 1 ? 's' : ''})`;
    },
  },

  BURN: {
    icon: '🔥',
    statusIcon: STATUS_FIRE_1,
    color: '#f97316',
    describe: (tag) => `-${tag.power} HP/turn`,
  },

  BATTOJUTSU: {
    icon: '🔦',
    color: '#c084fc',
    statusIcon: FOX_SUMMURAI_BATTOJUTSU,
    describe: (tag) => {
      const base = Math.round((tag.base_boost ?? 0.65) * 100);
      const stacks = tag.stack_count ?? 0;
      const total = base + stacks * 10;
      return `+${total}% next attack (${stacks}/10 stacks, ${base}% base)`;
    },
  },

  QUICK_STEPS: {
    icon: '👣',
    statusIcon: ENEMY_EVADE,
    color: '#38bdf8',
    describe: (tag) => {
      if (tag.dodge_anchor == null) return 'Dodge stance active';
      return `Dodge window: ${tag.dodge_anchor - (tag.dodge_range ?? 5)}–${tag.dodge_anchor} speed`;
    },
  },

  STILL_WIND: {
    icon: '🌬️',
    statusIcon: FOX_SUMMURAI_STILL_WIND,
    color: '#a78bfa',
    describe: () => '+1 Battle Spirit per action. Removed on damage.',
  },

  ELECTRIFIED: {
    icon: '⚡',
    color: '#facc15',
    describe: (tag) => {
      const s = tag.stacks ?? 10;
      return `Injects SHOCKED each turn · ${s} stack${s !== 1 ? 's' : ''}`;
    },
  },

  SHOCKED: {
    icon: '🌩️',
    color: '#facc15',
    describe: () => '-20 speed (first action)',
  },

  GOUKI: {
    icon: '🛡️',
    color: '#34d399',
    statusIcon: STATUS_GOUKI_1,
    describe: (tag) => {
      const s = tag.stacks ?? 3;
      const pct = Math.min(s * 25, 75);
      return `${pct}% damage reduction · ${s}/3 stack${s !== 1 ? 's' : ''} · Cleanses debuffs on gain`;
    },
  },

  HARAI: {
    icon: '🌿',
    color: '#6ee7b7',
    describe: () => '75% damage reduction · Expires on next action or end of turn',
  },

};

export const UI_DEFAULT = { icon: '🔮', color: '#4da6ff', describe: () => 'active' };
