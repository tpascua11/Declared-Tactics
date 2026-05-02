import { useMusicVolume } from '../../hooks/useMusic';

export default function SettingsModal({ onClose }) {
  const [musicVolume, setMusicVolume] = useMusicVolume();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#080c14',
          border: '1px solid rgba(77,166,255,0.2)',
          borderRadius: 10,
          padding: '32px 40px',
          minWidth: 340,
          fontFamily: "'Courier New', monospace",
          color: '#dde',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 13, letterSpacing: 4, color: '#4da6ff', fontWeight: 'bold', marginBottom: 28 }}>
          SETTINGS
        </div>

        {/* Music Volume */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, color: '#8aaabb' }}>MUSIC VOLUME</span>
            <span style={{ fontSize: 11, color: '#4da6ff', minWidth: 32, textAlign: 'right' }}>
              {Math.round(musicVolume * 100)}
            </span>
          </div>
          <input
            type="range" min="0" max="1.2" step="0.05"
            value={musicVolume}
            onChange={e => setMusicVolume(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#4da6ff', cursor: 'pointer' }}
          />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            marginTop: 32,
            width: '100%',
            padding: '10px 0',
            border: '1px solid rgba(77,166,255,0.2)',
            borderRadius: 6,
            background: 'transparent',
            color: '#4da6ff',
            fontSize: 11,
            letterSpacing: 3,
            cursor: 'pointer',
            fontFamily: "'Courier New', monospace",
            fontWeight: 'bold',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
