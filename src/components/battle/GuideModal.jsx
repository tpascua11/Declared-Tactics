// ============================================================
//  GuideModal — How To Play overlay (template)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../shared/shine-btn.css';
import '../../vfx/aura_animations.css';
import { playSelectSfx } from '../../vfx/animationRegistry';
import {
  FOX_SUMMURAI_STILL_WIND,
  FOX_SUMMURAI_BATTOJUTSU,
  FOX_SUMMURAI_STREAM_SLASH,
  FOX_SUMMURAI_HEAVY_STRIKE,
  FOX_QUICK_STEPS,
  FOX_SUMMURAI_FLAME_STRIKE,
  ENM_SAM_HEAVY_STRIKE_1,
  ENEMY_FERRET_SUMURAI,
  ENEMY_RABBIT_SUMURAI_3,
} from '../../assets/index.js';
import EnemyResourceBar from './EnemyResourceBar';
import SamuraiResourceBar from '../resources/SamuraiResourceBar';

const EXAMPLE_CARDS = [
  { name: 'Still Wind',   image: FOX_SUMMURAI_STILL_WIND,   color: '#e879f9', speed: 100, penalty: 0  },
  { name: 'Battojutsu',   image: FOX_SUMMURAI_BATTOJUTSU,   color: '#c084fc', speed: 80,  penalty: 1  },
  { name: 'Stream Slash', image: FOX_SUMMURAI_STREAM_SLASH, color: '#38bdf8', speed: 60,  penalty: 2  },
];

const HEAVY_SLICES_CARDS = [
  { name: 'Heavy Slices', image: FOX_SUMMURAI_HEAVY_STRIKE, color: '#f97316', speed: 90 },
  { name: 'Heavy Slices', image: FOX_SUMMURAI_HEAVY_STRIKE, color: '#f97316', speed: 70 },
  { name: 'Heavy Slices', image: FOX_SUMMURAI_HEAVY_STRIKE, color: '#f97316', speed: 50 },
];

function ExampleCard({ name, image, color, speed, penalty }) {
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
              style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)' }} />
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

      {/* Speed penalty label — only shown on page 1 */}
      {penalty !== undefined && (
        <span className="flex flex-col items-center text-[11px] font-mono text-center leading-tight" style={{ color: '#9ca3af', marginTop: '8px' }}>
          <span>{penalty} Speed Penalty</span>
          <span style={{ visibility: penalty > 0 ? 'visible' : 'hidden' }}>(−{penalty * 20} Speed)</span>
        </span>
      )}
    </div>
  );
}

