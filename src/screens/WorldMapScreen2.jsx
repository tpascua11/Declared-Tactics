import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MAP_ICON_GARDEN_TOWN, MAP_ICON_GARDEN_TOWN_2, MAP_ICON_SUNSET_VILLAGE,
  MAP_ICON_FOREST_1, MAP_ICON_FOREST_2,
  MAP_ICON_CITADEL_1, MAP_ICON_CITADEL_2, MAP_ICON_CITADEL_3,
  MAP_ICON_RUINS, MAP_ICON_ISLAND_1, MAP_ICON_CASTLE_1, MAP_ICON_PATH_1,
  MAP_ICON_TREE_1, MAP_ICON_TREE_2, MAP_ICON_DESERT_CASTLE_1, MAP_ICON_DESERT,
  MAP_ICON_COOL_1, MAP_ICON_MOUNTAIN_ARC_1, MAP_ICON_NOT_SURE_1,
  MAP_ICON_GRASS_1, MAP_ICON_GRASS_2, MAP_ICON_GRASS_3,
  MAP_ICON_GRASS_4, MAP_ICON_GRASS_5, MAP_ICON_GRASS_6,
  MAP_ICON_SNOWY_FOREST, MAP_ICON_GREEN_TREE_AT_SNOW,
  MAP_ICON_BIG_SNOW_CAVE, MAP_ICON_BIG_SNOW_CAVE_2, MAP_ICON_HOME,
  MAP_ICON_SNOW_CHERRY_PATH_1, MAP_ICON_SNOW_FIELD_PATH_1, MAP_ICON_SNOW_FIELD_PATH_2, MAP_ICON_SNOW_FIELD_PATH_3,
  MAP_ICON_SNOW_FIELD_SHRINE, MAP_ICON_SNOW_IRON_GATE, MAP_ICON_SNOW_MOUNTAIN_1, MAP_ICON_SNOW_MOUNTAIN_2,
  MAP_ICON_SNOW_AND_WATER, MAP_ICON_SNOW_AND_WATER_2, MAP_ICON_SNOWY_FIELD_BAMBOO, MAP_ICON_SNOWY_FIELD_DEN,
  MAP_ICON_SUNSET, MAP_ICON_SUNSET_2, MAP_ICON_TREE_AT_SNOW, MAP_ICON_WATER,
  ITEM_GOLD_1,
} from '../assets';
import SUNSWORD_5 from '../assets/World/Sunsword5.png';
import SUNSWORD_6 from '../assets/World/Sunsword6.png';
import SUNSWORD_7 from '../assets/World/Sunsword7.png';
import PLAYER_SAMURAI from '../assets/Player_Map_Icons/SAMURAI.png';
import BOOK_ICON from '../assets/UI/BOOK.png';
import SUN_ICON from '../assets/UI/SUN.png';
import WEAPON_ICON from '../assets/UI/WEAPON.png';
import OPEN_BOOK_ICON from '../assets/UI/OPEN_BOOK.png';
import NOTE_BOOK_ICON from '../assets/UI/NOTE_BOOK.png';
import MOON_ICON from '../assets/UI/MOON.png';
import WORLD_ICON_1 from '../assets/World_Map_Icons/world-icon-1.png';
import WORLD_ICON_2 from '../assets/World_Map_Icons/world-icon-2.png';
import SNOWY_PAGODA_MOUNTAIN_SHRINE from '../assets/World_Map_Icons/Snowy Pagoda Mountain Shrine.png';
import { setWeather } from '../vfx/weatherBus';
import samuraiMapTheme from '../assets/Music/SAMURAI_MAP_THEME_1.mp3';
import { useMusic } from '../hooks/useMusic';
import { DIALOG_REGISTRY } from '../data/dialogs/dialog_registry';
import { getCampaign } from '../data/campaigns/campaign_registry';
import { usePlayer } from '../context/PlayerContext';
import DialogModal from '../dialog/DialogModal';
import EventModal from '../event/EventModal';
import { useScenarioRunner } from '../event/useScenarioRunner';
import { meetsRequires } from '../event/requires';
import GuideModal from '../components/battle/GuideModal';
import SettingsModal from '../components/map/SettingsModal';
import { playSelectSfx } from '../vfx/animationRegistry';

