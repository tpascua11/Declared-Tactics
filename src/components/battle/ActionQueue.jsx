// ============================================================
//  ActionQueue — Card-shaped slots to the right of Vrax
// ============================================================

import { projectedSpeedPenalty, projectedSpeedInfluence } from '../../battle/engine/preview_utils';

export default function ActionQueue({ queue, totalSlots, enemies, retargetingSlot, onRetargetBoxClick, onClearSlot, onExecute, isBattling, isResult, result, fizzlingCard, tagPool, baseSpeed, allowRetry, onRetry }) {
  const filledCount = queue.filter(Boolean).length;
  const canExecute = !isBattling && filledCount > 0 && filledCount >= totalSlots;

  const showRetry = isResult && result !== 'WIN' && allowRetry;

  return (
    <div className="flex flex-col items-start gap-3">

      {/* Slots — hidden during result screen */}
      <div className="relative flex flex-row gap-2" style={{ paddingTop: '5rem', willChange: 'transform', display: isResult ? 'none' : undefined }}>

        {/* Fizzle popup — placeholder until animation is implemented */}
        {fizzlingCard && (
          <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none z-20">
            <div style={{ background: '#09090f', border: '2px solid #f97316', borderRadius: '3px', padding: '0.35rem 0.9rem', boxShadow: '0 0 16px rgba(249,115,22,0.45)' }}>
              <div className="text-xs font-bold font-mono tracking-widest uppercase text-orange-400 text-center">FIZZLED</div>
              <div className="text-[9px] font-mono text-gray-400 text-center tracking-wide mt-[2px]">{fizzlingCard.name}</div>
            </div>
          </div>
        )}
        {Array.from({ length: totalSlots }).map((_, i) => {
          const slot = queue[i];
          const borderColor = slot ? slot.color : '#ffffff22';
          return (
            <div key={i} className="relative flex flex-row overflow-visible">
            {i > 0 && (
              <div className="flex items-center justify-center pointer-events-none" style={{ height: '8.25rem', width: '1rem', marginLeft: '-4px' }}>
                <span className="text-lg font-mono font-bold" style={{
                  color: queue[i - 1] ? '#ffffffcc' : '#ffffff44',
                  textShadow: queue[i - 1] ? '0 0 8px #fff, 0 0 16px #ffffff88' : 'none',
                  transition: 'color 0.2s, text-shadow 0.2s',
                }}>→</span>
              </div>
            )}
            <div className="relative flex flex-col overflow-visible" style={{ width: '5.5rem' }}>

              {/* Target box */}
              {slot && !isBattling && slot.tags?.target?.length > 0 && (() => {
                const target = enemies.find(e => e.id === slot.target_id);
                const enemyNum = enemies.findIndex(e => e.id === slot.target_id) + 1;
                const isRetargeting = retargetingSlot === i;
                return (
                  <div
                    className="absolute left-0 right-0 flex flex-col items-center cursor-pointer group"
                    data-retarget-slot={i}
                    style={{ top: '-3.2rem', zIndex: 10, height: '3rem' }}
                    onClick={e => { e.stopPropagation(); onRetargetBoxClick(i); }}
                  >
                    <div className="relative w-full h-full flex flex-col items-center justify-around py-1 transition-all duration-150 group-hover:brightness-125 group-hover:-translate-y-[2px]"
                      style={{
                        background: '#09090f',
                        border: `1px solid ${isRetargeting ? '#4da6ff' : '#e94560'}`,
                        borderBottom: 'none',
                        borderRadius: '3px 3px 0 0',
                        boxShadow: isRetargeting
                          ? '0 0 14px rgba(77,166,255,0.5), inset 0 0 6px rgba(77,166,255,0.1)'
                          : '0 0 8px rgba(233,69,96,0.3), inset 0 0 4px rgba(233,69,96,0.06)',
                      }}
                    >
                      {/* Row 1 — ENEMY N */}
                      <div className="text-[11px] font-display tracking-widest leading-none"
                        style={{ color: '#ffffffcc' }}>
                        ENEMY {enemyNum}
                      </div>
                      {/* Row 2 — name */}
                      <div className="text-[11px] font-display tracking-widest leading-none truncate px-1 text-center w-full mt-[2px]"
                        style={{ color: '#9ca3af' }}>
                        {target?.name ?? '???'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Card — hover and click isolated here */}
              <div
                onClick={() => slot && !isBattling && onClearSlot(i)}
                className={`flex flex-col transition-all duration-200 ${slot ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : 'border-dashed'}`}
                style={{
                  height: '8.25rem',
                  background: '#09090f',
                  border: `2px ${slot ? 'solid' : 'dashed'} ${borderColor}`,
                  borderRadius: '3px',
                  boxShadow: slot ? `0 0 10px ${slot.color}55, inset 0 0 6px ${slot.color}11` : 'none',
                  isolation: 'isolate',
                }}
              >
                {/* Header strip */}
                <div className="relative flex-shrink-0"
                  style={{ background: '#0d0d1a', borderBottom: `1px solid ${slot ? slot.color + '44' : '#ffffff11'}`, height: '1.3rem', overflow: 'visible', zIndex: 2 }}>
                  <span className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold font-mono text-center leading-tight"
                    style={{ color: slot ? slot.color : '#4b5563' }}>
                    {slot ? slot.name : `SLOT ${i + 1}`}
                  </span>
                </div>

                {/* Art area */}
                <div className="relative flex-1"
                  style={{ background: slot ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                    {slot ? (
                      <>
                        {slot.image
                          ? <img src={slot.image} alt={slot.name} className="w-full h-full object-contain" />
                          : <span className="text-3xl">{slot.icon}</span>
                        }
                        {/* Scanlines */}
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)' }} />
                      </>
                    ) : (
                      <span className="text-2xl" style={{ color: '#ffffff11' }}>＋</span>
                    )}
                  </div>
                </div>

                {/* Footer strip */}
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ background: '#0d0d1a', borderTop: `1px solid ${slot ? slot.color + '55' : '#ffffff11'}`, height: '1.1rem' }}>
                  <span className="text-[11px] font-bold font-mono"
                    style={{ color: slot ? slot.color : '#4b5563' }}>
                    {slot
                      ? `SPD ${(baseSpeed + (slot.speed_mod ?? 0)) - projectedSpeedPenalty(queue, i) + projectedSpeedInfluence(tagPool, queue, i)}`
                      : (projectedSpeedPenalty(queue, i) > 0 ? `−${projectedSpeedPenalty(queue, i)} SPD` : '—')
                    }
                  </span>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {/* Execute Plan — normal gameplay only */}
      {!isResult && (
        <button
          disabled={!canExecute}
          onClick={onExecute}
          className={`w-full py-2 rounded-lg font-display tracking-widest text-sm text-white transition-all
            ${!canExecute
              ? 'bg-gray-700 opacity-40 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#e94560] to-[#b83b5e] hover:scale-105 shadow-[0_0_15px_rgba(233,69,96,0.4)]'
            }`}
        >
          {isBattling ? 'RESOLVING...' : 'EXECUTE PLAN'}
        </button>
      )}

      {/* Result buttons — 3× card width, stacked */}
      {isResult && (
        <div className="flex flex-col gap-2" style={{ width: '16.5rem', marginTop: '5rem' }}>
          {showRetry ? (
            <button
              className="w-full py-2 rounded-lg font-display tracking-widest text-sm hover:scale-105 transition-transform"
              style={{
                position: 'relative',
                zIndex: 9003,
                background: 'linear-gradient(to right, #e94560, #b83b5e)',
                color: '#fff',
                boxShadow: '0 0 14px rgba(233,69,96,0.5)',
              }}
              onClick={onRetry}
            >
              Keep on Fighting!
            </button>
          ) : (
            <button
              className="w-full py-2 rounded-lg font-display tracking-widest text-sm hover:scale-105 transition-transform"
              style={result !== 'WIN' ? {
                position: 'relative',
                zIndex: 9003,
                background: 'linear-gradient(to right, #e2e8f0, #ffffff)',
                color: '#0f0f1a',
                boxShadow: '0 0 18px rgba(255,255,255,0.6), 0 0 36px rgba(255,255,255,0.25)',
              } : {
                background: '#4da6ff',
                color: '#fff',
                boxShadow: '0 0 14px rgba(77,166,255,0.4)',
              }}
              onClick={onExecute}
            >
              CONTINUE
            </button>
          )}
        </div>
      )}
    </div>
  );
}
