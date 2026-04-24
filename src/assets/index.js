// ============================================================
//  ASSET INDEX
//  Central export for all image and audio assets.
//  Import from here instead of importing assets directly.
// ============================================================

// Sound effects are loaded dynamically in animationRegistry.js via require().

// --- Portraits ---
export { default as COOL_FOX } from './Cool_Fox.png';
export { default as PORTRAIT_SUMURAI } from './PLAYER_PORTRAITS/SUMURAI_2.png';
export { default as PORTRAIT_SUMURAI_VICTORY } from './PLAYER_PORTRAITS/SUMURAI_2_VICTORY.png';
export { default as PORTRAIT_PALADIN } from './PLAYER_PORTRAITS/PALADIN_2.png';
export { default as PORTRAIT_ROGUE } from './PLAYER_PORTRAITS/ROGUE_3.png';
export { default as PORTRAIT_WARRIOR } from './PLAYER_PORTRAITS/WARRIOR_2.png';
export { default as PORTRAIT_FIGHTER } from './PLAYER_PORTRAITS/FIGHTER_2.png';
export { default as PORTRAIT_MONK } from './PLAYER_PORTRAITS/MONK_2.png';
export { default as PORTRAIT_TEMPLAR } from './PLAYER_PORTRAITS/TEMPLAR.png';
export { default as PORTRAIT_WIZARD } from './PLAYER_PORTRAITS/WIZARD_DARK.png';
export { default as UPSCALED_00017 } from './PLAYER_PORTRAITS/Upscaled_00017_.png';
export { default as UPSCALED_00028 } from './PLAYER_PORTRAITS/Upscaled_00028_.png';
export { default as UPSCALED_00203 } from './PLAYER_PORTRAITS/Upscaled_00203_.png';
export { default as UPSCALED_00235 } from './PLAYER_PORTRAITS/Upscaled_00235_.png';

// --- Scenario Backgrounds ---
import SCENARIO_CITADEL_1_ENEMY    from './SCENARIO/CITADEL_1_ENEMY.png';
import SCENARIO_CABIN_WOOD_1_WIDE  from './SCENARIO/CABIN_WOOD_1_WIDE.png';
import SCENARIO_CABIN_WOOD_2_WIDE  from './SCENARIO/CABIN_WOOD_2_WIDE.png';
import SCENARIO_MOUNTAIN_1_WIDE    from './SCENARIO/MOUNTAIN_1_WIDE.png';
import SCENARIO_MOUNTAIN_2_WIDE    from './SCENARIO/MOUNTAIN_2_WIDE.png';
import SCENARIO_MOUNTAIN_3_WIDE    from './SCENARIO/MOUNTAIN_3_WIDE.png';
import SCENARIO_SECRET_DOOR_1_WIDE from './SCENARIO/SECRET_DOOR_1_WIDE.png';
import SCENARIO_SECRET_DOOR_2_WIDE from './SCENARIO/SECRET_DOOR_2_WIDE.png';
import SCENARIO_SNOW_BATTLE_FIELD_WIDE from './SCENARIO/SNOW_BATTLE_FIELD_WIDE.png';

export const SCENARIO_BACKGROUNDS = {
  CITADEL_1_ENEMY:        SCENARIO_CITADEL_1_ENEMY,
  CABIN_WOOD_1_WIDE:      SCENARIO_CABIN_WOOD_1_WIDE,
  CABIN_WOOD_2_WIDE:      SCENARIO_CABIN_WOOD_2_WIDE,
  MOUNTAIN_1_WIDE:        SCENARIO_MOUNTAIN_1_WIDE,
  MOUNTAIN_2_WIDE:        SCENARIO_MOUNTAIN_2_WIDE,
  MOUNTAIN_3_WIDE:        SCENARIO_MOUNTAIN_3_WIDE,
  SECRET_DOOR_1_WIDE:     SCENARIO_SECRET_DOOR_1_WIDE,
  SECRET_DOOR_2_WIDE:     SCENARIO_SECRET_DOOR_2_WIDE,
  SNOW_BATTLE_FIELD_WIDE: SCENARIO_SNOW_BATTLE_FIELD_WIDE,
};

