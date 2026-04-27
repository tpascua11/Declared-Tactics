import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import MAP_DATA from '../data/maps/PATH_OF_THE_SUMURAI.json';
import { SCENARIO_REGISTRY } from '../data/maps/scenario_registry';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import {
  MAP_ICON_GARDEN_TOWN, MAP_ICON_GARDEN_TOWN_2, MAP_ICON_SUNSET_VILLAGE,
  MAP_ICON_FOREST_1, MAP_ICON_FOREST_2,
  MAP_ICON_CITADEL_1, MAP_ICON_CITADEL_2, MAP_ICON_CITADEL_3,
  MAP_ICON_RUINS, MAP_ICON_ISLAND_1, MAP_ICON_CASTLE_1, MAP_ICON_PATH_1,
  MAP_ICON_TREE_1, MAP_ICON_TREE_2, MAP_ICON_DESERT_CASTLE_1, MAP_ICON_DESERT,
  MAP_ICON_COOL_1, MAP_ICON_MOUNTAIN_ARC_1, MAP_ICON_NOT_SURE_1,
  MAP_ICON_GRASS_1, MAP_ICON_GRASS_2, MAP_ICON_GRASS_3,
  MAP_ICON_GRASS_4, MAP_ICON_GRASS_5, MAP_ICON_GRASS_6,
  Snowy_Forest, Green_Tree_At_Snow,
  Big_Snow_Cave, Big_Snow_Cave_2, Home,
  Snow_Cherry_Path_1, Snow_Field_Path_1, Snow_Field_Path_2, Snow_Field_Path_3,
  Snow_Field_Shrine, Snow_Iron_Gate, Snow_Mountain_1, Snow_Mountain_2,
  Snow_and_Water, Snow_and_Water_2, Snowy_Field_Bamboo, Snowy_Field_Den,
  Sunset, Sunset_2, Tree_At_Snow, Water,
} from '../assets';
import { DEBUG_MAP } from '../debug';
import './MapScreen.css';
import menuMapTheme from '../assets/MUSIC/Menu Map Theme.mp3';
import WinModal from '../components/map/WinModal';
import LosePopup from '../components/map/LosePopup';

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
  Snowy_Forest,
  Green_Tree_At_Snow,
  Big_Snow_Cave,
  Big_Snow_Cave_2,
  Home,
  Snow_Cherry_Path_1,
  Snow_Field_Path_1,
  Snow_Field_Path_2,
  Snow_Field_Path_3,
  Snow_Field_Shrine,
  Snow_Iron_Gate,
  Snow_Mountain_1,
  Snow_Mountain_2,
  Snow_and_Water,
  Snow_and_Water_2,
  Snowy_Field_Bamboo,
  Snowy_Field_Den,
  Sunset,
  Sunset_2,
  Tree_At_Snow,
  Water,
};

const ALL_MAP_ICONS = Object.values(MAP_ICON_LOOKUP);

const MAX_LEVEL_ID = Math.max(...Object.keys(MAP_DATA.levels).map(Number));

const CELL_GAP  = 14;

const TARGET_ROWS = 3;

const CELL_SIZE_BY_ROWS = {
  5: 160,
  4: 192,
  3: 256,
  2: 384,
};

const CELL_SIZE = CELL_SIZE_BY_ROWS[TARGET_ROWS] ?? 160;

// ── Constants ────────────────────────────────────────────────

