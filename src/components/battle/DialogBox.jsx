// ============================================================
//  DialogBox — static speaker line shown during QUEUE_SETUP, in
//  the battle-queue row (that row is otherwise empty until BATTLE
//  starts). Non-interactive. Caller passes text={null} once there's
//  no line to show (BattleScreen does this once BATTLE starts) —
//  this component stays mounted through its own collapse animation
//  instead of disappearing immediately, then unmounts itself.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';

const TYPE_MS_PER_CHAR = 8; // fast reveal
const EXPAND_MS = 450; // must match the scaleX transition duration below

// Where the box sits within its relatively-positioned parent, and how big it
// is within that anchor — the two things to touch to relocate/resize it.
const ANCHOR_CLASS = 'absolute inset-0 flex items-center justify-center px-12 pointer-events-none';
const BOX_WIDTH_CLASS = 'max-w-4xl w-full';
const BOX_HEIGHT = 'calc(100% - 1rem)';

const ACCENT_COLOR = '#f5d76e'; // border + speaker name
const BG_COLOR = '#0f0f1acc';   // box background (semi-transparent)

// Inline markup: **bold**, {{red}}word{{/red}}, and {{red-bold}}word{{/red-bold}}
// for both at once. Segments carry only the plain content plus style flags —
// the typewriter reveal counts plain characters (markup itself is never "typed").
function parseDialogMarkup(raw) {
  const segments = [];
  const regex = /\*\*([\s\S]+?)\*\*|\{\{red-bold\}\}([\s\S]+?)\{\{\/red-bold\}\}|\{\{red\}\}([\s\S]+?)\{\{\/red\}\}/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(raw))) {
    if (match.index > lastIndex) segments.push({ content: raw.slice(lastIndex, match.index), bold: false, red: false });
    if (match[1] !== undefined) segments.push({ content: match[1], bold: true, red: false });
    else if (match[2] !== undefined) segments.push({ content: match[2], bold: true, red: true });
    else segments.push({ content: match[3], bold: false, red: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < raw.length) segments.push({ content: raw.slice(lastIndex), bold: false, red: false });
  return segments;
}

// Plain text for contexts that can't render styled spans (the battle log).
export function stripDialogMarkup(raw) {
  return parseDialogMarkup(raw).map(s => s.content).join('');
}

// Renders up to `limit` plain characters across segments, preserving style per segment.
function renderSegments(segments, limit = Infinity) {
  let remaining = limit;
  const nodes = [];
  for (const seg of segments) {
    if (remaining <= 0) break;
    const slice = seg.content.slice(0, remaining);
    remaining -= slice.length;
    if (!slice) continue;
    nodes.push(
      <span key={nodes.length} className={`${seg.bold ? 'font-bold' : ''} ${seg.red ? 'text-red-500' : ''}`}>{slice}</span>
    );
  }
  return nodes;
}

export default function DialogBox({ speakerName, text }) {
  const [mounted, setMounted] = useState(!!text);
  const [expanded, setExpanded] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const boxRef = useRef(null);

  // Holds the last non-null line so content stays put while the box
  // collapses (text goes null a beat before the collapse animation ends).
  const lastLineRef = useRef({ speakerName, text: text ?? '' });
  if (text) lastLineRef.current = { speakerName, text };
  const { speakerName: shownSpeaker, text: shownText } = lastLineRef.current;

  const segments = useMemo(() => parseDialogMarkup(shownText), [shownText]);
  const plainLength = useMemo(() => segments.reduce((n, s) => n + s.content.length, 0), [segments]);

  // Mount immediately on a new line; the expand-to-scaleX(1) flip happens
  // in the effect below, once the collapsed frame has actually painted.
  useEffect(() => {
    if (!text) { setExpanded(false); return; }
    setMounted(true);
  }, [text]);

  // Split from the effect above: re-mounting right after a BATTLE_STEP flurry
  // can coalesce a double-rAF into one frame before the scaleX(0) starting
  // state ever paints, skipping the transition entirely (same fix as
  // BattleLog's slide-in). Forcing a layout read commits that starting
  // position synchronously, so the rAF-triggered flip always has something
  // to animate from.
  useEffect(() => {
    if (!mounted || !text) return;
    const el = boxRef.current;
    if (!el) return;
    void el.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted, text]);

  useEffect(() => {
    if (!text) return;
    setRevealCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealCount(i);
      if (i >= plainLength) clearInterval(interval);
    }, TYPE_MS_PER_CHAR);
    return () => clearInterval(interval);
  }, [text, plainLength]);

  if (!mounted) return null;

  return (
    <div className={ANCHOR_CLASS}>
      <div
        ref={boxRef}
        className={`rounded-lg border-2 px-6 py-4 flex flex-col justify-center ${BOX_WIDTH_CLASS}`}
        style={{
          borderColor: ACCENT_COLOR,
          backgroundColor: BG_COLOR,
          backdropFilter: 'blur(2px)',
          height: BOX_HEIGHT,
          transform: expanded ? 'scaleX(1)' : 'scaleX(0)',
          transition: `transform ${EXPAND_MS}ms ease-out`,
        }}
        onTransitionEnd={e => { if (e.propertyName === 'transform' && !expanded) setMounted(false); }}
      >
        <div className="text-sm font-bold tracking-wide mb-2 text-center" style={{ color: ACCENT_COLOR }}>{shownSpeaker}</div>
        <div className="relative text-base leading-relaxed text-center">
          {/* Invisible full text reserves the box's final size up front,
              so the typewriter reveal doesn't resize the box as it types. */}
          <div className="invisible whitespace-pre-line" aria-hidden="true">{renderSegments(segments)}</div>
          <div className="absolute inset-0 text-white whitespace-pre-line">{renderSegments(segments, revealCount)}</div>
        </div>
      </div>
    </div>
  );
}