export default function GuideModal({ onClose, nudgeUp = 0 }) {
  const [page, setPage] = useState(1);
  const page2Ref = useRef(null);
  const [guideLines, setGuideLines] = useState(null);

  useEffect(() => {
    if (page !== 2) { setGuideLines(null); return; }
    const t = setTimeout(() => {
      const container = page2Ref.current;
      if (!container) return;
      const enemy1El = container.querySelector('[data-guide-enemy="1"]');
      const enemy2El = container.querySelector('[data-guide-enemy="2"]');
      if (!enemy1El) return;
      const lines = [];
      for (let i = 0; i < 3; i++) {
        const boxEl = container.querySelector(`[data-guide-slot="${i}"]`);
        if (!boxEl) continue;
        const b = boxEl.getBoundingClientRect();
        const targetEl = i === 2 ? enemy2El : enemy1El;
        if (!targetEl) continue;
        const e = targetEl.getBoundingClientRect();
        lines.push({
          key: i,
          isActive: i === 2,
          x1: b.left + b.width / 2,
          y1: b.top,
          x2: e.left + e.width / 2,
          y2: e.bottom,
        });
      }
      setGuideLines(lines.length > 0 ? lines : null);
    }, 50);
    return () => clearTimeout(t);
  }, [page]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70" style={{ paddingBottom: nudgeUp }} onClick={onClose}>
      <div
        className="relative w-[80%] max-w-2xl bg-gray-900 border border-white/20 rounded-lg p-8 text-white font-mono flex flex-col"
        style={{ height: '54rem' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-6 flex-shrink-0">How To Play</h2>

        <div className="flex-1 overflow-y-auto min-h-0">
        {page === 1 && (
          <>
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
                Each action after the first suffers a <span className="text-white font-bold">−20 Speed Penalty</span> — that's why your queue drops from 100 → 80 → 60. Enemies work the same way, starting at <span className="text-white font-bold">SPD 100</span> with the same penalty. Most queue <span className="text-white font-bold">1 or 2 actions</span> per turn; bosses queue <span className="text-white font-bold">3</span>.
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
          </>
        )}

        {page === 2 && (
          <div ref={page2Ref} className="relative">
            {/* SVG targeting lines — portalled to body so viewport coords align exactly */}
            {guideLines && createPortal(
              <svg className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999, width: '100%', height: '100%' }}>
                <defs>
                  <filter id="guide-glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {guideLines.map(({ key, isActive, x1, y1, x2, y2 }) => (
                  <g key={key}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth="0.5" opacity={isActive ? 0.18 : 0.07} />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth={isActive ? 3 : 2} opacity={isActive ? 0.6 : 0.2}
                      strokeDasharray="10 5 2 8 14 3 6 4" filter="url(#guide-glow)" />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isActive ? '#a0d4ff' : '#4da6ff'} strokeWidth="1.2" opacity={isActive ? 0.9 : 0.3}
                      strokeDasharray="3 11 8 4 2 9 5 6" />
                  </g>
                ))}
              </svg>,
              document.body
            )}

            <>
            {/* Two ferret enemies */}
            <div className="flex items-end justify-center gap-12 mb-14">
              {[{ label: 'FERRET 1', targeted: true }, { label: 'FERRET 2', targeted: false }].map(({ label, targeted }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div data-guide-enemy={targeted ? '1' : '2'} className="relative rounded-lg border-2 overflow-hidden"
                    style={{
                      width: '8rem',
                      height: '12rem',
                      borderColor: '#000000',
                      boxShadow: targeted
                        ? '0 0 28px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.5)'
                        : '0 0 20px rgba(255,255,255,0.15)',
                    }}>
                    <img src={ENEMY_FERRET_SUMURAI} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    {/* Bottom overlay: name + HP bar */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                      <div className="text-[10px] font-display text-white tracking-widest text-center mb-1 relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[9px] text-white flex gap-px leading-none">
                          <span>▮</span>
                        </span>
                        FERRET SUMURAI
                      </div>
                      <div className="w-full relative">
                        <div className="w-full h-3 bg-gray-600/50 rounded-full overflow-hidden relative">
                          <div className="absolute h-full" style={{ width: '100%', background: 'linear-gradient(90deg,#e94560,#ff6b6b)' }} />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-mono leading-none pointer-events-none"
                          style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}>
                          230 / 230
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono tracking-widest" style={{ color: targeted ? '#e94560' : '#6b7280' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* 3 action slots with target boxes */}
            <div className="flex items-end justify-center border-t border-white/10 pt-6">
              {HEAVY_SLICES_CARDS.map((card, i) => (
                <div key={i} className="flex items-end">
                  {i > 0 && (
                    <div className="flex items-center justify-center" style={{ height: '8.25rem', width: '1.5rem' }}>
                      <span className="text-lg font-mono font-bold text-gray-600">→</span>
                    </div>
                  )}
                  <div className="flex flex-col" style={{ width: '5.5rem', gap: '0.35rem' }}>
                    {/* Target box */}
                    <div data-guide-slot={i} className="w-full flex flex-col items-center justify-around py-1" style={{
                      height: '2.8rem',
                      background: '#09090f',
                      border: `1px solid ${i === 2 ? '#4da6ff' : '#e94560'}`,
                      borderRadius: '3px',
                      boxShadow: i === 2
                        ? '0 0 14px rgba(77,166,255,0.5), inset 0 0 6px rgba(77,166,255,0.1)'
                        : '0 0 8px rgba(233,69,96,0.3)',
                    }}>
                      <span className="text-[10px] font-mono tracking-widest" style={{ color: '#ffffffcc' }}>ENEMY {i === 2 ? 2 : 1}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#9ca3af' }}>Ferret Sam.</span>
                    </div>
                    {/* Card slot */}
                    <div className="w-full flex flex-col" style={{
                      height: '8.25rem',
                      background: '#09090f',
                      border: `2px solid ${card.color}`,
                      borderRadius: '3px',
                      boxShadow: `0 0 10px ${card.color}55`,
                    }}>
                      <div className="flex-shrink-0 flex items-center justify-center px-1" style={{ background: '#0d0d1a', borderBottom: `1px solid ${card.color}44`, height: '1.3rem' }}>
                        <span className="text-[10px] font-bold font-mono truncate" style={{ color: card.color }}>{card.name}</span>
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-0 overflow-hidden">
                          <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)' }} />
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center" style={{ background: '#0d0d1a', borderTop: `1px solid ${card.color}55`, height: '1.1rem' }}>
                        <span className="text-[11px] font-bold font-mono" style={{ color: card.color }}>SPD {card.speed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory text */}
            <div className="space-y-3 text-base text-gray-300 leading-relaxed border-t border-white/10 pt-5 mt-5">
              <p>
                Clicking the <span className="text-white font-bold">target box</span> lets you change where that action is aimed. Clicking it again shifts to the <span className="text-white font-bold">next target</span>, or you can click an <span className="text-white font-bold">enemy directly</span> to assign them instead. You can also <span className="text-white font-bold">preselect a target</span> — your next queued action will automatically go towards that enemy.
              </p>
            </div>
            </>
          </div>
        )}

        {page === 3 && (
          <div className="flex flex-col items-center gap-6">
            {/* Otter Sumurai — medium card matching BattleScreen format */}
            <div className="relative flex-shrink-0" style={{ width: '10rem', height: '15rem' }}>
              <div className="absolute inset-0 rounded-lg border-2 overflow-hidden"
                style={{
                  borderColor: '#000000',
                  boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                }}>
              <img src={ENEMY_RABBIT_SUMURAI_3} alt="Rabbit Sumurai" className="absolute inset-0 w-full h-full object-cover" />
              {/* flame_ember aura gradient — inside overflow-hidden */}
              <div className="absolute inset-0 aura-flame pointer-events-none"
                style={{ '--aura-color': '#f97316', '--aura-secondary': '#fbbf24', opacity: 0.28 }} />
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                <div className="text-xs font-display text-white tracking-widest text-center mb-1 relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[9px] text-white flex gap-px leading-none">
                    <span>▮</span><span>▮</span>
                  </span>
                  RABBIT SUMURAI
                </div>
                <div className="w-full relative">
                  <div className="w-full h-3 bg-gray-600/50 rounded-full overflow-hidden relative">
                    <div className="absolute h-full" style={{ width: '100%', background: 'linear-gradient(90deg,#e94560,#ff6b6b)' }} />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-mono leading-none pointer-events-none"
                    style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}>
                    270 / 270
                  </span>
                </div>
                <EnemyResourceBar
                  enemy={{
                    resource_bar_type: 'sumurai',
                    card_size: 'medium',
                    resources: { BATTLE_SPIRIT: { current: 3, max: 10 } },
                  }}
                />
              </div>
              </div>

              {/* flame_ember aura particles — outside overflow-hidden so they escape the card */}
              <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.28 }}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const pct = i / 7;
                  const x = pct * 130 - 15;
                  const driftX = x < 10 ? '7px' : x > 105 ? '-7px' : (i % 2 === 0 ? '3px' : '-2px');
                  return (
                    <span
                      key={i}
                      className="aura-ember-particle"
                      style={{
                        '--p-color': '#f97316',
                        '--p-delay': `${pct * 1.8}s`,
                        '--p-dur': `${1.8 + (i % 4) * 0.4}s`,
                        '--x': `${x}%`,
                        '--bottom': `${(i % 6) * 5}%`,
                        '--drift-x': driftX,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-base text-gray-300 leading-relaxed text-center">
              <p>
                The <span className="text-white font-bold">squares</span> next to the enemy name show how many <span className="text-white font-bold">actions</span> they queue each turn.
              </p>
              <p>
                The <span className="text-white font-bold">suns</span> below the health bar are the enemy's <span className="text-white font-bold">Battle Spirit</span>. Enemies in this campaign fight with their own selection of Sumurai moves.
              </p>
              <p>
                Once they accumulate enough <span className="text-white font-bold">Battle Spirit</span>, they will spend it to unleash <span className="text-white font-bold">powerful slashes</span>.
              </p>
              <p>
                An <span className="text-white font-bold">aura</span> glowing around an enemy is your warning — act fast or prepare your defense.
              </p>
            </div>
          </div>
        )}

        {page === 4 && (
          <>
            {/* Battle Spirit bar */}
            <div className="flex flex-col items-center gap-5 mb-6">
              <div style={{ transform: 'scale(1.25)', transformOrigin: 'center top', marginBottom: '0.5rem' }}>
                <SamuraiResourceBar resources={{ BATTLE_SPIRIT: { current: 3, max: 10 } }} />
              </div>
              <div className="w-full border-t border-white/10" />
              <p className="text-base text-gray-300 leading-relaxed text-center">
                At the end of each turn, you gain <span className="text-white font-bold">1 Battle Spirit</span>. It builds up passively — no matter what actions you take.
              </p>
            </div>

            {/* Two cards */}
            <div className="flex gap-8 border-t border-white/10 pt-5">
              {/* Flame Strike */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <ExampleCard name="Flame Strike" image={FOX_SUMMURAI_FLAME_STRIKE} color="#ef4444" speed={100} />
                <div className="space-y-2 text-sm text-gray-300 leading-relaxed text-center">
                  <p>
                    <span className="text-white font-bold">Flame Strike</span> costs <span className="text-white font-bold">3 Battle Spirit</span> to cast. Once you have enough, it unleashes <span className="text-white font-bold">333 fire damage</span> and applies <span className="text-white font-bold">Burn</span>.
                  </p>
                </div>
              </div>

              <div className="w-px bg-white/10 self-stretch" />

              {/* Still Wind */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <ExampleCard name="Still Wind" image={FOX_SUMMURAI_STILL_WIND} color="#e879f9" speed={100} />
                <div className="space-y-2 text-sm text-gray-300 leading-relaxed text-center">
                  <p>
                    <span className="text-white font-bold">Still Wind</span> grants <span className="text-white font-bold">1 Battle Spirit</span> and activates a stance that earns more spirit per action. If the stance is already active, it <span className="text-white font-bold">heals you</span> instead. Taking damage will <span className="text-white font-bold">remove the stance early</span>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {page === 5 && (
          <>
            {/* Dodge intro */}
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
          </>
        )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between mt-6 border-t border-white/10 pt-4">
          <button
            className="shine-btn text-xs font-mono tracking-widest text-white border border-white/20 rounded px-4 py-2 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            onClick={() => { playSelectSfx(); setPage(p => p - 1); }}
            disabled={page === 1}
          >
            ← BACK
          </button>
          <span className="relative flex items-center justify-center">
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontWeight: 'bold',
              fontSize: '1.15rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#f5d76e',
              textShadow: '0 0 20px #c8a135, 0 0 50px rgba(200,161,53,0.3)',
            }}>
              {{ 1: 'Actions', 2: 'Targeting', 3: 'Enemy', 4: 'Battle Spirit', 5: 'Dodge' }[page]}
            </span>
            <span className="absolute left-full ml-2 text-sm font-mono text-gray-300 whitespace-nowrap">{page}/5</span>
          </span>
          <button
            className="shine-btn text-xs font-mono tracking-widest text-white border border-white/20 rounded px-4 py-2 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            onClick={() => { playSelectSfx(); setPage(p => p + 1); }}
            disabled={page === 5}
          >
            NEXT →
          </button>
        </div>

        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-white text-lg leading-none"
          onClick={() => { playSelectSfx(); onClose(); }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
