// ============================================================
//  Animation Registry
//  Maps animation name → config used by BattleScreen.
//  Cards reference these by name via their `animation` field.
//
//  To add a new effect:
//    1. Add a @keyframes + .animate-* class to animations.css
//    2. Add an entry here
//    3. Set `animation: 'your_key'` on the card
// ============================================================

// Resolves a sound file from the SOUND EFFECTS folder by name.
// Webpack bundles the entire folder so any file dropped in is instantly available —
// no entry in assets/index.js needed.
export const sfx = (name) => { const m = require(`../assets/SOUND EFFECTS/${name}`); return m.default ?? m; };

// Web Audio API — pre-decodes audio into PCM buffers for zero-latency playback.
// HTMLAudioElement.load() only fetches; the browser still decodes on first play.
// decodeAudioData() does the full decode upfront so start() is instant.
const _ctx = new (window.AudioContext || window.webkitAudioContext)();
const _bufferCache = new Map();

export function preloadSfx(src) {
  if (_bufferCache.has(src)) return;
  const p = fetch(src)
    .then(r => r.arrayBuffer())
    .then(ab => _ctx.decodeAudioData(ab))
    .then(buf => { _bufferCache.set(src, buf); })
    .catch(() => {});
  _bufferCache.set(src, p);
}

export function playSfxBuffer(src, volume = 0.6) {
  const buf = _bufferCache.get(src);
  if (!buf || buf instanceof Promise) return;
  const source = _ctx.createBufferSource();
  source.buffer = buf;
  const gain = _ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(_ctx.destination);
  source.start();
}

export const ANIMATIONS = {
  shake: {
    cssClass: 'animate-shake',
    duration: 350,
    sfx: sfx('ATTACK_1.wav'),
    volume: 0.6,
    floatingNumber: { color: '#ff4444' },
    // sprite: null,    // future: { sheet, frames, fps }
    // particles: null, // future: { preset: 'ice_burst' }
  },
  heavy_slice: {
    cssClass: 'animate-heavy_shake',
    duration: 500,
    sfx: sfx('SLICE_1.wav'),
    volume: 0.7,
    floatingNumber: { color: '#ff4444' },
  },
  stream_slash: {
    cssClass: 'animate-heavy_shake',
    duration: 500,
    sfx: [
      { src: sfx('STREAM_SLASH.wav'), delay: 125,   volume: 0.5 },
      { src: sfx('HARD_SWING_1.wav'), delay: 0, volume: 0.5 },
    ],
    volume: 0.7,
    floatingNumber: { color: '#449bff' },
  },
  dual_heavy_slice: {
    cssClass: 'animate-heavy_shake',
    duration: 500,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('HARD_SWING_1.wav'), delay: 180, volume: 0.5 },
    ],
    floatingNumber: [
      { color: '#ff4444', delay: 0,   split: 0.5 },
      { color: '#ff4444', delay: 280, split: 0.5 },
    ],
  },
  shake_magic: {
    cssClass: 'animate-shake',
    duration: 350,
    sfx: sfx('LASER_1.wav'),
    volume: 0.6,
    floatingNumber: { color: '#a78bfa' },
  },
  fizzle: {
    cssClass: 'animate-fizzle',
    duration: 600,
    sfx: null,
    floatingNumber: null,
  },
  wiggle: {
    cssClass: 'animate-wiggle',
    duration: 550,
    sfx: null,
    floatingNumber: null,
  },
  sidestep: {
    cssClass: 'animate-sidestep',
    duration: 550,
    sfx: sfx('DODGE_1.wav'),
    volume: 0.6,
    floatingNumber: null,
  },
  run_circle: {
    cssClass: 'animate-run_circle',
    duration: 700,
    //battleDelay: 2000,
    sfx: sfx('BUFF_1.wav'), 
    floatingNumber: null,
  },
  heal: {
    cssClass: 'animate-heal',
    duration: 700,  
    sfx: [
      { src: sfx('REGEN_2.wav'), delay: 0,   volume: 0.7 },
    ], 
    floatingNumber: null,
  },
  buff: {
    cssClass: 'animate-buff',
    duration: 650,
    sfx: [
      { src: sfx('BUFF_2.wav'), delay: 0,   volume: 0.7 },
    ], 
    floatingNumber: null,
  },
  sumurai_sheath: {
    cssClass: 'animate-buff',
    duration: 650,
    sfx: [
      { src: sfx('SHEATH.wav'), delay: 0,   volume: 0.7 },
    ], 
    floatingNumber: null,
  },
  burn: {
    cssClass: 'animate-burn',
    duration: 750,
    sfx: sfx('LASER_1.wav'),
    volume: 0.8,
    floatingNumber: { color: '#f97316' },
  },
  ice_slash: {
    cssClass: 'animate-ice_shake',
    duration: 500,
    sfx: [
      { src: sfx('ICE'), delay: 0,   volume: 0.7 },
      { src: sfx('ICE'), delay: 200, volume: 0.5 },
    ],
    floatingNumber: { color: '#7dd3fc' },
  },
  flame_strike: {
    cssClass: 'animate-burn',
    duration: 750,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('FLAMES'), delay: 300, volume: 0.8 },
    ],
    floatingNumber: { color: '#f97316' },
  },
  green_marching_ants: {
    cssClass: 'animate-green-marching-ants',
    duration: 1000,
    sfx: [
      { src: sfx('REGEN_3.wav'), delay: 0,   volume: 0.7 },
    ], 
    floatingNumber: null,
  },
  enemy_exit: {
    cssClass: 'animate-enemy_exit',
    duration: 500,
    sfx: null,
    floatingNumber: null,
  },
  enemy_enter: {
    cssClass: 'animate-enemy_enter',
    duration: 700,
    sfx: null,
    floatingNumber: null,
  },
  // ── Coming soon ──────────────────────────────────────────
  // slam:   { cssClass: 'animate-slam',   duration: 500, sfx: null },
};

// Preload every sfx referenced in the registry at module load time.
Object.values(ANIMATIONS).forEach(({ sfx: s }) => {
  if (!s) return;
  (Array.isArray(s) ? s : [{ src: s }]).forEach(({ src }) => preloadSfx(src));
});

// UI sounds used directly in BattleScreen (not tied to an animation entry).
['BATTLE_NEXT.wav', 'FUN_SELECT_2.wav', 'SELECT.wav', 'DESELECT.wav', 'START_1.wav']
  .forEach(name => preloadSfx(sfx(name)));
