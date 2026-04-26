// ============================================================
//  SAMURAI CLASS
// ============================================================

import { SAMURAI_CARDS } from '../cards/samurai_cards';
import SamuraiResourceBar from '../../components/resources/SamuraiResourceBar';

// perk_list — future perks to consider for the Samurai class:
//   - PATH_OF_THE_SUMURAI completion: +250 max HP (implemented via stat_boosts / UPGRADE_STAT)
//   - map levels will reward unique perks (e.g. passive abilities, stat upgrades) tied to that level's story/encounter

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
  starting_cards: ['heavy_slice', 'flame_strike', 'battojutsu', ],
  //starting_cards: ['heavy_slice', 'flame_strike', 'storm_strike', 'quick_steps', 'still_wind', 'harai', 'mend', 'speed_up', 'freeze_slash', 'stream_slash', 'battojutsu'],
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
    const restLogs = [];
    player.temp_hp = 0;
    if (player.resources?.BATTLE_SPIRIT) {
      const prev = player.resources.BATTLE_SPIRIT.current;
      player.resources.BATTLE_SPIRIT.current = Math.min(3, player.resources.BATTLE_SPIRIT.max);
      const next = player.resources.BATTLE_SPIRIT.current;
      if (next !== prev) restLogs.push({ msg: `🌀 ${player.name} — Battle Spirit reset to ${next}`, type: 'info' });
    }
    const half = Math.floor(player.max_health / 2);
    const prevHp = player.health;
    if (player.health < half) {
      player.health = half;
      restLogs.push({ msg: `💚 ${player.name} — restored to ${player.health} HP`, type: 'heal' });
    } else {
      player.health = Math.min(player.max_health, Math.floor(player.health * 1.1));
      if (player.health > prevHp) restLogs.push({ msg: `💚 ${player.name} — recovered ${player.health - prevHp} HP`, type: 'heal' });
    }
    return { player, logs: restLogs };
  },
};
