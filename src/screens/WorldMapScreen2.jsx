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
import SUNSWORD_BG from '../assets/World/Sunsword2.png';
import { setWeather } from '../vfx/weatherBus';
import samuraiMapTheme from '../assets/Music/SAMURAI_MAP_THEME_1.mp3';
import { useMusic } from '../hooks/useMusic';

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

// Sunsword2.png's native pixel size (checked via Get-Image on the file).
const SUNSWORD_W = 1672;
const SUNSWORD_H = 941;

const BOX_COLOR = { color: "#4da6ff", dim: "rgba(77,166,255,0.10)", glow: "rgba(77,166,255,0.4)" };

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
  // Scrollable viewport — the void gradients are its own static background
  // (default background-attachment: scroll keeps them pinned to the visible
  // box, not the scrolled content), while the oversized image+grid live in
  // the larger `canvas` div below so there's actually something to pan.
  main: {
    flex: 1,
    position: "relative",
    overflow: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    backgroundImage: [
      "radial-gradient(ellipse at 50% 38%, rgba(30,20,50,0.35), transparent 65%)",
      "linear-gradient(155deg, #050308 0%, #020103 45%, #000000 100%)",
    ].join(","),
    boxShadow: "inset 0 0 200px rgba(0,0,0,0.9)",
  },
  // Sunsword.png at its native pixel size (1777x885) — canvas matches so
  // main can scroll/pan if the viewport is smaller than the image.
  canvas: {
    position: "relative",
    width: SUNSWORD_W,
    height: SUNSWORD_H,
    backgroundImage: `url(${SUNSWORD_BG})`,
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
const CARD_W = 64;
const CARD_H = 80;

const LocationCard = ({ title, mapIconSrc, isSelected }) => (
  <div
    className={isSelected ? "marching-ants" : undefined}
    style={{
      width: CARD_W,
      height: CARD_H,
      display: "flex",
      flexDirection: "column",
      background: "#0a0e18",
      border: "2px solid #000000",
      borderRadius: 8,
      boxShadow: "0 0 16px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.95), 0 4px 18px rgba(0,0,0,0.6)",
      overflow: "hidden",
      cursor: "pointer",
    }}
  >
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(77,166,255,0.08)" }}>
      <img
        src={mapIconSrc}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none" }}
      />
    </div>
    <div
      style={{
        padding: "3px 4px",
        borderTop: "1px solid rgba(77,166,255,0.25)",
        fontSize: 6.5,
        letterSpacing: 0.5,
        textAlign: "center",
        color: "#dde",
        textTransform: "uppercase",
      }}
    >
      {title}
    </div>
  </div>
);

// First 10 samurai icons, just to see a spread of cards at once.
const TRY_CARDS = SAMURAI_ICON_KEYS.slice(0, 10).map(key => ({
  id: key,
  title: key.replace(/_/g, ' '),
  icon: MAP_ICON_LOOKUP[key],
}));

// Selected-card border pulses gold via an animated box-shadow/border-color.
const MARCHING_ANTS_CSS = `
@keyframes gold-pulse {
  0%, 100% { border-color: rgba(255,215,0,0.4); box-shadow: 0 0 6px rgba(255,215,0,0.4); }
  50%      { border-color: rgba(255,215,0,1);   box-shadow: 0 0 18px rgba(255,215,0,0.9); }
}
.marching-ants {
  border-color: gold !important;
  animation: gold-pulse 1.2s ease-in-out infinite;
}
`;

const EmptyBox = ({ isSelected, mapIconSrc, onClick }) => {
  const showBorder = isSelected || !!mapIconSrc;

  const boxStyle = useMemo(() => ({
    width: GRID_TILE,
    height: GRID_TILE,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: showBorder ? "2.5px solid" : "2.5px solid transparent",
    borderRadius: 3,
    cursor: "pointer",
    transition: "all 0.15s ease",
    background: isSelected ? BOX_COLOR.dim : "transparent",
    borderColor: isSelected ? BOX_COLOR.color : mapIconSrc ? "rgba(255,255,255,0.85)" : "transparent",
    boxShadow: isSelected
      ? `0 0 10px ${BOX_COLOR.glow}`
      : mapIconSrc
        ? "0 0 12px rgba(255,255,255,0.65), 0 0 4px rgba(255,255,255,0.8)"
        : "none",
  }), [isSelected, showBorder, mapIconSrc]);

  return (
    <div style={boxStyle} onClick={onClick}>
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

export default function WorldMapScreen2() {
  const [selectedBox, setSelectedBox] = useState(null);
  const [gridDims, setGridDims] = useState({ cols: 0, rows: 0 });
  const gridWrapRef = useRef(null);

  // Temporary drag test for LocationCard — 10 cards, each independently
  // draggable. Positions keyed by id; dragRef tracks which id is active.
  const [cardPositions, setCardPositions] = useState(() =>
    TRY_CARDS.reduce((acc, c, i) => {
      acc[c.id] = { x: 24 + (i % 5) * 90, y: 24 + Math.floor(i / 5) * 110 };
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

  const handleBoxClick = useCallback((idx) => setSelectedBox(idx), []);

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

      <div style={STATIC_STYLES.topbar}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4da6ff", fontWeight: "bold" }}>WORLD MAP PREVIEW (v2)</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#1e3050" }}>{gridDims.cols}x{gridDims.rows} SPACED GRID</div>
      </div>

      <div style={STATIC_STYLES.main}>
        <div style={STATIC_STYLES.canvas}>
          {TRY_CARDS.map(c => (
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
                    isSelected={selectedBox === i}
                    mapIconSrc={scattered ?? filled}
                    onClick={() => handleBoxClick(i)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
