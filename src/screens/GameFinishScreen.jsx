// ============================================================
//  GameFinishScreen — shown when a zone is fully cleared
// ============================================================

import { useEffect, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { VICTORY_MUSIC, MUSIC_REGISTRY } from '../assets/MUSIC/index';
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
      id:       i,
      color,
      left:     Math.random() * 100,
      delay:    Math.random() * 6.0,
      duration: 6.0 + Math.random() * 4.0,
      startRot: (Math.random() - 0.5) * 64,
      endRot:   (Math.random() - 0.5) * 64,
      width,
      height:   Math.round(width * 1.5),
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
            '--shower-duration':  `${card.duration}s`,
            '--shower-delay':     `${card.delay}s`,
            '--shower-start-rot': `${card.startRot}deg`,
            '--shower-end-rot':   `${card.endRot}deg`,
            '--card-rgb':         card.color.join(','),
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
    const trackId = VICTORY_MUSIC[playerData?.class_id] ?? VICTORY_MUSIC.default;
    const src = MUSIC_REGISTRY[trackId];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.35;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [playerData?.class_id]);

  return (
    <div className="w-full h-full flex flex-col bg-black relative overflow-hidden">

      <RisingCardShower />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-8 py-8">

        {/* Portrait — top, same frame as BattleScreen PlayerPortrait */}
        <div className="flex flex-col items-center">
          <div
            className="relative w-[14rem] h-[21rem] rounded-2xl overflow-hidden"
          >
            {portrait && (
              <img src={portrait} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
        </div>

        {/* Text — below portrait */}
        <div className="flex flex-col items-center gap-4 px-10 text-center" style={{ maxWidth: '480px', background: 'rgba(0,0,0,0.65)', borderRadius: '24px', padding: '24px 32px', backdropFilter: 'blur(4px)' }}>
          <div className="finish-title">PATH CLEARED</div>
          <div className="finish-subtitle">You are a force few dare to face.</div>
          <p className="finish-body">
            The path asked for discipline, cunning, and the will to rise when the odds were
            stacked. You answered — every time. Others carry blades. You carry intent.
            A true sumurai walks not because the road is safe, but because retreat was never an option.
          </p>
        </div>

      </div>
    </div>
  );
}
