// ============================================================
//  TagPool — Active buff/debuff tags
//  Used for both player (full) and enemy (compact).
//  Same layout code runs for both — only sizes differ.
//
//  Tags/columns push open and pop closed instead of popping in/out
//  instantly: an added tag or a newly-needed column animates its
//  height/width from 0 to full ("push"), a removed one animates back
//  to 0 before actually leaving the DOM ("pop") — see useAnimatedList.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { ui_registry, UI_DEFAULT } from '../../battle/registry/ui_registry';
import { STATUS_DEFAULT as DEFAULT_ICON } from '../../assets';

const FULL_SZ = {
  tile:         'calc((24rem - 7 * 0.375rem) / 8)',
  stackFont:    '16px',
  barWidth:     '12rem',
  barMinHeight: '2.5rem',
  barIconWidth: '2.5rem',
  barFont:      '13px',
  gap:          'gap-1.5',
  barMargin:    '16px',
};

const COMPACT_SZ = {
  tile:         '2.35rem',
  stackFont:    '16px',
  barWidth:     '9.5rem',
  barMinHeight: '2.1rem',
  barIconWidth: '2.1rem',
  barFont:      '11px',
  gap:          'gap-1',
  barMargin:    '10px',
};

// ── List reconciliation with enter/exit phases ───────────────
// Diffs sourceItems (by key) against the previously-rendered order.
// Removed keys aren't dropped immediately — they're kept with
// phase 'exiting' until the caller confirms the collapse animation
// finished (via the returned `remove`). New keys get phase 'entering'.
//
// The gating value (prevSig) lives in useState rather than a ref:
// a ref mutated during render survives React.StrictMode's discarded
// first pass, so the real second pass would see "no change" and skip
// the reconcile — see BattleQueue.jsx's exitingCards for the same fix.
function useAnimatedList(sourceItems, keyOf) {
  const [order, setOrder] = useState(() => sourceItems.map(s => ({ key: keyOf(s), phase: 'stable' })));
  const sig = sourceItems.map(keyOf).join('|');
  const [prevSig, setPrevSig] = useState(sig);

  if (sig !== prevSig) {
    setOrder(prev => {
      const currentKeys = new Set(sourceItems.map(keyOf));
      const prevKeys = new Set(prev.map(i => i.key));
      const merged = prev.map(i => {
        if (currentKeys.has(i.key)) return { key: i.key, phase: 'stable' };
        return i.phase === 'exiting' ? i : { key: i.key, phase: 'exiting' };
      });
      const additions = sourceItems
        .filter(s => !prevKeys.has(keyOf(s)))
        .map(s => ({ key: keyOf(s), phase: 'entering' }));
      return [...merged, ...additions];
    });
    setPrevSig(sig);
  }

  const remove = (key) => setOrder(prev => prev.filter(i => i.key !== key));
  return [order, remove];
}

