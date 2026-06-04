// ============================================================
//  VfxEditorScreen — VFX authoring / preview tool
// ============================================================

import { useState } from 'react';
import { PORTRAIT_SUMURAI } from '../assets';
import PlayerPortrait from '../components/battle/PlayerPortrait';
import EffectsLayer from '../components/battle/EffectsLayer';

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

      <EffectsLayer />
    </div>
  );
}
