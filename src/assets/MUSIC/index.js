// ============================================================
//  MUSIC REGISTRY
//  Maps music track IDs (used in scenario JSON) to audio files.
// ============================================================

import battleTheme from './BATTLE_THEME.mp3';
import menuMapTheme from './MENU_MAP_THEME.mp3';
import menuMapTheme3 from './MENU_MAP_THEME_3.mp3';
import wayOfTheSamurai from './WAY_OF_THE_SAMURAI_BATTLE_1.mp3';
import wayOfTheSamurai2 from './WAY_OF_THE_SAMURAI_BATTLE_2.mp3';
import wayOfTheSamurai3 from './WAY_OF_THE_SAMURAI_BATTLE_3.mp3';
import wayOfTheSamurai4 from './WAY_OF_THE_SAMURAI_BATTLE_4.mp3';
import wayOfTheSamurai5 from './WAY_OF_THE_SAMURAI_BATTLE_5.mp3';
import samuraiVictory from './SAMURAI_VICTORY.mp3';
import samuraiDefeat from './SAMURAI_DEFEAT.mp3';
import introMusic from './INTRO.mp3';
import samuraiCompletion from './SAMURAI_COMPLETION.mp3';
import samuraiBoss1 from './SAMURAI_BOSS_1.mp3';
import samuraiTutorial from './SAMURAI_TUTORIAL.mp3';

export { samuraiDefeat as introMusic };

export const MUSIC_REGISTRY = {
  battle_theme: battleTheme,
  menu_map_theme: menuMapTheme,
  menu_map_theme_3: menuMapTheme3,
  WAY_OF_THE_SAMURAI_BATTLE_1: wayOfTheSamurai,
  WAY_OF_THE_SAMURAI_BATTLE_2: wayOfTheSamurai2,
  WAY_OF_THE_SAMURAI_BATTLE_3: wayOfTheSamurai3,
  WAY_OF_THE_SAMURAI_BATTLE_4: wayOfTheSamurai4,
  WAY_OF_THE_SAMURAI_BATTLE_5: wayOfTheSamurai5,


  SAMURAI_BOSS_1: samuraiBoss1,
  SAMURAI_TUTORIAL: samuraiTutorial,
  samurai_victory: samuraiVictory,
  samurai_defeat: samuraiDefeat,
  samurai_completion: samuraiCompletion,
};

export const COMPLETION_MUSIC = {
  SAMURAI: 'samurai_completion',
  default: 'samurai_completion',
};

export const VICTORY_MUSIC = {
  SAMURAI: 'samurai_victory',
  default: 'samurai_victory',
};

export const DEFEAT_MUSIC = {
  SAMURAI: 'samurai_defeat',
  default: 'samurai_defeat',
};
