// ============================================================
//  SAMURAI ENEMY — Battle Spirit Bar (aztec sun pips)
//  Simplified mirror of SamuraiResourceBar — no plan/cost logic.
//  Reads from enemy.resources.BATTLE_SPIRIT.
//  Pip size scales to fit inside the enemy portrait card.
// ============================================================

const RAY_POINTS = [
  '12,2 13.2,5.5 10.8,5.5',
  '19.1,4.9 17.4,8.3 15.8,6.6',
  '22,12 18.5,13.2 18.5,10.8',
  '19.1,19.1 15.8,17.4 17.4,15.8',
  '12,22 10.8,18.5 13.2,18.5',
  '4.9,19.1 6.6,15.8 8.3,17.4',
  '2,12 5.5,10.8 5.5,13.2',
  '4.9,4.9 8.3,6.6 6.6,8.3',
];

const PIP_SIZE = { small: 10, medium: 13, large: 16 };

function AztecSun({ filled }) {
  const color = filled ? 'white' : 'rgba(255,255,255,0.15)';
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill={color}>
      {RAY_POINTS.map((pts, i) => <polygon key={i} points={pts} />)}
      <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1.2" />
      <polygon points="12,9.5 13.5,12 12,14.5 10.5,12" />
    </svg>
  );
}

export default function SamuraiEnemyResourceBar({ enemy, cardSize = 'medium' }) {
  const { current = 0, max = 10 } = enemy.resources?.BATTLE_SPIRIT ?? {};
  const pip = PIP_SIZE[cardSize] ?? PIP_SIZE.medium;
  return (
    <div className="flex justify-center" style={{ gap: '1px', marginTop: '3px' }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ width: pip, height: pip, flexShrink: 0 }}>
          <AztecSun filled={i < current} />
        </div>
      ))}
    </div>
  );
}
