// ============================================================
//  VfxEditorScreen — VFX authoring / preview tool
// ============================================================

import { useState, useEffect } from 'react';
import { PORTRAIT_SAMURAI, ENEMY_WOLF_SAMURAI } from '../assets';
import { ANIMATIONS, ANIMATION_DEVELOPMENT_KEYS, playBattleSfx } from '../vfx/animationRegistry';
import PIXI_DATA from '../vfx/pixi_data';
import CSS_PRESETS, { playPreset, applyDynamicVars, captureCurrentTransform } from '../vfx/css_presets';
import { getForwardSign } from '../vfx/direction';
import DOM_PRESETS, { playDomPreset, clearAllDomSpawns } from '../vfx/dom_presets';
import fuseDeflect from '../vfx/fuseDeflect';
import PlayerPortrait from '../components/battle/PlayerPortrait';
import EffectsLayer from '../components/battle/EffectsLayer';

const ANIM_KEYS = Object.keys(ANIMATIONS).filter(k => !ANIMATION_DEVELOPMENT_KEYS.includes(k));

const MOCK_PLAYER = {
  id: 'editor_player',
  name: 'Vrax',
  class_id: 'FOX_SAMURAI',
  health: 80,
  max_health: 100,
  temp_hp: 0,
  portrait: PORTRAIT_SAMURAI,
  active_tag_pool: [],
};

const ENEMY_ID = 'editor_enemy';

// Reaction toggle → default animation fused into the attack on play
// (swappable per-reaction via the editor dropdowns), plus per-reaction
// merge options (see fuseDeflect.js for the defaults).
const REACTIONS = {
  deflect: { defaultAnim: 'steel_guard_deflect', fuseOptions: {} },
  avoid:   { defaultAnim: 'sidestep',            fuseOptions: { keepImpactCss: false, sfxDelay: 0 } },
};

const TARGET_SIZES = ['small', 'medium', 'large'];
const ENEMY_CARD_CLASS = {
  small:  'w-32 h-48',
  medium: 'w-40 h-60',
  large:  'w-48 h-72',
};

