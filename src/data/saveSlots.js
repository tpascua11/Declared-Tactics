// Save slots: design in todo/old/world_data_design.md ("Save slots"). Only file that knows storage key names.

export const SLOT_COUNT = 10;
const DEFAULT_SLOT = 1;
const SLOT_KEY_PREFIX = 'daq_save_';
const ACTIVE_SLOT_KEY = 'daq_active_slot';
const LEGACY_KEY = 'daq_player';

const slotKey = (slot) => `${SLOT_KEY_PREFIX}${slot}`;

export function getActiveSlot() {
  try {
    const slot = Number(localStorage.getItem(ACTIVE_SLOT_KEY));
    return Number.isInteger(slot) && slot >= 1 && slot <= SLOT_COUNT ? slot : DEFAULT_SLOT;
  } catch {
    return DEFAULT_SLOT;
  }
}

export function setActiveSlot(slot) {
  try {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(slot));
  } catch {
    // storage unavailable — fail silently
  }
}

export function readSlot(slot) {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSlot(slot, saveData) {
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(saveData));
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function clearSlot(slot) {
  try {
    localStorage.removeItem(slotKey(slot));
  } catch {
    // storage unavailable — fail silently
  }
}

export const listSlots = () =>
  Array.from({ length: SLOT_COUNT }, (_, i) => ({ slot: i + 1, save: readSlot(i + 1) }));

// One-time: moves the pre-slot single save into slot 1 if that slot is empty,
// then removes it so deleting slot 1 later cannot resurrect it.
export function importLegacySave() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    if (readSlot(DEFAULT_SLOT) === null) {
      localStorage.setItem(slotKey(DEFAULT_SLOT), raw);
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // storage unavailable — fail silently
  }
}
