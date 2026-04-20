// ============================================================
//  PLAYER BUILDER
//  Creates a runtime player instance from a class definition.
// ============================================================

export function buildPlayer(classDef, { id = 'player', name, portrait } = {}) {
  return {
    id,
    name,
    portrait: portrait ?? classDef.portrait ?? null,
    victory_portrait: classDef.victory_portrait ?? null,
    icon: classDef.icon,
    faction: 'player',
    class_id: classDef.id,
    health: classDef.base_health,
    max_health: classDef.base_health,
    temp_hp: 0,
    base_speed: classDef.base_speed,
    resources: Object.fromEntries(
      classDef.resources.map(r => [r.type, { current: r.starting, max: r.max }])
    ),
    total_action_slots: classDef.total_action_slots,
    action_count: 0,
    active_tag_pool: [...classDef.permanent_tags],
    queue: [],
    // Store these so START_BATTLE can inject them
    combat_start_tags: [...classDef.combat_start_tags],
    permanent_tags: [...classDef.permanent_tags],
    cards: classDef.cards,
    ...(classDef.extra_fields ?? {}),
  };
}
