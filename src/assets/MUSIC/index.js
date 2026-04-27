// ============================================================
//  MUSIC REGISTRY
//  Maps music track IDs (used in scenario JSON) to audio files.
// ============================================================

import battleTheme from './Battle Theme.mp3';
import menuMapTheme from './Menu Map Theme.mp3';
import menuMapTheme3 from './Menu Map Theme 3.mp3';
import wayOfTheSumurai from './WAY_OF_THE_SUMURAI_BATTLE_1.mp3';
import wayOfTheSumurai2 from './WAY_OF_THE_SUMURAI_BATTLE_2.mp3';
import wayOfTheSumurai3 from './WAY_OF_THE_SUMURAI_BATTLE_3.mp3';
import wayOfTheSumurai4 from './WAY_OF_THE_SUMURAI_BATTLE_4.mp3';
import wayOfTheSumurai5 from './WAY_OF_THE_SUMURAI_BATTLE_5.mp3';
import samuraiVictory from './Samurai Victory.mp3';
import sumuraiDefeat from './Sumurai Defeat.mp3';
import introMusic from './intro.mp3';
import samuraiCompletion from './Samurai Completion.mp3';
import sumuraiBoss1 from './Sumurai Boss 1.mp3';

export { sumuraiDefeat as introMusic };

export const MUSIC_REGISTRY = {
  battle_theme: battleTheme,
  menu_map_theme: menuMapTheme,
  menu_map_theme_3: menuMapTheme3,
  WAY_OF_THE_SUMURAI_BATTLE_1: wayOfTheSumurai,
  WAY_OF_THE_SUMURAI_BATTLE_2: wayOfTheSumurai2,
  WAY_OF_THE_SUMURAI_BATTLE_3: wayOfTheSumurai3,
  WAY_OF_THE_SUMURAI_BATTLE_4: wayOfTheSumurai4,
  WAY_OF_THE_SUMURAI_BATTLE_5: wayOfTheSumurai5,


  SUMURAI_BOSS_1: sumuraiBoss1,
  samurai_victory: samuraiVictory,
  sumurai_defeat: sumuraiDefeat,
  samurai_completion: samuraiCompletion,
};

export const COMPLETION_MUSIC = {
  SUMURAI: 'samurai_completion',
  default: 'samurai_completion',
};

export const VICTORY_MUSIC = {
  SUMURAI: 'samurai_victory',
  default: 'samurai_victory',
};

export const DEFEAT_MUSIC = {
  SUMURAI: 'sumurai_defeat',
  default: 'sumurai_defeat',
};
