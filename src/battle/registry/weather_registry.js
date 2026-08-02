// ============================================================
//  WEATHER REGISTRY
//  Maps scenario.weather keys to ambient pixi particle params,
//  consumed by WeatherInterpreter via EffectsLayer.
//  This registry is UI-only — battle logic never touches it.
// ============================================================

export const WEATHER_REGISTRY = {
  snow: {
    shape: 'snowflake',
    count: 150,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 60,
    speedMax: 120,
    waveAmp: 15,
    waveFreq: 0.4,
    opacity: 0.6,
  },
};
