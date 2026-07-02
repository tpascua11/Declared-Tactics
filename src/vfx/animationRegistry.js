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

import { getUiVolume, getSfxVolume } from '../hooks/useMusic';

// Resolves a sound file from the SOUND EFFECTS folder by name.
// Webpack bundles the entire folder so any file dropped in is instantly available —
// no entry in assets/index.js needed.
export const sfx = (name) => { const m = require(`../assets/Sound_Effects/${name}`); return m.default ?? m; };

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

export function playUiSfx(src, volume = 0.6) {
  playSfxBuffer(src, Math.min(1, volume * getUiVolume()));
}

export function playBattleSfx(src, volume = 0.6) {
  playSfxBuffer(src, Math.min(1, volume * getSfxVolume()));
}

export const playSelectSfx = () => playUiSfx(sfx('SELECT_2.wav'), 0.25);

// Old CSS-class-based animations, defined inline. Entries also present in
// animation_data/*.json are shadowed/overridden below and get deleted from
// here once every animation using them has migrated — see ANIMATIONS merge
// below. What remains here is either genuinely unused (orphaned — kept only
// because nothing has decided to delete it outright) or still shares a CSS
// class with something that IS staying (e.g. old_storm_strike/
// cool_storm_strike still reuse storm_strike's keyframes).
const LEGACY_ANIMATIONS = {
  // targetCssClass — applied to the target. ownerCssClass — applied to the attacker simultaneously (optional).
  shake: {
    targetCssClass:'animate-shake',
    duration: 350,
    sfx: sfx('ATTACK_1.wav'),
    volume: 0.6,
    floatingNumber: { color: '#ff4444' },
    // sprite: null,    // future: { sheet, frames, fps }
    // particles: null, // future: { preset: 'ice_burst' }
  },
  stream_slash_2: {
    targetCssClass:'animate-heavy_shake',
    duration: 500,
    sfx: [
      { src: sfx('STREAM_SLASH.wav'), delay: 125,   volume: 0.5 },
      { src: sfx('HARD_SWING_1.wav'), delay: 0, volume: 0.5 },
    ],
    volume: 0.7,
    floatingNumber: { color: '#449bff' },
  },
  shake_magic: {
    targetCssClass:'animate-shake',
    duration: 350,
    sfx: sfx('LASER_1.wav'),
    volume: 0.6,
    floatingNumber: { color: '#a78bfa' },
  },
  wiggle: {
    targetCssClass:'animate-wiggle',
    duration: 550,
    sfx: null,
    floatingNumber: null,
  },
  burn: {
    targetCssClass:'animate-burn',
    duration: 750,
    sfx: sfx('LASER_1.wav'),
    volume: 0.8,
    floatingNumber: { color: '#f97316' },
  },
  old_ice_slash: {
    targetCssClass:'animate-ice_shake',
    duration: 1000,
    sfx: [
      { src: sfx('STREAM_SLASH.wav'), delay: 25,   volume: 0.3 },
      { src: sfx('ICE'), delay: 100,   volume: 0.7 },
      { src: sfx('ICE'), delay: 200, volume: 0.5 },
      { src: sfx('ICE'), delay: 300, volume: 0.4 },
    ],
    floatingNumber: { color: '#7dd3fc' },
  },
  cool_storm_strike: {
    ownerCssClass: 'animate-cool_storm_strike_user',
    duration: 1600,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0,   volume: 0.4 },
      { src: sfx('HARD_SWING_1.wav'), delay: 25,  volume: 0.35 },
      { src: sfx('SWORD_SWING.wav'),  delay: 240, volume: 0.7 },
      { src: sfx('THUNDER.wav'),      delay: 720, volume: 1.0 },
    ],
    floatingNumber: { color: '#818cf8' },
  },
  old_storm_strike: {
    targetCssClass:'animate-storm_strike',
    ownerCssClass: 'animate-storm_strike_user',
    duration: 1100,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('THUNDER.wav'),     delay: 300, volume: 1.0 },
    ],
    floatingNumber: { color: '#818cf8' },
  },
  enemy_exit: {
    targetCssClass:'animate-enemy_exit',
    duration: 500,
    sfx: null,
    floatingNumber: null,
  },
  gatotsu_call_lightning: {
    targetCssClass:'animate-gatotsu_call_lightning',
    duration: 1400,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0,   volume: 0.9 },
      { src: sfx('SWORD_SWING.wav'),  delay: 450,  volume: 0.7 },
      { src: sfx('THUNDER.wav'),      delay: 700,  volume: 0.4 },
      { src: sfx('THUNDER.wav'),      delay: 780,  volume: 1.0 },
    ],
    duration: 1800,
    floatingNumber: { color: '#fde047' },
  },
  // ── Coming soon ──────────────────────────────────────────
  // slam:   { cssClass: 'animate-slam',   duration: 500, sfx: null },
};

// New-shape animations — one self-contained JSON per animation (duration,
// sfx, css.target/css.owner timelines referencing css_presets.js by name).
// Same require.context loader pattern as pixi_data.js. The only adjustment
// made here is resolving each sfx `src` from a bare filename to a real
// asset URL — JSON can't call require() itself, so this has to happen
// somewhere. Field names (`start` vs legacy `delay`) are left as authored;
// BattleScreen's SFX loop is the one place that reads either name.
const animationDataCtx = require.context('./animation_data', true, /\.json$/);
const JSON_ANIMATIONS = {};
animationDataCtx.keys().forEach(key => {
  const name = key.replace(/^.*\//, '').replace(/\.json$/, '');
  const raw = animationDataCtx(key);
  JSON_ANIMATIONS[name] = {
    ...raw,
    sfx: (raw.sfx ?? []).map(entry => ({ ...entry, src: sfx(entry.src) })),
  };
});

// JSON-sourced entries override legacy ones by name — migrated animations
// win, everything else still plays via the old CSS-class path for now.
export const ANIMATIONS = { ...LEGACY_ANIMATIONS, ...JSON_ANIMATIONS };

// Preload every sfx referenced in the registry at module load time.
Object.values(ANIMATIONS).forEach(({ sfx: s }) => {
  if (!s) return;
  (Array.isArray(s) ? s : [{ src: s }]).forEach(({ src }) => preloadSfx(src));
});

// UI sounds used directly in BattleScreen (not tied to an animation entry).
['BATTLE_NEXT.wav', 'FUN_SELECT_2.wav', 'SELECT.wav', 'SELECT_2.wav', 'DESELECT.wav', 'START_1.wav']
  .forEach(name => preloadSfx(sfx(name)));
