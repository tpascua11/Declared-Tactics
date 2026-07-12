// ============================================================
//  EnemyResourceBar — dispatcher
//  Renders the correct resource bar for an enemy based on
//  their `resource_bar_type`. Add new types to BAR_REGISTRY.
//
//  Unique bars receive the full `enemy` object so they can
//  pull whatever fields they need.
//
//  Types:
//    'samurai' → aztec sun pips (SamuraiEnemyResourceBar)
//    undefined / anything else → generic fill bar (if max_resource set)
// ============================================================

import SamuraiEnemyResourceBar from '../resources/enemy/SamuraiEnemyResourceBar';

const BAR_REGISTRY = {
  samurai: SamuraiEnemyResourceBar,
};

function GenericEnemyResourceBar({ enemy, hpText }) {
  const pct = Math.max(0, ((enemy.resource ?? 0) / enemy.max_resource) * 100);
  return (
    <div className="w-full relative mt-1">
      <div className="w-full h-3 bg-gray-600/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg,#4da6ff,#a0d4ff)',
          }}
        />
      </div>
      <span
        className={`absolute inset-0 flex items-center justify-center ${hpText} text-white font-mono leading-none pointer-events-none`}
        style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}
      >
        {enemy.resource ?? 0} / {enemy.max_resource}
      </span>
    </div>
  );
}

export default function EnemyResourceBar({ enemy, hpText }) {
  const Unique = BAR_REGISTRY[enemy.resource_bar_type];
  if (Unique) {
    return <Unique enemy={enemy} cardSize={enemy.card_size} />;
  }
  if (enemy.max_resource != null) {
    return <GenericEnemyResourceBar enemy={enemy} hpText={hpText} />;
  }
  return null;
}
