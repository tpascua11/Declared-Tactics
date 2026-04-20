// ============================================================
//  BattleQueue — Converging action timeline
//  Enemies fan left · current action center · player cards fan right
//  Only visible during BATTLE phase
// ============================================================

import { useRef } from 'react';
import { battle_registry } from '../../battle/registry/battle_registry';
import '../../battle/handlers';

const CARD_W = 88;   // px  (≈ 5.5rem)
const CARD_H = 132;  // px  (= 8.25rem, matches Hand card height)
const GAP    = 10;   // px between card slots

// ── helpers ──────────────────────────────────────────────────

function applySpeedCalc(baseSpeed, tagPool, char) {
  const clone = { calc_speed: baseSpeed };
  for (const tag of tagPool) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('SPEED_CALC')) {
      entry.handlers['SPEED_CALC'](clone, char, tag);
    }
  }
  return clone.calc_speed;
}

// initialLengths: { [char.id]: original queue length at battle start }
// Used to compute absolute queue indices so keys stay stable as cards are consumed.
function simulateExecutionOrder(characters, initialLengths) {
  const queues = {};
  const tagPools = {};
  const speedPenalties = {};

  for (const char of characters) {
    if (char.health <= 0) continue;
    const filled = (char.queue || []).filter(Boolean);
    if (filled.length === 0) continue;
    const initialLen = initialLengths?.[char.id] ?? filled.length;
    const offset = initialLen - filled.length;
    queues[char.id] = filled.map((a, i) => ({
      ...a,
      _char: char,
      _stableKey: `${char.id}_${offset + i}`,
    }));
    tagPools[char.id] = [...(char.active_tag_pool || [])];
    speedPenalties[char.id] = char.action_count ?? 0;
  }

  const order = [];

  for (let step = 0; step < 50; step++) {
    const candidates = Object.entries(queues)
      .filter(([, q]) => q.length > 0)
      .map(([id, q]) => {
        const action = q[0];
        const char = action._char;
        const base = (char.base_speed + (action.speed_mod ?? 0)) - speedPenalties[id] * 20;
        return { ...action, _simSpeed: applySpeedCalc(base, tagPools[id] || [], char) };
      });
    if (candidates.length === 0) break;
    candidates.sort((a, b) => b._simSpeed - a._simSpeed);
    const winner = candidates[0];
    order.push({ ...winner, calc_speed: winner._simSpeed });
    queues[winner.owner_id] = queues[winner.owner_id].slice(1);
    if (!winner.ignores_slot_penalty) speedPenalties[winner.owner_id] += 1;
  }
  return order;
}

function scaleForDistance(d) {
  return Math.max(0.48, 1 - d * 0.13);
}

// ── card ─────────────────────────────────────────────────────

