// ============================================================
//  DialogEditorScreen — dialog authoring / preview tool
//  ?dialog query param, same convention as VfxEditorScreen (?editor)
// ============================================================

import { useState } from 'react';
import { DIALOG_REGISTRY } from '../data/dialogs/dialog_registry';
import DialogModal from '../dialog/DialogModal';

const DIALOG_KEYS = Object.keys(DIALOG_REGISTRY);

export default function DialogEditorScreen() {
  const [selected, setSelected] = useState(DIALOG_KEYS[0]);
  const [playKey, setPlayKey] = useState(0);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a12',
      color: '#cfe3ee',
      fontFamily: "'Courier New', monospace",
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'relative', zIndex: 301,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: '#0a0a12',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <span style={{ color: '#f5d76e', letterSpacing: 2 }}>DIALOG EDITOR</span>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ background: '#111', color: '#cfe3ee', border: '1px solid #333', padding: '4px 8px' }}
        >
          {DIALOG_KEYS.map(key => <option key={key} value={key}>{key}</option>)}
        </select>
        <button
          onClick={() => setPlayKey(k => k + 1)}
          style={{ background: '#1a2a3a', color: '#cfe3ee', border: '1px solid #4da6ff55', padding: '4px 12px', cursor: 'pointer' }}
        >
          ▶ Replay
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {selected && (
          <DialogModal
            key={`${selected}-${playKey}`}
            dialog={DIALOG_REGISTRY[selected]}
            onClose={() => {}}
          />
        )}
      </div>
    </div>
  );
}
