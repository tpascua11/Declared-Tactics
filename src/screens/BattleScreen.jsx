// ============================================================
//  BattleScreen — battle and queue setup UI
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { useGame } from '../context/GameContext';
import { getEffectiveActionSlots } from '../battle/engine/battle_engine';

import { MUSIC_REGISTRY, VICTORY_MUSIC, DEFEAT_MUSIC } from '../assets/Music/index';
import { useMusic } from '../hooks/useMusic';
import { ANIMATIONS, playBattleSfx, sfx } from '../vfx/animationRegistry';
import CSS_PRESETS, { playPreset } from '../vfx/css_presets';
import fuseDeflect from '../vfx/fuseDeflect';
import '../vfx/animations.css';
import '../vfx/aura_animations.css';
import CardRiseTransition from '../components/shared/CardRiseTransition';
import EnemyZone from '../components/battle/EnemyZone';
import BattleLog from '../components/battle/BattleLog';
import BattleQueue, { simulateExecutionOrder } from '../components/battle/BattleQueue';
import TagPool from '../components/battle/TagPool';
import PlayerPortrait from '../components/battle/PlayerPortrait';
import ActionQueue from '../components/battle/ActionQueue';
import Hand from '../components/battle/Hand';
import { Z } from '../components/shared/zLayers';

// Per-reaction fuse options — same merges the VFX editor previews:
// DEFLECT keeps the hit css and the clang trails impact (fuse defaults),
// AVOID drops the hit css, lands the dodge exactly on the beat, and
// softens the whiffed attack's own sfx to 80%.
const REACTION_FUSE_OPTIONS = {
  DEFLECT: {},
  AVOID:   { keepImpactCss: false, sfxDelay: 0, attackVolumeScale: 0.8 },
};

// Resolve a pendingAnimation entry to its final playable config: the raw
// registry entry, or — when the reducer stamped a reaction onto it — the
// attack config with the reaction animation fused in at its impact times.
// Both the animation handler and the battle-pacing effect must resolve
// through here so a fused tail also stretches the step delay.
function resolveAnimConfig(anim) {
  const config = ANIMATIONS[anim.type];
  if (!config || !anim.reactionAnim) return config;
  const reactionConfig = ANIMATIONS[anim.reactionAnim];
  if (!reactionConfig) return config;
  return fuseDeflect(config, reactionConfig, REACTION_FUSE_OPTIONS[anim.reactionKind] ?? {});
}

