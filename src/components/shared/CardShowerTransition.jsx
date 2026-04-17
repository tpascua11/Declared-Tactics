import { useEffect, useMemo } from 'react';
import './CardShowerTransition.css';
import rainSfx from '../../assets/SOUND EFFECTS/RAIN.wav';

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

const CARD_COUNT = 300;
const DONE_DELAY = 2200;

function buildCards() {
  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const color = COLORS[i % COLORS.length];
    return {
      id:        i,
      color,
      left:      Math.random() * 100,
      delay:     Math.random() * 1.0,
      duration:  0.8 + Math.random() * 0.6,
      startRot:  (Math.random() - 0.5) * 64,
      endRot:    (Math.random() - 0.5) * 64,
      width:     38 + Math.floor(Math.random() * 18),
      height:    54 + Math.floor(Math.random() * 22),
    };
  });
}

export default function CardShowerTransition({ onDone }) {
  const cards = useMemo(buildCards, []);

  useEffect(() => {
    const audio = new Audio(rainSfx);
    audio.volume = 0.25;
    audio.play().catch(() => {});
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="shower-overlay">
      {cards.map(card => (
        <div
          key={card.id}
          className="shower-card"
          style={{
            '--shower-duration':   `${card.duration}s`,
            '--shower-delay':      `${card.delay}s`,
            '--shower-start-rot':  `${card.startRot}deg`,
            '--shower-end-rot':    `${card.endRot}deg`,
            '--card-rgb':          card.color.join(','),
            left:   `${card.left}%`,
            top:    `-${card.height + 10}px`,
            width:  `${card.width}px`,
            height: `${card.height}px`,
          }}
        />
      ))}
    </div>
  );
}
