// ============================================================
//  fuseDeflect — runtime fusion of a deflect animation into an
//  attack animation, for when the target deflects the hit
//  (DEFLECT flag). Not pre-authored per attack: the attack's full
//  timeline (sfx + css, impact included) plays untouched, and the
//  deflect's sfx + target css are layered ON TOP at each impact time
//  — the hit lands, and the steel guard answers it. `phase: "impact"`
//  tags only mark WHERE the deflect gets injected. A multi-hit attack
//  with several impact entries fires the deflect once per impact, at
//  the attack's own rhythm.
// ============================================================

// Phase defaults: css.target entries default to "impact" (css on the
// target's card is almost by definition the hit landing), sfx default
// to "windup" (swings/whooshes happen whether or not the hit lands).
// So untagged attacks fuse correctly with no tagging at all — tags are
// the opt-out: `phase: "windup"` on target css that isn't a hit
// reaction, `phase: "impact"` on a sound that only exists because the
// hit connected.
const cssPhase = e => e.phase ?? 'impact';
const sfxPhase = s => s.phase ?? 'windup';

// Impact times: an explicit top-level `impact_override: [ms, ...]` on
// the attack json wins — needed for multi-hit combos authored as ONE
// continuous preset (dual_flame_strike etc.), where a single css entry
// hides several hits and the times can't be derived. Otherwise derived
// from the impact target-css entries' starts; if an attack has
// impact-tagged sfx but no impact css, fall back to the sfx starts. An
// attack with none of these returns unchanged — nothing to anchor to
// (also what keeps legacy non-array-sfx registry entries safe).
// The reaction json is authored at its own zero — this merge owns the
// timing. Defaults fit DEFLECT: the attack's impact css still plays
// (hit lands, guard answers) and the clang trails the visual hit by
// 75ms. AVOID overrides both: impact css dropped (the hit never lands
// on a dodging target), dodge css + sound exactly on the impact time.
const DEFLECT_SFX_DELAY = 75;

export function fuseDeflect(
  attackConfig,
  deflectConfig,
  { keepImpactCss = true, sfxDelay = DEFLECT_SFX_DELAY } = {},
) {
  if (!attackConfig || !deflectConfig) return attackConfig;

  const attackSfx = Array.isArray(attackConfig.sfx) ? attackConfig.sfx : [];
  const targetCss = attackConfig.css?.target ?? [];

  let impactTimes = Array.isArray(attackConfig.impact_override) && attackConfig.impact_override.length > 0
    ? attackConfig.impact_override
    : targetCss
        .filter(e => cssPhase(e) === 'impact')
        .map(e => e.start ?? 0);
  if (impactTimes.length === 0) {
    impactTimes = attackSfx
      .filter(s => sfxPhase(s) === 'impact')
      .map(s => s.start ?? 0);
  }
  if (impactTimes.length === 0) return attackConfig;

  const deflectSfx = Array.isArray(deflectConfig.sfx) ? deflectConfig.sfx : [];
  const deflectCss = deflectConfig.css?.target ?? [];

  return {
    ...attackConfig,
    duration: Math.max(
      attackConfig.duration ?? 0,
      ...impactTimes.map(t => t + (deflectConfig.duration ?? 0)),
    ),
    sfx: [
      ...attackSfx,
      ...impactTimes.flatMap(t =>
        deflectSfx.map(s => ({ ...s, start: t + sfxDelay + (s.start ?? 0) }))),
    ],
    css: {
      ...attackConfig.css,
      target: [
        ...(keepImpactCss ? targetCss : targetCss.filter(e => cssPhase(e) !== 'impact')),
        ...impactTimes.flatMap(t =>
          deflectCss.map(e => ({ ...e, start: t + (e.start ?? 0) }))),
      ],
    },
    // Deflected — no damage number.
    floatingNumber: null,
  };
}

export default fuseDeflect;
