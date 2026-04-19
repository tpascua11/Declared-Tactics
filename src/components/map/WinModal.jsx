import MAP_DATA from '../../data/maps/PATH_OF_THE_SUMURAI.json';

const CARD_W = 88;
const CARD_H = 132;

function CardWidget({ card }) {
  const spd = card.speed_mod ?? 0;
  const spdLabel = spd === 0 ? 'SPD —' : `SPD ${spd > 0 ? '+' : ''}${spd}`;

  return (
    <div style={{
      display: "flex", gap: 18, alignItems: "flex-start",
      background: `${card.color}09`,
      border: `1px solid ${card.color}33`,
      borderRadius: 8, padding: "14px 16px",
    }}>
      {/* Card — matches Hand.jsx proportions */}
      <div style={{
        flexShrink: 0,
        width: CARD_W, height: CARD_H,
        border: `2px solid ${card.color}`,
        borderRadius: 3,
        background: "#09090f",
        boxShadow: `0 0 10px ${card.color}55, inset 0 0 6px ${card.color}11`,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Name strip */}
        <div style={{
          flexShrink: 0, height: "1.3rem",
          background: "#0d0d1a",
          borderBottom: `1px solid ${card.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 4px",
        }}>
          <span style={{
            fontSize: 11, fontWeight: "bold", fontFamily: "ui-monospace,monospace",
            color: card.color, textAlign: "center", lineHeight: 1.2,
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
            maxWidth: "100%",
          }}>
            {card.name}
          </span>
        </div>

        {/* Art */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {card.image
            ? <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{card.icon}</div>
          }
          {/* Scanlines */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "repeating-linear-gradient(0deg,rgba(0,0,0,0.18) 0px,rgba(0,0,0,0.18) 1px,transparent 1px,transparent 3px)",
          }} />
        </div>

        {/* SPD strip */}
        <div style={{
          flexShrink: 0, height: "1.1rem",
          background: "#0d0d1a",
          borderTop: `1px solid ${card.color}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: "bold", fontFamily: "ui-monospace,monospace", color: card.color }}>
            {spdLabel}
          </span>
        </div>
      </div>

      {/* Info beside the card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, paddingTop: 2 }}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: card.color, letterSpacing: 1 }}>{card.name}</div>
        <div style={{ fontSize: 9, color: "#4a6a8a", letterSpacing: 1.5 }}>{card.tag_type?.join(' · ')}</div>
        <div style={{ fontSize: 11, color: "#8aaabb", lineHeight: 1.65 }}>{card.desc}</div>
        {Object.keys(card.cost ?? {}).length > 0 && (
          <div style={{ fontSize: 9, color: "#ffd70099", letterSpacing: 1, marginTop: 2 }}>
            COST: {Object.entries(card.cost).map(([k, v]) => `${v} ${k.replace(/_/g, ' ')}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WinModal({ levelId, reward, unlockedCards, mapIconSrc, onClose }) {
  const level = MAP_DATA.levels[levelId];
  const levelName = level?.name ?? "";
  const clearDesc = level?.clear_desc ?? "";

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
        width: 560,
        maxWidth: "90vw",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: "0 0 80px rgba(77,166,255,0.1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 22,
      }}>

        {/* Icon + header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          {mapIconSrc && (
            <div style={{
              width: 220, height: 220,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={mapIconSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
          <div style={{ fontSize: 26, color: "#f5d76e", textShadow: "0 0 20px #c8a135", letterSpacing: 2, textAlign: "center" }}>
            {levelName}
          </div>
          {clearDesc && (
            <div style={{
              width: "100%",
              background: "rgba(9,9,15,0.72)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 3,
              padding: "10px 14px",
            }}>
              <div style={{ fontSize: 14, color: "#7a9aaa", lineHeight: 1.9, fontStyle: "italic", fontWeight: 500 }}>
                {clearDesc}
              </div>
            </div>
          )}
        </div>

        {/* Rewards */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Gold */}
          {typeof reward === 'object' && reward?.general?.type === 'gold' && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: 6, padding: "6px 12px",
            }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>⬡</span>
              <span style={{ fontSize: 9, letterSpacing: 2, color: "#ffd70066" }}>GOLD</span>
              <span style={{ fontSize: 13, color: "#ffd700", fontWeight: "bold", marginLeft: 2 }}>+{reward.general.amount}</span>
            </div>
          )}

          {/* String reward */}
          {typeof reward === 'string' && (
            <div style={{ fontSize: 12, color: "#8aaabb", letterSpacing: 1, textAlign: "center", padding: "8px 0" }}>
              {reward}
            </div>
          )}

          {/* Unlocked cards */}
          {unlockedCards?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#c084fc77" }}>
                {unlockedCards.length === 1 ? 'CARD UNLOCKED' : 'CARDS UNLOCKED'}
              </div>
              {unlockedCards.map(card => <CardWidget key={card.id} card={card} />)}
            </div>
          )}

          {!unlockedCards?.length && !reward && (
            <div style={{ fontSize: 11, color: "#4a6a8a", textAlign: "center" }}>No rewards this time.</div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 4, padding: "10px 40px",
            border: "1.5px solid #4da6ff44", borderRadius: 6,
            background: "rgba(77,166,255,0.07)",
            color: "#4da6ff", fontSize: 10, letterSpacing: 3,
            cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "bold",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(77,166,255,0.14)"; e.currentTarget.style.borderColor = "#4da6ff88"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(77,166,255,0.07)"; e.currentTarget.style.borderColor = "#4da6ff44"; }}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
