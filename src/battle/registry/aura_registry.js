// ============================================================
//  AURA REGISTRY
//  Maps preset names to { color, secondary, style, intensity }
//  style maps to a CSS animation class in animations.css:
//    'wisp'     → slow, soft upward drift
//    'frost'    → medium speed, crystalline shimmer
//    'flame'    → fast upward flow, flickering
//    'electric'      → rapid jagged pulse
//    'electric-wisp' → soft idle crackle, low flash
//  This registry is UI-only — battle logic never touches it.
// ============================================================

export const AURA_REGISTRY = {
  turtle_patient: { color: '#38bdf8', secondary: '#818cf8', style: 'wisp',     intensity: 0.40 },
  flame_burst:    { color: '#ef4444', secondary: '#f97316', style: 'flame',    intensity: 1.00 },
  flame_ember:    { color: '#f97316', secondary: '#fbbf24', style: 'flame',    intensity: 0.28, particles: { count: 8, duration: 1.8, class: 'aura-ember-particle' } },
  fire_intense:   { color: '#f97316', secondary: '#ef4444', style: 'flame',    intensity: 0.90, particles: { count: 16, duration: 1.2, class: 'aura-ember-particle' } },
  fire_warm:      { color: '#f97316', secondary: '#ef4444', style: 'flame',    intensity: 0.50, particles: { count: 16, duration: 1.2, class: 'aura-ember-particle' } },
  electric:       { color: '#818cf8', secondary: '#facc15', style: 'electric', intensity: 0.80 },
  frost_wisp:     { color: '#7dd3fc', secondary: '#818cf8', style: 'wisp',     intensity: 0.45, particles: { count: 12, duration: 5.0, class: 'aura-frost-particle' } },
  frost_burst:    { color: '#38bdf8', secondary: '#e0f2fe', style: 'frost',    intensity: 0.85, particles: { count: 18, duration: 1.8, class: 'aura-frost-particle' } },
  lightning_wisp: { color: '#a78bfa', secondary: '#facc15', style: 'electric-wisp', intensity: 0.18, particles: { count: 6,  duration: 1.5, class: 'aura-lightning-particle' } },
  lightning_burst:   { color: '#818cf8', secondary: '#facc15', style: 'electric-burst',  intensity: 0.45, particles: { count: 18, duration: 0.8, class: 'aura-lightning-particle' } },
  lightning_particles:{ color: '#a78bfa', secondary: '#facc15', style: 'particles-only', intensity: 0.90, particles: { count: 22, duration: 0.7, class: 'aura-lightning-particle' } },
  water_particles:    { color: '#38bdf8', secondary: '#7dd3fc', style: 'particles-only', intensity: 0.70, particles: { count: 10, duration: 3.5, class: 'aura-frost-particle' } },
  nature_wisp:        { color: '#4ade80', secondary: '#86efac', style: 'wisp',           intensity: 0.25, particles: { count: 8,  duration: 4.0, class: 'aura-frost-particle' } },
  nature_surge:       { color: '#22c55e', secondary: '#4ade80', style: 'wisp',           intensity: 0.55, particles: { count: 14, duration: 2.5, class: 'aura-frost-particle' } },
  fire_wisp:          { color: '#f97316', secondary: '#fbbf24', style: 'flame',          intensity: 0.25, particles: { count: 8,  duration: 1.8, class: 'aura-ember-particle' } },
  fire_burst:         { color: '#ef4444', secondary: '#f97316', style: 'flame',          intensity: 0.90, particles: { count: 16, duration: 1.2, class: 'aura-ember-particle' } },
  reading:            { color: '#c4b5fd', secondary: '#f5f3ff', style: 'mist',           intensity: 0.55, particles: { count: 20, duration: 7.0, class: 'aura-frost-particle' } },
  lightning_frost_burst: { color: '#818cf8', secondary: '#38bdf8', style: 'electric-burst', intensity: 1.0,  particles: { count: 24, duration: 1.0, class: 'aura-frost-particle' } },
};
