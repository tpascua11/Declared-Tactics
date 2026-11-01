// NOTE: EventModal replaces src/dialog/DialogModal.jsx. Same layout, new page model
// (todo/world_design.md: game_events).
// DialogModal stays only until the old MapScreen and DialogEditorScreen are removed.

import { useState, useEffect, useMemo } from 'react';
import { resolveDialogSpeaker } from '../dialog/resolveDialogSpeaker';
import { parseDialogText } from '../dialog/parseDialogText';
import { playSelectSfx } from '../vfx/animationRegistry';
import * as ASSETS from '../assets';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import './EventModal.css';
import '../components/shared/shine-btn.css';

const CARD_W = 88;
const CARD_H = 132;

const TYPE_MS_PER_CHAR = 12;
const CLOSE_ANIM_MS = 400;

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// pages: [{ type: 'line', speaker: { source, id, side }, text }
//        | { type: 'reward', gold, classId, cardId, desc }
//        | { type: 'choice', header, options: [{ label, sublabel, disabled }] }]
// A choice page waits for an option click (backdrop clicks do nothing): onChoose(optionIndex)
// runs, then the modal moves to the next page or closes if it was the last.
// Speaker portraits sit on their declared side and persist there across pages
// (a silent party member still shows), dimming when not the current speaker.
// onEnd (optional): runs after the last page. Return a page number to stay open and show that page (the parent
// has swapped `pages`); anything else closes the modal and runs onDone(true).
// startPageIndex: the page to open on (e.g. past the menu page when resuming after a fight).
export default function EventModal({ pages, title, sceneImage, onDone, onChoose, onEnd, startPageIndex = 0 }) {
  const resolvedPages = useMemo(
    () => pages.map(page => (page.type === 'line' ? { ...page, speaker: resolveDialogSpeaker(page.speaker) } : page)),
    [pages]
  );

  const [pageIndex, setPageIndex] = useState(startPageIndex);
  // `pages` can shrink under the current index (a finished scenario's pages leave): show the last page until the effect resyncs.
  const shownPageIndex = Math.min(pageIndex, resolvedPages.length - 1);
  const page = resolvedPages[shownPageIndex];
  useEffect(() => {
    if (pageIndex >= resolvedPages.length) setPageIndex(resolvedPages.length - 1);
  }, [pageIndex, resolvedPages.length]);
  const isReward = page.type === 'reward';
  const isChoice = page.type === 'choice';
  const segments = useMemo(() => (page.type === 'line' ? parseDialogText(page.text) : []), [page.type, page.text]);
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
      if (resolvedPages[i].speaker?.side === side) return resolvedPages[i].speaker;
    }
    for (let i = uptoIndex + 1; i < resolvedPages.length; i++) {
      if (resolvedPages[i].speaker?.side === side) return resolvedPages[i].speaker;
    }
    return null;
  };
  const leftSpeaker = speakerForSide('left', shownPageIndex);
  const rightSpeaker = speakerForSide('right', shownPageIndex);
  const activeSide = page.speaker?.side;

  const [closing, setClosing] = useState(false);
  // onDone(completed): true when the last page finished, false when the player pressed Leave.
  const requestClose = (completed) => {
    setClosing(true);
    setTimeout(() => onDone(completed), CLOSE_ANIM_MS);
  };

  // Second-stage reveal (banner wipe, portrait fade, dialog box slide) fires
  // once the shell's own slide-in animation finishes, not on mount.
  const [entered, setEntered] = useState(false);

  const goToNextPage = () => {
    if (pageIndex + 1 < resolvedPages.length) {
      setPageIndex(pageIndex + 1);
    } else {
      const nextPageIndex = onEnd?.();
      if (typeof nextPageIndex === 'number') setPageIndex(nextPageIndex);
      else requestClose(true);
    }
  };

  const advance = () => {
    if (isChoice) return;
    playSelectSfx();
    if (typedCount < fullText.length) {
      setTypedCount(fullText.length);
      return;
    }
    goToNextPage();
  };

  // onChoose may make the parent pass more pages (the picked scenario's). Both state updates batch into one
  // render, so the effect below sees the new `pages` and either moves on or closes if none followed.
  const [choicePending, setChoicePending] = useState(false);
  const choose = (optionIndex) => {
    playSelectSfx();
    onChoose?.(optionIndex);
    setChoicePending(true);
  };
  useEffect(() => {
    if (!choicePending) return;
    setChoicePending(false);
    goToNextPage();
  }, [choicePending]);

  let renderedChars = 0;
  const sceneImageSrc = sceneImage ? (ASSETS[sceneImage] ?? ASSETS.SCENARIO_BACKGROUNDS[sceneImage]) : null;

  return (
    <div
      className="event-backdrop-enter"
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
        className={closing ? 'event-shell-exit' : 'event-shell-enter'}
        onAnimationEnd={() => { if (!closing) setEntered(true); }}
        style={{
          width: 1400, height: 760,
          background: 'linear-gradient(160deg,#0a1220,#071018)',
          border: '1.5px solid #4da6ff33',
          borderRadius: 16,
          boxShadow: '0 0 80px rgba(77,166,255,0.1)',
          padding: 24,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          position: 'relative',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); playSelectSfx(); requestClose(false); }}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1,
            background: 'rgba(0,0,0,0.6)', color: '#cfe3ee',
            border: '1.5px solid #4da6ff55', borderRadius: 8,
            padding: '6px 20px', fontFamily: 'inherit', fontSize: 18, letterSpacing: 2, cursor: 'pointer',
          }}
        >
          LEAVE
        </button>

        {/* Row above everything else — scene image fills the row, cropped to fit rather than squeezed */}
        <div style={{
          width: '100%', height: 368, marginBottom: 20,
          position: 'relative', overflow: 'hidden', borderRadius: 12,
          border: (sceneImageSrc && entered) ? '3px solid #fff' : '3px solid rgba(255,255,255,0.25)',
          boxShadow: (sceneImageSrc && entered) ? '0 0 40px rgba(255,255,255,0.6)' : 'none',
          background: '#000',
          transition: 'border-color 2s ease-out, box-shadow 2s ease-out',
        }}>
          {sceneImageSrc && (
            <>
              <img src={sceneImageSrc} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                clipPath: entered ? 'inset(0 0 0 0)' : 'inset(0 50% 0 50%)',
                transition: 'clip-path 2s ease-out',
              }} />
              {title && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  textAlign: 'center', padding: '24px 0',
                  background: 'radial-gradient(ellipse 260px 90px at center, rgba(0,0,0,0.75) 0%, transparent 75%)',
                  fontSize: 32, fontWeight: 'bold', color: '#f5d76e', textShadow: '0 0 24px #c8a135, 0 0 8px rgba(0,0,0,0.9)', letterSpacing: 3,
                  opacity: entered ? 1 : 0,
                  transition: 'opacity 0.6s ease-out',
                  transitionDelay: entered ? '2s' : '0s',
                }}>
                  {title}
                </div>
              )}
            </>
          )}
        </div>

        {/* Row: portraits + dialog box */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
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
            {isReward || isChoice ? (
              <div className="font-body" style={{ fontSize: 26, color: '#f5d76e', letterSpacing: 2, marginBottom: 12, textDecoration: 'underline', textUnderlineOffset: '6px', flexShrink: 0 }}>
                {isReward ? 'REWARDS' : page.header}
              </div>
            ) : (
              page.speaker?.name && (
                <div className="font-body" style={{ fontSize: 30, color: page.speaker.color, letterSpacing: 2, marginBottom: 8, textDecoration: 'underline', textUnderlineOffset: '6px', flexShrink: 0 }}>
                  {page.speaker.name}
                </div>
              )
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {isReward ? (
                <RewardMock page={page} />
              ) : isChoice ? (
                <ChoiceList options={page.options} onChoose={choose} />
              ) : (
                <div style={{
                  fontSize: 24, color: page.speaker?.name ? '#cfe3ee' : '#9fb0bd',
                  lineHeight: 1.7, fontWeight: 500, flex: 1,
                  fontStyle: page.speaker?.name ? 'normal' : 'italic',
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
            {!isChoice && typedCount >= fullText.length && (
              <div style={{ textAlign: 'right', color: '#4a6a8a', flexShrink: 0 }}>▼</div>
            )}
          </div>

          <Connector speaker={rightSpeaker} active={activeSide === 'right'} visible={entered} />
          <PortraitSlot speaker={rightSpeaker} active={activeSide === 'right'} align="right" visible={entered} />
        </div>
      </div>
    </div>
  );
}

// Option buttons for a choice page; disabled options stay visible but can't be picked.
function ChoiceList({ options, onChoose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((option, i) => (
        <button
          key={i}
          disabled={option.disabled}
          onClick={(e) => { e.stopPropagation(); onChoose(i); }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px',
            background: 'rgba(77,166,255,0.08)',
            border: '1.5px solid #4da6ff55',
            borderRadius: 8,
            color: '#cfe3ee', fontFamily: 'inherit', fontSize: 22, textAlign: 'left',
            cursor: option.disabled ? 'not-allowed' : 'pointer',
            opacity: option.disabled ? 0.4 : 1,
          }}
        >
          <span>{option.label}</span>
          {option.sublabel && <span style={{ fontSize: 15, color: '#8aaabb' }}>{option.sublabel}</span>}
        </button>
      ))}
    </div>
  );
}

// Every reward (gold included) is shown as a card, grouped into labeled
// sections (You Learn! for unlocked cards, You Gain! for gold). Real cards
// resolve via CLASS_REGISTRY same as WinModal's CardWidget.
function RewardMock({ page }) {
  const { gold, classId, cardId, desc } = page;
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
      className={c.animated ? 'shine-btn event-marching-ants' : ''}
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