function ActionCard({ action, isCenter }) {
  const isPlayer = action._char?.faction === 'player';
  const color = action.color || (isPlayer ? '#4da6ff' : '#e94560');
  const icon  = action.icon  || action._char?.icon || '⚔️';

  return (
    <div
      style={{
        width:        CARD_W,
        height:       CARD_H,
        background:   '#09090f',
        border:       `2px solid ${color}`,
        borderRadius: '3px',
        boxShadow:    isCenter
          ? `0 0 10px ${color}bb, 0 0 20px ${color}44`
          : `0 0 5px ${color}33`,
        display:      'flex',
        flexDirection:'column',
        isolation:    'isolate',
        flexShrink:   0,
      }}
    >
      {/* Header */}
      <div style={{
        background:   '#0d0d1a',
        borderBottom: `1px solid ${color}44`,
        height:       '1.3rem',
        position:     'relative',
        flexShrink:   0,
        zIndex:       2,
        overflow:     'hidden',
      }}>
        <span className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold font-mono text-center leading-tight truncate"
          style={{ color }}>
          {action.name}
        </span>
      </div>

      {/* Art */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), ${color}18`,
        }}>
          {action.image
            ? <img src={action.image} alt={action.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: '1.75rem' }}>{icon}</span>
          }
          {/* Scanlines */}
          <div style={{
            position:   'absolute',
            inset:      0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.15) 0px,rgba(0,0,0,0.15) 1px,transparent 1px,transparent 3px)',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background:  '#0d0d1a',
        borderTop:   `1px solid ${color}55`,
        height:      '1.1rem',
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        flexShrink:  0,
      }}>
        <span className="text-[11px] font-bold font-mono" style={{ color }}>
          SPD {action.calc_speed}
        </span>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────

export default function BattleQueue({ characters, phase }) {
  // Capture queue lengths the moment battle starts so keys stay stable as cards execute.
  const initialLengthsRef = useRef(null);
  if (phase === 'BATTLE' && !initialLengthsRef.current) {
    initialLengthsRef.current = {};
    for (const char of characters) {
      initialLengthsRef.current[char.id] = (char.queue || []).filter(Boolean).length;
    }
  }
  if (phase !== 'BATTLE') initialLengthsRef.current = null;

  const containerStyle = {
    position:   'relative',
    height:     '10rem',
    background: 'rgba(0,0,0,0.35)',
    borderTop:    '1px solid rgba(255,255,255,0.08)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    overflow:   'hidden',
  };

  if (phase !== 'BATTLE') return <div style={containerStyle} />;

  const allActions = simulateExecutionOrder(characters, initialLengthsRef.current);

  if (allActions.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <span className="text-[9px] font-mono text-gray-700 tracking-widest">RESOLVING...</span>
      </div>
    );
  }

  const centerAction  = allActions[0];
  const rest          = allActions.slice(1);
  const enemyActions  = rest.filter(a => a._char.faction === 'enemy');
  const playerActions = rest.filter(a => a._char.faction === 'player');

  // slot 0 = center, negative = enemy (left), positive = player (right)
  const slots = [
    { action: centerAction, slot: 0 },
    ...enemyActions.map((a, i)  => ({ action: a, slot: -(i + 1) })),
    ...playerActions.map((a, i) => ({ action: a, slot:   i + 1  })),
  ];

  return (
    <div style={containerStyle}>

      {/* Edge fade masks */}
      <div style={{
        position:      'absolute',
        inset:         0,
        zIndex:        20,
        pointerEvents: 'none',
        background:    'linear-gradient(to right, rgba(15,15,26,0.92) 0%, transparent 14%, transparent 86%, rgba(15,15,26,0.92) 100%)',
      }} />

      {/* Divider lines either side of center */}
      <div style={{
        position:   'absolute',
        left:       `calc(50% - ${CARD_W / 2 + GAP + 1}px)`,
        top:        '15%',
        height:     '70%',
        width:      '1px',
        background: 'rgba(255,255,255,0.07)',
        zIndex:     15,
      }} />
      <div style={{
        position:   'absolute',
        left:       `calc(50% + ${CARD_W / 2 + GAP}px)`,
        top:        '15%',
        height:     '70%',
        width:      '1px',
        background: 'rgba(255,255,255,0.07)',
        zIndex:     15,
      }} />

      {slots.map(({ action, slot }) => {
        const distance = Math.abs(slot);
        const scale    = distance === 0 ? 1 : scaleForDistance(distance);
        const xOffset  = slot * (CARD_W + GAP);
        const opacity  = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.22);

        return (
          <div
            key={action._stableKey}
            style={{
              position:        'absolute',
              left:            `calc(50% + ${xOffset - CARD_W / 2}px)`,
              top:             '50%',
              transform:       `translateY(-50%) scale(${scale})`,
              transformOrigin: 'center center',
              transition:      'left 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease',
              zIndex:          distance === 0 ? 10 : Math.max(1, 9 - distance),
              opacity,
            }}
          >
            <ActionCard action={action} isCenter={distance === 0} />
          </div>
        );
      })}
    </div>
  );
}
