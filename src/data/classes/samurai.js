// ============================================================
//  SAMURAI CLASS
// ============================================================

import { SAMURAI_CARDS } from '../cards/samurai_cards';
import SamuraiResourceBar from '../../components/resources/SamuraiResourceBar';

export const SAMURAI = {
  id: 'samurai',
  name: 'Samurai',
  icon: '⚔️',
  portrait: 'PORTRAIT_SUMURAI',
  victory_portrait: 'PORTRAIT_SUMURAI_VICTORY',
  base_health: 750,
  base_speed: 100,
  total_action_slots: 3,
  resources: [
    { type: 'BATTLE_SPIRIT', max: 10, starting: 0 },
  ],
  permanent_tags: [
    { tag_name: 'UNDER_THE_SUN', tier: 'permanent' },
  ],
  combat_start_tags: [],
  starting_cards: ['heavy_slice', 'flame_strike', 'battojutsu', 'still_wind'],
  // starting_cards: ['heavy_slice', 'flame_strike', 'storm_strike', 'quick_steps', 'stream_slash', 'still_wind', 'gouki', 'mend', 'speed_up',  ' 'freeze_slash', 'stream_slash'],
  card_order: [
    'heavy_slice',
    'stream_slash',
    'quick_slice',
    'freeze_slash',
    'storm_strike',
    'flame_strike',
    'battojutsu',
    'speed_up',
    'quick_steps',
    'steel_will',
    'gouki',
    'still_wind',
    'focus_spirit',
    'mend',
  ],
  cards: SAMURAI_CARDS,
  ResourceBar: SamuraiResourceBar,
  short_rest(player) {
    player.temp_hp = 0;
    if (player.resources?.BATTLE_SPIRIT) {
      player.resources.BATTLE_SPIRIT.current = Math.min(3, player.resources.BATTLE_SPIRIT.max);
    }
    const half = Math.floor(player.max_health / 2);
    if (player.health < half) {
      player.health = half;
    } else {
      player.health = Math.min(player.max_health, Math.floor(player.health * 1.1));
    }
    return player;
  },
};