const LEVEL_TYPES = {
  COMBAT:    { label: "COMBAT",    color: "#ffffff", dim: "rgba(255,255,255,0.08)", icon: "⚔️",  glow: "rgba(255,255,255,0.4)"  },
  CHALLENGE: { label: "CHALLENGE", color: "#c084fc", dim: "rgba(192,132,252,0.08)", icon: "💀",  glow: "rgba(192,132,252,0.4)" },
  EXPLORE:   { label: "EXPLORE",   color: "#4da6ff", dim: "rgba(77,166,255,0.08)",  icon: "🏛️", glow: "rgba(77,166,255,0.4)"  },
  RESTORE:   { label: "RESTORE",   color: "#69d99a", dim: "rgba(105,217,154,0.08)", icon: "💖",  glow: "rgba(105,217,154,0.4)" },
  SHOP:      { label: "SHOP",      color: "#ffd700", dim: "rgba(255,215,0,0.08)",   icon: "⬡",  glow: "rgba(255,215,0,0.4)"  },
  BOSS:      { label: "BOSS",      color: "#ffffff", dim: "rgba(255,255,255,0.14)", icon: "👑",  glow: "rgba(255,255,255,0.5)"  },
};

const MENU_ITEMS = [
  { id: 'deck',      label: 'DECK',      icon: '🃏', color: '#4da6ff' },
  { id: 'shop',      label: 'SHOP',      icon: '⬡',  color: '#ffd700' },
  { id: 'inventory', label: 'INVENTORY', icon: '🎒', color: '#69d99a' },
  { id: 'skills',    label: 'SKILLS',    icon: '✦',  color: '#c084fc' },
  { id: 'settings',  label: 'SETTINGS',  icon: '⚙',  color: '#667788' },
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
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
  },
  gridWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 32px",
    boxSizing: "border-box",
  },
  bottom: {
    height: 80,
    flexShrink: 0,
    background: "linear-gradient(180deg,#050810,#0a0f18)",
    borderTop: "1px solid rgba(77,166,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "0 24px",
    zIndex: 100,
    position: "relative",
  },
};

// ── Pure helpers ─────────────────────────────────────────────

function getNeighbors(id) {
  const total = MAP_DATA.levels.length;
  return id + 1 < total ? [id + 1] : [];
}

const DEBUG_UNLOCK_ALL = false;

// Converts playerData.completed_levels ([0, 2, ...]) into a flat levelStates map.
function deriveStates(completedLevels = []) {
  const ls = {};
  MAP_DATA.levels.forEach(l => { ls[l.id] = "locked"; });

  if (DEBUG_UNLOCK_ALL) {
    MAP_DATA.levels.forEach(l => { ls[l.id] = "available"; });
    return ls;
  }

  ls[0] = "available";
  completedLevels.forEach(id => {
    ls[id] = "cleared";
    getNeighbors(id).forEach(nid => { if (ls[nid] === "locked") ls[nid] = "available"; });
  });

  return ls;
}

// ── LevelCell ─────────────────────────────────────────────────

