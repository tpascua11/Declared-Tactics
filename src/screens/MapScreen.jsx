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
} from '../assets';
import './MapScreen.css';
import menuMapTheme from '../assets/MUSIC/Menu Map Theme.mp3';

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
  GRASS_4:        MAP_ICON_GRASS_4,
  GRASS_5:        MAP_ICON_GRASS_5,
  GRASS_6:        MAP_ICON_GRASS_6,
};

const CELL_SIZE = 160;
const CELL_GAP  = 14;

// ── Constants ────────────────────────────────────────────────

const ZONE_TYPES = {
  COMBAT:    { label: "COMBAT",    color: "#e94560", dim: "rgba(233,69,96,0.08)",   icon: "⚔️",  glow: "rgba(233,69,96,0.4)"  },
  CHALLENGE: { label: "CHALLENGE", color: "#c084fc", dim: "rgba(192,132,252,0.08)", icon: "💀",  glow: "rgba(192,132,252,0.4)" },
  EXPLORE:   { label: "EXPLORE",   color: "#4da6ff", dim: "rgba(77,166,255,0.08)",  icon: "🏛️", glow: "rgba(77,166,255,0.4)"  },
  RESTORE:   { label: "RESTORE",   color: "#69d99a", dim: "rgba(105,217,154,0.08)", icon: "💖",  glow: "rgba(105,217,154,0.4)" },
  SHOP:      { label: "SHOP",      color: "#ffd700", dim: "rgba(255,215,0,0.08)",   icon: "⬡",  glow: "rgba(255,215,0,0.4)"  },
  BOSS:      { label: "BOSS",      color: "#e94560", dim: "rgba(233,69,96,0.14)",   icon: "👑",  glow: "rgba(233,69,96,0.5)"  },
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
  const cols = MAP_DATA.cols, rows = MAP_DATA.rows;
  const col = id % cols, row = Math.floor(id / cols);
  const n = [];
  if (row > 0)       n.push(id - cols);
  if (row < rows - 1) n.push(id + cols);
  if (col > 0)       n.push(id - 1);
  if (col < cols - 1) n.push(id + 1);
  return n;
}

const DEBUG_UNLOCK_ALL = true;

// Converts playerData.completed_zones ({ "0": [0,1] }) into
// zoneStates and levelStates the component can render directly.
function deriveStates(completedZones = {}) {
  const zs = {}, ls = {};

  if (DEBUG_UNLOCK_ALL) {
    MAP_DATA.zones.forEach(z => {
      zs[z.id] = "available";
      ls[z.id] = {};
      z.levels.forEach((_, i) => { ls[z.id][i] = "available"; });
    });
    return { zoneStates: zs, levelStates: ls };
  }

  // Initialize everything locked
  MAP_DATA.zones.forEach(z => {
    zs[z.id] = "locked";
    ls[z.id] = {};
    z.levels.forEach((_, i) => { ls[z.id][i] = "locked"; });
  });

  // Zone 0 always starts available
  zs[0] = "available";
  ls[0][0] = "available";

  // Pass 1: mark fully-cleared zones
  MAP_DATA.zones.forEach(z => {
    const cleared = completedZones[z.id] ?? [];
    if (cleared.length === z.levels.length) {
      zs[z.id] = "cleared";
    }
  });

  // Pass 2: unlock neighbors of cleared zones
  MAP_DATA.zones.forEach(z => {
    if (zs[z.id] === "cleared") {
      getNeighbors(z.id).forEach(nid => {
        if (zs[nid] === "locked") {
          zs[nid] = "available";
          ls[nid][0] = "available";
        }
      });
    }
  });

  // Pass 3: apply level-granular progress for partial zones
  Object.entries(completedZones).forEach(([zidStr, clearedLevels]) => {
    const zid = parseInt(zidStr);
    if (!MAP_DATA.zones[zid]) return;
    const total = MAP_DATA.zones[zid].levels.length;
    if (clearedLevels.length === total) {
      // Fully cleared — already handled above, just set level states
      clearedLevels.forEach(li => { ls[zid][li] = "cleared"; });
    } else {
      // Partially cleared
      zs[zid] = "available";
      clearedLevels.forEach(li => {
        ls[zid][li] = "cleared";
        if (li + 1 < total) ls[zid][li + 1] = "available";
      });
    }
  });

  return { zoneStates: zs, levelStates: ls };
}

// ── ZoneCell ─────────────────────────────────────────────────

