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
} from '../assets';
import SUNSWORD_5 from '../assets/World/Sunsword5.png';
import PLAYER_SAMURAI from '../assets/Player_Map_Icons/SAMURAI.png';
import BOOK_ICON from '../assets/UI/BOOK.png';
import SUN_ICON from '../assets/UI/SUN.png';
import WEAPON_ICON from '../assets/UI/WEAPON.png';
import OPEN_BOOK_ICON from '../assets/UI/OPEN_BOOK.png';
import NOTE_BOOK_ICON from '../assets/UI/NOTE_BOOK.png';
import MOON_ICON from '../assets/UI/MOON.png';
import IMAGE_GEN_1 from '../assets/World_Map_Icons/image-gen-1.png';
import IMAGE_GEN_2 from '../assets/World_Map_Icons/image-gen-2.png';
import IMAGE_GEN_3 from '../assets/World_Map_Icons/image-gen-3.png';
import IMAGE_GEN_4 from '../assets/World_Map_Icons/image-gen-4.png';
import IMAGE_GEN_5 from '../assets/World_Map_Icons/image-gen-5.png';
import { setWeather } from '../vfx/weatherBus';
import samuraiMapTheme from '../assets/Music/SAMURAI_MAP_THEME_1.mp3';
import { useMusic } from '../hooks/useMusic';
import { DIALOG_REGISTRY } from '../data/dialogs/dialog_registry';
import { getCampaign } from '../data/campaigns/campaign_registry';
import { usePlayer } from '../context/PlayerContext';
import DialogModal from '../dialog/DialogModal';
import GuideModal from '../components/battle/GuideModal';
import SettingsModal from '../components/map/SettingsModal';
import { playSelectSfx } from '../vfx/animationRegistry';

// Pure visual preview of a world-map layout/feel — no battle wiring, no
// level data. Grid fills the viewport at GRID_TILE-sized boxes; a hand-
// placed scatter of icons (SCATTERED_ICONS) previews icon density/coverage.

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
};

// The box grid itself now draws the graph-paper lines (each box's border
// is one grid square) — no separate SVG grain/gridline background needed.
const GRID_TILE = 128;
const BOX_GAP   = 2;

// Sunsword7.png's native pixel size (checked via Get-Image on the file).
const SUNSWORD_W = 1672;
const SUNSWORD_H = 941;
const GAME_CANVAS_W = 1920;
const MAP_SCALE = GAME_CANVAS_W / SUNSWORD_W;

// The exact set of map_icon values referenced across PATH_OF_THE_SAMURAI(_V2)
// levels — everything else in MAP_ICON_LOOKUP is a different map's icon set.
const SAMURAI_ICON_KEYS = [
  'Snow_Iron_Gate', 'Snowy_Field_Bamboo', 'Snowy_Field_Den', 'Snow_Field_Shrine',
  'Snow_Field_Path_1', 'Snow_Field_Path_2', 'Snow_Field_Path_3', 'Snow_Mountain_1',
  'Snow_Mountain_2', 'Snow_and_Water', 'Snow_and_Water_2', 'Snowy_Forest',
  'Green_Tree_At_Snow', 'Big_Snow_Cave', 'Big_Snow_Cave_2', 'Home',
  'Snow_Cherry_Path_1', 'Sunset', 'Sunset_2', 'Tree_At_Snow', 'Water',
];

// Hand-placed (not Math.random()) so the scatter can be eyeballed and
// adjusted by hand — just a density preview, not real level positions.
// Every col/row is even, same lattice as FILL_STRIDE below: any two
// distinct even/even points are always >=2 apart in both axes, so nothing
// here can ever land adjacent (incl. diagonally) to another filled box.
const SCATTERED_ICONS = [
  { col: 2,  row: 0,  icon: 'Snow_Iron_Gate' },
  { col: 4,  row: 2,  icon: 'Snow_Mountain_2' },
  { col: 2,  row: 4,  icon: 'Snowy_Field_Bamboo' },
  { col: 6,  row: 0,  icon: 'Snowy_Forest' },
  { col: 8,  row: 2,  icon: 'Snow_Field_Shrine' },
  { col: 4,  row: 6,  icon: 'Big_Snow_Cave_2' },
  { col: 10, row: 4,  icon: 'Snowy_Field_Den' },
  { col: 12, row: 0,  icon: 'Snow_Field_Path_2' },
  { col: 6,  row: 6,  icon: 'Tree_At_Snow' },
  { col: 14, row: 2,  icon: 'Snow_Cherry_Path_1' },
  { col: 4,  row: 8,  icon: 'Snow_Mountain_1' },
  { col: 16, row: 0,  icon: 'Snow_and_Water_2' },
  { col: 8,  row: 6,  icon: 'Home' },
  { col: 10, row: 8,  icon: 'Snow_and_Water' },
  { col: 0,  row: 6,  icon: 'Green_Tree_At_Snow' },
  { col: 18, row: 4,  icon: 'Sunset' },
  { col: 14, row: 8,  icon: 'Big_Snow_Cave' },
  { col: 0,  row: 2,  icon: 'Sunset_2' },
  { col: 12, row: 6,  icon: 'Snow_Field_Path_1' },
  { col: 16, row: 2,  icon: 'Snow_Field_Path_3' },
  { col: 2,  row: 8,  icon: 'Water' },
];

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
  gridWrap: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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