// ── Collapsible wrapper — animates height or width between 0 and
//    `size` for the push (entering) / pop (exiting) effect. Sibling
//    flex items reflow live as this box's size transitions, which is
//    what gives the "push" feel without a FLIP animation. ──────────
function AnimatedBox({ axis, size, phase, allowGrow, onExited, children }) {
  const [grown, setGrown] = useState(phase !== 'entering');
  const [settled, setSettled] = useState(phase === 'stable');

  useEffect(() => {
    if (phase !== 'entering') return;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setGrown(true));
    });
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2); };
  }, [phase]);

  const dim = axis === 'width' ? 'width' : 'height';
  const collapsed = phase === 'exiting' || (phase === 'entering' && !grown);
  const visible = !collapsed && settled;

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== dim) return;
    if (phase === 'exiting') onExited();
    else if (phase === 'entering' && grown) setSettled(true);
  };

  return (
    <div
      style={{
        [dim]:      collapsed ? 0 : size,
        overflow:   visible ? 'visible' : 'hidden',
        flexShrink: 0,
        transition: `${dim} 0.28s cubic-bezier(0.4,0,0.2,1)`,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div style={{ [dim]: visible && allowGrow ? 'auto' : size, opacity: collapsed ? 0 : 1, transition: 'opacity 0.22s ease' }}>
        {children}
      </div>
    </div>
  );
}

// ── Icon-only square tile (condition tier) ───────────────────
function IconTag({ icon, color, stacks, name, duration, tooltip, sz }) {
  return (
    <div
      className="group relative flex flex-row items-center overflow-visible"
      style={{ height: sz.tile }}
    >
      <div
        className="flex-shrink-0 relative flex items-center justify-center"
        style={{
          width: sz.tile,
          height: sz.tile,
          background: '#09090f',
          border: `2px solid ${color}`,
          borderRadius: '3px',
          boxShadow: `0 0 0 2px #000, 0 0 8px ${color}55, inset 0 0 4px ${color}11`,
        }}
      >
        <img src={icon} alt={name} className="w-full h-full object-contain" style={{ borderRadius: '2px' }} />
        <span
          className="absolute bottom-0 right-0 text-white font-mono leading-none"
          style={{ fontSize: sz.stackFont, textShadow: '0 0 3px #000, 0 0 3px #000', padding: '1px 2px' }}
        >
          {stacks > 1 ? stacks : (duration ?? stacks)}
        </span>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0
            w-64 rounded-lg border border-gray-600 shadow-xl z-[100]
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: '#1a1a2e' }}
        >
          <div className="h-1.5 rounded-t-lg" style={{ background: color }} />
          <div className="px-4 py-3 flex flex-col gap-2">
            <div className="text-base font-bold font-body" style={{ color }}>{name}</div>
            <div className="text-sm text-gray-300 leading-snug">{tooltip}</div>
            {duration && <div className="text-xs text-[#ffd700] font-mono">{duration} turns remaining</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bar-style tile (advanced tier) ───────────────────────────
function BarTag({ icon, color, stacks, name, duration, tooltip, sz }) {
  return (
    <div
      className="group relative flex flex-row items-center overflow-visible"
      style={{
        width: sz.barWidth,
        minHeight: sz.barMinHeight,
        background: '#09090f',
        border: `3px solid ${color}`,
        borderRadius: '3px',
        boxShadow: `0 0 0 2px #000, 0 0 10px ${color}55, inset 0 0 6px ${color}11`,
      }}
    >
      {/* Left — icon */}
      <div
        className="flex-shrink-0 self-stretch flex items-center justify-center"
        style={{ width: sz.barIconWidth, borderRight: `1px solid ${color}` }}
      >
        <img src={icon} alt={name} className="w-full h-full object-contain" style={{ borderRadius: '2px' }} />
      </div>

      {/* Right — stack + name + duration */}
      <div className="flex flex-row items-center justify-between min-w-0 flex-1 self-stretch py-1">
        <>
          <span className="flex-shrink-0 text-white font-mono mx-2 self-center" style={{ fontSize: sz.barFont }}>x{stacks}</span>
          <div className="flex-shrink-0 self-stretch w-px ml-0.5 mr-1.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </>
        <div
          className="font-bold tracking-wide font-body leading-tight flex-1 min-w-0 flex items-center"
          style={{ color, fontSize: sz.barFont }}
        >
          <span className="break-words">{name}</span>
        </div>
        {duration && (
          <span className="flex-shrink-0 text-[#ffd700] font-mono ml-1 self-center" style={{ fontSize: sz.barFont }}>{duration}⏳</span>
        )}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0
            w-64 rounded-lg border border-gray-600 shadow-xl z-[100]
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: '#1a1a2e' }}
        >
          <div className="h-1.5 rounded-t-lg" style={{ background: color }} />
          <div className="px-4 py-3 flex flex-col gap-2">
            <div className="text-base font-bold font-body" style={{ color }}>{name}</div>
            <div className="text-sm text-gray-300 leading-snug">{tooltip}</div>
            {duration && <div className="text-xs text-[#ffd700] font-mono">{duration} turns remaining</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TagPool({ tags, compact, growRight }) {
  const sz = compact ? COMPACT_SZ : FULL_SZ;

  const conditionSource = tags.filter(t => t.tier === 'condition');
  const advancedSource  = tags.filter(t => t.tier === 'advanced');

  // Live lookup for current tags, plus a cache so exiting tags (already
  // dropped from `tags`) keep rendering their last known stacks/duration
  // while they collapse instead of going blank mid-animation.
  const condCacheRef = useRef({});
  conditionSource.forEach(t => { condCacheRef.current[t.tag_name] = t; });
  const advCacheRef = useRef({});
  advancedSource.forEach(t => { advCacheRef.current[t.tag_name] = t; });

  const [condOrder, removeCondItem] = useAnimatedList(conditionSource, t => t.tag_name);
  const [advOrder, removeAdvItem]   = useAnimatedList(advancedSource, t => t.tag_name);

  // Chunk condition tags into columns of 7 in display order — items that
  // are mid-exit stay in place (still occupying their slot in condOrder)
  // so removing one only ever shifts the tags after it, never the whole
  // column layout underneath it.
  const columnsRaw = [];
  for (let i = 0; i < condOrder.length; i += 7) columnsRaw.push(condOrder.slice(i, i + 7));

  const columnCacheRef = useRef({});
  columnsRaw.forEach((items, i) => { columnCacheRef.current[i] = items; });
  const [colOrder, removeColItem] = useAnimatedList(columnsRaw.map((_, i) => i), i => i);

  const advancedColumn = advOrder.length > 0 ? (
    <div className={`flex flex-col-reverse ${sz.gap}`}>
      {advOrder.map(item => {
        const tag = advCacheRef.current[item.key];
        const display = ui_registry[tag.tag_name] || UI_DEFAULT;
        const stacks = tag.stacks ?? tag.stack_count ?? 1;
        const description = display.describe(tag);
        return (
          <AnimatedBox key={item.key} axis="height" size={sz.barMinHeight} allowGrow phase={item.phase} onExited={() => removeAdvItem(item.key)}>
            <BarTag
              sz={sz}
              icon={display.statusIcon ?? DEFAULT_ICON}
              color={display.color}
              stacks={stacks}
              name={tag.tag_name.replace(/_/g, ' ')}
              duration={tag.duration}
              tooltip={description && description !== 'active' ? description : null}
            />
          </AnimatedBox>
        );
      })}
    </div>
  ) : null;

  return (
    <div className={`flex ${growRight ? 'flex-row' : 'flex-row-reverse'} ${sz.gap}`}>
      {colOrder.map(colItem => {
        const items = columnCacheRef.current[colItem.key] || [];
        return (
          <AnimatedBox key={colItem.key} axis="width" size={sz.tile} phase={colItem.phase} onExited={() => removeColItem(colItem.key)}>
            <div className={`flex flex-col-reverse ${sz.gap}`}>
              {items.map(item => {
                const tag = condCacheRef.current[item.key];
                const display = ui_registry[tag.tag_name] || UI_DEFAULT;
                const description = display.describe(tag);
                const stacks = tag.stacks ?? tag.stack_count ?? 1;
                return (
                  <AnimatedBox key={item.key} axis="height" size={sz.tile} phase={item.phase} onExited={() => removeCondItem(item.key)}>
                    <IconTag
                      sz={sz}
                      icon={display.statusIcon ?? DEFAULT_ICON}
                      color={display.color}
                      stacks={stacks}
                      name={tag.tag_name.replace(/_/g, ' ')}
                      duration={tag.duration}
                      tooltip={description && description !== 'active' ? description : null}
                    />
                  </AnimatedBox>
                );
              })}
            </div>
          </AnimatedBox>
        );
      })}
      {/* Advanced tier — leftmost */}
      {advancedColumn}
    </div>
  );
}