const ZoneCell = ({ zone, zoneState, zoneType, isPlayerHere, isSelected, progress, isPlayerCell, playerTypeColor, playerGlow, tokenPortrait, tokenName, mapIconSrc, onClick, onEnter }) => {
  const isLocked  = zoneState === "locked";
  const isCleared = zoneState === "cleared";

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
    if (isLocked) return { ...base, background: zoneType.dim, borderColor: `${zoneType.color}30`, filter: "saturate(0.35) brightness(0.6)" };
    if (isCleared) {
      return {
        ...base,
        background: (isPlayerHere || isSelected) ? zoneType.dim : "#0e1a26",
        borderColor: (isPlayerHere || isSelected) ? zoneType.color : `${zoneType.color}40`,
        boxShadow: isPlayerHere
          ? `0 0 30px ${zoneType.glow}`
          : isSelected
            ? `0 0 20px ${zoneType.glow}`
            : `0 0 8px ${zoneType.glow}44`,
      };
    }
    return {
      ...base,
      background: (isPlayerHere || isSelected) ? zoneType.dim : "#0a0f1a",
      borderColor: (isPlayerHere || isSelected) ? zoneType.color : "rgba(26,42,58,0.9)",
      boxShadow: isPlayerHere
        ? `0 0 30px ${zoneType.glow}, inset 0 0 20px ${zoneType.dim}`
        : isSelected ? `0 0 20px ${zoneType.glow}` : "none",
      transform: (isPlayerHere || isSelected) ? "scale(1.02)" : "scale(1)",
    };
  }, [isLocked, isCleared, isPlayerHere, isSelected, zoneType]);

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
            : (isPlayerHere || isSelected)
              ? `linear-gradient(160deg,rgba(5,8,15,0.30),${zoneType.dim})`
              : "rgba(5,8,15,0.35)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg,transparent,${zoneType.color},transparent)`,
        opacity: isLocked ? 0.35 : 0.8,
        zIndex: 1,
      }} />

      {!isLocked ? (
        <>
          {/* Top: zone name + progress */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: 12, letterSpacing: 1.5, textAlign: "center",
              padding: "0 4px", lineHeight: 1.3, fontWeight: "bold",
              color: isCleared ? `${zoneType.color}cc` : isPlayerHere ? zoneType.color : "#8aaabb",
            }}>
              {zone.name}
            </div>
            <div style={{ fontSize: 14, letterSpacing: 1, color: isCleared ? `${zoneType.color}bb` : `${zoneType.color}99` }}>
              {progress.done}/{progress.total}
            </div>
          </div>

          {/* Bottom: portrait (if player is here) + enter button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%", position: "relative", zIndex: 1 }}>
            {isPlayerCell && (
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
            {isPlayerCell ? (
              <button
                className="map-enter-btn-cell"
                onClick={e => { e.stopPropagation(); onEnter(); }}
                style={{
                  padding: "5px 14px",
                  border: `1.5px solid ${playerTypeColor || "#4da6ff"}`,
                  borderRadius: 5,
                  fontSize: 9,
                  letterSpacing: 2,
                  cursor: "pointer",
                  background: `${playerTypeColor || "#4da6ff"}15`,
                  color: playerTypeColor || "#4da6ff",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  "--glow": playerGlow || "rgba(77,166,255,0.3)",
                  transition: "all 0.15s",
                }}
              >
                ENTER
              </button>
            ) : (
              <div style={{ fontSize: 24, lineHeight: 1 }}>{zoneType.icon}</div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: 11, letterSpacing: 1.5, textAlign: "center",
            color: `${zoneType.color}55`, fontWeight: "bold",
            position: "relative", zIndex: 1, padding: "0 4px",
          }}>
            {zone.name}
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

// ── LevelBar ─────────────────────────────────────────────────

const LevelBar = ({ level, index, levelState, isSelected, zoneType, onClick }) => {
  const barStyle = useMemo(() => {
    const base = {
      display: "flex", alignItems: "center", gap: 16,
      border: "2px solid", borderRadius: 8, padding: "18px 20px",
      cursor: levelState === "locked" ? "default" : "pointer",
      transition: "all 0.2s ease", flexShrink: 0,
    };
    if (levelState === "cleared") return { ...base, background: "linear-gradient(135deg,#06090e,#080c12)", borderColor: "rgba(77,166,255,0.1)", opacity: 0.45 };
    if (isSelected) return {
      ...base,
      background: `linear-gradient(135deg,${zoneType?.dim || "#0a0f1a"},${zoneType?.color}11)`,
      borderColor: zoneType?.color || "#4da6ff",
      boxShadow: `0 0 30px ${zoneType?.glow || "transparent"}44,inset 0 0 20px ${zoneType?.dim || "transparent"}`,
      transform: "scale(1.02)",
    };
    if (levelState === "locked") return { ...base, background: "linear-gradient(135deg,#06090e,#050810)", borderColor: "#0d1420", opacity: 0.35 };
    return { ...base, background: "linear-gradient(135deg,#0a0f1a,#0c1424)", borderColor: "#1e2a3a" };
  }, [levelState, isSelected, zoneType]);

  const numColor  = levelState === "cleared" ? "rgba(77,166,255,0.3)" : levelState === "locked" ? "#1a2030" : isSelected ? (zoneType?.color || "#4da6ff") : "#4da6ff";
  const descColor = levelState === "cleared" ? "rgba(77,166,255,0.3)" : levelState === "locked" ? "#1a2030" : isSelected ? (zoneType?.color || "#4da6ff") : "#c0d0e0";
  const rewColor  = levelState === "cleared" ? "rgba(77,166,255,0.2)" : levelState === "locked" ? "#0d1420" : (zoneType?.color || "#4da6ff");
  const statusTxt = levelState === "cleared" ? "✓ DONE" : levelState === "locked" ? "— LOCKED" : isSelected ? "▶ SELECTED" : "READY";

  return (
    <div className="map-level-bar" style={barStyle} onClick={onClick}>
      <div style={{
        minWidth: 36, height: 36, borderRadius: 8, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: "bold", fontVariantNumeric: "tabular-nums",
        background: levelState === "cleared" ? "rgba(77,166,255,0.05)" : levelState === "locked" ? "rgba(20,30,40,0.5)" : isSelected ? `${zoneType?.color}22` : "rgba(77,166,255,0.08)",
        border: `1px solid ${levelState === "cleared" ? "rgba(77,166,255,0.15)" : levelState === "locked" ? "rgba(20,30,40,0.5)" : isSelected ? (zoneType?.color || "#4da6ff") : "rgba(77,166,255,0.2)"}`,
        color: numColor,
      }}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 0.5, color: descColor, marginBottom: 6, lineHeight: 1.4, fontWeight: isSelected ? "600" : "400" }}>
          {level.desc}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 0.5, color: rewColor, opacity: levelState === "cleared" ? 0.5 : 0.85 }}>
          ⬡ {typeof level.reward === 'string' ? level.reward : "Card Unlock"}
        </div>
      </div>
      <div style={{ fontSize: 10, letterSpacing: 1, minWidth: 48, textAlign: "right", color: levelState === "cleared" ? "rgba(77,166,255,0.3)" : levelState === "locked" ? "#0d1420" : isSelected ? (zoneType?.color || "#4da6ff") : "#2a4060", fontWeight: isSelected ? "bold" : "normal" }}>
        {statusTxt}
      </div>
    </div>
  );
};

// ── MapScreen ─────────────────────────────────────────────────

export default function MapScreen() {
  const { gs, dispatch, goToBattle } = useGame();
  const { playerData, playerDispatch } = usePlayer();

  // Derive initial zone/level states from saved progress
  const initStates = useMemo(() => deriveStates(playerData?.completed_zones ?? {}), []);

  const [zoneStates,    setZoneStates]    = useState(initStates.zoneStates);
  const [levelStates,   setLevelStates]   = useState(initStates.levelStates);
  const [playerZone,    setPlayerZone]    = useState(0);
  const [selectedZone,  setSelectedZone]  = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [flashMsg,      setFlashMsg]      = useState("");
  const [flashOn,       setFlashOn]       = useState(false);
  const [activeMenu,    setActiveMenu]    = useState(null);

  const [gridDims, setGridDims] = useState({ cols: 5, rows: 1 });
  const gridWrapRef = useRef(null);
  const audioRef = useRef(null);
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
      const cols = Math.max(1, Math.floor((el.clientWidth  + CELL_GAP) / (CELL_SIZE + CELL_GAP)));
      const rows = Math.max(1, Math.floor((el.clientHeight + CELL_GAP) / (CELL_SIZE + CELL_GAP)));
      setGridDims({ cols, rows });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ftRef    = useRef(null);

  // ── Battle return handler ──────────────────────────────────
  useEffect(() => {
    if (!gs.battleResult) return;
    playerDispatch({ type: 'APPLY_BATTLE_RESULT', currentHP: gs.battleResult.currentHP });
    if (gs.battleResult.victory && gs.sourceZone) {
      const { zoneId, levelIndex } = gs.sourceZone;
      playerDispatch({ type: 'SAVE_MAP_PROGRESS', zoneId, levelIndex });

      // Update local display state to reflect the cleared level
      setLevelStates(prev => {
        const zone = MAP_DATA.zones[zoneId];
        const next = { ...prev, [zoneId]: { ...prev[zoneId], [levelIndex]: "cleared" } };
        if (levelIndex + 1 < zone.levels.length) next[zoneId][levelIndex + 1] = "available";
        return next;
      });

      const level = MAP_DATA.zones[zoneId].levels[levelIndex];
      if (typeof level.reward === 'object' && level.reward !== null) {
        const classUnlock = level.reward.unlocks?.find(u => u.class === playerData.class_id);
        if (classUnlock) classUnlock.card_ids.forEach(id => playerDispatch({ type: 'UNLOCK_CARD', cardId: id }));
      }

      const zone = MAP_DATA.zones[zoneId];
      const allLevelsCleared = zone.levels.every((_, i) => i === levelIndex || levelStates[zoneId][i] === "cleared");
      if (allLevelsCleared) {
        setZoneStates(prev => {
          const next = { ...prev, [zoneId]: "cleared" };
          getNeighbors(zoneId).forEach(nid => { if (next[nid] === "locked") next[nid] = "available"; });
          return next;
        });
        setLevelStates(prev => {
          const next = { ...prev };
          getNeighbors(zoneId).forEach(nid => { if (!next[nid]) return; next[nid] = { ...next[nid], 0: "available" }; });
          return next;
        });
        flash("ZONE CLEARED — NEIGHBORS UNLOCKED");
      } else {
        flash("LEVEL CLEARED");
      }
    }
    // Clear battleResult so this doesn't re-apply on re-renders
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
  const zoneData        = useMemo(() => selectedZone !== null ? MAP_DATA.zones[selectedZone] : null, [selectedZone]);
  const zoneTypeConfig  = useMemo(() => zoneData ? ZONE_TYPES[zoneData.type] : null, [zoneData]);
  const playerZoneData  = useMemo(() => MAP_DATA.zones[playerZone], [playerZone]);
  const playerTypeCfg   = useMemo(() => ZONE_TYPES[playerZoneData?.type], [playerZoneData]);

  const getProgress = useCallback((zid) => {
    const ls = levelStates[zid], t = MAP_DATA.zones[zid].levels.length;
    return { done: Object.values(ls).filter(s => s === "cleared").length, total: t };
  }, [levelStates]);

  const clearedCount = useMemo(() =>
    Object.values(zoneStates).filter(s => s === "cleared").length,
  [zoneStates]);

  const canEnter = useMemo(() =>
    selectedLevel !== null && levelStates[selectedZone]?.[selectedLevel] === "available",
  [selectedLevel, selectedZone, levelStates]);

  // ── Handlers ─────────────────────────────────────────────
  const handleCellClick = useCallback((zid) => {
    if (zoneStates[zid] === "locked") { flash("🔒 ZONE LOCKED"); return; }
    if (modalOpen) setModalOpen(false);
    setPlayerZone(zid);
    setSelectedZone(zid);
    setSelectedLevel(null);
  }, [zoneStates, modalOpen, flash]);

  const openModal    = useCallback(() => { if (zoneStates[playerZone] !== "locked") { setSelectedZone(playerZone); setModalOpen(true); } }, [zoneStates, playerZone]);
  const closeModal   = useCallback(() => { setModalOpen(false); }, []);
  const handleBackdropClick = useCallback((e) => { if (e.target === e.currentTarget) closeModal(); }, [closeModal]);
  const handleLevelClick = useCallback((lid) => {
    if (levelStates[selectedZone]?.[lid] === "locked") return;
    setSelectedLevel(lid === selectedLevel ? null : lid);
  }, [levelStates, selectedZone, selectedLevel]);

  const handleEnter = useCallback(() => {
    if (selectedZone === null || selectedLevel === null) return;
    const zone  = MAP_DATA.zones[selectedZone];
    const level = zone.levels[selectedLevel];

    if (!level.scenario_id) {
      // Non-combat zone: resolve immediately
      setLevelStates(prev => {
        const next = { ...prev, [selectedZone]: { ...prev[selectedZone], [selectedLevel]: "cleared" } };
        if (selectedLevel + 1 < zone.levels.length) next[selectedZone][selectedLevel + 1] = "available";
        return next;
      });
      const allCleared = zone.levels.every((_, i) => i === selectedLevel || levelStates[selectedZone][i] === "cleared");
      if (allCleared) {
        setZoneStates(prev => {
          const next = { ...prev, [selectedZone]: "cleared" };
          getNeighbors(selectedZone).forEach(nid => { if (next[nid] === "locked") next[nid] = "available"; });
          return next;
        });
        setLevelStates(prev => {
          const next = { ...prev };
          getNeighbors(selectedZone).forEach(nid => { if (!next[nid]) return; next[nid] = { ...next[nid], 0: "available" }; });
          return next;
        });
        flash("ZONE CLEARED — NEIGHBORS UNLOCKED");
      } else {
        flash(typeof level.reward === 'string' ? level.reward : "LEVEL CLEARED");
      }
      if (typeof level.reward === 'object' && level.reward !== null) {
        const classUnlock = level.reward.unlocks?.find(u => u.class === playerData.class_id);
        if (classUnlock) classUnlock.card_ids.forEach(id => playerDispatch({ type: 'UNLOCK_CARD', cardId: id }));
      }
      playerDispatch({ type: 'SAVE_MAP_PROGRESS', zoneId: selectedZone, levelIndex: selectedLevel });
      setSelectedLevel(null);
      closeModal();
      return;
    }

    const scenario = SCENARIO_REGISTRY[level.scenario_id];
    if (!scenario) { flash("NO SCENARIO FOUND"); return; }
    closeModal();
    goToBattle(scenario, { zoneId: selectedZone, levelIndex: selectedLevel });
  }, [selectedZone, selectedLevel, levelStates, playerDispatch, flash, closeModal, goToBattle]);

  // ── Memoized styles ───────────────────────────────────────
  const gridWrapStyle = useMemo(() => ({
    ...STATIC_STYLES.gridWrap,
    filter: modalOpen ? "blur(5px) brightness(0.7)" : "none",
    transition: "filter 0.3s ease",
  }), [modalOpen]);

  const gridStyle = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${gridDims.cols},${CELL_SIZE}px)`,
    gridTemplateRows:    `repeat(${gridDims.rows},${CELL_SIZE}px)`,
    gap: CELL_GAP,
  }), [gridDims]);

  const backdropStyle = useMemo(() => ({
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 500, pointerEvents: modalOpen ? "auto" : "none",
  }), [modalOpen]);

  const modalStyle = useMemo(() => ({
    width: "100%", maxWidth: 520, maxHeight: "85%",
    background: "linear-gradient(180deg,#0c1220,#080c14)",
    border: `1px solid ${zoneTypeConfig?.color || "#4da6ff"}33`,
    borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column",
    boxShadow: `0 25px 80px rgba(0,0,0,0.7), 0 0 60px ${zoneTypeConfig?.glow || "rgba(77,166,255,0.15)"}`,
  }), [zoneTypeConfig]);

  const tokenName = playerData ? (playerData.class_id?.toUpperCase() ?? "PLAYER") : "PLAYER";
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
          {clearedCount}/{MAP_DATA.zones.length} CLEARED
        </div>
      </div>

      {/* MAIN */}
      <div style={STATIC_STYLES.main}>
        <div ref={gridWrapRef} style={gridWrapStyle}>
          <div style={gridStyle}>
            {Array.from({ length: gridDims.cols * gridDims.rows }, (_, i) => {
              const z = MAP_DATA.zones[i];
              if (!z) {
                return <div key={`empty-${i}`} className="map-cell-base map-cell-locked" style={{ background: "#05080f", borderColor: "#0c1018" }} />;
              }
              const st   = zoneStates[z.id];
              const t    = ZONE_TYPES[z.type];
              const prog = getProgress(z.id);
              const isPlayerCell = playerZone === z.id && !modalOpen;
              return (
                <ZoneCell
                  key={z.id}
                  zone={z}
                  zoneState={st}
                  zoneType={t}
                  isPlayerHere={playerZone === z.id}
                  isSelected={selectedZone === z.id}
                  progress={prog}
                  isPlayerCell={isPlayerCell}
                  playerTypeColor={playerTypeCfg?.color}
                  playerGlow={playerTypeCfg?.glow}
                  tokenPortrait={isPlayerCell ? tokenPortrait : null}
                  tokenName={tokenName}
                  mapIconSrc={z.map_icon ? MAP_ICON_LOOKUP[z.map_icon] : null}
                  onClick={() => handleCellClick(z.id)}
                  onEnter={openModal}
                />
              );
            })}
          </div>
        </div>

        {/* MODAL BACKDROP */}
        <div style={backdropStyle} onClick={handleBackdropClick}>
          {modalOpen && zoneData && (
            <div className="map-modal-content" style={modalStyle} onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div style={{
                padding: "22px 26px 18px",
                borderBottom: `1px solid ${zoneTypeConfig.color}22`,
                position: "relative",
                background: `linear-gradient(135deg,${zoneTypeConfig.dim}00,${zoneTypeConfig.dim}44)`,
              }}>
                <button
                  onClick={closeModal}
                  style={{
                    position: "absolute", top: 16, right: 16,
                    width: 28, height: 28, borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#556677", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "#e94560"; e.target.style.color = "#e94560"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "#556677"; }}
                >
                  ✕
                </button>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 8, letterSpacing: 2, padding: "3px 10px",
                  borderRadius: 4, background: zoneTypeConfig.dim,
                  color: zoneTypeConfig.color, marginBottom: 10,
                  border: `1px solid ${zoneTypeConfig.color}33`,
                }}>
                  <span>{zoneTypeConfig.icon}</span>
                  {zoneData.type}
                </div>

                <div style={{ fontSize: 22, letterSpacing: 3, color: zoneTypeConfig.color, fontWeight: "bold", lineHeight: 1.2 }}>
                  {zoneData.name}
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1, color: "#3a5a7a", marginTop: 8 }}>
                  {getProgress(selectedZone).done}/{zoneData.levels.length} LEVELS CLEARED
                </div>
                <div style={{ marginTop: 10, height: 3, background: "#1a2030", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: `linear-gradient(90deg,${zoneTypeConfig.color}88,${zoneTypeConfig.color})`,
                    width: `${(getProgress(selectedZone).done / zoneData.levels.length) * 100}%`,
                    transition: "width 0.5s ease",
                    boxShadow: `0 0 10px ${zoneTypeConfig.glow}`,
                  }} />
                </div>
              </div>

              {/* Level list */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, padding: "20px 24px", overflowY: "auto" }}>
                {zoneData.levels.map((lv, i) => (
                  <LevelBar
                    key={i}
                    level={lv}
                    index={i}
                    levelState={levelStates[selectedZone][i]}
                    isSelected={selectedLevel === i}
                    zoneType={zoneTypeConfig}
                    onClick={() => handleLevelClick(i)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div style={{
                borderTop: "1px solid #1a2a3a", padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.2)", flexShrink: 0,
              }}>
                <button
                  onClick={canEnter ? handleEnter : undefined}
                  disabled={!canEnter}
                  style={{
                    padding: "14px 48px",
                    border: `2px solid ${canEnter ? (zoneTypeConfig?.color || "#4da6ff") : "#1a2a3a"}`,
                    borderRadius: 10, fontSize: 12, letterSpacing: 4,
                    cursor: canEnter ? "pointer" : "not-allowed",
                    background: canEnter
                      ? `linear-gradient(135deg,${zoneTypeConfig?.dim || "#0a0f1a"},${zoneTypeConfig?.color}22)`
                      : "transparent",
                    color: canEnter ? (zoneTypeConfig?.color || "#4da6ff") : "#2a3a4a",
                    fontWeight: "bold",
                    textShadow: canEnter ? `0 0 20px ${zoneTypeConfig?.glow || "rgba(77,166,255,0.3)"}` : "none",
                    boxShadow: canEnter ? `0 4px 20px ${zoneTypeConfig?.glow || "rgba(77,166,255,0.2)"}` : "none",
                    transition: "all 0.2s",
                    opacity: canEnter ? 1 : 0.45,
                  }}
                  onMouseEnter={e => { if (canEnter) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 40px ${zoneTypeConfig?.glow || "rgba(77,166,255,0.35)"}`; } }}
                  onMouseLeave={e => { if (canEnter) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${zoneTypeConfig?.glow || "rgba(77,166,255,0.2)"}`; } }}
                >
                  ▶ ENTER ZONE
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
}

