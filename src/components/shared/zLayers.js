// ============================================================
//  zLayers — single source of truth for GLOBAL stacking order.
//
//  Two kinds of z-index exist in this codebase:
//
//  1. GLOBAL layers (this file): elements that compete across the
//     whole screen — fixed overlays, portals, the Pixi canvas, and
//     the top-level battle zones. Always use a named constant from
//     here; never hardcode a global z-index.
//
//  2. LOCAL stacking: ordering *inside* one component's own
//     stacking context (HP bar over portrait art, scanlines over
//     card art). Keep those as small literals (0–5) in the
//     component — they cannot interact with global layers.
//
//  A parent with a z-index TRAPS its children: a child's z-index
//  only counts inside that parent's stacking context. If a child
//  must reach a global layer (e.g. the defeat-screen restart strip),
//  lift only that child, not its ancestors — otherwise the ancestor's
//  whole subtree escapes layers it should still sit under (e.g. the
//  result-dim overlay). See Hand.jsx's button-strip wrapper.
// ============================================================

export const Z = {
  QUEUE_ROW:   10, // BattleQueue timeline row — lowest battle band
  CARDS:       20, // battlefield entities: player portrait, enemy cards
  CARD_ACTIVE: 30, // a battlefield card mid-animation / stepped forward
  VFX:        100, // Pixi effects canvas (EffectsLayer) — draws on top of the battlefield
  TARGETING:  200, // targeting-line SVG, action announcement
  HAND_UI:    300, // whole Hand section: buttons, cards, tooltips — UI above the battlefield
  RESULT:     400, // VICTORY/DEFEATED text + dark backdrop
  RESULT_UI:  450, // interactive/readable elements above the result dim (retry buttons, defeat tip)
  MODAL:      500, // guide/settings modals, full-screen transitions
};
