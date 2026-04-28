// ============================================================
//  AdvancedGuideModal — Advanced How To Play overlay (template)
// ============================================================

import { FOX_QUICK_STEPS, ENM_SAM_HEAVY_STRIKE_1 } from '../../assets/index.js';

function ExampleCard({ name, image, color, speed }) {
  return (
    <div className="flex flex-col items-center gap-2">
    <div
      className="flex-shrink-0 flex flex-col border-2"
      style={{
        width: '5.5rem',
        height: '8.25rem',
        background: '#09090f',
        borderColor: color,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}11`,
        borderRadius: '3px',
      }}
    >
      {/* Header strip */}
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

      {/* Footer strip */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ background: '#0d0d1a', borderTop: `1px solid ${color}55`, height: '1.1rem' }}
      >
        <span className="text-[11px] font-bold font-mono" style={{ color }}>SPD {speed}</span>
      </div>
    </div>
    <span className="text-base font-bold font-mono text-white">SPD {speed}</span>
    </div>
  );
}

export default function AdvancedGuideModal({ onClose, nudgeUp = 0 }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70" style={{ paddingBottom: nudgeUp }} onClick={onClose}>
      <div
        className="relative w-[80%] max-w-2xl bg-gray-900 border border-white/20 rounded-lg p-8 text-white font-mono"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-6">Advanced Guide</h2>

        {/* 3-card dodge example + intro text */}
        <p className="text-gray-500 text-sm mb-3">This is an example of how dodge works</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-10 flex-shrink-0">
            <ExampleCard name="Heavy Slice" image={ENM_SAM_HEAVY_STRIKE_1} color="#ef4444" speed={70} />
            <ExampleCard name="Heavy Slice" image={ENM_SAM_HEAVY_STRIKE_1} color="#ef4444" speed={90} />
            <ExampleCard name="Quick Steps" image={FOX_QUICK_STEPS} color="#a5f3fc" speed={100} />
          </div>
          <div className="space-y-3 text-base text-gray-300 leading-relaxed">
            <p>
              <span className="text-white font-bold">Quick Steps</span> is an essential card for the Sumurai in battle.
            </p>
            <p>
              It allows you to <span className="text-white font-bold">dodge attacks</span> within a <span className="text-white font-bold">−10 speed range</span> window.
            </p>
          </div>
        </div>

        {/* Dodge range breakdown */}
        <div className="flex items-center gap-6 mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 flex-shrink-0">
            <ExampleCard name="Heavy Slice" image={ENM_SAM_HEAVY_STRIKE_1} color="#ef4444" speed={90} />
            <span className="text-gray-600 text-2xl font-mono">→</span>
            <ExampleCard name="Quick Steps" image={FOX_QUICK_STEPS} color="#a5f3fc" speed={100} />
          </div>
          <div className="space-y-3 text-base text-gray-300 leading-relaxed">
            <p>
              Since <span className="text-white font-bold">Quick Steps</span> is at <span className="text-white font-bold">SPD 100</span>, any attack within a <span className="text-white font-bold">−10 speed range</span> (SPD 90–100) will be <span className="text-white font-bold">dodged</span>.
            </p>
          </div>
        </div>

        {/* Out of dodge range */}
        <div className="flex items-center gap-6 mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 flex-shrink-0">
            <ExampleCard name="Heavy Slice" image={ENM_SAM_HEAVY_STRIKE_1} color="#ef4444" speed={70} />
            <span className="text-gray-600 text-2xl font-mono">→</span>
            <ExampleCard name="Quick Steps" image={FOX_QUICK_STEPS} color="#a5f3fc" speed={100} />
          </div>
          <div className="space-y-3 text-base text-gray-300 leading-relaxed">
            <p>
              At <span className="text-white font-bold">SPD 70</span>, Heavy Slice falls <span className="text-white font-bold">outside</span> the −10 range. Quick Steps <span className="text-white font-bold">will not dodge</span> this attack.
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
