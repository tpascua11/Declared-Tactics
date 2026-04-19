export default function LosePopup({ tip, onClose }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 300,
      background: "linear-gradient(160deg,#120a0a,#1a0a10)",
      border: "1.5px solid rgba(233,69,96,0.35)",
      borderRadius: 10, padding: "18px 22px",
      width: 300, fontFamily: "'Courier New', monospace",
      boxShadow: "0 0 40px rgba(233,69,96,0.12)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 20, background: "#e94560", borderRadius: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#e94560", fontWeight: "bold" }}>TACTICIAN'S NOTE</div>
      </div>
      <div style={{ fontSize: 11, color: "#9aaabb", lineHeight: 1.7 }}>{tip}</div>
      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-end", padding: "5px 16px",
          border: "1px solid rgba(233,69,96,0.28)", borderRadius: 5,
          background: "transparent", color: "#e9456077",
          fontSize: 9, letterSpacing: 2, cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#e94560"; e.currentTarget.style.borderColor = "rgba(233,69,96,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#e9456077"; e.currentTarget.style.borderColor = "rgba(233,69,96,0.28)"; }}
      >
        DISMISS
      </button>
    </div>
  );
}
