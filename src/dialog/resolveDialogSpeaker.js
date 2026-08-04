// Resolves a dialog line's { source, id } into a renderable speaker:
// name + portrait pulled from the same registries battle/map already use,
// so dialog never needs its own duplicate asset entries.

import { CLASS_REGISTRY } from '../data/classes/class_registry';
import { ENEMY_REGISTRY } from '../data/characters/enemy_registry';

// Default border/glow color per source — overridable per line via speaker.color.
const DEFAULT_COLOR = {
  class: '#4da6ff',
  enemy: '#e94560',
  narrator: '#8a9aab',
};

export function resolveDialogSpeaker(speaker) {
  if (!speaker) return null;
  const { source, id, side, name, color } = speaker;

  // Narrator has no character behind it — no registry lookup, no portrait,
  // no side (doesn't occupy either portrait slot).
  if (source === 'narrator') {
    return { id: 'narrator', side: null, name: null, portrait: null, color: color ?? DEFAULT_COLOR.narrator };
  }

  const registry = source === 'enemy' ? ENEMY_REGISTRY : CLASS_REGISTRY;
  const def = registry[id];
  const registryName = source === 'enemy' ? def?.name : def?.default_name;
  return {
    id,
    side: side ?? (source === 'enemy' ? 'right' : 'left'),
    name: name ?? registryName ?? id,
    portrait: def?.portrait ?? null,
    color: color ?? DEFAULT_COLOR[source] ?? '#f5d76e',
  };
}