const MAP_ICON_LOOKUP = {
  GARDEN_TOWN:    MAP_ICON_GARDEN_TOWN,
  GARDEN_TOWN_2:  MAP_ICON_GARDEN_TOWN_2,
  SUNSET_VILLAGE: MAP_ICON_SUNSET_VILLAGE,
  FOREST_1:       MAP_ICON_FOREST_1,
  FOREST_2:       MAP_ICON_FOREST_2,
  CITADEL_1:      MAP_ICON_CITADEL_1,
  CITADEL_2:      MAP_ICON_CITADEL_2,
  CITADEL_3:      MAP_ICON_CITADEL_3,
  RUINS:          MAP_ICON_RUINS,
  ISLAND_1:       MAP_ICON_ISLAND_1,
  CASTLE_1:       MAP_ICON_CASTLE_1,
  PATH_1:         MAP_ICON_PATH_1,
  TREE_1:         MAP_ICON_TREE_1,
  TREE_2:         MAP_ICON_TREE_2,
  DESERT_CASTLE_1:MAP_ICON_DESERT_CASTLE_1,
  DESERT:         MAP_ICON_DESERT,
  COOL_1:         MAP_ICON_COOL_1,
  MOUNTAIN_ARC_1: MAP_ICON_MOUNTAIN_ARC_1,
  NOT_SURE_1:     MAP_ICON_NOT_SURE_1,
  GRASS_1:        MAP_ICON_GRASS_1,
  GRASS_2:        MAP_ICON_GRASS_2,
  GRASS_3:        MAP_ICON_GRASS_3,
  GRASS_4:          MAP_ICON_GRASS_4,
  GRASS_5:          MAP_ICON_GRASS_5,
  GRASS_6:          MAP_ICON_GRASS_6,
  Snowy_Forest:       MAP_ICON_SNOWY_FOREST,
  Green_Tree_At_Snow: MAP_ICON_GREEN_TREE_AT_SNOW,
  Big_Snow_Cave:      MAP_ICON_BIG_SNOW_CAVE,
  Big_Snow_Cave_2:    MAP_ICON_BIG_SNOW_CAVE_2,
  Home:               MAP_ICON_HOME,
  Snow_Cherry_Path_1: MAP_ICON_SNOW_CHERRY_PATH_1,
  Snow_Field_Path_1:  MAP_ICON_SNOW_FIELD_PATH_1,
  Snow_Field_Path_2:  MAP_ICON_SNOW_FIELD_PATH_2,
  Snow_Field_Path_3:  MAP_ICON_SNOW_FIELD_PATH_3,
  Snow_Field_Shrine:  MAP_ICON_SNOW_FIELD_SHRINE,
  Snow_Iron_Gate:     MAP_ICON_SNOW_IRON_GATE,
  Snow_Mountain_1:    MAP_ICON_SNOW_MOUNTAIN_1,
  Snow_Mountain_2:    MAP_ICON_SNOW_MOUNTAIN_2,
  Snow_and_Water:     MAP_ICON_SNOW_AND_WATER,
  Snow_and_Water_2:   MAP_ICON_SNOW_AND_WATER_2,
  Snowy_Field_Bamboo: MAP_ICON_SNOWY_FIELD_BAMBOO,
  Snowy_Field_Den:    MAP_ICON_SNOWY_FIELD_DEN,
  Sunset:             MAP_ICON_SUNSET,
  Sunset_2:           MAP_ICON_SUNSET_2,
  Tree_At_Snow:       MAP_ICON_TREE_AT_SNOW,
  Water:              MAP_ICON_WATER,
  World_Icon_1:                  WORLD_ICON_1,
  World_Icon_2:                  WORLD_ICON_2,
  Snowy_Pagoda_Mountain_Shrine:  SNOWY_PAGODA_MOUNTAIN_SHRINE,
};

