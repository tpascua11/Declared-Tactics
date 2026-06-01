// ============================================================
//  ThumosInterpreter
//  Reads a Thumos animation JSON config and plays particle
//  effects using @pixi/particle-emitter + PixiJS.
//
//  Designed to be shared between daq-game and Thumos Vision.
//  No app-specific imports — safe to extract as a standalone
//  npm package (thumos-interpreter) with zero code changes.
//
//  JSON shape:
//  {
//    name: string,
//    duration: number,          // total animation length in ms
//    emitters: [
//      {
//        id: string,
//        start: number,         // ms from play() call
//        end: number,           // ms — emitter stops emitting
//        config: { ... }        // @pixi/particle-emitter config
//      }
//    ]
//  }
// ============================================================

import { Emitter } from '@pixi/particle-emitter';
import * as PIXI from 'pixi.js';

export class ThumosInterpreter {
  constructor(app) {
    this._app = app;
    this._timers = [];
    this._emitters = [];
    this._container = null;
    this._tickerFn = null;
    this._textureMap = {};
    this._buildDefaultTextures();
  }

  // Generates built-in PIXI.Texture objects keyed by name.
  // JSON configs reference these by name in textureSingle behavior.
  // Bypasses Pixi's global texture cache to avoid string-lookup issues.
  _buildDefaultTextures() {
    const g = new PIXI.Graphics();
    g.beginFill(0xffffff);
    g.drawCircle(0, 0, 16);
    g.endFill();
    this._textureMap['circle'] = this._app.renderer.generateTexture(g);
    g.destroy();
  }

  // Replaces texture string references in a behavior config with actual
  // PIXI.Texture objects so @pixi/particle-emitter doesn't do a URL lookup.
  _resolveConfig(config) {
    const resolved = JSON.parse(JSON.stringify(config));
    resolved.behaviors = resolved.behaviors.map(b => {
      if (b.type === 'textureSingle' && typeof b.config.texture === 'string') {
        const tex = this._textureMap[b.config.texture];
        if (tex) b.config.texture = tex;
      }
      if (b.type === 'textureRandom' && Array.isArray(b.config.textures)) {
        b.config.textures = b.config.textures.map(t =>
          typeof t === 'string' ? (this._textureMap[t] ?? t) : t
        );
      }
      return b;
    });
    return resolved;
  }

  // ── play ──────────────────────────────────────────────────
  // Sequences all emitters in the JSON at screen position (x, y).
  play(json, x, y) {
    this.stop();

    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    this._app.stage.addChild(container);
    this._container = container;

    // Start each emitter at its scheduled start time.
    json.emitters.forEach(emitterDef => {
      const startTimer = setTimeout(() => {
        const resolvedConfig = this._resolveConfig(emitterDef.config);
        const emitter = new Emitter(container, resolvedConfig);
        emitter.emit = true;
        this._emitters.push(emitter);

        // Stop emitting at end time (particles already alive finish naturally).
        const stopTimer = setTimeout(() => {
          emitter.emit = false;
        }, emitterDef.end - emitterDef.start);

        this._timers.push(stopTimer);
      }, emitterDef.start);

      this._timers.push(startTimer);
    });

    // Tick all active emitters every frame.
    let last = performance.now();
    this._tickerFn = () => {
      const now = performance.now();
      const elapsed = (now - last) * 0.001; // seconds
      last = now;
      this._emitters.forEach(e => e.update(elapsed));
    };
    this._app.ticker.add(this._tickerFn);

    // Auto-cleanup after total duration.
    const doneTimer = setTimeout(() => this.stop(), json.duration);
    this._timers.push(doneTimer);
  }

  // ── stop ──────────────────────────────────────────────────
  // Cancels all timers, destroys all emitters, removes container.
  stop() {
    this._timers.forEach(clearTimeout);
    this._timers = [];

    if (this._tickerFn) {
      this._app.ticker.remove(this._tickerFn);
      this._tickerFn = null;
    }

    this._emitters.forEach(e => e.destroy());
    this._emitters = [];

    if (this._container) {
      this._app.stage.removeChild(this._container);
      this._container.destroy({ children: true });
      this._container = null;
    }
  }
}
