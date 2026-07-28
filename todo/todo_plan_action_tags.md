ACTION TAGS — PLAN
===================

CONCEPT
-------
Action tags are not a new system. They're the same self-tag application
(`addTagToPool`) an action already does, just offered at an earlier point
in the timeline so the tag can affect the action's own resolution.

- Applied early (top of `ExecuteAction`, before `PRE_ACTION`) instead of
  late (after `POST_ATTACK`, where normal `action.tags.self` lands today).
- Goes through the exact same `addTagToPool` call — same `onApply`
  stacking, same registry lookup. Treat it as "applied by an earlier
  action" for the duration of this action.
- Whether it lingers after (a real Mend/Burn) or disappears immediately
  is decided per tag_name, same as any tag — via whatever `phases`/`reset`
  it declares. Not a forced-ephemeral rule.
- No marker field, no special engine filter needed for the general case.


PIECE 1 — SPEED_CALC (separate, already easy)
----------------------------------------------
`SpeedCheckAllAvailableActions` (battle_engine.js:72) only loops
`character.active_tag_pool` today. Add a second loop over the action's
own early tags, using the same `battle_registry[tag.tag_name]` lookup and
the same `SPEED_CALC` handler dispatch. No new registry category.


PIECE 2 — EARLY APPLICATION IN ExecuteAction
---------------------------------------------
- New bucket on action tag data: `action.tags.action` (name TBD), separate
  from the existing late `action.tags.self`.
- At the very top of `ExecuteAction` (before `PRE_ACTION`, battle_engine.js:382),
  push `action.tags.action` through `addTagToPool` onto `owner.active_tag_pool`
  — same call normal self tags use later.
- Everything downstream (PRE_ACTION, IMBUE, INJECT_MULT, INJECT_FLAT,
  resolveSelfTags's owner_has check, POST_ATTACK) sees these tags as real,
  ordinary pool contents. No special-casing needed — this is the point of
  treating them as "applied by an earlier action."


PIECE 3 — ACTION_END PHASE
----------------------------
- New phase, `ACTION_END`, same shape as every other phase runner
  (loop tag_pool, check `entry.phases.includes('ACTION_END')`, run handler,
  drop if `consumed: true`).
- Runs at the very end of `ExecuteAction`, right before it returns.
- Only tag_names meant to be action-scoped declare `ACTION_END` with a
  handler that always returns `consumed: true`. Persistent tags (real
  MOMENTUM, real SPEED_BOOST) never declare it — they fall through
  untouched, same as they do in every other phase today.


KNOWN OPEN EDGE CASE (not blocking, revisit later)
----------------------------------------------------
If the same tag_name is used BOTH as a real persistent grant AND as an
action-tag, `onApply` stacking merges them into one object (e.g. shared
`stack_count`). The registry entry's `phases` list is keyed by tag_name,
not per-instance — so you can't have "this instance expires at ACTION_END,
that instance doesn't" for the same name. No existing removal mechanism
in the engine does partial-stack decrement (consumed/reset always drop
the whole tag object, never part of a stack — checked battle_engine.js
runPhaseOnTurnStart/EndOfTurn/TurnResultCleanup).
Simplest way out: never reuse a persistent tag_name as an action-tag name.
Decide this only if/when it actually comes up.