// --- Enemy Portraits ---
export { default as ENEMY_APPRENTICE_WITCH } from './ENEMY/APPRENTICE_WITCH.png';
export { default as ENEMY_FLAME_WITCH } from './ENEMY/FLAME_WITCH.png';
export { default as ENEMY_FLAME_QUEEN } from './ENEMY/FLAME_QUEEN.png';
export { default as ENEMY_BEAR_SUMURAI } from './ENEMY/BEAR_SUMURAI_3.png';
export { default as ENEMY_FERRET_SUMURAI } from './ENEMY/FERRET_SUMURAI.png';
export { default as ENEMY_TIGER_SUMURAI } from './ENEMY/TIGER_SUMURAI_3.png';
export { default as ENEMY_WOLF_SUMURAI } from './ENEMY/WOLF_SUMURAI_3.png';
export { default as ENEMY_RABBIT_SUMURAI_3 } from './ENEMY/RABBIT_SUMURAI_3.png';
export { default as ENEMY_OTTER_SUMURAI } from './ENEMY/WHITE_OTTER_SUMURAI.png';
export { default as ENEMY_TURTLE_SUMURAI } from './ENEMY/TURTLE_SUMURAI.png';
export { default as ENEMY_FALCON_SUMURAI } from './ENEMY/FALCON_SUMURAI.png';
export { default as ENEMY_BOAR_SUMURAI } from './ENEMY/BOAR_SUMURAI.png';
export { default as ENEMY_DRAGON_SUMURAI } from './ENEMY/DRAGON_SUMURAI_1.png';

// --- Status Icons ---
export { default as STATUS_DEFAULT } from './STATUS/DEFAULT.png';
export { default as STATUS_FROST_1 } from './STATUS/FROST_1.png';
export { default as STATUS_FIRE_1 } from './STATUS/FIRE_1.png';
export { default as STATUS_ELECTRIC_1 } from './STATUS/ELECTRIC_1.png';
export { default as STATUS_DARK_1 } from './STATUS/DARK_1.png';
export { default as STATUS_NATURE_1 } from './STATUS/NATURE_1.png';
export { default as STATUS_NATURE_2 } from './STATUS/NATURE_2.png';
export { default as STATUS_LIGHT_1 } from './STATUS/LIGHT_1.png';
export { default as STATUS_LIGHT_2 } from './STATUS/LIGHT_2.png';
export { default as STATUS_WATER_1 } from './STATUS/WATER_1.png';
export { default as STATUS_WATER_2 } from './STATUS/WATER_2.png';
export { default as STATUS_GOUKI_1 } from './STATUS/GOUKI_1.png';

// --- Class Icons ---
export { default as CLASS_ICON_WARRIOR } from './CLASS_ICONS/WARRIOR.png';
export { default as CLASS_ICON_PALADIN } from './CLASS_ICONS/PALADIN.png';
export { default as CLASS_ICON_MONK } from './CLASS_ICONS/MONK.png';
export { default as CLASS_ICON_ROGUE } from './CLASS_ICONS/ROGUE.png';
export { default as CLASS_ICON_SAMURAI } from './CLASS_ICONS/SAMURAI.png';
export { default as CLASS_ICON_TEMPLAR } from './CLASS_ICONS/TEMPLAR.png';
export { default as CLASS_ICON_WIZARD } from './CLASS_ICONS/WIZARD.png';
export { default as CLASS_ICON_FIGHTER } from './CLASS_ICONS/FIGHTER.png';

