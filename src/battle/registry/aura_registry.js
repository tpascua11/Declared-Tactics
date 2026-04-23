// ============================================================
//  AURA REGISTRY
//  Maps preset names to { color, secondary, style, intensity }
//  style maps to a CSS animation class in animations.css:
//    'wisp'     → slow, soft upward drift
//    'frost'    → medium speed, crystalline shimmer
//    'flame'    → fast upward flow, flickering
//    'electric' → rapid jagged pulse
//  This registry is UI-only — battle logic never touches it.
// ============================================================

export const AURA_REGISTRY = {
  turtle_patient: { color: '#38bdf8', secondary: '#818cf8', style: 'wisp',     intensity: 0.40 },
  flame_burst:    { color: '#ef4444', secondary: '#f97316', style: 'flame',    intensity: 1.00 },
  fire_intense:   { color: '#f97316', secondary: '#ef4444', style: 'flame',    intensity: 0.90 },
  electric:       { color: '#818cf8', secondary: '#facc15', style: 'electric', intensity: 0.80 },
  frost_wisp:     { color: '#7dd3fc', secondary: '#818cf8', style: 'wisp',     intensity: 0.45 },
  frost_burst:    { color: '#38bdf8', secondary: '#e0f2fe', style: 'frost',    intensity: 0.85 },
};
