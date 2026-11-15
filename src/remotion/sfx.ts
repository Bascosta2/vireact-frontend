import type { SfxType } from './types';

/**
 * How long each built-in sound lasts (seconds), so an effect only holds an audio tag while it plays.
 * Matches the lengths in the backend's scripts/generate-sfx.js, which builds public/sfx/<type>.mp3.
 */
export const SFX_SECONDS: Record<SfxType, number> = {
  // Movement
  whoosh: 0.7, swoosh: 0.35, swish: 0.22, whip: 0.3, sweep_up: 0.6, sweep_down: 0.6, reverse: 1.0, riser: 1.5, launch: 1.3,
  // Impacts
  boom: 1.6, hit: 0.45, thud: 0.4, impact: 1.3, bass_drop: 1.4, kick: 0.3, snap: 0.12, clap: 0.3,
  // Interface
  pop: 0.14, click: 0.05, tick: 0.07, tap: 0.09, blip: 0.14, bubble: 0.2, drip: 0.35, typing: 1.1, page: 0.28, shutter: 0.3,
  // Tones
  ding: 1.4, chime: 1.5, bell: 2.0, sparkle: 1.0, shimmer: 1.3, notify: 0.75, success: 1.0, coin: 0.7, cash: 1.0, power_up: 0.7,
  // Tension and twists
  suspense: 2.0, glitch: 0.45, static: 0.35, zap: 0.3, error: 0.5, alert: 0.55, power_down: 0.7, pulse: 0.45, heartbeat: 0.9,
};
