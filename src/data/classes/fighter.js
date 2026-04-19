// ============================================================
//  FIGHTER CLASS
// ============================================================

import { FIGHTER_CARDS } from '../cards/fighter_cards';
import FighterResourceBar from '../../components/resources/FighterResourceBar';

export const FIGHTER = {
  id: 'fighter',
  name: 'Fighter',
  icon: '⚔️',
  portrait: 'PORTRAIT_FIGHTER',
  base_health: 350,
  base_speed: 100,
  total_action_slots: 3,
  resources: [
    { type: 'RAGE', max: 100, starting: 0 },
  ],
  // Always in pool — never removed
  permanent_tags: [
    { tag_name: 'RAGE_ON_HIT', amount: 15, tier: 'permanent' },
  ],
  // Injected at battle start — can be one-time buffs or combat-duration effects
  combat_start_tags: [],
  cards: FIGHTER_CARDS,
  ResourceBar: FighterResourceBar,
  short_rest(player) { return { player, logs: [] }; },
};