export default function BattleScreen() {
  const { gs, dispatch, onBattleEnd, retry, restartBattle } = useGame();
  const [retargetingSlot, setRetargetingSlot] = useState(null);
  const [showRestartTransition, setShowRestartTransition] = useState(false);
  const restartTransitionTimerRef = useRef(null);
  const [lineCoords, setLineCoords] = useState(null);
  const [activeAnimations, setActiveAnimations] = useState({});
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [resultVisible, setResultVisible] = useState(false);
  const [typedTip, setTypedTip] = useState('');
  const [announcement, setAnnouncement] = useState(null);
  const [logVisible, setLogVisible] = useState(true);
  const floatIdRef = useRef(0);
  const floatTimersRef = useRef([]);
  const animClearTimersRef = useRef([]);
  const battleTimerRef = useRef(null);

  const player = gs.characters.find(c => c.faction === 'player');
  const enemies = gs.characters.filter(c => c.faction === 'enemy');
  const { ResourceBar } = CLASS_REGISTRY[player.class_id] ?? {};
  const effectiveSlots = getEffectiveActionSlots(player);

  const battleTrack = gs.music ? MUSIC_REGISTRY[gs.music] : null;
  const victoryRegistry = gs.result === 'WIN' ? VICTORY_MUSIC : DEFEAT_MUSIC;
  const victoryTrackId = (victoryRegistry[player.class_id] ?? victoryRegistry.default);
  const victoryTrack = MUSIC_REGISTRY[victoryTrackId];

  useMusic(battleTrack, { loop: true, baseVolume: gs.musicVolume ?? 0.2, enabled: gs.phase === 'QUEUE_SETUP' || gs.phase === 'BATTLE', restartKey: gs.retryKey });
  useMusic(victoryTrack, { loop: false, baseVolume: 0.35, enabled: gs.phase === 'RESULT' });


  // ── Cleanup ───────────────────────────────────────────────
  // Clean up any in-flight float/anim timers on unmount
  useEffect(() => {
    return () => {
      floatTimersRef.current.forEach(clearTimeout);
      animClearTimersRef.current.forEach(clearTimeout);
      clearTimeout(restartTransitionTimerRef.current);
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  function getCharacterEl(id) {
    return document.querySelector(`[data-enemy-id="${id}"]`)
        ?? document.querySelector(`[data-character-id="${id}"]`);
  }

  function getCharacterScreenPos(id) {
    const el = getCharacterEl(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // ── Result Screen ─────────────────────────────────────────
  function handleRestartBattle() {
    setShowRestartTransition(true);
    restartTransitionTimerRef.current = setTimeout(() => {
      restartBattle();
    }, 1050);
    setTimeout(() => setShowRestartTransition(false), 2300);
  }

  useEffect(() => {
    if (gs.phase !== 'RESULT') { setResultVisible(false); return; }
    const t = setTimeout(() => setResultVisible(true), 400);
    return () => clearTimeout(t);
  }, [gs.phase]);

  useEffect(() => {
    const tip = gs.sourceLevel?.defeat_tip;
    if (gs.phase !== 'RESULT' || gs.result === 'WIN' || !tip) { setTypedTip(''); return; }
    setTypedTip('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedTip(tip.slice(0, i));
      if (i >= tip.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [gs.phase, gs.result, gs.sourceLevel?.defeat_tip]);

  // ── Stage Transitions ─────────────────────────────────────
  // Stage-clear shine — fires when advancing to a new stage, completely outside the battle loop.
  useEffect(() => {
    if (!gs.currentStageIndex) return;
    setActiveAnimations(prev => ({ ...prev, [player.id]: { cssClass: 'animate-stage-clear', intensity: 1 } }));
    playSfx(sfx('BATTLE_NEXT.wav'), 0.4);
    const t = setTimeout(() => setActiveAnimations(prev => ({ ...prev, [player.id]: null })), 2000);
    return () => clearTimeout(t);
  }, [gs.currentStageIndex]);

  // Retry — play rest animation, clear result overlay
  useEffect(() => {
    if (!gs.retryKey) return;
    setResultVisible(false);
    setActiveAnimations(prev => ({ ...prev, [player.id]: { cssClass: 'animate-stage-clear', intensity: 1 } }));
    playSfx(sfx('BATTLE_NEXT.wav'), 0.4);
    const t = setTimeout(() => setActiveAnimations(prev => ({ ...prev, [player.id]: null })), 2000);
    return () => clearTimeout(t);
  }, [gs.retryKey]);

  // ── Battle Loop ───────────────────────────────────────────
  // Drive battle loop with timed steps.
  // If pending animations define a battleDelay, use the longest one — otherwise fall back to duration.
  useEffect(() => {
    if (gs.phase !== 'BATTLE') return;
    const maxDelay = (gs.pendingAnimation ?? []).reduce((max, anim) => {
      const config = resolveAnimConfig(anim);
      if (!config) return max;
      return Math.max(max, config.battleDelay ?? config.duration ?? 0);
    }, 0);
    // First step of each round waits an extra beat so the BattleQueue entrance can land.
    const entranceDelay = gs.stepCount === 0 ? 175 : 0;
    const delay = Math.max(600, maxDelay + 50) + entranceDelay;
    battleTimerRef.current = setTimeout(() => {
      floatTimersRef.current = [];
      animClearTimersRef.current = [];
      dispatch({ type: 'BATTLE_STEP' });
    }, delay);
    return () => clearTimeout(battleTimerRef.current);
  }, [gs.phase, gs.stepCount]);

  // ── Action Announcement ───────────────────────────────────
  useEffect(() => {
    if (gs.phase !== 'BATTLE') { setAnnouncement(null); return; }
    const holdMs = 900;
    const fadeMs = 300;
    const t = setTimeout(() => {
      const allActions = simulateExecutionOrder(gs.characters, null);
      if (allActions.length === 0) return;
      const center = allActions[0];
      const target = gs.characters.find(c => c.id === center.target_id);
      const noTarget = (center.tags?.target ?? []).length === 0;
      const nameColor = center._char?.faction === 'player' ? '#4da6ff' : '#e94560';
      const charName = center._char?.name;
      const targetColor = target?.faction === 'player' ? '#4da6ff' : '#e94560';
      const middle = noTarget ? `  ↩  ${center.name}` : `  →  ${center.name}  →  `;
      const targetName = noTarget ? '' : (target?.name ?? '');
      const stepKey = gs.stepCount;
      setAnnouncement({ charName, nameColor, middle, targetName, targetColor, key: stepKey, exiting: false });
      setTimeout(() => {
        setAnnouncement(prev => prev?.key === stepKey ? { ...prev, exiting: true } : prev);
      }, holdMs);
      setTimeout(() => {
        setAnnouncement(prev => prev?.key === stepKey ? null : prev);
      }, holdMs + fadeMs);
    }, 80);
    return () => clearTimeout(t);
  }, [gs.phase, gs.stepCount]);

  // ── Animation Handler (CSS · SFX · Floating Numbers · Pixi) ─
  function playSfx(src, volume = 0.6) {
    playBattleSfx(src, volume);
  }

  // Unified animation handler — reads pendingAnimation array from reducer,
  // looks up each entry in registry, applies CSS class + SFX, auto-clears.
  useEffect(() => {
    const anims = gs.pendingAnimation;
    if (!anims?.length) return;

    const timers = [];
    anims.forEach(anim => {
      const config = resolveAnimConfig(anim);
      if (!config) return;

      // 1. PIXI — single dispatch with both target and owner positions.
      const targetPos = getCharacterScreenPos(anim.targetId);
      const ownerPos  = anim.ownerId ? getCharacterScreenPos(anim.ownerId) : null;
      if (targetPos) window.dispatchEvent(new CustomEvent('play-thumos-animation', {
        detail: { animType: anim.type, target: targetPos, owner: ownerPos, x: targetPos.x, y: targetPos.y },
      }));

      // 1b. PIXI channel — fused configs carry { name, start } entries (the
      // reaction, once per impact beat). Target and owner are both the
      // defender: a reaction plays entirely "at" the reactor, no travel.
      // noFallback: unauthored names play nothing, not the debug burst.
      if (config.pixi && targetPos) {
        config.pixi.forEach(({ name, start }) => {
          setTimeout(() => window.dispatchEvent(new CustomEvent('play-thumos-animation', {
            detail: { animType: name, target: targetPos, owner: targetPos, x: targetPos.x, y: targetPos.y, noFallback: true },
          })), start ?? 0);
        });
      }

      // 2. CSS — new-shape animations only (animation_data/*.json + css_presets.js),
      // fired directly via the Web Animations API. Animations not yet migrated
      // to `config.css` simply play no CSS (sfx/floatingNumber/PIXI are
      // unaffected either way).
      if (config.css) {
        const targetEl = getCharacterEl(anim.targetId);
        const ownerEl  = anim.ownerId ? getCharacterEl(anim.ownerId) : null;
        (config.css.target ?? []).forEach(({ preset, start = 0, duration, iterations }) => {
          const p = CSS_PRESETS[preset];
          if (!p || !targetEl) return;
          setTimeout(() => playPreset(targetEl, p, { duration, iterations }), start);
        });
        (config.css.owner ?? []).forEach(({ preset, start = 0, duration, iterations }) => {
          const p = CSS_PRESETS[preset];
          if (!p || !ownerEl) return;
          setTimeout(() => playPreset(ownerEl, p, { duration, iterations }), start);
        });

        // activeAnimations also gates EnemyZone's death-fade (isDead && !anim) —
        // mark the target "busy" for config.duration so a killed enemy doesn't
        // fade out mid-animation, same wait the old cssClass path provided.
        setActiveAnimations(prev => ({ ...prev, [anim.targetId]: { intensity: anim.intensity ?? 1.0 } }));
        animClearTimersRef.current.push(setTimeout(() => {
          setActiveAnimations(prev => ({ ...prev, [anim.targetId]: null }));
        }, config.duration));
      }

      // 3. SFX — play sound(s), supports multiple sounds with individual timings.
      // `start` is the new-shape field name; `delay` is what legacy registry
      // entries still use — accept either.
      if (config.sfx && !anim.skipSfx) {
        const sfxList = Array.isArray(config.sfx)
          ? config.sfx
          : [{ src: config.sfx, start: 0, volume: config.volume ?? 0.6 }];
        sfxList.forEach(({ src, start, delay, volume, volumeScale }) => {
          setTimeout(() => playSfx(src, (volume ?? config.volume ?? 0.6) * (volumeScale ?? 1)), start ?? delay ?? 0);
        });
      }

      // 4. FLOATING NUMBERS — show damage/heal value rising above the target.
      if (config.floatingNumber && anim.value > 0) {
        const floatList = Array.isArray(config.floatingNumber)
          ? config.floatingNumber
          : [config.floatingNumber];

        // Float timers are stored in a ref so effect cleanup doesn't cancel them
        // if the next battle step fires before the animation completes.
        floatList.forEach(({ color, prefix = '', delay: floatDelay = 0, split = 1 }) => {
          const displayValue = Math.floor(anim.value * split);
          if (displayValue <= 0) return;
          const id = ++floatIdRef.current;
          const showAt  = floatDelay;
          const fadeAt  = showAt + config.duration;
          const clearAt = fadeAt + 300;
          floatTimersRef.current.push(setTimeout(() => {
            setFloatingNumbers(prev => [...prev, { id, targetId: anim.targetId, value: displayValue, color, prefix, fading: false }]);
          }, showAt));
          floatTimersRef.current.push(setTimeout(() => {
            setFloatingNumbers(prev => prev.map(fn => fn.id === id ? { ...fn, fading: true } : fn));
          }, fadeAt));
          floatTimersRef.current.push(setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
          }, clearAt));
        });
      }

    });

    return () => timers.forEach(clearTimeout);
  }, [gs.pendingAnimation, gs.stepCount]);

  // ── Targeting Lines ───────────────────────────────────────
  useEffect(() => {
    if (gs.phase !== 'QUEUE_SETUP') { setLineCoords(null); return; }
    const lines = [];
    player.queue.forEach((slot, i) => {
      if (!slot?.target_id) return;
      const boxEl = document.querySelector(`[data-retarget-slot="${i}"]`);
      const enemyEl = document.querySelector(`[data-enemy-id="${slot.target_id}"]`);
      if (!boxEl || !enemyEl) return;
      const b = boxEl.getBoundingClientRect();
      const e = enemyEl.getBoundingClientRect();
      lines.push({
        key: i,
        isActive: retargetingSlot === i,
        x1: b.left + b.width / 2,
        y1: b.top,
        x2: e.left + e.width / 2,
        y2: e.bottom,
      });
    });
    setLineCoords(lines.length > 0 ? lines : null);
  }, [gs.phase, player.queue, retargetingSlot]);

  function handleEnemyClick(targetId) {
    if (gs.phase !== 'QUEUE_SETUP') return;
    if (retargetingSlot !== null) {
      playSfx(sfx('FUN_SELECT_2.wav'), 0.4);
      dispatch({ type: 'RETARGET_SLOT', index: retargetingSlot, targetId });
    } else {
      playSfx(sfx('FUN_SELECT_2.wav'), 0.4);
      dispatch({ type: 'SELECT_TARGET', targetId });
    }
  }

  function handleRetargetBoxClick(index) {
    if (gs.phase !== 'QUEUE_SETUP') return;
    playSfx(sfx('FUN_SELECT_2.wav'), 0.4);
    if (retargetingSlot === index) {
      // Already in retarget mode for this slot — cycle to next living enemy
      const living = enemies.filter(e => e.health > 0);
      if (living.length < 2) return;
      const currentTargetId = player.queue[index]?.target_id;
      const currentIdx = living.findIndex(e => e.id === currentTargetId);
      const nextEnemy = living[(currentIdx + 1) % living.length];
      dispatch({ type: 'RETARGET_SLOT', index, targetId: nextEnemy.id });
    } else {
      setRetargetingSlot(index);
    }
  }

  function handleCardClick(card) {
    if (gs.phase !== 'QUEUE_SETUP') return;
    if (player.queue.filter(Boolean).length >= effectiveSlots) return;
    playSfx(sfx('SELECT.wav'), 0.6);
    dispatch({ type: 'ADD_TO_QUEUE', card });
  }

  function handleClearSlot(index) {
    playSfx(sfx('DESELECT.wav'), 0.6);
    dispatch({ type: 'CLEAR_SLOT', index });
  }

  function handleExecute() {
    if (gs.phase === 'RESULT') {
      onBattleEnd(player.health, gs.result === 'WIN');
      return;
    }
    if (gs.phase !== 'QUEUE_SETUP') return;
    const filledCount = player.queue.filter(Boolean).length;
    if (filledCount === 0 || filledCount < effectiveSlots) return;
    playSfx(sfx('START_1.wav'), 0.7);
    dispatch({ type: 'START_BATTLE' });
  }

  return (
    <>
      {showRestartTransition && <CardRiseTransition />}

      {/* Retarget line overlay — portalled to document.body so it sits outside the CSS-transformed GameCanvas */}
      {lineCoords && createPortal(
        <svg className="fixed inset-0 pointer-events-none" style={{ zIndex: Z.TARGETING }} width="100%" height="100%">
          <defs>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {lineCoords.map(({ key, isActive, x1, y1, x2, y2 }) => (
            <g key={key}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth="0.5" opacity={isActive ? 0.18 : 0.07}/>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#4da6ff" strokeWidth={isActive ? 3 : 2} opacity={isActive ? 0.6 : 0.2}
                strokeDasharray="10 5 2 8 14 3 6 4"
                filter="url(#arc-glow)"
                style={{ animation: 'electricA 0.6s linear infinite' }}
              />
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? "#a0d4ff" : "#4da6ff"} strokeWidth="1.2" opacity={isActive ? 0.9 : 0.3}
                strokeDasharray="3 11 8 4 2 9 5 6"
                style={{ animation: 'electricB 0.4s linear infinite' }}
              />
            </g>
          ))}
        </svg>,
        document.body
      )}

      {gs.phase === 'RESULT' && gs.result === 'WIN' && (
        <div className="fixed inset-0 flex items-start justify-center pointer-events-none" style={{ zIndex: Z.RESULT, padding: '20%', opacity: resultVisible ? 1 : 0, transition: 'opacity 1.4s ease-in' }}>
          <div style={{
            fontFamily: "'Georgia', serif",
            fontSize: '5rem',
            fontWeight: 'bold',
            color: '#f5d76e',
            textShadow: '0 0 30px #f5d76e, 0 0 60px #c8a135, 2px 2px 0 #3a2800',
            letterSpacing: '0.15em',
            animation: 'victoryPulse 2s ease-in-out infinite',
          }}>
            VICTORY
          </div>
        </div>
      )}

      {gs.phase === 'RESULT' && gs.result !== 'WIN' && (
        <>
          {/* Dark background layer */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: Z.RESULT, backgroundColor: 'rgba(0,0,0,0.72)', opacity: resultVisible ? 1 : 0, transition: 'opacity 1.8s ease-in' }} />
          {/* DEFEATED text — above background */}
          {/* Same layer as the backdrop — later in DOM, so it paints above it */}
          <div className="fixed inset-0 flex items-start justify-center pointer-events-none" style={{ zIndex: Z.RESULT, padding: '20%', opacity: resultVisible ? 1 : 0, transition: 'opacity 1.4s ease-in' }}>
            <div style={{
              fontFamily: "'Georgia', serif",
              fontSize: '5rem',
              fontWeight: 'bold',
              color: '#a0a0b0',
              textShadow: '0 0 30px #303040, 0 0 60px #1a1a28, 2px 2px 0 #000',
              letterSpacing: '0.15em',
              animation: 'victoryPulse 3s ease-in-out infinite',
            }}>
              DEFEATED
            </div>
          </div>
        </>
      )}

      <div
        className="w-full h-full flex flex-col overflow-hidden bg-[#0f0f1a]"
        onClick={() => setRetargetingSlot(null)}
      >

        {/* ROW 1 — Enemy Zone (flex-1: fills leftover height) */}
        <EnemyZone
          enemies={enemies}
          activeAnimations={activeAnimations}
          floatingNumbers={floatingNumbers}
          activeEnemyId={gs.activeEnemyId}
          selectedTargetId={gs.lastTargetId}
          phase={gs.phase}
          retargetingSlot={retargetingSlot}
          onSelectTarget={handleEnemyClick}
          battleBackground={gs.battleBackground}
        />

        {/* ROW 2 — Battle Queue timeline (fixed ~180px) */}
        <BattleQueue
          characters={gs.characters}
          phase={gs.phase}
          announcement={announcement}
        />

        {/* ROW 3 — Player row: BattleLog | debuff tags | portrait | buff tags + slots.
            Content-sized (portrait height + padding), capped at 26rem.
            Overflow stays visible (like the Hand) so CSS animations can carry the
            portrait up past the BattleQueue row — clipping here reads as a z-order
            bug. The root column still clips at the screen edges. */}
        <div className="flex-shrink-0 flex items-end justify-center overflow-visible pt-2 pb-4 max-h-[26rem]" style={{ position: 'relative' }}>

            {/* Defeat tip — top of player zone, result screen only */}
            {gs.phase === 'RESULT' && gs.result !== 'WIN' && gs.sourceLevel?.defeat_tip && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: 'calc(50% + 11.5rem)',
                width: '30rem',
                fontSize: 19,
                color: '#7a9aaa',
                lineHeight: 1.9,
                fontStyle: 'italic',
                fontWeight: 500,
                padding: '8px 12px',
                zIndex: Z.RESULT_UI,
                textAlign: 'left',
              }}>
                {typedTip}
              </div>
            )}

            {/* Battle Log — absolutely positioned in left column space, does not affect flex layout */}
            {logVisible && <BattleLog logs={gs.logs} turn={gs.turn} />}

            {/* LEFT — Condition tag column (fixed width, right-aligned so buffs hug the gap) */}
            <div style={{ width: '340px', paddingRight: '12px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
              <TagPool tags={player.active_tag_pool.filter(t => t.status_type === 'debuff')} />
            </div>

            {/* CENTER — Character column */}
            <PlayerPortrait player={player} activeAnimations={activeAnimations} floatingNumbers={floatingNumbers} isVictory={gs.phase === 'RESULT' && gs.result === 'WIN'} />

            {/* RIGHT — Advanced tag column + Slot column */}
            <div style={{ width: '340px', paddingLeft: '12px', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '12px' }}>
              <TagPool tags={player.active_tag_pool.filter(t => t.status_type === 'buff')} growRight />
              <ActionQueue
                queue={player.queue}
                totalSlots={effectiveSlots}
                enemies={enemies}
                onClearSlot={handleClearSlot}
                retargetingSlot={retargetingSlot}
                onRetargetBoxClick={handleRetargetBoxClick}
                onExecute={handleExecute}
                isBattling={gs.phase === 'BATTLE'}
                isResult={gs.phase === 'RESULT'}
                result={gs.result}
                fizzlingCard={gs.pendingAnimation?.find(a => a.type === 'fizzle') ? { name: gs.pendingAnimation.find(a => a.type === 'fizzle').cardName } : null}
                tagPool={player.active_tag_pool}
                baseSpeed={player.base_speed}
                actionCount={player.action_count ?? 0}
                allowRetry={!!gs.scenario?.allow_retry}
                onRetry={retry}
                onRestartBattle={handleRestartBattle}
              />
            </div>

          </div>

        {/* ROW 4 — Hand */}
        <Hand
          cards={player.cards}
          queue={player.queue}
          totalSlots={effectiveSlots}
          onCardClick={handleCardClick}
          disabled={gs.phase !== 'QUEUE_SETUP'}
          resources={player.resources}
          ResourceBar={ResourceBar}
          baseSpeed={player.base_speed}
          tagPool={player.active_tag_pool}
          onRestartBattle={handleRestartBattle}
          isDefeated={gs.phase === 'RESULT' && gs.result !== 'WIN'}
          allowRetry={!!gs.scenario?.allow_retry}
          logVisible={logVisible}
          onToggleLog={() => setLogVisible(v => !v)}
        />

      </div>

    </>
  );
}
