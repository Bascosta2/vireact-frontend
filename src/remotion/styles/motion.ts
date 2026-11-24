import type { CSSProperties } from 'react';
import { interpolate, spring } from 'remotion';

/**
 * How things arrive in each style. One vocabulary for captions, hooks and graphics:
 *   glide   eased slide down into place (flat vector, CGI)
 *   pop     scale up with one small overshoot (comic, bricks)
 *   bounce  soft, rounded overshoot (explainer 3D)
 *   step    in two hard steps, no easing (pixel art)
 *   write   revealed left to right, like chalk being written
 *   flicker a neon tube catching: on, off, on
 *   swing   swings down on a hinge like a game menu (retro 3D)
 *   fade    opacity and a short blur only (minimal line)
 */
export type Entrance = 'glide' | 'pop' | 'bounce' | 'step' | 'write' | 'flicker' | 'swing' | 'fade';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

/**
 * Entrance progress at `frame` (0 before, 1 settled; springs may pass 1 briefly). `speed` above 1 makes
 * it quicker (captions arrive at twice the speed of graphics).
 */
export function enterProgress(kind: Entrance, frame: number, fps: number, speed = 1): number {
  const f = frame * speed;
  if (f < 0) return 0;
  switch (kind) {
    case 'pop':
      return spring({ frame: f, fps, config: { damping: 12, stiffness: 230, mass: 0.6 } });
    case 'bounce':
      return spring({ frame: f, fps, config: { damping: 9, stiffness: 150, mass: 0.8 } });
    case 'glide':
    case 'swing':
      return spring({ frame: f, fps, config: { damping: 20, stiffness: 180, mass: 0.8 } });
    case 'step':
      return f < 3 ? 0.5 : 1;
    case 'write':
      return interpolate(f, [0, 14], [0, 1], { ...clamp, easing: easeInOut });
    case 'flicker':
      return interpolate(f, [0, 9], [0, 1], clamp);
    case 'fade':
    default:
      return interpolate(f, [0, 10], [0, 1], { ...clamp, easing: easeOut });
  }
}

/** Neon catching: frames where the tube is still dark while it warms up. */
const FLICKER_OFF = new Set([1, 2, 4, 7]);

/**
 * The style of an element `t` of the way through its entrance and `out` of the way through its exit.
 * `frame` is the element's own frame (the flicker pattern needs it).
 */
export function enterStyle(kind: Entrance, t: number, out: number, frame: number): CSSProperties {
  const o = Math.max(0, Math.min(1, t * 1.6)) * (1 - out);
  switch (kind) {
    case 'pop':
      return { opacity: o, transform: `scale(${(0.55 + 0.45 * t) * (1 - 0.12 * out)})` };
    case 'bounce':
      return { opacity: o, transform: `translateY(${(1 - t) * 40 + 20 * out}px) scale(${(0.7 + 0.3 * t) * (1 - 0.15 * out)})` };
    case 'glide':
      return { opacity: o, transform: `translateY(${(1 - t) * -46 - 30 * out}px)` };
    case 'swing':
      return { opacity: o, transform: `perspective(1200px) rotateX(${(1 - t) * -80 + out * 70}deg)`, transformOrigin: '50% 0%' };
    case 'step':
      // Pixel art: no fades. It drops in two steps and leaves in one.
      return { opacity: t > 0 && out < 0.5 ? 1 : 0, transform: `translateY(${t < 1 ? -24 : 0}px)` };
    case 'write':
      return { opacity: 1 - out, clipPath: `inset(-20% ${Math.max(0, (1 - t) * 100)}% -20% -5%)` };
    case 'flicker': {
      const on = t >= 1 || !FLICKER_OFF.has(Math.floor(frame));
      return { opacity: (on ? 1 : 0.15) * (t > 0 ? 1 : 0) * (1 - out) };
    }
    case 'fade':
    default:
      return { opacity: Math.min(1, t) * (1 - out), filter: t < 1 ? `blur(${((1 - t) * 8).toFixed(1)}px)` : undefined, transform: `translateY(${(1 - t) * 14}px)` };
  }
}

/** 0 → 1 over the last `frames` frames of something `duration` long. */
export const exitProgress = (frame: number, duration: number, frames = 6) => interpolate(frame, [duration - frames, duration], [0, 1], clamp);