// Sunsword7.png's native pixel size (checked via Get-Image on the file).
const SUNSWORD_W = 1672;
const SUNSWORD_H = 941;
const GAME_CANVAS_W = 1920;
const MAP_SCALE = GAME_CANVAS_W / SUNSWORD_W;

const STATIC_STYLES = {
  root: {
    background: "#080c14",
    color: "#dde",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Courier New', monospace",
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    zIndex: 99,
    pointerEvents: "none",
    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)",
  },
  topbar: {
    height: 46,
    flexShrink: 0,
    background: "#050810",
    borderBottom: "1px solid rgba(77,166,255,0.12)",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 20,
    zIndex: 100,
    position: "relative",
  },
  // The screen's two stacked rows: rowTop (topbar + map frame) at its natural
  // height, rowBottom (PlayerHud) takes the remaining height.
  rowTop: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
  },
  rowBottom: {
    flex: "1 1 auto",
    minHeight: 0,
    display: "flex",
    alignItems: "stretch",
    gap: 20,
    padding: "12px 24px",
    boxSizing: "border-box",
    background: "#050810",
    borderTop: "1px solid rgba(77,166,255,0.12)",
    position: "relative",
    zIndex: 100,
  },
  // Scrollable viewport — the void gradients are its own static background
  // (default background-attachment: scroll keeps them pinned to the visible
  // box, not the scrolled content), while the oversized image+grid live in
  // the larger `canvas` div below so there's actually something to pan.
  main: {
    flex: "0 0 auto",
    height: Math.round(SUNSWORD_H * MAP_SCALE * 0.75),
    width: GAME_CANVAS_W * 0.95,
    alignSelf: "center",
    margin: "40px 0 auto",
    border: "2px solid #fff",
    boxSizing: "content-box",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    backgroundColor: "#000000",
    backgroundImage: [
      "radial-gradient(ellipse at 50% 38%, rgba(30,20,50,0.35), transparent 65%)",
      "linear-gradient(155deg, #050308 0%, #020103 45%, #000000 100%)",
    ].join(","),
    boxShadow: "inset 0 0 200px rgba(0,0,0,0.9)",
  },
  // Map background (set inline from map.background) scaled to the game canvas
  // width — canvas matches so main scrolls vertically. margin:auto (not flex
  // centering) keeps the top reachable once the canvas overflows main.
  canvas: {
    position: "relative",
    flexShrink: 0,
    width: GAME_CANVAS_W,
    height: Math.round(SUNSWORD_H * MAP_SCALE),
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  },
};

// One-off try: a location as a card (art + title) instead of a bare icon box.
const CARD_W = 128;
const CARD_H = 160;

const LocationCard = ({ title, mapIconSrc, isSelected }) => (
  <div
    style={{
      width: CARD_W,
      height: CARD_H,
      display: "flex",
      flexDirection: "column",
      background: "transparent",
      border: "2px solid transparent",
      borderRadius: 8,
      overflow: "hidden",
      cursor: "pointer",
    }}
  >
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={mapIconSrc}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none" }}
      />
    </div>
    <div
      className={isSelected ? "title-selected" : undefined}
      style={{
        position: "relative",
        border: "2px solid transparent",
        margin: "-24px 0 4px",
        whiteSpace: "nowrap",
        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 35%, rgba(255,255,255,0) 100%)",
        padding: "6px 2px",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        fontWeight: "bold",
        letterSpacing: 0.5,
        textAlign: "center",
        color: "#000",
        textTransform: "uppercase",
      }}
    >
      {isSelected && (
        <img
          src={PLAYER_SAMURAI}
          alt=""
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            imageRendering: "pixelated",
            pointerEvents: "none",
          }}
        />
      )}
      {title}
    </div>
  </div>
);