export default function VfxEditorScreen() {
  const [floatingNumbers]           = useState([]);
  const [selected, setSelected]     = useState(ANIM_KEYS[0]);
  const [targetSize, setTargetSize] = useState('medium');
  const [jsonText, setJsonText]     = useState('');
  const [jsonError, setJsonError]   = useState(null);
  // null | 'deflect' | 'avoid' — mutually exclusive reaction toggles
  const [reaction, setReaction]     = useState(null);
  // Which side is the attacker (config.css.owner) vs defender (config.css.target) —
  // lets the editor preview an animation's --dir mirroring on the enemy side too.
  const [attackerIsEnemy, setAttackerIsEnemy] = useState(false);
  // Which animation each reaction fuses in — editable per-reaction
  const [reactionAnims, setReactionAnims] = useState(
    Object.fromEntries(Object.entries(REACTIONS).map(([k, r]) => [k, r.defaultAnim]))
  );

  // Sync textarea when selected animation changes
  useEffect(() => {
    const data = PIXI_DATA[selected];
    setJsonText(JSON.stringify(data ?? [], null, 2));
    setJsonError(null);
  }, [selected]);

  useEffect(() => () => {
    clearAllDomSpawns();
  }, []);

  function handleJsonChange(e) {
    setJsonText(e.target.value);
    setJsonError(null);
  }

  function handlePlay() {
    // Reaction toggles — fuse the reaction animation into the attack at
    // play time: its css/sfx get injected at each impact-phase entry's
    // start. Same merge the battle will do when the DEFLECT/AVOID flag
    // is passed.
    const r = REACTIONS[reaction];
    const config = r
      ? fuseDeflect(ANIMATIONS[selected], ANIMATIONS[reactionAnims[reaction]], r.fuseOptions)
      : ANIMATIONS[selected];

    // Parse local JSON — use it for Pixi, leave the file untouched
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(jsonText);
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
      parsedJson = null;
    }

    // Mirrors BattleScreen.jsx exactly — new-shape animations (config.css)
    // fire directly via the Web Animations API. Animations not yet migrated
    // simply play no CSS here either, so the editor never shows a look that
    // BattleScreen itself can't reproduce.
    if (config) {
      if (config.css) {
        const enemyEl  = document.querySelector(`[data-character-id="${ENEMY_ID}"]`);
        const playerEl = document.querySelector(`[data-character-id="${MOCK_PLAYER.id}"]`);
        if (enemyEl)  enemyEl.style.setProperty('--dir', String(getForwardSign('enemy')));
        if (playerEl) playerEl.style.setProperty('--dir', String(getForwardSign('player')));
        // config.css.owner is the attacker, config.css.target is the defender —
        // normally player attacks enemy; the toggle flips which element plays which.
        const attackerEl = attackerIsEnemy ? enemyEl : playerEl;
        const defenderEl = attackerIsEnemy ? playerEl : enemyEl;
        // lastEnd = real end of this attack's own css entries — see
        // BattleScreen's matching block for why.
        const spawnedAnims = [];
        let lastEnd = 0;
        (config.css.target ?? []).forEach(({ preset, start = 0, duration, iterations, ...params }) => {
          const p = CSS_PRESETS[preset];
          if (!p || !defenderEl) return;
          lastEnd = Math.max(lastEnd, start + duration);
          setTimeout(() => {
            captureCurrentTransform(defenderEl);
            applyDynamicVars(defenderEl, params);
            spawnedAnims.push(playPreset(defenderEl, p, { duration, iterations }));
          }, start);
        });
        (config.css.owner ?? []).forEach(({ preset, start = 0, duration, iterations, ...params }) => {
          const p = CSS_PRESETS[preset];
          if (!p || !attackerEl) return;
          lastEnd = Math.max(lastEnd, start + duration);
          setTimeout(() => {
            captureCurrentTransform(attackerEl);
            applyDynamicVars(attackerEl, params);
            spawnedAnims.push(playPreset(attackerEl, p, { duration, iterations }));
          }, start);
        });
        setTimeout(() => {
          spawnedAnims.forEach(a => a?.cancel());
        }, lastEnd);
      }

      // DOM channel — spawner presets (dom_presets/). Same entry shape and
      // start-scheduling as the css block above; at the chain's real end
      // handles get finish()ed, not cancel()ed — pending spawns are cleared
      // but in-flight visuals self-remove. Hard removal is unmount-only
      // (clearAllDomSpawns). Contract: todo/css_animation_philosophy.txt.
      if (config.dom) {
        const enemyEl  = document.querySelector(`[data-character-id="${ENEMY_ID}"]`);
        const playerEl = document.querySelector(`[data-character-id="${MOCK_PLAYER.id}"]`);
        const attackerEl = attackerIsEnemy ? enemyEl : playerEl;
        const defenderEl = attackerIsEnemy ? playerEl : enemyEl;
        const spawnedHandles = [];
        let lastEnd = 0;
        (config.dom.target ?? []).forEach(({ preset, start = 0, duration, ...params }) => {
          if (!DOM_PRESETS[preset] || !defenderEl) return;
          lastEnd = Math.max(lastEnd, start + duration);
          setTimeout(() => {
            const h = playDomPreset(preset, defenderEl, { duration, ...params });
            if (h) spawnedHandles.push(h);
          }, start);
        });
        (config.dom.owner ?? []).forEach(({ preset, start = 0, duration, ...params }) => {
          if (!DOM_PRESETS[preset] || !attackerEl) return;
          lastEnd = Math.max(lastEnd, start + duration);
          setTimeout(() => {
            const h = playDomPreset(preset, attackerEl, { duration, ...params });
            if (h) spawnedHandles.push(h);
          }, start);
        });
        setTimeout(() => {
          spawnedHandles.forEach(h => h.finish());
        }, lastEnd);
      }

      if (config.sfx) {
        const sfxList = Array.isArray(config.sfx)
          ? config.sfx
          : [{ src: config.sfx, start: 0, volume: config.volume ?? 0.6 }];
        sfxList.forEach(({ src, start, delay, volume }) => {
          setTimeout(() => playBattleSfx(src, volume ?? config.volume ?? 0.6), start ?? delay ?? 0);
        });
      }
      if (config.pixi) {
        // Pixi channel — same shape as css/sfx: dispatch each named entry
        // at its start. Aimed at the defender (owner too: reactions play
        // entirely "at" the reactor). noFallback: unauthored names play
        // nothing, not the debug burst.
        const enemyEl = document.querySelector(`[data-character-id="${ENEMY_ID}"]`);
        if (enemyEl) {
          const er = enemyEl.getBoundingClientRect();
          const pos = { x: er.left + er.width / 2, y: er.top + er.height / 2 };
          config.pixi.forEach(({ name, start }) => {
            setTimeout(() => window.dispatchEvent(new CustomEvent('play-thumos-animation', {
              detail: { animType: name, target: pos, owner: pos, x: pos.x, y: pos.y, noFallback: true },
            })), start ?? 0);
          });
        }
      }
    }

    if (parsedJson !== null) {
      const inlineJson = parsedJson?.length > 0 ? parsedJson : undefined;
      const enemyEl  = document.querySelector(`[data-character-id="${ENEMY_ID}"]`);
      const playerEl = document.querySelector(`[data-character-id="${MOCK_PLAYER.id}"]`);
      // Same attacker/defender swap as the css block above — target is the
      // defender, owner is the attacker, whichever side that currently is.
      const attackerEl = attackerIsEnemy ? enemyEl : playerEl;
      const defenderEl = attackerIsEnemy ? playerEl : enemyEl;
      if (defenderEl) {
        const dr = defenderEl.getBoundingClientRect();
        const target = { x: dr.left + dr.width / 2, y: dr.top + dr.height / 2 };
        let owner = null;
        if (attackerEl) {
          const pr = attackerEl.getBoundingClientRect();
          owner = { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 };
        }
        window.dispatchEvent(new CustomEvent('play-thumos-animation', {
          detail: { animType: selected, target, owner, x: target.x, y: target.y, ...(inlineJson && { json: inlineJson }) },
        }));
      }
    }

  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f1a] text-white">

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-white/10 text-xs tracking-widest text-[#4da6ff] font-mono uppercase">
        VFX Editor
      </div>

      {/* Body — left panel + preview */}
      <div className="flex-1 flex min-h-0">

        {/* Left: JSON editor */}
        <div className="flex flex-col w-80 border-r border-white/10 min-h-0">
          <div className="flex-1 relative min-h-0">
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-[#0a0a14] text-[#a8d8ff] font-mono text-xs p-3 resize-none focus:outline-none leading-relaxed"
            />
          </div>
          {jsonError && (
            <div className="flex-shrink-0 px-3 py-2 bg-red-900/40 border-t border-red-500/40 text-red-400 font-mono text-xs">
              {jsonError}
            </div>
          )}
        </div>

        {/* Right: preview — enemy on top, player portrait on bottom */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Top: enemy target */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div
                data-character-id={ENEMY_ID}
                className={`${ENEMY_CARD_CLASS[targetSize]} relative rounded-lg border-2 overflow-hidden`}
                style={{
                  borderColor: '#000000',
                  boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                }}
              >
                <img src={ENEMY_WOLF_SAMURAI} alt="wolf samurai" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Bottom: player portrait */}
          <div className="flex-shrink-0 flex items-end justify-center pb-6">
            <PlayerPortrait
              player={MOCK_PLAYER}
              floatingNumbers={floatingNumbers}
            />
          </div>

        </div>

      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3 px-6 py-5 border-t border-white/10">

        {/* Enemy size toggle */}
        <div className="flex gap-1">
          {TARGET_SIZES.map(size => (
            <button
              key={size}
              onClick={() => setTargetSize(size)}
              className={`px-3 py-1 text-xs font-mono rounded tracking-widest transition-colors ${
                targetSize === size
                  ? 'bg-[#4da6ff] text-[#0f0f1a] font-bold'
                  : 'bg-[#1a1a2e] border border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Animation picker + play */}
        <div className="flex items-center gap-4">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="bg-[#1a1a2e] border border-white/20 text-white text-sm rounded px-3 py-2 font-mono focus:outline-none focus:border-[#4da6ff]"
          >
            {ANIM_KEYS.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          {ANIMATION_DEVELOPMENT_KEYS.length > 0 && (
            <select
              value={ANIMATION_DEVELOPMENT_KEYS.includes(selected) ? selected : ''}
              onChange={e => e.target.value && setSelected(e.target.value)}
              className="bg-[#1a1a2e] border border-[#4da6ff]/50 text-[#4da6ff] text-sm rounded px-3 py-2 font-mono focus:outline-none focus:border-[#4da6ff]"
            >
              <option value="" disabled>DEV...</option>
              {ANIMATION_DEVELOPMENT_KEYS.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setAttackerIsEnemy(v => !v)}
            className={`px-3 py-2 text-xs font-mono rounded tracking-widest transition-colors ${
              attackerIsEnemy
                ? 'bg-[#e94560] text-white font-bold'
                : 'bg-[#1a1a2e] border border-white/20 text-white/60 hover:text-white'
            }`}
          >
            ENEMY ATTACKS {attackerIsEnemy ? 'ON' : 'OFF'}
          </button>

          {Object.keys(REACTIONS).map(key => (
            <div key={key} className="flex items-center gap-1">
              <button
                onClick={() => setReaction(r => r === key ? null : key)}
                className={`px-3 py-2 text-xs font-mono rounded tracking-widest transition-colors ${
                  reaction === key
                    ? 'bg-white text-[#0f0f1a] font-bold'
                    : 'bg-[#1a1a2e] border border-white/20 text-white/60 hover:text-white'
                }`}
              >
                {key.toUpperCase()} {reaction === key ? 'ON' : 'OFF'}
              </button>
              <select
                value={reactionAnims[key]}
                onChange={e => setReactionAnims(prev => ({ ...prev, [key]: e.target.value }))}
                className={`bg-[#1a1a2e] border border-white/20 text-xs rounded px-1 py-2 font-mono focus:outline-none focus:border-[#4da6ff] max-w-36 ${
                  reaction === key ? 'text-white' : 'text-white/40'
                }`}
              >
                {ANIM_KEYS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={handlePlay}
            className="px-6 py-2 bg-[#4da6ff] hover:bg-[#6ab8ff] text-[#0f0f1a] font-bold text-sm rounded tracking-widest transition-colors"
          >
            PLAY
          </button>
        </div>

      </div>

      <EffectsLayer />
    </div>
  );
}
