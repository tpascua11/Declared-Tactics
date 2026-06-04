// ============================================================
//  VfxEditorScreen — VFX authoring / preview tool
// ============================================================

import { useRef, useState } from 'react';
import { PORTRAIT_SUMURAI } from '../assets';
import { ANIMATIONS, playBattleSfx, sfx } from '../vfx/animationRegistry';
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

export default function VfxEditorScreen() {
  const [activeAnimations, setActiveAnimations] = useState({});
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [selected, setSelected] = useState(ANIM_KEYS[0]);
  const clearTimerRef = useRef(null);

  function handlePlay() {
    const config = ANIMATIONS[selected];
    if (!config) return;

    clearTimeout(clearTimerRef.current);

    // CSS
    setActiveAnimations({ [MOCK_PLAYER.id]: { cssClass: config.cssClass, intensity: 1.0 } });

    // SFX
    if (config.sfx) {
      const sfxList = Array.isArray(config.sfx)
        ? config.sfx
        : [{ src: config.sfx, delay: 0, volume: config.volume ?? 0.6 }];
      sfxList.forEach(({ src, delay = 0, volume }) => {
        setTimeout(() => playBattleSfx(src, volume ?? config.volume ?? 0.6), delay);
      });
    }

    // Pixi
    const el = document.querySelector(`[data-character-id="${MOCK_PLAYER.id}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      const pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      window.dispatchEvent(new CustomEvent('play-thumos-animation', { detail: { ...pos, animType: selected } }));
    }

    // Cleanup
    clearTimerRef.current = setTimeout(() => {
      setActiveAnimations({});
    }, config.duration);
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f1a] text-white">

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-white/10 text-xs tracking-widest text-[#4da6ff] font-mono uppercase">
        VFX Editor
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center">
        <PlayerPortrait
          player={MOCK_PLAYER}
          activeAnimations={activeAnimations}
          floatingNumbers={floatingNumbers}
        />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-6 py-5 border-t border-white/10">
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

      <EffectsLayer />
    </div>
  );
}
