// ============================================================
//  SAMURAI — Battle Spirit Bar (10 aztec sun pips)
// ============================================================

import { useState, useRef, useEffect } from 'react';

// 8 triangle rays pre-computed at 45° intervals (0° = up, clockwise)
// viewBox 0 0 24 24, center (12,12), tip r=10, base r=6.5, half-width=1.2
const RAY_POINTS = [
  '12,2 13.2,5.5 10.8,5.5',
  '19.1,4.9 17.4,8.3 15.8,6.6',
  '22,12 18.5,13.2 18.5,10.8',
  '19.1,19.1 15.8,17.4 17.4,15.8',
  '12,22 10.8,18.5 13.2,18.5',
  '4.9,19.1 6.6,15.8 8.3,17.4',
  '2,12 5.5,10.8 5.5,13.2',
  '4.9,4.9 8.3,6.6 6.6,8.3',
];

const PIP_W = 30;
const PIP_GAP = 3;
const PIP_STRIDE = PIP_W + PIP_GAP;
const PARTICLES_PER_PIP = 7;
const FLOAT_DURATION = 900;

function buildParticles(fromIdx, toIdx) {
  const out = [];
  for (let i = fromIdx; i < toIdx; i++) {
    const cx = i * PIP_STRIDE + PIP_W / 2;
    const cy = PIP_W / 2;
    for (let j = 0; j < PARTICLES_PER_PIP; j++) {
      // drift upward with gentle horizontal wander
      const tx = (Math.random() - 0.5) * 20;
      const ty = -(80 + Math.random() * 80);
      out.push({
        id: `${Date.now()}-${i}-${j}-${Math.random()}`,
        cx,
        cy,
        tx,
        ty,
        size: 2 + Math.random() * 2.5,
        color: Math.random() < 0.55 ? 'white' : '#f97316',
        delay: Math.random() * 220,
      });
    }
  }
  return out;
}

// state: 'filled' | 'planned' | 'gain' | 'gain-planned' | 'empty'
function AztecSun({ state }) {
  const c =
    state === 'filled'       ? 'white' :
    state === 'planned'      ? 'white' :
    state === 'gain'         ? '#f97316' :
    state === 'gain-planned' ? '#f97316' :
    'rgba(255,255,255,0.15)';

  const anim =
    state === 'planned'      ? 'spiritPlanned 0.8s ease-in-out infinite' :
    state === 'gain-planned' ? 'spiritPlanned 0.8s ease-in-out infinite' :
    undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={c}
      style={anim ? { animation: anim } : undefined}
    >
      {RAY_POINTS.map((pts, i) => <polygon key={i} points={pts} />)}
      <circle cx="12" cy="12" r="5" fill="none" stroke={c} strokeWidth="1.2" />
      <polygon points="12,9.5 13.5,12 12,14.5 10.5,12" />
    </svg>
  );
}

export default function SamuraiResourceBar({ resources, planned = {}, plannedGain = {} }) {
  const { current = 0, max = 10 } = resources?.BATTLE_SPIRIT ?? {};
  const plannedAmount = planned.BATTLE_SPIRIT ?? 0;
  const gainAmount = Math.min(plannedGain.BATTLE_SPIRIT ?? 0, max - current);

  const gainUsedAsCost = Math.min(gainAmount, Math.max(0, plannedAmount - current));
  const solidGain = gainAmount - gainUsedAsCost;
  const freeFilled = Math.max(0, current - plannedAmount);

  const [particles, setParticles] = useState([]);
  const prevCurrentRef = useRef(current);

  useEffect(() => {
    const prev = prevCurrentRef.current;
    prevCurrentRef.current = current;
    if (current < prev) {
      const born = buildParticles(current, prev);
      setParticles(p => [...p, ...born]);
      const ids = new Set(born.map(p => p.id));
      setTimeout(() => setParticles(p => p.filter(pt => !ids.has(pt.id))), FLOAT_DURATION + 300);
    }
  }, [current]);

  // Pip regions:
  // [0, freeFilled)                         = filled (solid white)
  // [freeFilled, current)                   = planned spend (pulsing white)
  // [current, current+solidGain)            = gain not consumed (solid orange)
  // [current+solidGain, current+gainAmount) = gain used as cost (pulsing orange)
  // [current+gainAmount, max)               = empty

  return (
    <>
      <style>{`
        @keyframes spiritPlanned {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes spiritFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          20%  { opacity: 0.9; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        <div className="relative flex" style={{ gap: '3px', zIndex: 0, overflow: 'visible' }}>
          {Array.from({ length: max }, (_, i) => {
            const state =
              i < freeFilled                  ? 'filled' :
              i < current                     ? 'planned' :
              i < current + solidGain         ? 'gain' :
              i < current + gainAmount        ? 'gain-planned' :
              'empty';
            return (
              <div key={i} style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                <AztecSun state={state} />
              </div>
            );
          })}

          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.cx - p.size / 2,
                top: p.cy - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 5px 1px ${p.color}`,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                animation: `spiritFloat ${FLOAT_DURATION}ms ease-in ${p.delay}ms forwards`,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          ))}
        </div>
        <span className="absolute text-[11px] font-mono tracking-widest whitespace-nowrap pointer-events-none"
          style={{
            color: 'white',
            zIndex: 1,
            bottom: '-8px',
            textShadow: '0 0 4px #000, 0 1px 3px #000, 0 0 8px #000',
          }}>
          BATTLE SPIRIT
        </span>
      </div>
    </>
  );
}
