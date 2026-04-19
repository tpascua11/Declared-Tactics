const ctx = require.context('../scenarios', true, /\.json$/);

export const SCENARIO_REGISTRY = Object.fromEntries(
  ctx.keys().map(key => {
    const scenario = ctx(key);
    return [scenario.id, scenario];
  })
);
