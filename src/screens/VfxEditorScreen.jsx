// ============================================================
//  VfxEditorScreen — VFX authoring / preview tool
// ============================================================

import { useRef, useState, useEffect } from 'react';
import { PORTRAIT_SUMURAI, ENEMY_WOLF_SUMURAI } from '../assets';
import { ANIMATIONS, playBattleSfx } from '../vfx/animationRegistry';
import PIXI_DATA from '../vfx/pixi_data';
import PlayerPortrait from '../components/battle/PlayerPortrait';
import EffectsLayer from '../components/battle/EffectsLayer';

const ANIM_KEYS = Object.keys(ANIMATIONS);

const MOCK_PLAYER = {
  id: 'editor_player',
  name: 'Vrax',
  class_id: 'FOX_SUMMURAI',
  health: 80,
  max_health: 100,
  temp_hp: 0,
  portrait: PORTRAIT_SUMURAI,
  active_tag_pool: [],
};

const TARGET_SIZES = ['player', 'small', 'medium', 'large'];
const ENEMY_CARD_CLASS = {
  small:  'w-32 h-48',
  medium: 'w-40 h-60',
  large:  'w-48 h-72',
};

export default function VfxEditorScreen() {
  const [activeAnimations, setActiveAnimations] = useState({});
  const [floatingNumbers]                       = useState([]);
  const [selected, setSelected]                 = useState(ANIM_KEYS[0]);
  const [targetSize, setTargetSize]             = useState('player');
  const [jsonText, setJsonText]                 = useState('');
  const [jsonError, setJsonError]               = useState(null);
  const clearTimerRef = useRef(null);

  // Sync textarea when selected animation changes
  useEffect(() => {
    const data = PIXI_DATA[selected];
    setJsonText(JSON.stringify(data ?? [], null, 2));
    setJsonError(null);
  }, [selected]);

  function handleJsonChange(e) {
    setJsonText(e.target.value);
    setJsonError(null);
  }

  function handlePlay() {
    const config = ANIMATIONS[selected];
    clearTimeout(clearTimerRef.current);

    // Parse local JSON — use it for Pixi, leave the file untouched
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(jsonText);
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
      parsedJson = null;
    }

    if (config) {
      setActiveAnimations({ [MOCK_PLAYER.id]: { cssClass: config.cssClass, intensity: 1.0 } });
      if (config.sfx) {
        const sfxList = Array.isArray(config.sfx)
          ? config.sfx
          : [{ src: config.sfx, delay: 0, volume: config.volume ?? 0.6 }];
        sfxList.forEach(({ src, delay = 0, volume }) => {
          setTimeout(() => playBattleSfx(src, volume ?? config.volume ?? 0.6), delay);
        });
      }
    }

    if (parsedJson !== null) {
      const el = document.querySelector('[data-character-id="editor_player"]');
      if (el) {
        const r = el.getBoundingClientRect();
        const pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        window.dispatchEvent(new CustomEvent('play-thumos-animation', {
          detail: { ...pos, animType: selected, json: parsedJson },
        }));
      }
    }

    clearTimerRef.current = setTimeout(() => {
      setActiveAnimations({});
    }, config?.duration ?? 1000);
  }

  const anim = activeAnimations[MOCK_PLAYER.id];

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

        {/* Right: preview */}
        <div className="flex-1 flex items-center justify-center">
          {targetSize === 'player' ? (
            <PlayerPortrait
              player={MOCK_PLAYER}
              activeAnimations={activeAnimations}
              floatingNumbers={floatingNumbers}
            />
          ) : (
            <div className="relative">
              <div
                data-character-id="editor_player"
                className={`${ENEMY_CARD_CLASS[targetSize]} relative rounded-lg border-2 overflow-hidden ${anim?.cssClass ?? ''}`}
                style={{
                  '--anim-intensity': anim?.intensity ?? 1,
                  borderColor: '#333355',
                  boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                }}
              >
                <img src={ENEMY_WOLF_SUMURAI} alt="wolf sumurai" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3 px-6 py-5 border-t border-white/10">

        {/* Size toggle */}
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
