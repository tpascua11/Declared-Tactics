// ============================================================
//  CLASS REGISTRY
//  Resolves portrait and card image keys to actual asset imports.
//  Class/card data files store string keys — never direct imports —
//  so the raw data is JSON-serializable and localStorage-safe.
//
//  To add a new class:
//    1. Define it in its own file with portrait/image as string keys
//    2. Import and add it to CLASS_LIST below
//    3. Ensure its portrait key exists in src/assets/index.js
// ============================================================

import * as ASSETS from '../../assets';
import { FIGHTER } from './fighter';
import { WIZARD } from './wizard';
import { SAMURAI } from './samurai';

const CLASS_LIST = [FIGHTER, WIZARD, SAMURAI];

function resolveClass(classDef) {
  return {
    ...classDef,
    portrait: ASSETS[classDef.portrait] ?? null,
    cards: classDef.cards
      .map(card => ({ ...card, image: ASSETS[card.image] ?? null }))
      .sort((a, b) => {
        const order = classDef.card_order;
        if (!order) return 0;
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        const aIdx = ai === -1 ? order.length : ai;
        const bIdx = bi === -1 ? order.length : bi;
        return aIdx - bIdx;
      }),
  };
}

export const CLASS_REGISTRY = Object.fromEntries(
  CLASS_LIST.map(c => [c.id, resolveClass(c)])
);