// --- Map Icons ---
export { default as MAP_ICON_GARDEN_TOWN }    from './MAP_ICONS/GARDEN_TOWN.png';
export { default as MAP_ICON_GARDEN_TOWN_2 }  from './MAP_ICONS/GARDEN_TOWN_2.png';
export { default as MAP_ICON_SUNSET_VILLAGE }  from './MAP_ICONS/SUNSET_VILLAGE.png';
export { default as MAP_ICON_FOREST_1 }        from './MAP_ICONS/FOREST_1.png';
export { default as MAP_ICON_FOREST_2 }        from './MAP_ICONS/FOREST_2.png';
export { default as MAP_ICON_CITADEL_1 }       from './MAP_ICONS/CITADEL_1.png';
export { default as MAP_ICON_CITADEL_2 }       from './MAP_ICONS/CITADEL_2.png';
export { default as MAP_ICON_CITADEL_3 }       from './MAP_ICONS/CITADEL_3.png';
export { default as MAP_ICON_RUINS }           from './MAP_ICONS/RUINS.png';
export { default as MAP_ICON_ISLAND_1 }        from './MAP_ICONS/ISLAND_1.png';
export { default as MAP_ICON_CASTLE_1 }        from './MAP_ICONS/CASTLE_1.png';
export { default as MAP_ICON_PATH_1 }          from './MAP_ICONS/PATH_1.png';
export { default as MAP_ICON_TREE_1 }          from './MAP_ICONS/TREE_1.png';
export { default as MAP_ICON_TREE_2 }          from './MAP_ICONS/TREE_2.png';
export { default as MAP_ICON_DESERT_CASTLE_1 } from './MAP_ICONS/DESERT_CASTLE_1.png';
export { default as MAP_ICON_DESERT }          from './MAP_ICONS/DESERT.png';
export { default as MAP_ICON_COOL_1 }          from './MAP_ICONS/COOL_1.png';
export { default as MAP_ICON_MOUNTAIN_ARC_1 }  from './MAP_ICONS/MOUNTAIN_ARC_1.png';
export { default as MAP_ICON_NOT_SURE_1 }      from './MAP_ICONS/NOT_SURE_1.png';
export { default as MAP_ICON_GRASS_1 }         from './MAP_ICONS/GRASS_1.png';
export { default as MAP_ICON_GRASS_2 }         from './MAP_ICONS/GRASS_2.png';
export { default as MAP_ICON_GRASS_3 }         from './MAP_ICONS/GRASS_3.png';
export { default as MAP_ICON_GRASS_4 }         from './MAP_ICONS/GRASS_4.png';
export { default as MAP_ICON_GRASS_5 }         from './MAP_ICONS/GRASS_5.png';
export { default as MAP_ICON_GRASS_6 }         from './MAP_ICONS/GRASS_6.png';
export { default as MAP_ICON_2_SNOWY_FOREST }      from './MAP_ICONS_2/Snowy_Forest.png';
export { default as MAP_ICON_2_GREEN_TREE_AT_SNOW } from './MAP_ICONS_2/Green_Tree_At_Snow.png';

// --- Enemy Ability Icons ---
export { default as ENM_DEFAULT }        from './ENEMY_ABILITY_ICONS/ENEMY_DEFAULT_ATTACK.png';
export { default as ENM_SAM_BUFF_1 }    from './ENEMY_ABILITY_ICONS/ENEMY_BUFF_1.png';
export { default as ENM_SAM_BUFF_2 }    from './ENEMY_ABILITY_ICONS/ENEMY_BUFF_2.png';
export { default as ENM_SAM_BUFF_3 }    from './ENEMY_ABILITY_ICONS/ENEMY_BUFF_3.png';
export { default as ENM_SAM_BUFF_4 }    from './ENEMY_ABILITY_ICONS/ENEMY_BUFF_4.png';
export { default as ENM_SAM_FLAME_STRIKE }   from './ENEMY_ABILITY_ICONS/ENEMY_FLAME_STRIKE.png';
export { default as ENM_SAM_FREEZE_SLASH }   from './ENEMY_ABILITY_ICONS/ENEMY_FREEZE_SLASH.png';
export { default as ENM_SAM_HEAVY_STRIKE_1 } from './ENEMY_ABILITY_ICONS/ENEMY_HEAVY_STRIKE_1.png';
export { default as ENM_SAM_PREPARE }        from './ENEMY_ABILITY_ICONS/ENEMY_PREPARE.png';
export { default as ENM_SAM_SHEATH }         from './ENEMY_ABILITY_ICONS/ENEMY_SHEATH.png';
export { default as ENM_SAM_SPEED_UP }       from './ENEMY_ABILITY_ICONS/ENEMY_SPEED_UP.png';
export { default as ENEMY_SPEED_UP }         from './ENEMY_ABILITY_ICONS/ENEMY_SPEED_UP.png';
export { default as ENM_SAM_STANCE_1 }       from './ENEMY_ABILITY_ICONS/ENEMY_STANCE_1.png';
export { default as ENM_SAM_STANCE_2 }       from './ENEMY_ABILITY_ICONS/ENEMY_STANCE_2.png';
export { default as ENM_SAM_STORM_STRIKE }   from './ENEMY_ABILITY_ICONS/ENEMY_STORM_STRIKE.png';
export { default as ENEMY_EVADE }            from './ENEMY_ABILITY_ICONS/ENEMY_EVADE.png';
export { default as ENEMY_STREAM_SLASH }     from './ENEMY_ABILITY_ICONS/ENEMY_STREAM_SLASH.png';
export { default as ENEMY_RESOLVE }          from './ENEMY_ABILITY_ICONS/ENEMY_RESOLVE.png';

