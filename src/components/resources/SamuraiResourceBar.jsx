// ============================================================
//  SAMURAI — Battle Spirit Bar (10 kiku pips)
// ============================================================

import { useState, useRef, useEffect, memo } from 'react';

// 16 chrysanthemum petals pre-computed at 22.5° intervals (0° = up, clockwise)
// viewBox 0 0 24 24, center (12,12), tip r=10.5, base r=5.6 at angle ±10°
// (vs 11.25 half-spacing — the narrower base leaves a gap between petals)
// One triangle per petal, non-overlapping, so all 16 collapse into a single
// multi-subpath <path> — 1 DOM node instead of 16 <polygon> nodes per pip.
const KIKU_PETAL_TRIANGLES = [
  '12,1.5 11,6.5 13,6.5',
  '16,2.3 13.2,6.5 15,7.3',
  '19.4,4.6 15.2,7.4 16.6,8.8',
  '21.7,8 16.7,9 17.5,10.8',
  '22.5,12 17.5,11 17.5,13',
  '21.7,16 17.5,13.2 16.7,15',
  '19.4,19.4 16.6,15.2 15.2,16.6',
  '16,21.7 15,16.7 13.2,17.5',
  '12,22.5 13,17.5 11,17.5',
  '8,21.7 10.8,17.5 9,16.7',
  '4.6,19.4 8.8,16.6 7.4,15.2',
  '2.3,16 7.3,15 6.5,13.2',
  '1.5,12 6.5,13 6.5,11',
  '2.3,8 6.5,10.8 7.3,9',
  '4.6,4.6 7.4,8.8 8.8,7.4',
  '8,2.3 9,7.3 10.8,6.5',
];

const KIKU_PETALS_PATH = KIKU_PETAL_TRIANGLES
  .map(tri => `M${tri.replace(/ /g, 'L')}Z`)
  .join(' ');

const PIP_W = 30;
const PIP_GAP = 3;
const PIP_STRIDE = PIP_W + PIP_GAP;
const PARTICLES_PER_PIP = 7;
const FLOAT_DURATION = 900;
const GAIN_FLOAT_DURATION = 700;

