const ctx = require.context('./pixi_data', true, /\.json$/);
const PARTICLE_CONFIGS = {};
ctx.keys().forEach(key => {
  const name = key.replace(/^.*\//, '').replace('.json', '');
  PARTICLE_CONFIGS[name] = ctx(key);
});
export default PARTICLE_CONFIGS;
