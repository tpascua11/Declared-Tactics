// ============================================================
//  GameFinishScreen — shown when a zone is fully cleared
// ============================================================

import { useEffect, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { COMPLETION_MUSIC, MUSIC_REGISTRY } from '../assets/MUSIC/index';
import './GameFinishScreen.css';

const COLORS = [
  [212, 168,  75],
  [232, 197, 109],
  [155, 139, 171],
  [175, 159, 191],
  [108, 180, 190],
  [195, 130, 150],
  [100, 170, 130],
  [180, 130, 100],
  [120, 150, 195],
  [140, 170, 215],
];

const CARD_COUNT = 200;

function buildRisingCards() {
  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const color = COLORS[i % COLORS.length];
    const width = 38 + Math.floor(Math.random() * 18);
    return {
      id:          i,
      color,
      left:        Math.random() * 100,
      delay:       Math.random() * 6.0,
      duration:    6.0 + Math.random() * 4.0,
      spinDuration: 5.0 + Math.random() * 5.0,
      width,
      height:      Math.round(width * 1.5),
    };
  });
}

function RisingCardShower() {
  const cards = useMemo(buildRisingCards, []);
  return (
    <div className="finish-shower-overlay">
      {cards.map(card => (
        <div
          key={card.id}
          className="finish-shower-card"
          style={{
            '--shower-duration': `${card.duration}s`,
            '--shower-delay':    `${card.delay}s`,
            '--spin-duration':   `${card.spinDuration}s`,
            '--card-rgb':        card.color.join(','),
            left:   `${card.left}%`,
            bottom: `-${card.height + 10}px`,
            width:  `${card.width}px`,
            height: `${card.height}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function GameFinishScreen() {
  const { playerData } = usePlayer();
  const classDef = CLASS_REGISTRY[playerData?.class_id];
  const portrait = classDef?.victory_portrait ?? classDef?.portrait;

  useEffect(() => {
    const trackId = COMPLETION_MUSIC[playerData?.class_id] ?? COMPLETION_MUSIC.default;
    const src = MUSIC_REGISTRY[trackId];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.35;
    audio.loop = true;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [playerData?.class_id]);

  return (
    <div className="w-full h-full flex flex-col bg-black relative overflow-hidden">

      <RisingCardShower />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center py-8">

        {/* Single box — portrait + text */}
        <div className="flex flex-col items-center gap-6 text-center" style={{
          maxWidth: '480px',
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(200,200,200,0.25)',
          borderRadius: '24px',
          padding: '32px 32px',
          backdropFilter: 'blur(4px)',
        }}>

          {/* Portrait */}
          <div className="relative w-[14rem] h-[21rem] rounded-2xl overflow-hidden flex-shrink-0">
            {portrait && (
              <img src={portrait} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>

          {/* Text */}
          <div className="finish-title">PATH CLEARED</div>
          <div className="finish-subtitle">You are a force few dare to face.</div>
          {/* TODO: replace title, subtitle, and body with class-specific flavour text per future class */}
          <p className="finish-body">
              From the iron gate to the storm at the end of everything — 
              you fought, learned, bled, and rose every single time.
              No past. No excuses. Just forward.
              A true samurai isn't made from where they came from.
              They're made from the moment they refuse to fall.
          </p>

        </div>

      </div>
    </div>
  );
}
