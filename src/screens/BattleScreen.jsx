// ============================================================
//  BattleScreen — battle and queue setup UI
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { useGame } from '../context/GameContext';
import { getEffectiveActionSlots } from '../battle/engine/battle_engine';

import { MUSIC_REGISTRY, VICTORY_MUSIC, DEFEAT_MUSIC } from '../assets/MUSIC/index';
import { ANIMATIONS, preloadedAudio, sfx } from '../battle/animationRegistry';
import '../battle/animations.css';
import EnemyZone from '../components/battle/EnemyZone';
import BattleLog from '../components/battle/BattleLog';
import BattleQueue from '../components/battle/BattleQueue';
import TagPool from '../components/battle/TagPool';
import PlayerPortrait from '../components/battle/PlayerPortrait';
import ActionQueue from '../components/battle/ActionQueue';
import Hand from '../components/battle/Hand';

export default function BattleScreen() {
  const { gs, dispatch, onBattleEnd } = useGame();
  const [retargetingSlot, setRetargetingSlot] = useState(null);
  const [lineCoords, setLineCoords] = useState(null);
  const [activeAnimations, setActiveAnimations] = useState({});
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const floatIdRef = useRef(0);
  const floatTimersRef = useRef([]);
  const animClearTimersRef = useRef([]);
  const battleTimerRef = useRef(null);
  const musicRef = useRef(null);

  const player = gs.characters.find(c => c.faction === 'player');
  const enemies = gs.characters.filter(c => c.faction === 'enemy');
  const { ResourceBar } = CLASS_REGISTRY[player.class_id] ?? {};
  const effectiveSlots = getEffectiveActionSlots(player);


  // Clean up any in-flight float/anim timers on unmount
  useEffect(() => {
    return () => {
      floatTimersRef.current.forEach(clearTimeout);
      animClearTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Battle music — start on mount, stop on RESULT or unmount
  useEffect(() => {
    const src = gs.music ? MUSIC_REGISTRY[gs.music] : null;
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.2;
    audio.play().catch(() => {}); // ignore autoplay policy errors
    musicRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      musicRef.current = null;
    };
  }, [gs.music]);

  const victoryMusicRef = useRef(null);

  useEffect(() => {
    if (gs.phase !== 'RESULT') return;
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
    const registry = gs.result === 'WIN' ? VICTORY_MUSIC : DEFEAT_MUSIC;
    const trackId = registry[player.class_id] ?? registry.default;
    const src = MUSIC_REGISTRY[trackId];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.35;
    audio.play().catch(() => {});
    victoryMusicRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      victoryMusicRef.current = null;
    };
  }, [gs.phase, gs.result]);

  // Stage-clear shine — fires when advancing to a new stage, completely outside the battle loop.
  useEffect(() => {
    if (!gs.currentStageIndex) return;
    setActiveAnimations(prev => ({ ...prev, [player.id]: { cssClass: 'animate-stage-clear', intensity: 1 } }));
    playSfx(sfx('BATTLE_NEXT.wav'), 0.4);
    const t = setTimeout(() => setActiveAnimations(prev => ({ ...prev, [player.id]: null })), 2000);
    return () => clearTimeout(t);
  }, [gs.currentStageIndex]);

  // Drive battle loop with timed steps.
  // If pending animations define a battleDelay, use the longest one — otherwise fall back to duration.
  useEffect(() => {
    if (gs.phase !== 'BATTLE') return;
    const maxDelay = (gs.pendingAnimation ?? []).reduce((max, anim) => {
      const config = ANIMATIONS[anim.type];
      if (!config) return max;
      return Math.max(max, config.battleDelay ?? config.duration ?? 0);
    }, 0);
    const delay = Math.max(600, maxDelay + 150);
    battleTimerRef.current = setTimeout(() => {
      floatTimersRef.current = [];
      animClearTimersRef.current = [];
      dispatch({ type: 'BATTLE_STEP' });
    }, delay);
    return () => clearTimeout(battleTimerRef.current);
  }, [gs.phase, gs.stepCount]);

  function playSfx(src, volume = 0.6) {
    const audio = preloadedAudio(src).cloneNode();
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  // Unified animation handler — reads pendingAnimation array from reducer,
  // looks up each entry in registry, applies CSS class + SFX, auto-clears.
  useEffect(() => {
    const anims = gs.pendingAnimation;
    if (!anims?.length) return;

    const timers = [];
    anims.forEach(anim => {
      const config = ANIMATIONS[anim.type];
      if (!config) return;

      setActiveAnimations(prev => ({
        ...prev,
        [anim.targetId]: { cssClass: config.cssClass, intensity: anim.intensity ?? 1.0 },
      }));

      if (config.sfx && !anim.skipSfx) {
        const sfxList = Array.isArray(config.sfx)
          ? config.sfx
          : [{ src: config.sfx, delay: 0, volume: config.volume ?? 0.6 }];
        sfxList.forEach(({ src, delay = 0, volume }) => {
          setTimeout(() => playSfx(src, volume ?? config.volume ?? 0.6), delay);
        });
      }

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

      // Stored in a ref so effect cleanup on the next step doesn't cancel it —
      // the clear must always fire so dead enemies fade after their animation ends.
      animClearTimersRef.current.push(setTimeout(() => {
        setActiveAnimations(prev => ({ ...prev, [anim.targetId]: null }));
      }, config.duration));
    });

    return () => timers.forEach(clearTimeout);
  }, [gs.pendingAnimation, gs.stepCount]);

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
      dispatch({ type: 'RETARGET_SLOT', index: retargetingSlot, targetId });
    } else {
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
      {/* Retarget line overlay — portalled to document.body so it sits outside the CSS-transformed GameCanvas */}
      {lineCoords && createPortal(
        <svg className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} width="100%" height="100%">
          <defs>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {lineCoords.map(({ key, isActive, x1, y1, x2, y2 }) => isActive ? (
            <g key={key}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth="0.5" opacity="0.12"/>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#4da6ff" strokeWidth="3" opacity="0.5"
                strokeDasharray="10 5 2 8 14 3 6 4"
                filter="url(#arc-glow)"
                style={{ animation: 'electricA 0.6s linear infinite' }}
              />
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#a0d4ff" strokeWidth="1.2" opacity="0.9"
                strokeDasharray="3 11 8 4 2 9 5 6"
                style={{ animation: 'electricB 0.4s linear infinite' }}
              />
            </g>
          ) : (
            <g key={key}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth="2" opacity="0.12" filter="url(#arc-glow)"/>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4da6ff" strokeWidth="1" opacity="0.35" strokeDasharray="4 6"/>
            </g>
          ))}
        </svg>,
        document.body
      )}

      {gs.phase === 'RESULT' && gs.result === 'WIN' && (
        <div className="fixed inset-0 flex items-start justify-center pointer-events-none" style={{ zIndex: 9000, padding: '20%'}}>
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
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.72)' }} />
          {/* DEFEATED text — above background */}
          <div className="fixed inset-0 flex items-start justify-center pointer-events-none" style={{ zIndex: 9002, padding: '20%' }}>
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

        {/* TOP — Enemy Zone */}
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

        {/* MIDDLE — Battle Queue Row */}
        <BattleQueue
          characters={gs.characters}
          phase={gs.phase}
        />

        {/* BOTTOM — Player Zone */}
        <div className="flex-shrink-0 flex flex-col">

          {/* Center row: Buff Column | Character Column | Slot Column */}
          <div className="flex-1 flex items-end justify-center overflow-hidden pt-2 pb-4 max-h-[26rem]" style={{ position: 'relative' }}>

            {/* Battle Log — absolutely positioned in left column space, does not affect flex layout */}
            <BattleLog logs={gs.logs} turn={gs.turn} />

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
              />
            </div>

          </div>

          {/* BOTTOM — Hand */}
          <Hand
            cards={player.cards}
            queue={player.queue}
            totalSlots={effectiveSlots}
            onCardClick={handleCardClick}
            disabled={gs.phase !== 'QUEUE_SETUP'}
            resources={player.resources}
            ResourceBar={ResourceBar}
            baseSpeed={player.base_speed}
          />

        </div>

      </div>
    </>
  );
}