const LevelCell = ({ level, levelState, levelType, isPlayerHere, playerTypeColor, playerGlow, tokenPortrait, tokenName, mapIconSrc, onClick, onEnter }) => {
  const isLocked  = levelState === "locked";
  const isCleared = levelState === "cleared";

  const cellStyle = useMemo(() => {
    const base = {
      border: "2px solid",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 6px",
      position: "relative",
      overflow: "hidden",
      cursor: isLocked ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      userSelect: "none",
    };
    if (isLocked) return { ...base, background: levelType.dim, borderColor: `${levelType.color}30`, filter: "saturate(0.35) brightness(0.6)" };
    if (isCleared) {
      return {
        ...base,
        background: isPlayerHere ? levelType.dim : "#0e1a26",
        borderColor: isPlayerHere ? levelType.color : `${levelType.color}40`,
        boxShadow: isPlayerHere
          ? `0 0 30px ${levelType.glow}`
          : `0 0 8px ${levelType.glow}44`,
      };
    }
    return {
      ...base,
      background: isPlayerHere ? levelType.dim : "#0a0f1a",
      borderColor: isPlayerHere ? levelType.color : "rgba(26,42,58,0.9)",
      boxShadow: isPlayerHere
        ? `0 0 30px ${levelType.glow}, inset 0 0 20px ${levelType.dim}`
        : "none",
      transform: isPlayerHere ? "scale(1.02)" : "scale(1)",
    };
  }, [isLocked, isCleared, isPlayerHere, levelType]);

  return (
    <div
      className={`map-cell-base ${isLocked ? 'map-cell-locked' : 'map-cell-available'}`}
      style={cellStyle}
      onClick={onClick}
    >
      {/* Background icon image */}
      {mapIconSrc && (
        <img
          src={mapIconSrc}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            opacity: isLocked ? 0.55 : isCleared ? 0.65 : 0.75,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Dark overlay so text/UI stays readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: isLocked
          ? "rgba(5,8,15,0.45)"
          : isCleared
            ? "rgba(5,8,15,0.25)"
            : isPlayerHere
              ? `linear-gradient(160deg,rgba(5,8,15,0.30),${levelType.dim})`
              : "rgba(5,8,15,0.35)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg,transparent,${levelType.color},transparent)`,
        opacity: isLocked ? 0.35 : 0.8,
        zIndex: 1,
      }} />

      {!isLocked ? (
        <>
          {/* Top: level name + desc */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: 12, letterSpacing: 1.5, textAlign: "center",
              padding: "0 4px", lineHeight: 1.3, fontWeight: "bold",
              color: isCleared ? `${levelType.color}cc` : isPlayerHere ? levelType.color : "#8aaabb",
            }}>
              {level.name}
            </div>
            {level.desc && (
              <div style={{
                fontSize: 9, letterSpacing: 0.5, textAlign: "center",
                padding: "0 4px", lineHeight: 1.3,
                color: isCleared ? `${levelType.color}77` : "#506070",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                {level.desc}
              </div>
            )}
          </div>

          {/* Bottom: portrait (if player is here) + enter button */}
          {!isCleared && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%", position: "relative", zIndex: 1 }}>
              {isPlayerHere && (
                <div className="map-token-glow" style={{
                  width: 50, height: 70,
                  border: "2px solid #4da6ff", borderRadius: 6,
                  background: "linear-gradient(180deg,#0a1525,#061018)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {tokenPortrait
                    ? <img src={tokenPortrait} alt={tokenName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    : <span style={{ fontSize: 24 }}>👤</span>
                  }
                </div>
              )}
              <button
                className="map-enter-btn-cell"
                onClick={e => { e.stopPropagation(); onEnter(level.id); }}
                style={{
                  position: "relative",
                  padding: "5px 14px",
                  border: "1.5px solid #ffffff",
                  borderRadius: 5,
                  fontSize: 9,
                  letterSpacing: 2,
                  cursor: "pointer",
                  background: "#ffffff",
                  color: "#000000",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  "--glow": "rgba(255,255,255,0.35)",
                  transition: "all 0.15s",
                }}
              >
                ENTER
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{
            fontSize: 11, letterSpacing: 1.5, textAlign: "center",
            color: `${levelType.color}55`, fontWeight: "bold",
            position: "relative", zIndex: 1, padding: "0 4px",
          }}>
            {level.name}
          </div>
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <div style={{ fontSize: 18, opacity: 0.6 }}>🔒</div>
          </div>
        </>
      )}
    </div>
  );
};

// ── MapScreen ─────────────────────────────────────────────────

export default function MapScreen() {
  const { gs, dispatch, goToBattle } = useGame();
  const { playerData, playerDispatch } = usePlayer();

  const [levelStates, setLevelStates] = useState(() => deriveStates(playerData?.completed_levels ?? []));
  const [playerLevel, setPlayerLevel] = useState(() => playerData?.last_level_id ?? 0);
  const [flashMsg,    setFlashMsg]    = useState("");
  const [flashOn,     setFlashOn]     = useState(false);
  const [activeMenu,  setActiveMenu]  = useState(null);
  const [winModal,    setWinModal]    = useState(null); // { levelId, reward, unlockedCards }
  const [losePopup,   setLosePopup]   = useState(null); // defeat_tip string

  const [gridDims, setGridDims] = useState({ cols: 5, rows: TARGET_ROWS });
  const gridWrapRef = useRef(null);
  const audioRef    = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0.1;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, []);

  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const measure = () => {
      const cols = Math.max(1, Math.floor((el.clientWidth + CELL_GAP) / (CELL_SIZE + CELL_GAP)));
      setGridDims({ cols, rows: TARGET_ROWS });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ftRef = useRef(null);

  // ── Battle return handler ──────────────────────────────────
  useEffect(() => {
    if (!gs.battleResult) return;
    playerDispatch({ type: 'APPLY_BATTLE_RESULT', currentHP: gs.battleResult.currentHP });

    const levelId = gs.sourceLevel?.levelId;
    if (levelId != null) setPlayerLevel(levelId); // restore cursor to where they fought

    if (gs.battleResult.victory && levelId != null) {
      playerDispatch({ type: 'SAVE_MAP_PROGRESS', levelId });

      setLevelStates(prev => {
        const next = { ...prev, [levelId]: "cleared" };
        getNeighbors(levelId).forEach(nid => { if (next[nid] === "locked") next[nid] = "available"; });
        return next;
      });

      const level = MAP_DATA.levels[levelId];
      let unlockedCards = [];
      if (typeof level?.reward === 'object' && level.reward !== null) {
        const classUnlock = level.reward.unlocks?.find(u => u.class === playerData.class_id);
        if (classUnlock) {
          classUnlock.card_ids.forEach(id => playerDispatch({ type: 'UNLOCK_CARD', cardId: id }));
          const classDef = CLASS_REGISTRY[playerData.class_id];
          unlockedCards = classUnlock.card_ids.map(id => classDef?.cards.find(c => c.id === id)).filter(Boolean);
        }
        if (level.reward.hp_upgrade) {
          playerDispatch({ type: 'UPGRADE_STAT', stat: 'max_health', amount: level.reward.hp_upgrade, level_id: `${MAP_DATA.id}:${levelId}` });
        }
      }
      setWinModal({ levelId, reward: level?.reward, unlockedCards, mapIconSrc: level?.map_icon ? MAP_ICON_LOOKUP[level.map_icon] : null,});
    } else if (!gs.battleResult.victory && levelId != null) {
      const level = MAP_DATA.levels[levelId];
      setLosePopup(level?.defeat_tip ?? "Prepare your strategy and try again.");
    }

    dispatch({ type: 'CLEAR_BATTLE_RESULT' });
  }, []); // intentionally empty: runs once on mount to process a just-returned battle result

  // ── Flash helper ─────────────────────────────────────────
  const flash = useCallback((msg) => {
    setFlashMsg(msg);
    setFlashOn(true);
    clearTimeout(ftRef.current);
    ftRef.current = setTimeout(() => setFlashOn(false), 2200);
  }, []);

  // ── Derived values ───────────────────────────────────────
  const playerLevelData = useMemo(() => MAP_DATA.levels[playerLevel], [playerLevel]);
  const playerTypeCfg   = useMemo(() => LEVEL_TYPES[playerLevelData?.type], [playerLevelData]);

  const clearedCount = useMemo(() =>
    Object.values(levelStates).filter(s => s === "cleared").length,
  [levelStates]);

  const canEnter = useMemo(() =>
    levelStates[playerLevel] === "available",
  [playerLevel, levelStates]);

  // ── Cheat: force-clear selected node (opens win modal) ───
  const handleCheatClear = useCallback(() => {
    const level = MAP_DATA.levels[playerLevel];
    if (!level) return;
    setLevelStates(prev => {
      const next = { ...prev, [playerLevel]: "cleared" };
      getNeighbors(playerLevel).forEach(nid => { if (next[nid] === "locked") next[nid] = "available"; });
      return next;
    });
    playerDispatch({ type: 'SAVE_MAP_PROGRESS', levelId: playerLevel });
    let unlockedCards = [];
    if (typeof level.reward === 'object' && level.reward !== null) {
      const classUnlock = level.reward.unlocks?.find(u => u.class === playerData.class_id);
      if (classUnlock) {
        classUnlock.card_ids.forEach(id => playerDispatch({ type: 'UNLOCK_CARD', cardId: id }));
        const classDef = CLASS_REGISTRY[playerData.class_id];
        unlockedCards = classUnlock.card_ids.map(id => classDef?.cards.find(c => c.id === id)).filter(Boolean);
      }
      if (level.reward.hp_upgrade) {
        playerDispatch({ type: 'UPGRADE_STAT', stat: 'max_health', amount: level.reward.hp_upgrade, level_id: `${MAP_DATA.id}:${playerLevel}` });
      }
    }
    setWinModal({ levelId: playerLevel, reward: level.reward, unlockedCards, mapIconSrc: level.map_icon ? MAP_ICON_LOOKUP[level.map_icon] : null,});
  }, [playerLevel, playerData, playerDispatch]);

  // ── Cheat: trigger lose popup for selected node ───────────
  const handleCheatLose = useCallback(() => {
    const level = MAP_DATA.levels[playerLevel];
    setLosePopup(level?.defeat_tip ?? "Prepare your strategy and try again.");
  }, [playerLevel]);

  // ── Handlers ─────────────────────────────────────────────
  const handleCellClick = useCallback((lid) => {
    if (levelStates[lid] === "locked") { flash("🔒 LOCKED"); return; }
    setPlayerLevel(lid);
  }, [levelStates, flash]);

  const handleEnter = useCallback((levelId) => {
    const level = MAP_DATA.levels[levelId];
    if (!level) return;
    setPlayerLevel(levelId);

    if (!level.scenario_id) {
      setLevelStates(prev => {
        const next = { ...prev, [levelId]: "cleared" };
        getNeighbors(levelId).forEach(nid => { if (next[nid] === "locked") next[nid] = "available"; });
        return next;
      });
      if (typeof level.reward === 'object' && level.reward !== null) {
        const classUnlock = level.reward.unlocks?.find(u => u.class === playerData.class_id);
        if (classUnlock) classUnlock.card_ids.forEach(id => playerDispatch({ type: 'UNLOCK_CARD', cardId: id }));
      }
      playerDispatch({ type: 'SAVE_MAP_PROGRESS', levelId });
      flash(typeof level.reward === 'string' ? level.reward : "LEVEL CLEARED");
      return;
    }

    const scenario = SCENARIO_REGISTRY[level.scenario_id];
    if (!scenario) { flash("NO SCENARIO FOUND"); return; }
    playerDispatch({ type: 'SAVE_LAST_LEVEL', levelId });
    goToBattle(scenario, { levelId, defeat_tip: level.defeat_tip ?? null });
  }, [levelStates, playerData, playerDispatch, flash, goToBattle]);

  // ── Memoized styles ───────────────────────────────────────
  const gridStyle = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${gridDims.cols},${CELL_SIZE}px)`,
    gridTemplateRows:    `repeat(${gridDims.rows},${CELL_SIZE}px)`,
    gap: CELL_GAP,
  }), [gridDims]);

  const tokenName    = playerData ? (playerData.class_id?.toUpperCase() ?? "PLAYER") : "PLAYER";
  const tokenPortrait = playerData?.class_id ? (CLASS_REGISTRY[playerData.class_id]?.portrait ?? null) : null;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={STATIC_STYLES.root}>
      <audio ref={audioRef} src={menuMapTheme} loop />
      <div style={STATIC_STYLES.scanlines} />

      {/* TOPBAR */}
      <div style={STATIC_STYLES.topbar}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4da6ff", fontWeight: "bold" }}>WORLD MAP</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#1e3050" }}>{MAP_DATA.name}</div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#2a4060", marginLeft: 16 }}>
          {clearedCount}/{MAP_DATA.levels.length} CLEARED
        </div>
        {DEBUG_MAP && (
          <>
            <button
              onClick={handleCheatClear}
              style={{
                marginLeft: 16, padding: "3px 10px",
                border: "1px solid #ff006644", borderRadius: 4,
                background: "rgba(255,0,102,0.08)", color: "#ff4488",
                fontSize: 9, letterSpacing: 2, cursor: "pointer",
                fontFamily: "'Courier New', monospace",
              }}
            >
              CHEAT: WIN
            </button>
            <button
              onClick={handleCheatLose}
              style={{
                marginLeft: 6, padding: "3px 10px",
                border: "1px solid #88440044", borderRadius: 4,
                background: "rgba(136,68,0,0.08)", color: "#cc7733",
                fontSize: 9, letterSpacing: 2, cursor: "pointer",
                fontFamily: "'Courier New', monospace",
              }}
            >
              CHEAT: LOSE
            </button>
          </>
        )}
      </div>

      {/* MAIN */}
      <div style={STATIC_STYLES.main}>
        <div ref={gridWrapRef} style={STATIC_STYLES.gridWrap}>
          <div style={gridStyle}>
            {Array.from({ length: gridDims.cols * gridDims.rows }, (_, i) => {
              const l = MAP_DATA.levels[i];
              if (!l) {
                const emptyIcon = ALL_MAP_ICONS[i % ALL_MAP_ICONS.length];
                return (
                  <div key={`empty-${i}`} className="map-cell-base map-cell-locked" style={{ background: "#05080f", borderColor: "#0c1018", position: "relative", overflow: "hidden" }}>
                    <img src={emptyIcon} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", opacity: 0.18, filter: "grayscale(1)", pointerEvents: "none" }} />
                  </div>
                );
              }
              const st = levelStates[l.id];
              const t  = LEVEL_TYPES[l.type];
              return (
                <LevelCell
                  key={l.id}
                  level={l}
                  levelState={st}
                  levelType={t}
                  isPlayerHere={playerLevel === l.id}
                  playerTypeColor={playerTypeCfg?.color}
                  playerGlow={playerTypeCfg?.glow}
                  tokenPortrait={playerLevel === l.id ? tokenPortrait : null}
                  tokenName={tokenName}
                  mapIconSrc={l.map_icon ? MAP_ICON_LOOKUP[l.map_icon] : null}
                  onClick={() => handleCellClick(l.id)}
                  onEnter={handleEnter}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={STATIC_STYLES.bottom}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 800 }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              className={`map-menu-btn${activeMenu === item.id ? ' active' : ''}`}
              onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
              style={{
                flex: 1, padding: "12px 8px",
                border: `1px solid ${activeMenu === item.id ? item.color + "55" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 8, fontSize: 9, letterSpacing: 2, cursor: "pointer",
                background: activeMenu === item.id ? item.color + "15" : "rgba(255,255,255,0.02)",
                color: activeMenu === item.id ? item.color : "#4a6a8a",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                minHeight: 60, fontFamily: "'Courier New', monospace",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FLASH MESSAGE */}
      <div
        className={`map-flash-message ${flashOn ? 'map-flash-active' : 'map-flash-inactive'}`}
      >
        {flashMsg}
      </div>

      {winModal && (
        <WinModal
          levelId={winModal.levelId}
          reward={winModal.reward}
          unlockedCards={winModal.unlockedCards}
          mapIconSrc={winModal.mapIconSrc}
          onClose={() => {
            setWinModal(null);
            if (winModal.levelId === MAX_LEVEL_ID) {
              dispatch({ type: 'GO_TO_GAME_FINISH' });
            }
          }}
        />
      )}

      {losePopup && (
        <LosePopup tip={losePopup} onClose={() => setLosePopup(null)} />
      )}
    </div>
  );
}