// --- Fox Summurai Animation Frames ---
export { default as FOX_SUMMURAI_1 } from './FOX_SUMMURAI/fox_summurai_1.png';
export { default as FOX_SUMMURAI_2 } from './FOX_SUMMURAI/fox_summurai_2.png';
export { default as FOX_SUMMURAI_3 } from './FOX_SUMMURAI/fox_summurai_3.png';
export { default as FOX_SUMMURAI_4 } from './FOX_SUMMURAI/fox_summurai_4.png';
export { default as FOX_SUMMURAI_5 } from './FOX_SUMMURAI/fox_summurai_5.png';
export { default as FOX_SUMMURAI_6 } from './FOX_SUMMURAI/fox_summurai_6.png';
export { default as FOX_SUMMURAI_7 } from './FOX_SUMMURAI/fox_summurai_7.png';
export { default as FOX_SUMMURAI_8 } from './FOX_SUMMURAI/fox_summurai_8.png';
export { default as FOX_SUMMURAI_9 } from './FOX_SUMMURAI/fox_summurai_9.png';
export { default as FOX_SUMMURAI_10 } from './FOX_SUMMURAI/fox_summurai_10.png';
export { default as FOX_SUMMURAI_11 } from './FOX_SUMMURAI/fox_summurai_11.png';
export { default as FOX_SUMMURAI_12 } from './FOX_SUMMURAI/fox_summurai_12.png';
export { default as FOX_SUMMURAI_13 } from './FOX_SUMMURAI/fox_summurai_13.png';
export { default as FOX_SUMMURAI_14 } from './FOX_SUMMURAI/fox_summurai_14.png';
export { default as FOX_SUMMURAI_15 } from './FOX_SUMMURAI/fox_summurai_15.png';
export { default as FOX_SUMMURAI_16 } from './FOX_SUMMURAI/fox_summurai_16.png';
export { default as FOX_SUMMURAI_17 } from './FOX_SUMMURAI/fox_summurai_17.png';
export { default as FOX_SUMMURAI_18 } from './FOX_SUMMURAI/fox_summurai_18.png';
export { default as FOX_SUMMURAI_19 } from './FOX_SUMMURAI/fox_summurai_19.png';
export { default as FOX_SUMMURAI_20 } from './FOX_SUMMURAI/fox_summurai_20.png';
export { default as FOX_SUMMURAI_21 } from './FOX_SUMMURAI/fox_summurai_21.png';
export { default as FOX_SUMMURAI_22 } from './FOX_SUMMURAI/fox_summurai_22.png';
export { default as FOX_SUMMURAI_23 } from './FOX_SUMMURAI/fox_summurai_23.png';
export { default as FOX_SUMMURAI_24 } from './FOX_SUMMURAI/fox_summurai_24.png';
export { default as FOX_SUMMURAI_25 } from './FOX_SUMMURAI/fox_summurai_25.png';
export { default as FOX_SUMMURAI_26 } from './FOX_SUMMURAI/fox_summurai_26.png';
export { default as FOX_SUMMURAI_27 } from './FOX_SUMMURAI/fox_summurai_27.png';
export { default as FOX_SUMMURAI_28 } from './FOX_SUMMURAI/fox_summurai_28.png';
export { default as FOX_SUMMURAI_29 } from './FOX_SUMMURAI/fox_summurai_29.png';
export { default as FOX_SUMMURAI_30 } from './FOX_SUMMURAI/fox_summurai_30.png';
export { default as FOX_SUMMURAI_31 } from './FOX_SUMMURAI/fox_summurai_31.png';
export { default as FOX_SUMMURAI_32 } from './FOX_SUMMURAI/fox_summurai_32.png';
export { default as FOX_SUMMURAI_33 } from './FOX_SUMMURAI/fox_summurai_33.png';
export { default as FOX_SUMMURAI_34 } from './FOX_SUMMURAI/fox_summurai_34.png';
export { default as FOX_SUMMURAI_35 } from './FOX_SUMMURAI/fox_summurai_35.png';
export { default as FOX_SUMMURAI_36 } from './FOX_SUMMURAI/fox_summurai_36.png';
export { default as FOX_SUMMURAI_37 } from './FOX_SUMMURAI/fox_summurai_37.png';
export { default as FOX_SUMMURAI_38 } from './FOX_SUMMURAI/fox_summurai_38.png';
export { default as FOX_SUMMURAI_39 } from './FOX_SUMMURAI/fox_summurai_39.png';
export { default as FOX_SUMMURAI_40 } from './FOX_SUMMURAI/fox_summurai_40.png';
export { default as FOX_SUMMURAI_41 } from './FOX_SUMMURAI/fox_summurai_41.png';
export { default as FOX_SUMMURAI_42 } from './FOX_SUMMURAI/fox_summurai_42.png';
export { default as FOX_SUMMURAI_43 } from './FOX_SUMMURAI/fox_summurai_43.png';
export { default as FOX_SUMMURAI_44 } from './FOX_SUMMURAI/fox_summurai_44.png';
export { default as FOX_SUMMURAI_45 } from './FOX_SUMMURAI/fox_summurai_45.png';
export { default as FOX_SUMMURAI_46 } from './FOX_SUMMURAI/fox_summurai_46.png';
export { default as FOX_SUMMURAI_47 } from './FOX_SUMMURAI/fox_summurai_47.png';
export { default as FOX_SUMMURAI_48 } from './FOX_SUMMURAI/fox_summurai_48.png';
export { default as FOX_SUMMURAI_49 } from './FOX_SUMMURAI/fox_summurai_49.png';
export { default as FOX_SUMMURAI_BATTOJUTSU } from './FOX_SUMMURAI/fox_battōjutsu.png';
export { default as FOX_SUMMURAI_HEAVY_STRIKE } from './FOX_SUMMURAI/fox_heavy_strike_2.png';
export { default as FOX_SUMMURAI_MEND } from './FOX_SUMMURAI/fox_mend.png';
export { default as FOX_SUMMURAI_STILL_WIND } from './FOX_SUMMURAI/fox_still_wind.png';
export { default as FOX_SUMMURAI_FREEZE_SLASH } from './FOX_SUMMURAI/fox_freeze_slash.png';
export { default as FOX_SUMMURAI_FLAME_STRIKE } from './FOX_SUMMURAI/fox_flame_strike.png';
export { default as FOX_QUICK_STEPS } from './FOX_SUMMURAI/fox_quick_steps.png';
export { default as FOX_GUARD_STANCE } from './FOX_SUMMURAI/fox_water_stance.png';
export { default as FOX_SUMMURAI_STREAM_SLASH } from './FOX_SUMMURAI/SUMURAI_STREAM_SLASH.png';
export { default as FOX_STORM_STRIKE } from './FOX_SUMMURAI/fox_storm_strike.png';
export { default as FOX_SHINSOKU} from './FOX_SUMMURAI/fox_shinsoku.png';