// Selected card's title gets a glowing white border.
const MARCHING_ANTS_CSS = `
.title-selected {
  border-color: #fff !important;
  box-shadow: 0 0 10px 2px rgba(255,255,255,0.9), inset 0 0 8px rgba(255,255,255,0.8);
}
`;

// Template values — wire to playerData later.
const HUD_BUTTON_SIZE = 88;
const HUD_BUTTONS = [
  { label: 'Guidance', icon: SUN_ICON,       modal: 'guide' },
  { label: 'Skillset', icon: WEAPON_ICON },
  { label: 'Bestiary',  icon: OPEN_BOOK_ICON },
  { label: 'Journal',   icon: NOTE_BOOK_ICON },
  { label: 'Location',  icon: BOOK_ICON },
  { label: 'Settings',  icon: MOON_ICON,      modal: 'settings' },
];
const HUD_STATS = [
  { label: 'HP',           value: 100, max: 100, color: '#e04848' },
  { label: 'BATTLE SPIRIT', value: 60,  max: 100, color: '#4da6ff' },
];

const HUD_FRAME = {
  boxSizing: "border-box",
  border: "2px solid rgba(255,255,255,0.18)",
  borderRadius: 10,
  background: "linear-gradient(180deg, rgba(20,28,44,0.9), rgba(8,12,20,0.95))",
  overflow: "hidden",
};

// Inline styles can't express :hover/:active, so the HUD buttons use classes.
// !important on border-color beats the inline borderColor on .hud-btn-box.
const HUD_BUTTON_CSS = `
.hud-btn .hud-btn-box {
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out, border-color 0.12s ease-out, filter 0.12s ease-out;
}
.hud-btn:hover .hud-btn-box {
  border-color: #d4af37 !important;
  box-shadow: 0 0 14px rgba(212,175,55,0.55);
  filter: brightness(1.25);
}
.hud-btn:active .hud-btn-box {
  transform: translateY(2px) scale(0.95);
  border-color: #fff !important;
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.7);
  filter: brightness(0.8);
}
.hud-btn:hover span { color: #d4af37; }
`;

const StatBar =({ label, value, max, color }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#9ab", marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ color: "#dde" }}>{value}/{max}</span>
    </div>
    <div style={{ height: 14, borderRadius: 3, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: `linear-gradient(180deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}88` }} />
    </div>
  </div>
);

// Bottom row: portrait (height-fit, 2:3 like the dialog PortraitSlot), stat
// bars, then square menu buttons on the right.
const PlayerHud = () => {
  const { playerData } = usePlayer();
  const [openModal, setOpenModal] = useState(null);
  return (
  <div style={STATIC_STYLES.rowBottom}>
    <style>{HUD_BUTTON_CSS}</style>
    {openModal === 'guide' && <GuideModal onClose={() => setOpenModal(null)} />}
    {openModal === 'settings' && <SettingsModal onClose={() => setOpenModal(null)} />}
    <div style={{ ...HUD_FRAME, height: "100%", aspectRatio: "2 / 3", flexShrink: 0, borderColor: "#d4af37", boxShadow: "0 0 18px rgba(212,175,55,0.25)" }}>
      <img src={PLAYER_SAMURAI} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
    </div>

    <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
      <div style={{ fontSize: 18, letterSpacing: 4, color: "#d4af37", fontWeight: "bold" }}>SAMURAI</div>
      {HUD_STATS.map(s => <StatBar key={s.label} {...s} />)}
    </div>

    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, marginLeft: 24, flexShrink: 0 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: "#9ab" }}>GOLD</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={ITEM_GOLD_1} alt="" style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }} />
        <span style={{ fontSize: 28, fontWeight: "bold", color: "#ffd700" }}>{playerData?.gold ?? 0}</span>
      </div>
    </div>

    <div style={{ flex: 1 }} />

    <div style={{ display: "flex", alignItems: "center", gap: 13, height: "100%", flexShrink: 0 }}>
      {HUD_BUTTONS.map(({ label, icon, modal }) => (
        <button
          key={label}
          className="hud-btn"
          onClick={modal ? () => { playSelectSfx(); setOpenModal(modal); } : undefined}
          style={{
            width: HUD_BUTTON_SIZE,
            flexShrink: 0,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "#cfe3ee",
            fontFamily: "inherit",
            fontSize: 13,
            letterSpacing: 2,
          }}
        >
          <div
            className="hud-btn-box"
            style={{
              ...HUD_FRAME,
              width: HUD_BUTTON_SIZE,
              height: HUD_BUTTON_SIZE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "rgba(77,166,255,0.35)",
            }}
          >
            <img
              src={icon}
              alt=""
              style={{
                width: 64,
                height: 64,
                objectFit: "contain",
                imageRendering: "pixelated",
                pointerEvents: "none",
              }}
            />
          </div>
          <span style={{ fontWeight: "bold" }}>{label}</span>
        </button>
      ))}
    </div>
  </div>
  );
};

