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
    duration: 500,
    //battleDelay: 2000,
    sfx: sfx('BUFF_1.wav'),
    floatingNumber: null,
  },
  speed_dash: {
    cssClass: 'animate-speed_dash',
    duration: 750,
    sfx: sfx('SPEED_2.wav'),
    volume: 0.7,
    floatingNumber: null,
  },
  speed_dash_player: {
    cssClass: 'animate-speed_dash_player',
    duration: 750,
    sfx: sfx('SPEED_2.wav'),
    volume: 0.7,
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
  harai: {
    cssClass: 'animate-harai',
    duration: 500,
    sfx: [
      { src: sfx('CLING_1.wav'), delay: 0, volume: 0.4 },
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.4 },
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
    duration: 1000,
    sfx: [
      { src: sfx('STREAM_SLASH.wav'), delay: 25,   volume: 0.3 },
      { src: sfx('ICE'), delay: 100,   volume: 0.7 },
      { src: sfx('ICE'), delay: 200, volume: 0.5 },
      { src: sfx('ICE'), delay: 300, volume: 0.4 },
    ],
    floatingNumber: { color: '#7dd3fc' },
  },
  flame_strike: {
    cssClass: 'animate-flame_strike',
    duration: 1200,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('FLAMES'), delay: 300, volume: 0.8 },
    ],
    floatingNumber: { color: '#f97316' },
  },
  tri_ice_slash: {
    cssClass: 'animate-tri_ice_slash',
    duration: 2000,
    sfx: [
      { src: sfx('STREAM_SLASH.wav'), delay: 0,    volume: 0.3 },
      { src: sfx('ICE'),              delay: 100,  volume: 0.7 },
      { src: sfx('ICE'),              delay: 200,  volume: 0.5 },
      { src: sfx('STREAM_SLASH.wav'), delay: 400,  volume: 0.3 },
      { src: sfx('ICE'),              delay: 490,  volume: 0.7 },
      { src: sfx('ICE'),              delay: 580,  volume: 0.5 },
      { src: sfx('STREAM_SLASH.wav'), delay: 780,  volume: 0.35 },
      { src: sfx('ICE'),              delay: 860,  volume: 0.8 },
      { src: sfx('ICE'),              delay: 960,  volume: 0.65 },
      { src: sfx('ICE'),              delay: 1060, volume: 0.5 },
    ],
    floatingNumber: [
      { color: '#7dd3fc', delay: 0,   split: 0.34 },
      { color: '#7dd3fc', delay: 400, split: 0.33 },
      { color: '#7dd3fc', delay: 780, split: 0.33 },
    ],
  },
  cross_flame_strike: {
    cssClass: 'animate-cross_flame_strike',
    duration: 1600,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('SWORD_SWING.wav'), delay: 25,  volume: 0.6 },
      { src: sfx('FLAMES'),          delay: 280, volume: 0.8 },
      { src: sfx('FLAMES'),          delay: 320, volume: 0.7 },
    ],
    floatingNumber: { color: '#f97316' },
  },
  dual_flame_strike: {
    cssClass: 'animate-dual_flame_strike',
    duration: 2000,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,    volume: 0.7 },
      { src: sfx('FLAMES'),          delay: 300,  volume: 0.8 },
      { src: sfx('SWORD_SWING.wav'), delay: 700,  volume: 0.7 },
      { src: sfx('FLAMES'),          delay: 1000, volume: 0.9 },
    ],
    floatingNumber: [
      { color: '#f97316', delay: 0,   split: 0.5 },
      { color: '#f97316', delay: 700, split: 0.5 },
    ],
  },
  storm_strike: {
    cssClass: 'animate-storm_strike',
    duration: 1100,
    sfx: [
      { src: sfx('SWORD_SWING.wav'), delay: 0,   volume: 0.7 },
      { src: sfx('THUNDER.wav'),     delay: 300, volume: 1.0 },
    ],
    floatingNumber: { color: '#818cf8' },
  },
  green_marching_ants: {
    cssClass: 'animate-green-marching-ants',
    duration: 1000,
    sfx: [
      { src: sfx('REGEN_3.wav'), delay: 0,   volume: 0.31 },
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
  gatotsu_shock: {
    cssClass: 'animate-gatotsu_shock',
    duration: 1400,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0,   volume: 0.9 },
      { src: sfx('THUNDER.wav'),      delay: 420,  volume: 0.5 },
      { src: sfx('THUNDER.wav'),      delay: 730,  volume: 0.8 },
    ],
    floatingNumber: { color: '#818cf8' },
  },
  gatotsu_call_lightning: {
    cssClass: 'animate-gatotsu_call_lightning',
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
  gatotsu_2: {
    cssClass: 'animate-gatotsu_2',
    duration: 750,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0,  volume: 0.9 },
    ],
    floatingNumber: { color: '#e2e8f0' },
  },
  gatotsu: {
    cssClass: 'animate-gatotsu',
    duration: 550,
    sfx: [
      { src: sfx('HARD_SWING_1.wav'), delay: 0, volume: 0.8 },
    ],
    floatingNumber: { color: '#e2e8f0' },
  },
  kuzu_ryusen: {
    cssClass: 'animate-kuzu_ryusen',
    duration: 1400,
    sfx: [
      { src: sfx('SLICE_1.wav'),      delay: 0,    volume: 0.5  },
      { src: sfx('SLICE_1.wav'),      delay: 154,  volume: 0.5  },
      { src: sfx('SLICE_1.wav'),      delay: 308,  volume: 0.55 },
      { src: sfx('SLICE_1.wav'),      delay: 462,  volume: 0.55 },
      { src: sfx('SLICE_1.wav'),      delay: 616,  volume: 0.6  },
      { src: sfx('SLICE_1.wav'),      delay: 770,  volume: 0.6  },
      { src: sfx('SLICE_1.wav'),      delay: 924,  volume: 0.65 },
      { src: sfx('SLICE_1.wav'),      delay: 1078, volume: 0.65 },
      { src: sfx('HARD_SWING_1.wav'), delay: 1190, volume: 0.8  },
    ],
    floatingNumber: { color: '#ff4444' },
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
['BATTLE_NEXT.wav', 'FUN_SELECT_2.wav', 'SELECT.wav', 'SELECT_2.wav', 'DESELECT.wav', 'START_1.wav']
  .forEach(name => preloadSfx(sfx(name)));
