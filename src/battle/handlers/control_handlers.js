// ============================================================
//  CONTROL HANDLERS
//  Crowd-control tags that gate whether a queued action fires at all,
//  as opposed to modifying its damage/speed once it does.
// ============================================================

import { registerTag } from '../registry/battle_registry';

// ── ACTION LOCKED ──
// One-shot debuff: cancels the owner's next queued action before it executes.
// PRE_ACTION returning cancelled:true makes ExecuteAction fizzle the action;
// ActionCleanup still pops it off owner.queue as normal, so the following
// queued action becomes front-of-queue on the next step untouched.

function ActionLockedPreActionHandler(context, tag) {
  const { action, owner } = context;
  return {
    cancelled: true,
    consumed: true,
    logs: [{ msg: `🔒 ${owner.name}'s ${action.name} was locked and failed to trigger!`, type: 'fizzle' }],
  };
}

registerTag('ACTION_LOCKED', {
  phases: ['PRE_ACTION'],
  status_type: 'debuff',
  handlers: {
    PRE_ACTION: ActionLockedPreActionHandler,
  },
});
