// ============================================================
//  EnemyZone — Top section showing enemy cards with HP bars
//  Layout per enemy: [Tags] [Card] [Action Stack]
// ============================================================

import TagPool from './TagPool';
import EnemyResourceBar from './EnemyResourceBar';
import { SCENARIO_BACKGROUNDS } from '../../assets';

const CARD_SIZES = {
  small:  { card: 'w-32 h-48',  icon: 'text-3xl py-2',   name: 'text-[10px]', hpText: 'text-[10px]' },
  medium: { card: 'w-40 h-60',  icon: 'text-4xl py-2.5', name: 'text-xs',     hpText: 'text-[11px]' },
  large:  { card: 'w-48 h-72',  icon: 'text-5xl py-3',   name: 'text-sm',     hpText: 'text-xs'     },
};

const CARD_WIDTH_REM = { small: 8, medium: 10, large: 12 };
const TAG_POOL_REM = 4;
const GAP_REM = 5; // gap-20 = 5rem

function getMidCardOffset(enemies) {
  const cardWidths = enemies.map(e => CARD_WIDTH_REM[e.card_size] ?? 12);
  const unitWidths = cardWidths.map(w => 2 * TAG_POOL_REM + w);
  const midIdx = Math.floor(enemies.length / 2);
  const totalWidth = unitWidths.reduce((a, b) => a + b, 0) + GAP_REM * (enemies.length - 1);
  const midCardCenter = unitWidths.slice(0, midIdx).reduce((a, b) => a + b, 0)
    + GAP_REM * midIdx
    + TAG_POOL_REM
    + cardWidths[midIdx] / 2;
  return totalWidth / 2 - midCardCenter;
}

