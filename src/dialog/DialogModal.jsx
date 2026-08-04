import { useState, useEffect, useMemo } from 'react';
import { resolveDialogSpeaker } from './resolveDialogSpeaker';
import { parseDialogText } from './parseDialogText';
import { playSelectSfx } from '../vfx/animationRegistry';
import * as ASSETS from '../assets';

const TYPE_MS_PER_CHAR = 12;

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
  const segments = useMemo(() => parseDialogText(line.text), [line.text]);
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
      if (resolvedLines[i].speaker.side === side) return resolvedLines[i].speaker;
    }
    for (let i = uptoIndex + 1; i < resolvedLines.length; i++) {
      if (resolvedLines[i].speaker.side === side) return resolvedLines[i].speaker;
    }
    return null;
  };
  const leftSpeaker = speakerForSide('left', lineIndex);
  const rightSpeaker = speakerForSide('right', lineIndex);
  const activeSide = line.speaker.side;

  const advance = () => {
    playSelectSfx();
    if (typedCount < fullText.length) {
      setTypedCount(fullText.length);
      return;
    }
    if (lineIndex + 1 < resolvedLines.length) {
      setLineIndex(lineIndex + 1);
    } else {
      onClose();
    }
  };

  let renderedChars = 0;
  const mapIconSrc = dialog.mapIcon ? ASSETS[dialog.mapIcon] : null;

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.85)',
        fontFamily: "'Courier New', monospace",
        cursor: 'pointer',
        padding: '0 40px 20px',
      }}
    >
      {/* Outer shell — fixed size */}
      <div style={{
        width: 1400, height: 800,
        background: 'linear-gradient(160deg,#0a1220,#071018)',
        border: '1.5px solid #4da6ff33',
        borderRadius: 16,
        boxShadow: '0 0 80px rgba(77,166,255,0.1)',
        padding: 24,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {/* Row above everything else — single map icon for the stage */}
        {mapIconSrc && (
          <div style={{ width: 860, alignSelf: 'center', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              width: 430, height: 384,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              {dialog.title && (
                <div style={{ fontSize: 26, color: '#f5d76e', textShadow: '0 0 20px #c8a135', letterSpacing: 2 }}>
                  {dialog.title}
                </div>
              )}
              <img src={mapIconSrc} alt="" style={{ width: 384, height: 384, border: '2px solid #fff', imageRendering: 'pixelated' }} />
            </div>
          </div>
        )}

        {/* Row: portraits + dialog box */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          {/* Hugging the dialog window's left edge */}
          <PortraitSlot speaker={leftSpeaker} active={activeSide === 'left'} />
          <Connector speaker={leftSpeaker} active={activeSide === 'left'} pointRight />

          {/* Center: dialog box */}
          <div style={{
            flex: 1,
            maxWidth: 860,
            background: 'linear-gradient(160deg,#0a1220,#071018)',
            border: '1.5px solid #4da6ff33',
            borderRadius: 12,
            boxShadow: '0 0 80px rgba(77,166,255,0.1)',
            padding: '18px 22px',
            minHeight: '19rem',
            alignSelf: 'flex-end',
            display: 'flex', flexDirection: 'column',
          }}>
            {line.speaker.name && (
              <div className="font-body" style={{ fontSize: 30, color: line.speaker.color, letterSpacing: 2, marginBottom: 8, textDecoration: 'underline', textUnderlineOffset: '6px' }}>
                {line.speaker.name}
              </div>
            )}
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
            {typedCount >= fullText.length && (
              <div style={{ textAlign: 'right', color: '#4a6a8a' }}>▼</div>
            )}
          </div>

          {/* Hugging the dialog window's right edge */}
          <Connector speaker={rightSpeaker} active={activeSide === 'right'} />
          <PortraitSlot speaker={rightSpeaker} active={activeSide === 'right'} align="right" />
        </div>
      </div>
    </div>
  );
}

// Arrow bridging a portrait to the dialog box — points toward the box,
// glows in the speaker's color while they're talking, dim otherwise.
function Connector({ speaker, active, pointRight = false }) {
  const color = active && speaker ? speaker.color : 'rgba(255,255,255,0.15)';
  return (
    <div style={{ width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
function PortraitSlot({ speaker, active, align = 'left' }) {
  if (!speaker) {
    return (
      <div style={{ width: '14rem', flexShrink: 0 }}>
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
    <div style={{ width: '14rem', flexShrink: 0 }}>
      <div style={{
        position: 'relative',
        width: '14rem', height: '21rem',
        border: active ? `4px solid ${speaker.color}` : '4px solid rgba(255,255,255,0.15)',
        borderRadius: '1rem', overflow: 'hidden',
        boxShadow: active ? `0 0 60px ${hexToRgba(speaker.color, 0.5)}` : 'none',
        background: '#050a10',
      }}>
        {speaker.portrait && (
          <img src={speaker.portrait} alt="" className="absolute inset-0 w-full h-full object-cover" />
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