const DIALOG_KEYS = Object.keys(DIALOG_REGISTRY);

const MAP_BACKGROUNDS = { Sunsword5: SUNSWORD_5, Sunsword6: SUNSWORD_6, Sunsword7: SUNSWORD_7 };
const FALLBACK_CAMPAIGN_ID = 'path_of_the_samurai';

export default function WorldMapScreen2() {
  const { playerData, playerDispatch } = usePlayer();
  // First world of the campaign until saves track a current world.
  const { campaign, worldMap } = useMemo(() => {
    const campaign = getCampaign(playerData?.campaign_id ?? FALLBACK_CAMPAIGN_ID);
    const worldMap = campaign.maps[campaign.campaign.worlds[0]];
    return { campaign, worldMap };
  }, [playerData?.campaign_id]);

  // Only locations whose `requires` are met are drawn.
  const mapCards = useMemo(
    () => worldMap.locations
      .filter(id => meetsRequires(campaign.locations[id].requires, playerData))
      .map(id => {
        const location = campaign.locations[id];
        return { id, title: location.title, icon: MAP_ICON_LOOKUP[location.icon], pos: location.pos };
      }),
    [campaign, worldMap, playerData]
  );

  // Dev only: cycles null -> 'win' -> 'loss' -> null. Remove with the other dev buttons (todo item 2).
  const [skipBattle, setSkipBattle] = useState(null);
  const { openLocation, eventModal } = useScenarioRunner(campaign, skipBattle);

  const [selectedDialogKey, setSelectedDialogKey] = useState(DIALOG_KEYS[0]);
  const [playingDialogKey, setPlayingDialogKey] = useState(null);

  // Temporary drag test for LocationCard — 10 cards, each independently
  // draggable. Positions keyed by id; dragRef tracks which id is active.
  // dragPositions holds only the cards that were dragged; the rest sit at their location's `pos`
  // (cards unlock over time, so positions cannot be fixed at first render).
  const [dragPositions, setDragPositions] = useState({});
  const cardPositions = useMemo(
    () => Object.fromEntries(mapCards.map(c => [c.id, dragPositions[c.id] ?? c.pos])),
    [mapCards, dragPositions]
  );
  const dragRef = useRef(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const handleCardPointerDown = useCallback((id) => (e) => {
    const pos = cardPositions[id];
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [cardPositions]);

  const handleCardPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { id, startX, startY, origX, origY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    setDragPositions(prev => ({ ...prev, [id]: { x: origX + dx, y: origY + dy } }));
  }, []);

  // setPointerCapture on the drag wrapper can swallow the child <LocationCard>'s
  // native click, so selection is driven here instead — a pointer-up with no
  // meaningful movement counts as a click.
  const handleCardPointerUp = useCallback(() => {
    if (dragRef.current && !dragRef.current.moved) setSelectedCardId(dragRef.current.id);
    dragRef.current = null;
  }, []);

  useMusic(samuraiMapTheme, { loop: true, baseVolume: 0.5 });

  useEffect(() => {
    setWeather('snow');
    return () => setWeather(null);
  }, []);

  return (
    <div style={STATIC_STYLES.root}>
      <style>{MARCHING_ANTS_CSS}</style>
      <div style={STATIC_STYLES.scanlines} />

      <div style={STATIC_STYLES.rowTop}>
      <div style={STATIC_STYLES.topbar}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: "#d4af37", fontWeight: "bold" }}>{worldMap.name}</div>
        <div style={{ flex: 1 }} />
        <select
          value={selectedDialogKey}
          onChange={e => setSelectedDialogKey(e.target.value)}
          style={{ background: "#111", color: "#cfe3ee", border: "1px solid #333", padding: "4px 8px" }}
        >
          {DIALOG_KEYS.map(key => <option key={key} value={key}>{key}</option>)}
        </select>
        <button
          onClick={() => setPlayingDialogKey(selectedDialogKey)}
          style={{ background: "#1a2a3a", color: "#cfe3ee", border: "1px solid #4da6ff55", padding: "4px 12px", cursor: "pointer" }}
        >
          ▶ Preview Dialog
        </button>
        <button
          onClick={() => setSkipBattle(s => (s === null ? 'win' : s === 'win' ? 'loss' : null))}
          style={{ background: "#1a2a3a", color: skipBattle ? "#f5d76e" : "#cfe3ee", border: "1px solid #4da6ff55", padding: "4px 12px", cursor: "pointer", letterSpacing: 1 }}
        >
          SKIP BATTLE: {skipBattle ? skipBattle.toUpperCase() : 'OFF'}
        </button>
        <button
          onClick={() => {
            if (!window.confirm('Reset everything? Clears cleared scenarios, gold, flags and unlocked cards.')) return;
            playerDispatch({ type: 'CONFIRM_CLASS', classId: playerData.class_id, campaignId: playerData.campaign_id });
          }}
          style={{ background: "#3a1a1a", color: "#ffb4b4", border: "1px solid #e0484888", padding: "4px 12px", cursor: "pointer", letterSpacing: 1 }}
        >
          RESET EVERYTHING
        </button>
      </div>

      {playingDialogKey && (
        <DialogModal
          key={playingDialogKey}
          dialog={DIALOG_REGISTRY[playingDialogKey]}
          onClose={() => setPlayingDialogKey(null)}
        />
      )}

      {eventModal && <EventModal key={eventModal.modalKey} {...eventModal} />}

      <div style={STATIC_STYLES.main}>
        <div style={{ ...STATIC_STYLES.canvas, backgroundImage: `url(${MAP_BACKGROUNDS[worldMap.background]})` }}>
          {mapCards.map(c => (
            <div
              key={c.id}
              style={{ position: "absolute", top: cardPositions[c.id].y, left: cardPositions[c.id].x, zIndex: 5, touchAction: "none" }}
              onPointerDown={handleCardPointerDown(c.id)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUp}
            >
              <LocationCard
                title={c.title}
                mapIconSrc={c.icon}
                isSelected={selectedCardId === c.id}
              />
            </div>
          ))}
          {selectedCardId && (
            <button
              onClick={() => { playSelectSfx(); openLocation(selectedCardId); }}
              style={{
                position: "absolute",
                top: cardPositions[selectedCardId].y + CARD_H + 4,
                left: cardPositions[selectedCardId].x + CARD_W / 2,
                transform: "translateX(-50%)",
                zIndex: 6,
                background: "#1a2a3a", color: "#f5d76e", border: "1px solid #d4af37",
                borderRadius: 4, padding: "4px 24px", letterSpacing: 2, fontWeight: "bold", cursor: "pointer",
              }}
            >
              ENTER
            </button>
          )}
        </div>
      </div>
      </div>
      <PlayerHud />
    </div>
  );
}
