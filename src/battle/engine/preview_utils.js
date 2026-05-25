// ============================================================
//  PREVIEW UTILS
//  Pure functions that answer "what would happen at execution
//  time?" — used by UI components to preview speed and cost.
// ============================================================

import { battle_registry } from '../registry/battle_registry';
import '../handlers';

// Returns the resource level available when the card at `mySlotIndex` executes.
// Player cards always execute in slot order, so only slots before mySlotIndex count.
// Pass skipIndex to exclude a specific slot (e.g. during cascade validation).
export function effectiveResourceAtExecution(resourceType, mySlotIndex, queue, resources, skipIndex = -1) {
  let effect = resources?.[resourceType]?.current ?? 0;
  for (let i = 0; i < mySlotIndex; i++) {
    if (i === skipIndex) continue;
    const slot = queue[i];
    if (!slot) continue;
    effect -= slot.cost?.[resourceType] ?? 0;
    for (const tag of slot.tags?.self ?? []) {
      const entry = battle_registry[tag.tag_name];
      const delta = entry?.resource_delta?.(tag);
      if (delta?.type === resourceType) effect += delta.amount ?? 0;
    }
  }
  return effect;
}

// Returns the projected action_count penalty a card at slotIndex would face at execution,
// accounting for ignores_slot_penalty on earlier queued cards.
export function projectedSpeedPenalty(queue, slotIndex) {
  let penalty = 0;
  for (let i = 0; i < slotIndex; i++) {
    const slot = queue[i];
    if (slot && !slot.ignores_slot_penalty) penalty += 20;
  }
  return penalty;
}

// Returns the projected speed influence for a card at slotIndex —
// combines current pool SPEED_CALC tags with self tags from earlier queued cards.
// Simulates IMBUE consumption per slot so action-mode boosts (e.g. SPEED_BOOST from
// Shinsoku) are correctly shown only until the first non-SPEED_ACTION card consumes them.
export function projectedSpeedInfluence(tagPool, queue, slotIndex) {
  let tags = (tagPool ?? []).map(t => ({ ...t }));

  for (let i = 0; i < slotIndex; i++) {
    const slot = queue[i];
    if (!slot) continue;

    // Simulate IMBUE: consume tags that this slot's action would spend
    const fakePayload = { properties: [...(slot.properties ?? [])] };
    tags = tags.filter(tag => {
      const entry = battle_registry[tag.tag_name];
      if (!entry?.phases?.includes('IMBUE')) return true;
      const result = entry.handlers['IMBUE'](fakePayload, null, tag);
      return !result.consumed;
    });

    // Apply self tags from this slot (IMBUE runs before SELF TAGS at runtime)
    for (const tag of slot.tags?.self ?? []) {
      const entry = battle_registry[tag.tag_name];
      if (!entry?.phases?.includes('SPEED_CALC')) continue;
      if (entry.onApply) {
        entry.onApply(tags, { ...tag, tier: 'condition' });
      } else {
        tags.push(tag);
      }
    }
  }

  let speedMod = 0;
  for (const tag of tags) {
    const entry = battle_registry[tag.tag_name];
    if (entry?.phases?.includes('SPEED_CALC')) {
      // action_count: slotIndex lets first-action guards (e.g. PARALYSIS) preview
      // correctly — penalty shows for slot 0 only, not all slots.
      speedMod += entry.handlers['SPEED_CALC'](null, { action_count: slotIndex }, tag) ?? 0;
    }
  }
  return speedMod;
}
