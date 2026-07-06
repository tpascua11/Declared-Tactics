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

// Impact times come from the attack's impact-tagged target-css
// entries; if an attack has impact sfx but no impact css, fall back
// to the sfx starts. An attack with no phase tags at all returns
// unchanged — there's nothing to substitute against (also what
// keeps legacy non-array-sfx registry entries safe).
// The deflect json is authored at its own zero — this merge owns the
// timing: injected deflect sfx land this many ms after each impact
// point (the clang trailing the visual hit slightly), while the
// deflect css stays exactly on the impact.
const DEFLECT_SFX_DELAY = 75;

export function fuseDeflect(attackConfig, deflectConfig) {
  if (!attackConfig || !deflectConfig) return attackConfig;

  const attackSfx = Array.isArray(attackConfig.sfx) ? attackConfig.sfx : [];
  const targetCss = attackConfig.css?.target ?? [];

  let impactTimes = targetCss
    .filter(e => e.phase === 'impact')
    .map(e => e.start ?? 0);
  if (impactTimes.length === 0) {
    impactTimes = attackSfx
      .filter(s => s.phase === 'impact')
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
        deflectSfx.map(s => ({ ...s, start: t + DEFLECT_SFX_DELAY + (s.start ?? 0) }))),
    ],
    css: {
      ...attackConfig.css,
      target: [
        ...targetCss,
        ...impactTimes.flatMap(t =>
          deflectCss.map(e => ({ ...e, start: t + (e.start ?? 0) }))),
      ],
    },
    // Deflected — no damage number.
    floatingNumber: null,
  };
}

export default fuseDeflect;
