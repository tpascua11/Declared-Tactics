import { useEffect, useMemo } from 'react';
import './CardRiseTransition.css';
import rainSfx from '../../assets/SOUND EFFECTS/RAIN.wav';

const _rainAudio = new Audio(rainSfx);
_rainAudio.volume = 0.1;

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

const CARD_COUNT = 100;

function buildCards() {
  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const color = COLORS[i % COLORS.length];
    return {
      id:       i,
      color,
      left:     Math.random() * 100,
      delay:    Math.random() * 1.1,
      duration: 0.7 + Math.random() * 0.55,
      startRot: (Math.random() - 0.5) * 64,
      endRot:   (Math.random() - 0.5) * 64,
      width:    38 + Math.floor(Math.random() * 18),
      get height() { return Math.round(this.width * 1.5); },
    };
  });
}

export default function CardRiseTransition() {
  const cards = useMemo(buildCards, []);

  useEffect(() => {
    _rainAudio.currentTime = 0;
    _rainAudio.play().catch(() => {});
  }, []);

  return (
    <div className="rise-overlay">
      {cards.map(card => (
        <div
          key={card.id}
          className="rise-card"
          style={{
            '--rise-duration':   `${card.duration}s`,
            '--rise-delay':      `${card.delay}s`,
            '--rise-start-rot':  `${card.startRot}deg`,
            '--rise-end-rot':    `${card.endRot}deg`,
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
