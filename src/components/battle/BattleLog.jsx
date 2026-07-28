// ============================================================
//  BattleLog — Fixed panel in the left column of the player zone
// ============================================================

import { useEffect, useRef, useState } from 'react';

const LOG_COLORS = {
  dmg:   'text-[#e94560]',
  heal:  'text-green-400',
  buff:  'text-[#4da6ff]',
  clash:  'text-purple-400',
  fizzle: 'text-orange-400',
  info:  'text-[#ffd700]',
  normal:'text-gray-400',
};

// Newest lines fade in fully; older ones dim. Full history is scrollable —
// the panel auto-sticks to the newest line unless the player scrolls up to
// read back, matching the ambient look while it's untouched.
function opacityForAge(ageFromNewest) {
  if (ageFromNewest < 4) return 1;
  if (ageFromNewest < 9) return 0.55;
  return 0.25;
}

export default function BattleLog({ logs, turn, visible }) {
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const [mounted, setMounted] = useState(visible);
  const [slidIn, setSlidIn] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
  };

  // Panel slides in from off-screen left on open, and slides back out to
  // the left on close (unmounting once the transition finishes) — mirrors
  // the MENU panel's slide behavior in Hand.jsx.
  useEffect(() => {
    if (!visible) {
      setSlidIn(false);
      return;
    }
    setMounted(true);
  }, [visible]);

  // Split from the effect above: mid-battle re-renders fire constantly
  // (BATTLE_STEP ticks), which can coalesce a double-rAF into one frame
  // before the off-screen position ever paints, skipping the transition.
  // Forcing a layout read commits that starting position synchronously,
  // so the rAF-triggered flip always has something to animate from.
  useEffect(() => {
    if (!mounted || !visible) return;
    const el = scrollRef.current;
    if (!el) return;
    void el.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setSlidIn(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted, visible]);

  if (!mounted) return null;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && !visible) setMounted(false); }}
      className="battle-log-scroll"
      style={{
        position:      'absolute',
        left:          0,
        top:           0,
        bottom:        0,
        width:         '600px',
        display:       'flex',
        flexDirection: 'column',
        overflowY:     'auto',
        zIndex:        5,
        pointerEvents: 'auto',
        padding:       '6px 10px',
        gap:           '3px',
        transition:      'transform 200ms ease-out',
        transform:       slidIn ? 'translateX(0)' : 'translateX(-100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
        maskImage:       'linear-gradient(to bottom, transparent 0%, black 15%)',
      }}
    >
      {logs.map((l, i) => {
        const ageFromNewest = logs.length - 1 - i;
        return (
          <div
            key={i}
            className={`text-[17px] font-mono leading-tight transition-opacity duration-500 ${LOG_COLORS[l.type] ?? LOG_COLORS.normal}`}
            style={{ opacity: opacityForAge(ageFromNewest) }}
          >
            {l.msg}
          </div>
        );
      })}
    </div>
  );
}