// Preview of the new World_Map_Icons set (not yet in ../assets index).
const TRY_CARDS = [
  { id: 'image-gen-1', title: 'Hakuryu Shrine', icon: IMAGE_GEN_1 },
  { id: 'image-gen-2', title: 'Frostpine Gate', icon: IMAGE_GEN_2 },
  { id: 'image-gen-3', title: 'Kitsune Hollow', icon: IMAGE_GEN_3 },
  { id: 'image-gen-4', title: 'Mount Tsukikage', icon: IMAGE_GEN_4 },
  { id: 'image-gen-5', title: 'Sakura Ridge', icon: IMAGE_GEN_5 },
];

// Selected card's title gets a glowing white border.
const MARCHING_ANTS_CSS = `
.title-selected {
  border-color: #fff !important;
  box-shadow: 0 0 10px 2px rgba(255,255,255,0.9), inset 0 0 8px rgba(255,255,255,0.8);
}
`;

const EmptyBox = ({ mapIconSrc }) => {
  const boxStyle = useMemo(() => ({
    width: GRID_TILE,
    height: GRID_TILE,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: mapIconSrc ? "2.5px solid" : "2.5px solid transparent",
    borderRadius: 3,
    background: "transparent",
    borderColor: mapIconSrc ? "rgba(255,255,255,0.85)" : "transparent",
    boxShadow: mapIconSrc
      ? "0 0 12px rgba(255,255,255,0.65), 0 0 4px rgba(255,255,255,0.8)"
      : "none",
  }), [mapIconSrc]);

  return (
    <div style={boxStyle}>
      {mapIconSrc && (
        <img
          src={mapIconSrc}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

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

const MAP_BACKGROUNDS = { Sunsword5: SUNSWORD_5 };
const FALLBACK_CAMPAIGN_ID = 'path_of_the_samurai';

export default function WorldMapScreen2() {
  const { playerData } = usePlayer();
  // First world of the campaign until saves track a current world.
  const { worldMap, mapCards } = useMemo(() => {
    const campaign = getCampaign(playerData?.campaign_id ?? FALLBACK_CAMPAIGN_ID);
    const worldMap = campaign.maps[campaign.campaign.worlds[0]];
    const mapCards = worldMap.locations.map(id => {
      const location = campaign.locations[id];
      return { id, title: location.title, icon: MAP_ICON_LOOKUP[location.icon], pos: location.pos };
    });
    return { worldMap, mapCards };
  }, [playerData?.campaign_id]);

  const [selectedDialogKey, setSelectedDialogKey] = useState(DIALOG_KEYS[0]);
  const [playingDialogKey, setPlayingDialogKey] = useState(null);
  const [gridDims, setGridDims] = useState({ cols: 0, rows: 0 });
  const gridWrapRef = useRef(null);

  // Temporary drag test for LocationCard — 10 cards, each independently
  // draggable. Positions keyed by id; dragRef tracks which id is active.
  const [cardPositions, setCardPositions] = useState(() =>
    mapCards.reduce((acc, c) => {
      acc[c.id] = { x: c.pos.x, y: c.pos.y };
      return acc;
    }, {})
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
    setCardPositions(prev => ({ ...prev, [id]: { x: origX + dx, y: origY + dy } }));
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

  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const measure = () => {
      const cols = Math.max(1, Math.floor((el.clientWidth + BOX_GAP) / (GRID_TILE + BOX_GAP)));
      const rows = Math.max(1, Math.floor((el.clientHeight + BOX_GAP) / (GRID_TILE + BOX_GAP)));
      setGridDims({ cols, rows });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scatteredByPos = useMemo(() => {
    const m = new Map();
    SCATTERED_ICONS.forEach(({ col, row, icon }) => m.set(`${col},${row}`, MAP_ICON_LOOKUP[icon]));
    return m;
  }, []);

  // Filled boxes cycle deterministically through the whole icon set, but
  // only every FILL_STRIDE'th row/col so a full empty box separates each
  // slot in every direction (incl. diagonals) — nothing touches.
  const ALL_ICONS = useMemo(() => SAMURAI_ICON_KEYS.map(k => MAP_ICON_LOOKUP[k]), []);
  const FILL_STRIDE = 4;

  const gridStyle = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${gridDims.cols}, ${GRID_TILE}px)`,
    gridTemplateRows:    `repeat(${gridDims.rows}, ${GRID_TILE}px)`,
    gap: BOX_GAP,
  }), [gridDims]);

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
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#1e3050" }}>{gridDims.cols}x{gridDims.rows} SPACED GRID</div>
      </div>

      {playingDialogKey && (
        <DialogModal
          key={playingDialogKey}
          dialog={DIALOG_REGISTRY[playingDialogKey]}
          onClose={() => setPlayingDialogKey(null)}
        />
      )}

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
          <div ref={gridWrapRef} style={STATIC_STYLES.gridWrap}>
            <div style={gridStyle}>
              {Array.from({ length: gridDims.cols * gridDims.rows }, (_, i) => {
                const col = i % gridDims.cols;
                const row = Math.floor(i / gridDims.cols);
                // Icons hidden for now — re-enable by uncommenting these two.
                // const scattered = scatteredByPos.get(`${col},${row}`);
                // const onStride = col % FILL_STRIDE === 0 && row % FILL_STRIDE === 0;
                // const filled = onStride ? ALL_ICONS[i % ALL_ICONS.length] : null;
                const scattered = null;
                const filled = null;
                return (
                  <EmptyBox
                    key={i}
                    mapIconSrc={scattered ?? filled}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
      <PlayerHud />
    </div>
  );
}
