// ============================================================
//  GuideModal — How To Play overlay (template)
// ============================================================

import {
  FOX_SUMMURAI_STILL_WIND,
  FOX_SUMMURAI_BATTOJUTSU,
  FOX_SUMMURAI_STREAM_SLASH,
  FOX_SUMMURAI_HEAVY_STRIKE,
} from '../../assets/index.js';

const EXAMPLE_CARDS = [
  { name: 'Still Wind',   image: FOX_SUMMURAI_STILL_WIND,   color: '#e879f9', speed: 100 },
  { name: 'Battojutsu',   image: FOX_SUMMURAI_BATTOJUTSU,   color: '#c084fc', speed: 80  },
  { name: 'Stream Slash', image: FOX_SUMMURAI_STREAM_SLASH, color: '#38bdf8', speed: 60  },
];

function ExampleCard({ name, image, color, speed }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex flex-col border-2"
        style={{
          width: '5.5rem',
          height: '8.25rem',
          background: '#09090f',
          borderColor: color,
          boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}11`,
          borderRadius: '3px',
        }}
      >
        {/* Header strip — name */}
        <div
          className="flex-shrink-0 flex items-center justify-center px-1"
          style={{ background: '#0d0d1a', borderBottom: `1px solid ${color}44`, height: '1.3rem' }}
        >
          <span className="text-[10px] font-bold font-mono text-center leading-tight truncate" style={{ color }}>
            {name}
          </span>
        </div>

        {/* Art area */}
        <div className="relative flex-1">
          <div className="absolute inset-0 overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-contain" />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)' }} />
          </div>
        </div>

        {/* Footer strip — speed */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ background: '#0d0d1a', borderTop: `1px solid ${color}55`, height: '1.1rem' }}
        >
          <span className="text-[11px] font-bold font-mono" style={{ color }}>
            SPD {speed}
          </span>
        </div>
      </div>

      {/* Speed label below card */}
      <span className="text-base font-bold font-mono text-white">SPD {speed}</span>
    </div>
  );
}

export default function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative w-[80%] max-w-2xl bg-gray-900 border border-white/20 rounded-lg p-8 text-white font-mono"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-6">How To Play</h2>

        {/* 3-card queue example */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {EXAMPLE_CARDS.map((card, i) => (
            <div key={card.name} className="flex items-center gap-3">
              <ExampleCard {...card} />
              {i < EXAMPLE_CARDS.length - 1 && (
                <span className="text-gray-600 text-2xl font-mono">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Guide text */}
        <div className="space-y-4 text-base text-gray-300 leading-relaxed border-t border-white/10 pt-5">
          <p>
            Each turn, pick <span className="text-white font-bold">3 actions</span> to fill your queue. They always fire in the <span className="text-white font-bold">order you queued them</span>.
          </p>
          <p>
            Each action applies a <span className="text-white font-bold">−20 Speed Penalty</span> to the next queued action. That's why your actions drop from 100 → 80 → 60.
          </p>
          <p>
            Enemies also start at <span className="text-white font-bold">SPD 100</span> and suffer the same <span className="text-white font-bold">Speed Penalty</span>. Most enemies queue <span className="text-white font-bold">1–2 actions</span> per turn. Bosses queue <span className="text-white font-bold">3</span>.
          </p>
        </div>

        {/* Speed mod example */}
        <div className="flex items-center gap-6 border-t border-white/10 pt-5 mt-4">
          <div className="flex-shrink-0">
            <ExampleCard name="Heavy Slices" image={FOX_SUMMURAI_HEAVY_STRIKE} color="#f97316" speed={70} />
          </div>
          <div className="space-y-3 text-base text-gray-300 leading-relaxed">
            <p>
              Some actions have a <span className="text-white font-bold">Speed Modifier</span>. Heavy Slices has <span className="text-white font-bold">−10 SPD</span>, so it fires 10 slower than your base speed for that slot.
            </p>
            <p>
              If it's your 2nd action (base SPD 80), the modifier brings it to <span className="text-white font-bold">SPD 70</span>.
            </p>
            <p className="text-gray-500 text-sm">
              Note: the modifier only affects that action's speed — it does <span className="text-white">not</span> stack into future speed penalties.
            </p>
          </div>
        </div>

        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-white text-lg leading-none"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
