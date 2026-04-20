// ============================================================
//  Hand — Bottom section showing available cards to play
// ============================================================

import { effectiveResourceAtExecution, projectedSpeedPenalty } from '../../battle/engine/preview_utils';
import { battle_registry } from '../../battle/registry/battle_registry';
import { DEBUG_HAND_COST } from '../../debug';

export default function Hand({ cards, queue, totalSlots, onCardClick, disabled, resources, ResourceBar, baseSpeed, speedInfluence }) {
  const filledCount = queue.filter(Boolean).length;
  const nullIdx = queue.findIndex(s => !s);
  const nextSlotIndex = filledCount >= totalSlots ? -1 : (nullIdx !== -1 ? nullIdx : queue.length);

  // Sum costs of all queued cards to get planned spend per resource
  const planned = {};
  for (const slot of queue) {
    if (!slot) continue;
    for (const [type, amount] of Object.entries(slot.cost ?? {})) {
      planned[type] = (planned[type] ?? 0) + amount;
    }
  }

  // Sum resource-delta self-tags of queued cards to get planned gains per resource
  const plannedGain = {};
  for (const slot of queue) {
    if (!slot) continue;
    for (const tag of slot.tags?.self ?? []) {
      const delta = battle_registry[tag.tag_name]?.resource_delta?.(tag);
      if (delta?.type) plannedGain[delta.type] = (plannedGain[delta.type] ?? 0) + (delta.amount ?? 0);
    }
  }


  return (
    <div className="h-[200px] flex-shrink-0 flex flex-col border-t border-white/10 mb-2"
      style={{ background: 'rgba(0,0,0,0.25)' }}>

      {/* Button row — 3 sections */}
      <div className="flex-shrink-0 flex border-b border-white/10" style={{ height: '2.5rem', position: 'relative', zIndex: 0 }}>

        {/* LEFT — bag / inventory */}
        <div className="w-[25%] flex items-center justify-center border-r border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-[9px] font-mono tracking-widest text-gray-500">BAG</span>
        </div>

        {/* MIDDLE — resource bar */}
        <div className="flex-1 flex items-center justify-center px-6">
          {ResourceBar && resources
            ? <ResourceBar resources={resources} planned={disabled ? {} : planned} plannedGain={disabled ? {} : plannedGain} />
            : <div className="w-full h-5 rounded-full bg-gray-700/60" />
          }
        </div>

        {/* RIGHT — options */}
        <div className="w-[25%] flex items-center justify-center border-l border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-[9px] font-mono tracking-widest text-gray-500">OPT</span>
        </div>

      </div>

      {/* Card area — cards sit at the bottom with breathing room */}
      <div className="flex-1 flex items-start justify-center px-4 pt-2">
        {cards.map((card, idx) => {
          const wouldSpeed = nextSlotIndex >= 0
            ? (baseSpeed + (card.speed_mod ?? 0)) - projectedSpeedPenalty(queue, nextSlotIndex) + speedInfluence
            : null;
          const canAfford = DEBUG_HAND_COST || (nextSlotIndex >= 0 && Object.entries(card.cost ?? {}).every(
            ([type, amount]) => effectiveResourceAtExecution(type, nextSlotIndex, queue, resources) >= amount
          ));
          const isDisabled = disabled || nextSlotIndex === -1 || !canAfford;

          return (
            <div
              key={card.id}
              onClick={() => !isDisabled && onCardClick(card)}
              className={`group relative overflow-visible flex flex-col border-2
                transition-all duration-200
                ${isDisabled
                  ? 'cursor-not-allowed border-gray-700 hover:z-50'
                  : 'cursor-pointer hover:-translate-y-8 hover:scale-110 hover:z-50'
                }`}
              style={{
                marginLeft: idx > 0 ? '-18px' : '0',
                width: '5.5rem',
                height: '8.25rem',
                background: '#09090f',
                borderColor: isDisabled ? '#374151' : card.color,
                boxShadow: isDisabled ? 'none' : `0 0 10px ${card.color}55, inset 0 0 6px ${card.color}11`,
                borderRadius: '3px',
                zIndex: isDisabled ? 0 : 10,
                position: 'relative',
              }}
            >
              {/* Card content — faded when disabled */}
              <div className={`flex flex-col flex-1 ${isDisabled ? 'opacity-40' : ''}`}>

                {/* Header strip — name */}
                <div className="relative flex-shrink-0"
                  style={{ background: '#0d0d1a', borderBottom: `1px solid ${card.color}44`, height: '1.3rem', overflow: 'visible', zIndex: 2 }}>
                  <span className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold font-mono text-center leading-tight" style={{ color: card.color }}>
                    {card.name}
                  </span>
                </div>

                {/* Art area */}
                <div className="relative flex-1">
                  <div className="absolute inset-0 overflow-hidden">
                    {card.image
                      ? <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">{card.icon}</div>
                    }
                    {/* Scanlines */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)' }} />
                  </div>
                </div>

                {/* Footer strip — speed */}
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ background: '#0d0d1a', borderTop: `1px solid ${card.color}55`, height: '1.1rem' }}>
                  <span className="text-[11px] font-bold font-mono" style={{ color: card.color }}>
                    SPD {wouldSpeed !== null && !isDisabled ? wouldSpeed : baseSpeed + (card.speed_mod ?? 0)}
                  </span>
                </div>

              </div>

              {/* Tooltip — outside the opacity wrapper so it's always full opacity */}
              <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2
                w-64 rounded-lg border border-gray-600 shadow-xl z-[100]
                opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: '#1a1a2e' }}>
                <div className="h-1.5 rounded-t-lg" style={{ background: card.color }} />
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="text-base font-bold text-white font-body">{card.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{card.tag_type.join(' · ')}</div>
                  <div className="text-sm text-gray-300 leading-snug mt-1">{card.desc}</div>
                  <div className="text-xs text-[#4da6ff] font-mono mt-1">BASE SPD {baseSpeed}{card.speed_mod !== 0 ? ` ${card.speed_mod > 0 ? '+' : ''}${card.speed_mod}` : ''}</div>
                  {speedInfluence !== 0 && (
                    <div className={`text-xs font-mono mt-1 ${speedInfluence > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      SPD INFLUENCE {speedInfluence > 0 ? '+' : ''}{speedInfluence}
                    </div>
                  )}
                  {Object.entries(card.cost ?? {}).map(([type, amount]) => {
                    const free = nextSlotIndex >= 0 ? effectiveResourceAtExecution(type, nextSlotIndex, queue, resources) : 0;
                    const hasEnough = free >= amount;
                    return (
                      <div key={type} className={`text-xs font-mono mt-1 ${hasEnough ? 'text-yellow-400' : 'text-red-400'}`}>
                        COST: {amount} {type.replace(/_/g, ' ')}
                        {!hasEnough && ' — NOT ENOUGH'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
