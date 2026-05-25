// ============================================================
//  BattleLog — Fixed panel in the left column of the player zone
// ============================================================

import { useEffect, useRef } from 'react';

const LOG_COLORS = {
  dmg:   'text-[#e94560]',
  heal:  'text-green-400',
  buff:  'text-[#4da6ff]',
  clash:  'text-purple-400',
  fizzle: 'text-orange-400',
  info:  'text-[#ffd700]',
  normal:'text-gray-400',
};

export default function BattleLog({ logs, turn }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <>
      <style>{`
        .battle-log-scroll::-webkit-scrollbar { width: 4px; }
        .battle-log-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; transition: background 0.2s; }
        .battle-log-scroll::-webkit-scrollbar-track { background: transparent; }
        .battle-log-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
        .battle-log-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .battle-log-scroll:hover { scrollbar-color: rgba(255,255,255,0.2) transparent; }
      `}</style>
      <div
        style={{
          position:     'absolute',
          left:         0,
          top:          0,
          bottom:       0,
          width:        '600px',
          background:   'rgba(9,9,15,0.72)',
          border:       '1px solid rgba(255,255,255,0.07)',
          borderRadius: '3px',
          display:      'flex',
          flexDirection:'column',
          zIndex:       5,
          willChange:   'transform',
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-3 py-[5px] border-b border-white/[0.06]"
          style={{ background: '#131320' }}
        >
          <span className="text-[9px] font-mono tracking-widest text-gray-500">
            BATTLE LOG — T{turn}
          </span>
        </div>

        {/* Entries */}
        <div
          ref={scrollRef}
          className="battle-log-scroll flex-1 overflow-y-auto flex flex-col gap-[3px]"
          style={{ padding: '6px 10px' }}
        >
          {logs.map((l, i) => (
            <div
              key={i}
              className={`text-[17px] font-mono leading-tight ${LOG_COLORS[l.type] ?? LOG_COLORS.normal}`}
            >
              {l.msg}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