function buildParticles(fromIdx, toIdx) {
  const out = [];
  for (let i = fromIdx; i < toIdx; i++) {
    const cx = Math.floor(i) * PIP_STRIDE + PIP_W / 2;
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

function buildGainParticles(fromIdx, toIdx) {
  const out = [];
  for (let i = fromIdx; i < toIdx; i++) {
    const cx = Math.floor(i) * PIP_STRIDE + PIP_W / 2;
    const cy = PIP_W / 2;
    for (let j = 0; j < PARTICLES_PER_PIP; j++) {
      const angle = (j / PARTICLES_PER_PIP) * Math.PI * 2 + Math.random() * 0.6;
      const radius = 22 + Math.random() * 18;
      out.push({
        id: `gain-${Date.now()}-${i}-${j}-${Math.random()}`,
        cx,
        cy,
        tx: Math.cos(angle) * radius,
        ty: Math.sin(angle) * radius,
        size: 2 + Math.random() * 2.5,
        color: 'white',
        delay: Math.random() * 180,
      });
    }
  }
  return out;
}

// state: 'filled' | 'planned' | 'gain' | 'gain-planned' | 'empty'
// half: true → circle-only (ring + center dot, no petals) — a pip whose
// .5 midpoint is empty, i.e. only a fractional remainder is actually filled.
// pulse: whether this pip should blink — decided by the caller, since a
// half pip should only blink when the underlying cost itself has a .5
// (a whole-number cost never produces a blinking half, only clean full pips).
const KikuCrest = memo(function KikuCrest({ state, half, pulse }) {
  const c =
    state === 'filled'       ? 'white' :
    state === 'planned'      ? 'white' :
    state === 'gain'         ? '#f97316' :
    state === 'gain-planned' ? '#f97316' :
    'rgba(255,255,255,0.15)';

  const anim = pulse ? 'spiritPlanned 0.8s ease-in-out infinite' : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={c}
      style={anim ? { animation: anim } : undefined}
    >
      {!half && <path d={KIKU_PETALS_PATH} />}
      <circle cx="12" cy="12" r="4.4" fill="none" stroke={c} strokeWidth="1.3" />
      <circle cx="12" cy="12" r="2" fill={c} />
    </svg>
  );
});

function Particle({ p, keyframe, duration, easing, blur }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: p.cx - p.size / 2,
        top: p.cy - p.size / 2,
        width: p.size,
        height: p.size,
        borderRadius: '50%',
        background: p.color,
        boxShadow: `0 0 ${blur}px 1px ${p.color}`,
        '--tx': `${p.tx}px`,
        '--ty': `${p.ty}px`,
        animation: `${keyframe} ${duration}ms ${easing} ${p.delay}ms forwards`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
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
  const [gainParticles, setGainParticles] = useState([]);
  const prevCurrentRef = useRef(current);

  useEffect(() => {
    const prev = prevCurrentRef.current;
    prevCurrentRef.current = current;
    if (current < prev) {
      const born = buildParticles(current, prev);
      setParticles(p => [...p, ...born]);
      const ids = new Set(born.map(p => p.id));
      setTimeout(() => setParticles(p => p.filter(pt => !ids.has(pt.id))), FLOAT_DURATION + 300);
    } else if (current > prev) {
      const born = buildGainParticles(prev, current);
      setGainParticles(p => [...p, ...born]);
      const ids = new Set(born.map(p => p.id));
      setTimeout(() => setGainParticles(p => p.filter(pt => !ids.has(pt.id))), GAIN_FLOAT_DURATION + 300);
    }
  }, [current]);

  // Value regions, in Battle Spirit units (which may land on a .5 — 1 pip = 1 BS):
  // [0, freeFilled)                         = filled (solid white)
  // [freeFilled, current)                   = planned spend (pulsing white)
  // [current, current+solidGain)            = gain not consumed (solid orange)
  // [current+solidGain, current+gainAmount) = gain used as cost (pulsing orange)
  // [current+gainAmount, max)               = empty
  const stateAtValue = (v) =>
    v < freeFilled                  ? 'filled' :
    v < current                     ? 'planned' :
    v < current + solidGain         ? 'gain' :
    v < current + gainAmount        ? 'gain-planned' :
    'empty';

  // Each pip i spans [i, i+1). If the .5 midpoint is empty, the pip is
  // "half" (circle-only) in the start-of-pip color. If both the start and
  // midpoint are active but differ (a boundary landed on the .5), the pip
  // renders full, colored by the midpoint's (more-committed) state.
  // A pulsing state only actually blinks on a half pip if the cost driving
  // that pulse has a .5 itself — a whole-number cost (e.g. "costs 3") must
  // only ever light up full pips, never a half-looking one.
  const plannedHasHalf = plannedAmount % 1 !== 0;
  const gainUsedHasHalf = gainUsedAsCost % 1 !== 0;

  const pipCount = Math.ceil(max);
  const pips = Array.from({ length: pipCount }, (_, i) => {
    const a = stateAtValue(i);
    if (a === 'empty') return { state: 'empty', half: false, pulse: false };

    const b = stateAtValue(i + 0.5);
    const half = b === 'empty';
    const state = half ? a : b;
    const pulse =
      state === 'planned'      ? (!half || plannedHasHalf) :
      state === 'gain-planned' ? (!half || gainUsedHasHalf) :
      false;
    return { state, half, pulse };
  });

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
        @keyframes spiritGainFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          80%  { opacity: 0.7; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        <div className="relative flex" style={{ gap: `${PIP_GAP}px`, zIndex: 0, overflow: 'visible' }}>
          {pips.map(({ state, half, pulse }, i) => (
            <div key={i} style={{ width: `${PIP_W}px`, height: `${PIP_W}px`, flexShrink: 0 }}>
              <KikuCrest state={state} half={half} pulse={pulse} />
            </div>
          ))}

          {particles.map(p => (
            <Particle key={p.id} p={p} keyframe="spiritFloat" duration={FLOAT_DURATION} easing="ease-in" blur={5} />
          ))}

          {gainParticles.map(p => (
            <Particle key={p.id} p={p} keyframe="spiritGainFloat" duration={GAIN_FLOAT_DURATION} easing="ease-out" blur={6} />
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
