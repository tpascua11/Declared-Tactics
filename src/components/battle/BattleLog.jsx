// ============================================================
//  BattleLog — Fixed panel in the left column of the player zone
// ============================================================

const LOG_COLORS = {
  dmg:   'text-[#e94560]',
  heal:  'text-green-400',
  buff:  'text-[#4da6ff]',
  clash:  'text-purple-400',
  fizzle: 'text-orange-400',
  info:  'text-[#ffd700]',
  normal:'text-gray-400',
};

// Ambient display only fades in the newest 14 lines — full history still
// lives in gs.logs untouched; the LOG button's full view reads that directly.
const MAX_AMBIENT_LINES = 14;

function opacityForAge(ageFromNewest) {
  if (ageFromNewest < 4) return 1;
  if (ageFromNewest < 9) return 0.55;
  return 0.25;
}

export default function BattleLog({ logs, turn }) {
  const visibleLogs = logs.slice(-MAX_AMBIENT_LINES);
  const firstIndex = logs.length - visibleLogs.length;

  return (
    <div
      style={{
        position:      'absolute',
        left:          0,
        top:           0,
        bottom:        0,
        width:         '600px',
        display:       'flex',
        flexDirection: 'column',
        justifyContent:'flex-end',
        overflow:      'hidden',
        zIndex:        5,
        pointerEvents: 'none',
        border:        '1px solid rgba(255,255,255,0.06)',
        borderRadius:  '3px',
        padding:       '6px 10px',
        gap:           '3px',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
        maskImage:       'linear-gradient(to bottom, transparent 0%, black 15%)',
      }}
    >
      {visibleLogs.map((l, i) => {
        const ageFromNewest = visibleLogs.length - 1 - i;
        return (
          <div
            key={firstIndex + i}
            className={`text-[17px] font-mono leading-tight transition-opacity duration-500 ${LOG_COLORS[l.type] ?? LOG_COLORS.normal}`}
            style={{ opacity: opacityForAge(ageFromNewest) }}
          >
            {l.msg}
          </div>
        );
      })}
    </div>
  );
}