export default function EnemyZone({ enemies, activeAnimations = {}, floatingNumbers = [], activeEnemyId, selectedTargetId, phase, onSelectTarget, battleBackground }) {
  const bgImage = SCENARIO_BACKGROUNDS[battleBackground] ?? SCENARIO_BACKGROUNDS['CITADEL_1_ENEMY'];
  const offset = getMidCardOffset(enemies);
  return (
    <div className="relative flex-1 min-h-0 mx-4 mt-3 mb-0 rounded-xl overflow-hidden flex flex-row items-end justify-center gap-20 pb-10"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 0 12px rgba(255,255,255,0.25), 0 0 32px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.6)',
      }}>

      {/* Dark tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(10, 5, 20, 0.45)' }} />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)' }} />

      <div className="relative flex flex-row items-end gap-20" style={{ transform: `translateX(${offset}rem)` }}>
      {enemies.map(enemy => {
        const hpPct = Math.max(0, (enemy.health / enemy.max_health) * 100);
        const tempHpPct = Math.min((enemy.temp_hp ?? 0) / enemy.max_health * 100, 100 - hpPct);
        const isDead = enemy.health <= 0;
        const anim = activeAnimations[enemy.id];
        const isActive = activeEnemyId === enemy.id && !isDead;
        const isSelected = selectedTargetId === enemy.id && !isDead && phase === 'QUEUE_SETUP';
        const isSelectable = phase === 'QUEUE_SETUP' && !isDead;
        const tags = enemy.active_tag_pool || [];
        const actions = enemy.queue || [];
        const visibleActions = actions.slice(0, 3);

        const sz = CARD_SIZES[enemy.card_size] ?? CARD_SIZES.large;

        return (
          <div
            key={enemy.id}
            className={`flex flex-row items-end gap-1.5 transition-all duration-300 ${isDead && !anim ? 'opacity-30' : 'opacity-100'} ${isSelectable ? 'cursor-pointer' : ''}`}
            style={{ transform: isActive ? 'translateY(35px)' : 'translateY(0)' }}
            onClick={e => { if (!isSelectable) return; e.stopPropagation(); onSelectTarget(enemy.id); }}
          >

            {/* Left: Debuff Pool */}
            <div className="shrink-0 flex justify-end items-end" style={{ width: `${TAG_POOL_REM}rem` }}>
              <TagPool tags={tags.filter(t => t.status_type === 'debuff')} compact />
            </div>

            {/* Enemy Card — wrapped in relative so floating numbers escape overflow-hidden */}
            <div className="relative shrink-0">
              <div
                data-enemy-id={enemy.id}
                className={`${sz.card} relative rounded-lg border-2 overflow-hidden ${anim?.cssClass ?? ''}`}
                style={{
                  '--anim-intensity': anim?.intensity ?? 1,
                  borderColor: '#000000',
                  boxShadow: isSelected
                    ? '0 0 28px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.5)'
                    : '0 0 20px rgba(255,255,255,0.15)',
                }}
              >
                {/* Portrait fills entire card */}
                <img src={enemy.portrait} alt={enemy.name} className="absolute inset-0 w-full h-full object-cover" />

                {/* Bottom overlay: name + HP bar */}
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                  <div className={`font-display ${sz.name} text-white tracking-widest text-center mb-1 relative`}>
                    {!isDead && enemy.total_action_slots > 0 && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[9px] text-white flex gap-px leading-none">
                        {Array.from({ length: enemy.total_action_slots }, (_, i) => <span key={i}>▮</span>)}
                      </span>
                    )}
                    {enemy.name}
                  </div>
                  <div className="w-full relative">
                    <div className="w-full h-3 bg-gray-600/50 rounded-full overflow-hidden relative">
                      {tempHpPct > 0 && (
                        <div
                          className="absolute h-full transition-all duration-500"
                          style={{
                            width: `${hpPct + tempHpPct}%`,
                            background: 'linear-gradient(90deg, rgba(180,220,255,0.55), rgba(210,240,255,0.75))',
                            boxShadow: 'inset 0 0 6px rgba(180,220,255,0.6)',
                          }}
                        />
                      )}
                      <div
                        className="absolute h-full transition-all duration-500"
                        style={{
                          width: `${hpPct}%`,
                          background: hpPct > 50
                            ? 'linear-gradient(90deg,#e94560,#ff6b6b)'
                            : hpPct > 25
                              ? 'linear-gradient(90deg,#ff6b35,#ffa500)'
                              : 'linear-gradient(90deg,#888,#aaa)',
                        }}
                      />
                    </div>
                    <span
                      className={`absolute inset-0 flex items-center justify-center ${sz.hpText} text-white font-mono leading-none pointer-events-none`}
                      style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}
                    >
                      {enemy.health + (enemy.temp_hp ?? 0)} / {enemy.max_health}
                    </span>
                  </div>

                  <EnemyResourceBar enemy={enemy} hpText={sz.hpText} />
                </div>
              </div>

              {/* Floating damage numbers */}
              {floatingNumbers.filter(fn => fn.targetId === enemy.id).map(fn => (
                <div
                  key={fn.id}
                  className="float-number absolute font-display text-3xl drop-shadow-lg tracking-widest"
                  style={{
                    color: fn.color,
                    left: '50%',
                    top: '30%',
                    zIndex: 10,
                    opacity: fn.fading ? 0 : 1,
                    transition: fn.fading ? 'opacity 0.3s ease-in' : 'none',
                  }}
                >
                  {fn.prefix}{fn.value}
                </div>
              ))}
            </div>

            {/* Right: Buff Pool */}
            <div className="shrink-0 flex justify-start items-end" style={{ width: `${TAG_POOL_REM}rem` }}>
              <TagPool tags={tags.filter(t => t.status_type === 'buff')} compact growRight />
            </div>

            {/* Right: Action Stack — padded to match left width (8rem) so card stays centered */}
            {/* COMMENTED OUT: action stack display next to enemy card
            <div className="shrink-0 flex items-end" style={{ width: '8rem' }}>
              <div className="relative" style={{ width: '60px', height: '76px' }}>
              {visibleActions.length === 0 ? (
                <div
                  className="absolute inset-0 rounded border flex items-center justify-center"
                  style={{ borderColor: '#3a1020', background: '#0d0509' }}
                >
                  <span className="text-[9px] text-gray-700 font-mono">—</span>
                </div>
              ) : (
                [...visibleActions].reverse().map((action, ri) => {
                  const frontIndex = visibleActions.length - 1 - ri;
                  const isTop = frontIndex === 0;
                  const offsetY = frontIndex * 4;
                  const offsetX = frontIndex * 4;

                  return (
                    <div
                      key={ri}
                      className="absolute rounded border flex flex-col items-center overflow-hidden"
                      style={{
                        width: '48px',
                        height: '64px',
                        top: offsetY,
                        left: offsetX,
                        background: isTop ? '#1a0a0f' : '#110408',
                        borderColor: isTop ? '#e94560' : '#4a1020',
                        boxShadow: isTop ? '0 2px 10px rgba(233,69,96,0.45)' : 'none',
                        zIndex: visibleActions.length - frontIndex,
                      }}
                    >
                      {isTop ? (
                        <>
                          <div
                            className="w-full py-0.5 text-center text-[7px] font-bold text-white tracking-wider font-body shrink-0"
                            style={{ background: '#e94560' }}
                          >
                            NEXT
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center px-1 gap-0.5">
                            <div className="text-[8px] text-gray-200 font-mono font-bold text-center leading-tight">
                              {action.name}
                            </div>
                            <div className="text-[8px] text-[#4da6ff] font-mono">
                              {action.calc_speed}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          className="w-full py-0.5 text-center text-[7px] font-bold tracking-wider font-body"
                          style={{ background: '#2a0810', color: '#6a2030' }}
                        >
                          ···
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </div>
            */}

          </div>
        );
      })}
      </div>

    </div>
  );
}
