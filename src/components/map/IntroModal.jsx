import { useState, useEffect } from 'react';
import '../shared/shine-btn.css';

export default function IntroModal({ level, levelType, mapIconSrc, onBattle, onClose }) {
  const typeColor = levelType?.color ?? '#4da6ff';

  const [typedDesc, setTypedDesc] = useState('');
  useEffect(() => {
    const desc = level.desc ?? '';
    if (!desc) return;
    setTypedDesc('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedDesc(desc.slice(0, i));
      if (i >= desc.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [level.desc]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        background: "linear-gradient(160deg,#0a1220,#071018)",
        border: "1.5px solid #4da6ff33",
        borderRadius: 12,
        padding: "36px 44px",
        width: 880,
        maxWidth: "90vw",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: "0 0 80px rgba(77,166,255,0.1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 22,
        position: "relative",
      }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 18,
            background: "none", border: "none", cursor: "pointer",
            color: "#4a6a8a", fontSize: 18, lineHeight: 1,
            padding: 4, transition: "color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#8aaabb"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#4a6a8a"; }}
        >
          ✕
        </button>

        {/* Level name */}
        <div style={{
          fontSize: 26, color: "#f5d76e",
          textShadow: "0 0 20px #c8a135",
          letterSpacing: 2, textAlign: "center", width: "100%",
        }}>
          {level.name}
        </div>

        {/* Icon + description side by side */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", width: "100%" }}>

          {/* Left: zone icon */}
          {mapIconSrc && (
            <div style={{
              flexShrink: 0,
              width: 220, height: 220,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={mapIconSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Right: description */}
          {level.desc && (
            <div style={{
              flex: 1,
              background: "rgba(9,9,15,0.72)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 3,
              padding: "14px 18px",
              alignSelf: "stretch",
              position: "relative",
            }}>
              {/* invisible full text holds the box size */}
              <div style={{ fontSize: 14, lineHeight: 1.9, fontStyle: "italic", fontWeight: 500, visibility: "hidden" }}>
                {level.desc}
              </div>
              {/* typed text overlaid */}
              <div style={{ fontSize: 14, color: "#7a9aaa", lineHeight: 1.9, fontStyle: "italic", fontWeight: 500, position: "absolute", top: "14px", left: "18px", right: "18px" }}>
                {typedDesc}
              </div>
            </div>
          )}
        </div>

        {/* Battle button */}
        <button
          className="shine-btn"
          onClick={onBattle}
          style={{
            marginTop: 4, padding: "11px 48px", alignSelf: "center",
            border: `1.5px solid ${typeColor}66`,
            borderRadius: 6,
            background: `${typeColor}14`,
            color: typeColor,
            fontSize: 11, letterSpacing: 4,
            cursor: "pointer",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            transition: "all 0.15s",
            "--shine-color": `${typeColor}77`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${typeColor}28`;
            e.currentTarget.style.borderColor = `${typeColor}aa`;
            e.currentTarget.style.boxShadow = `0 0 18px ${typeColor}44`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${typeColor}14`;
            e.currentTarget.style.borderColor = `${typeColor}66`;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          BATTLE
        </button>
      </div>
    </div>
  );
}
