// ============================================================
//  WEATHER REGISTRY
//  Maps scenario.weather keys to ambient pixi particle params,
//  consumed by WeatherInterpreter via EffectsLayer.
//  This registry is UI-only — battle logic never touches it.
// ============================================================

export const WEATHER_REGISTRY = {
  snow: {
    shape: 'snowflake',
    count: 50,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 15,
    speedMax: 35,
    waveAmp: 15,
    waveFreq: 0.4,
    opacity: 0.6,
  },
  rain: {
    shape: 'spark',
    count: 120,
    sizeMin: 8,
    sizeMax: 16,
    speedMin: 200,
    speedMax: 350,
    angle: 15,
    opacity: 0.35,
  },
  lanterns: {
    shape: 'circle',
    count: 50,
    sizeMin: 5,
    sizeMax: 8,
    speedMin: 20,
    speedMax: 45,
    waveAmp: 30,
    waveFreq: 0.3,
    opacity: 0.95,
    color: 0xffb347,
    additive: true,
    glowRadius: 90,
    tint: { color: 0x05050f, opacity: 0.4 },
  },
};
