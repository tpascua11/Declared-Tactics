import { useState, useEffect, useMemo } from 'react';
import { resolveDialogSpeaker } from './resolveDialogSpeaker';
import { parseDialogText } from './parseDialogText';
import { playSelectSfx } from '../vfx/animationRegistry';
import * as ASSETS from '../assets';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import './DialogModal.css';
import '../components/shared/shine-btn.css';

const CARD_W = 88;
const CARD_H = 132;

// TODO: external close triggers (e.g. a caller unmounting this directly instead
// of waiting for the dialog to reach its last line) bypass requestClose below,
// so the slide/fade-out never plays — only the natural end-of-dialog advance
// gets the exit animation right now. Needs an imperative close handle later.

const TYPE_MS_PER_CHAR = 12;
const CLOSE_ANIM_MS = 400;

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// Renders one { source, id, side } dialog script. Speaker portraits sit on
// their declared side and persist there across lines (so a silent party
// member still shows), dimming when they aren't the current line's speaker.
export default function DialogModal({ dialog, onClose }) {
  const resolvedLines = useMemo(
    () => dialog.lines.map(line => ({ ...line, speaker: resolveDialogSpeaker(line.speaker) })),
    [dialog]
  );

  const [lineIndex, setLineIndex] = useState(0);
  const line = resolvedLines[lineIndex];
  const isReward = line.type === 'reward';
  const segments = useMemo(() => (isReward ? [] : parseDialogText(line.text)), [isReward, line.text]);
  const fullText = useMemo(() => segments.map(s => s.text).join(''), [segments]);

  const [typedCount, setTypedCount] = useState(0);
  useEffect(() => {
    setTypedCount(0);
    if (!fullText) return;
    const id = setInterval(() => {
      setTypedCount(c => {
        if (c + 1 >= fullText.length) clearInterval(id);
        return c + 1;
      });
    }, TYPE_MS_PER_CHAR);
    return () => clearInterval(id);
  }, [fullText]);

  const speakerForSide = (side, uptoIndex) => {
    for (let i = uptoIndex; i >= 0; i--) {
      if (resolvedLines[i].speaker?.side === side) return resolvedLines[i].speaker;
    }
    for (let i = uptoIndex + 1; i < resolvedLines.length; i++) {
      if (resolvedLines[i].speaker?.side === side) return resolvedLines[i].speaker;
    }
    return null;
  };
  const leftSpeaker = speakerForSide('left', lineIndex);
  const rightSpeaker = speakerForSide('right', lineIndex);
  const activeSide = line.speaker?.side;

  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, CLOSE_ANIM_MS);
  };

  // Second-stage reveal (banner wipe, portrait fade, dialog box slide) fires
  // once the shell's own slide-in animation finishes, not on mount.
  const [entered, setEntered] = useState(false);

  const advance = () => {
    playSelectSfx();
    if (typedCount < fullText.length) {
      setTypedCount(fullText.length);
      return;
    }
    if (lineIndex + 1 < resolvedLines.length) {
      setLineIndex(lineIndex + 1);
    } else {
      requestClose();
    }
  };

  let renderedChars = 0;
  const mapIconSrc = dialog.mapIcon ? (ASSETS[dialog.mapIcon] ?? ASSETS.SCENARIO_BACKGROUNDS[dialog.mapIcon]) : null;

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        opacity: closing ? 0 : 1,
        transition: `opacity ${CLOSE_ANIM_MS}ms ease-in`,
        fontFamily: "'Courier New', monospace",
        cursor: 'pointer',
        padding: '0 40px',
      }}
    >
      {/* Outer shell — fixed size, slides in on mount / out on close */}
      <div
        className={closing ? 'dialog-shell-exit' : 'dialog-shell-enter'}
        onAnimationEnd={() => { if (!closing) setEntered(true); }}
        style={{
        width: 1400, height: 760,
        background: 'linear-gradient(160deg,#0a1220,#071018)',
        border: '1.5px solid #4da6ff33',
        borderRadius: 16,
        boxShadow: '0 0 80px rgba(77,166,255,0.1)',
        padding: 24,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {/* Row above everything else — scene image fills the row, cropped to fit rather than squeezed */}
        <div style={{
          width: '100%', height: 368, marginBottom: 20,
          position: 'relative', overflow: 'hidden', borderRadius: 12,
          border: (mapIconSrc && entered) ? '3px solid #fff' : '3px solid rgba(255,255,255,0.25)',
          boxShadow: (mapIconSrc && entered) ? '0 0 40px rgba(255,255,255,0.6)' : 'none',
          background: '#000',
          transition: 'border-color 2s ease-out, box-shadow 2s ease-out',
        }}>
          {mapIconSrc && (
            <>
            <img src={mapIconSrc} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              clipPath: entered ? 'inset(0 0 0 0)' : 'inset(0 50% 0 50%)',
              transition: 'clip-path 2s ease-out',
            }} />
            {dialog.title && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                textAlign: 'center', padding: '24px 0',
                background: 'radial-gradient(ellipse 260px 90px at center, rgba(0,0,0,0.75) 0%, transparent 75%)',
                fontSize: 32, fontWeight: 'bold', color: '#f5d76e', textShadow: '0 0 24px #c8a135, 0 0 8px rgba(0,0,0,0.9)', letterSpacing: 3,
                opacity: entered ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
                transitionDelay: entered ? '2s' : '0s',
              }}>
                {dialog.title}
              </div>
            )}
            </>
          )}
        </div>

        {/* Row: portraits + dialog box */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          {/* Hugging the dialog window's left edge */}
          <PortraitSlot speaker={leftSpeaker} active={activeSide === 'left'} visible={entered} />
          <Connector speaker={leftSpeaker} active={activeSide === 'left'} pointRight visible={entered} />

          {/* Center: dialog box */}
          <div style={{
            flex: 1,
            maxWidth: 860,
            background: 'linear-gradient(160deg,#0a1220,#071018)',
            border: '1.5px solid #4da6ff33',
            borderRadius: 12,
            boxShadow: '0 0 80px rgba(77,166,255,0.1)',
            padding: '18px 22px',
            height: '19rem',
            alignSelf: 'flex-end',
            display: 'flex', flexDirection: 'column',
            transform: entered ? 'translateY(0)' : 'translateY(40px)',
            opacity: entered ? 1 : 0,
            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
          }}>
            {/* Fixed header — stays put while the body below scrolls */}
            {isReward ? (
              <div className="font-body" style={{ fontSize: 26, color: '#f5d76e', letterSpacing: 2, marginBottom: 12, textDecoration: 'underline', textUnderlineOffset: '6px', flexShrink: 0 }}>
                REWARDS
              </div>
            ) : (
              line.speaker.name && (
                <div className="font-body" style={{ fontSize: 30, color: line.speaker.color, letterSpacing: 2, marginBottom: 8, textDecoration: 'underline', textUnderlineOffset: '6px', flexShrink: 0 }}>
                  {line.speaker.name}
                </div>
              )
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {isReward ? (
                <RewardMock line={line} />
              ) : (
                <div style={{
                  fontSize: 24, color: line.speaker.name ? '#cfe3ee' : '#9fb0bd',
                  lineHeight: 1.7, fontWeight: 500, flex: 1,
                  fontStyle: line.speaker.name ? 'normal' : 'italic',
                }}>
                  {segments.map((seg, i) => {
                    const start = renderedChars;
                    renderedChars += seg.text.length;
                    const visible = seg.text.slice(0, Math.max(0, typedCount - start));
                    if (!visible) return null;
                    return (
                      <span key={i} style={{ color: seg.color ?? undefined }}>
                        {visible}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {typedCount >= fullText.length && (
              <div style={{ textAlign: 'right', color: '#4a6a8a', flexShrink: 0 }}>▼</div>
            )}
          </div>

          {/* Hugging the dialog window's right edge */}
          <Connector speaker={rightSpeaker} active={activeSide === 'right'} visible={entered} />
          <PortraitSlot speaker={rightSpeaker} active={activeSide === 'right'} align="right" visible={entered} />
        </div>
      </div>
    </div>
  );
}

// Reward mockup — every reward (gold included) is represented as a card,
// grouped into labeled sections (ITEMS for gold, LEARN for unlocked cards).
// Real cards resolve via CLASS_REGISTRY same as WinModal's CardWidget; gold
// is just another card with a gold footer.
function RewardMock({ line }) {
  const { gold, classId, cardId, desc } = line;
  const card = classId && cardId ? CLASS_REGISTRY[classId]?.cards.find(c => c.id === cardId) : null;
  const spd = card?.speed_mod ?? 0;
  const spdLabel = spd === 0 ? 'SPD —' : `SPD ${spd > 0 ? '+' : ''}${spd}`;

  const sections = [];
  if (card) {
    sections.push({ label: 'You Learn!:', cards: [
      { key: card.id, name: card.name, color: card.color, image: card.image, icon: card.icon, footer: spdLabel, animated: true },
    ] });
  }
  if (gold != null) {
    sections.push({ label: 'You Gain!:', cards: [
      { key: 'gold', name: 'GOLD', color: '#ffd700', image: ASSETS.ITEM_GOLD_1, footer: `+${gold}` },
    ] });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 16, flex: 1 }}>
      <div style={{ display: 'flex', gap: 32 }}>
        {sections.map(section => (
          <div key={section.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="font-body" style={{ fontSize: 15, color: '#cfe3ee' }}>{section.label}</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {section.cards.map(c => <RewardCardBox key={c.key} card={c} />)}
            </div>
          </div>
        ))}
      </div>
      {desc && (
        <div style={{ fontSize: 15, color: '#8aaabb', lineHeight: 1.6, fontStyle: 'italic' }}>
          {desc}
        </div>
      )}
    </div>
  );
}

// One reward's card visual — same layout as WinModal's CardWidget (name
// strip / art with scanlines / footer strip), reused for gold and real cards.
function RewardCardBox({ card: c }) {
  return (
    <div
      className={c.animated ? 'shine-btn marching-ants' : ''}
      style={{
        flexShrink: 0,
        width: CARD_W, height: CARD_H,
        border: `2px solid ${c.color}`,
        borderRadius: 3,
        background: '#09090f',
        boxShadow: `0 0 10px ${c.color}55, inset 0 0 6px ${c.color}11`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        '--shine-color': `${c.color}88`,
        '--ants-color': c.color,
      }}>
      <div style={{
        flexShrink: 0, height: '1.3rem',
        background: '#0d0d1a',
        borderBottom: `1px solid ${c.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 'bold', fontFamily: 'ui-monospace,monospace',
          color: c.color, textAlign: 'center', lineHeight: 1.2,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%',
        }}>
          {c.name}
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {c.image
          ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{c.icon}</div>
        }
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.25) 0px,rgba(0,0,0,0.25) 1px,transparent 1px,transparent 3px)',
        }} />
      </div>
      <div style={{
        flexShrink: 0, height: '1.1rem',
        background: '#0d0d1a',
        borderTop: `1px solid ${c.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'ui-monospace,monospace', color: c.color }}>
          {c.footer}
        </span>
      </div>
    </div>
  );
}

// Arrow bridging a portrait to the dialog box — points toward the box,
// glows in the speaker's color while they're talking, dim otherwise.
function Connector({ speaker, active, pointRight = false, visible = true }) {
  const color = active && speaker ? speaker.color : 'rgba(255,255,255,0.15)';
  return (
    <div style={{
      width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease-out',
    }}>
      <div style={{
        width: 0, height: 0,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        ...(pointRight
          ? { borderLeft: `16px solid ${color}` }
          : { borderRight: `16px solid ${color}` }),
        filter: active && speaker ? `drop-shadow(0 0 6px ${color})` : 'none',
        transition: 'border-color 0.2s, filter 0.2s',
      }} />
    </div>
  );
}

// Same card footprint as the battle PlayerPortrait (w-[14rem] h-[21rem], border-4,
// rounded-2xl) so dialog and battle read as the same character card.
function PortraitSlot({ speaker, active, align = 'left', visible = true }) {
  const offset = align === 'right' ? 60 : -60;
  const fade = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${offset}px)`,
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
  };
  if (!speaker) {
    return (
      <div style={{ width: '14rem', flexShrink: 0, ...fade }}>
        <div style={{
          width: '14rem', height: '21rem',
          border: '4px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          background: 'rgba(5,10,16,0.4)',
        }} />
      </div>
    );
  }
  return (
    <div style={{ width: '14rem', flexShrink: 0, ...fade }}>
      <div style={{
        position: 'relative',
        width: '14rem', height: '21rem',
        border: active ? `4px solid ${speaker.color}` : '4px solid rgba(255,255,255,0.15)',
        borderRadius: '1rem', overflow: 'hidden',
        boxShadow: active ? `0 0 60px ${hexToRgba(speaker.color, 0.5)}` : 'none',
        background: '#050a10',
      }}>
        {speaker.portrait && (
          <img src={speaker.portrait} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        )}
        {/* Name overlay — same treatment as battle PlayerPortrait's name/HP band */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center font-display text-xl text-white tracking-widest py-2"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
        >
          {speaker.name}
        </div>
      </div>
    </div>
  );
}
