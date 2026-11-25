import type { CSSProperties, ReactNode } from 'react';
import type { GraphicType } from '../types';
import type { StyleFonts } from './fonts';
import type { StyleId } from './ids';
import type { Entrance } from './motion';

/**
 * An animation style, as the composition needs it. One shared set of components (StyledCaptions,
 * StyledHook, StyledGraphics, StyleLayers) draws every style from these tokens, so all ten move with
 * the same timings the backend plans sounds around; each style supplies its look, its motion and its
 * own animated layers (the ambient decoration and the transition).
 *
 * Sizes are for a 1080 x 1920 frame.
 */

/** What every style function is drawn with. `frame` is relative to the element being drawn. */
export interface Ctx {
  frame: number;
  fps: number;
  accent: string;
  fonts: StyleFonts;
  width: number;
  height: number;
}

export interface CaptionLook {
  /** Font size before any shrink-to-fit. */
  size: number;
  /** Average glyph width as a share of the font size, for shrink-to-fit. */
  glyph: number;
  box: (c: Ctx) => CSSProperties;
  word: (emphasis: boolean, c: Ctx) => CSSProperties;
  /** How a line arrives (faster than graphics). */
  entrance: Entrance;
  /** Each word arrives on its own, when it is said (kinetic typography). */
  stagger?: boolean;
}

export interface HookLook {
  box: (c: Ctx) => CSSProperties;
  text: (c: Ctx) => CSSProperties;
  /** Top of the card as a share of the frame height. */
  top: number;
  align?: 'center' | 'left';
  entrance: Entrance;
  /** Letters appear one by one (pixel art's dialog box). */
  typewriter?: boolean;
  /** Drawn inside the card (positioned absolutely against it). `t` is the entrance, 0 to 1. */
  Decor?: (p: { c: Ctx; t: number; durationFrames: number }) => ReactNode;
}

/** A window in the frame (pixels of 1080 x 1920). */
export interface Screen {
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: 'rect' | 'circle';
  radius?: number;
  /** Degrees. */
  rotate?: number;
  /** Border, shadow or frame of the window itself. */
  style?: CSSProperties;
}

/** One bar of a chart: its label, its value and the text shown for it ("$1.2M"). */
export interface ChartBar {
  label: string;
  value: number;
  text: string;
  /** 0 → 1: how far this bar has grown. */
  grow: number;
}

export interface CameraMove {
  scale?: number;
  /** Percent of the frame. */
  x?: number;
  y?: number;
  rotate?: number;
  rotateY?: number;
  blur?: number;
}

export interface StyleTheme {
  id: StyleId;
  /** Accent for emphasis words, numbers and highlights. The backend sends the same color. */
  accent: string;
  /** Two more colors the style decorates with. */
  colors: [string, string];
  /** CSS filter for the footage; replaces the edit's color grade. */
  footage: string;
  /** How graphics arrive. */
  entrance: Entrance;
  /** Motion is drawn on whole steps of this many frames (pixel art moves at 10 fps). 1 = smooth. */
  step: number;
  /** Size of display text against the standard graphics (wide pixel fonts shrink, narrow comic fonts grow). */
  textScale: number;
  /** The same for body text (subtext, list items); 1 when not set. */
  bodyScale?: number;
  /**
   * Ambient layer over the footage: texture, frame, slow decoration. `c.frame` is the edit frame. `scene`
   * is true when the style's Scene fills the frame (its own hero is then drawn by the Scene, not here).
   */
  Overlay: (p: { c: Ctx; total: number; scene?: boolean }) => ReactNode;
  /**
   * Animated storytelling styles: a whole painted world that fills the frame in place of the camera,
   * with the main subject in the middle. The creator's voice narrates it.
   */
  Scene?: (p: { c: Ctx }) => ReactNode;
  caption: CaptionLook;
  hook: HookLook;
  /** The surface graphics sit on. */
  card: (c: Ctx) => CSSProperties;
  title: (c: Ctx) => CSSProperties;
  body: (c: Ctx) => CSSProperties;
  number: (c: Ctx) => CSSProperties;
  slam: (c: Ctx) => CSSProperties;
  /** Drawn behind a slam (comic burst, brick plate, chalk scribble). `t` is the entrance, 0 to 1. */
  SlamBack?: (p: { c: Ctx; t: number }) => ReactNode;
  /** The bullet of list item k. `t` is that item's entrance, 0 to 1. */
  Marker: (p: { c: Ctx; k: number; t: number }) => ReactNode;
  /** The ring of a callout, centered on (x, y) with radius r. */
  Ring: (p: { c: Ctx; x: number; y: number; r: number; t: number }) => ReactNode;
  /** The disc an illustration sits on. */
  stage: { shape: 'circle' | 'square'; fill: [string, string]; ring: string; ringWidth: number; glow?: string };
  transition: {
    /** Frames drawn before and after the cut. */
    before: number;
    after: number;
    /** The transition's own layer; d is frames from the cut (negative before it). */
    Draw: (p: { c: Ctx; d: number }) => ReactNode;
    /** What the transition does to the camera. */
    camera?: (d: number) => CameraMove;
  };
  /** The style's progress indicator (replaces the standard bar when the edit has one). */
  Progress?: (p: { c: Ctx; total: number }) => ReactNode;
  /**
   * SVG definitions the style's footage treatment uses (filters referenced from `footage` as
   * `url(#id)`: thermal, x-ray, dither, line art). Drawn once, invisibly, in the edit.
   */
  Defs?: () => ReactNode;
  /**
   * The footage sits inside a window instead of filling the frame (a screen on a desk, a slide on a light
   * table, a microscope eyepiece). Pixels of the 1080 x 1920 frame; `Backdrop` draws the world around it.
   */
  screen?: Screen;
  /** Drawn under the footage: the room, desk or board around a `screen`. */
  Backdrop?: (p: { c: Ctx; total: number }) => ReactNode;
  /**
   * Explainer styles: while the Scene fills the frame, the creator stays on screen in this bubble
   * (picture in picture). Without it a Scene hides the camera completely (storytelling).
   */
  pip?: Screen;
  /** A bar chart in the style (the `chart` graphic); a plain chart on the style's card when not set. */
  Chart?: (p: { c: Ctx; bars: ChartBar[]; t: number }) => ReactNode;
  /** Slow camera drift over the whole edit (CGI). */
  drift?: (frame: number) => CameraMove;
  /** The sample graphic in the Skills library showcase. */
  sample: { type: GraphicType; text: string; subtext?: string; items?: string[] };
}

/** Deterministic noise in [0, 1) for a frame and seed (renders must repeat exactly: no Math.random). */
export const noise = (n: number, seed = 0) => {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** `frame` held on whole steps of `step` frames. */
export const stepped = (frame: number, step: number) => (step > 1 ? Math.floor(frame / step) * step : frame);

/** A hex color with an alpha byte (`hexA('#FFAA00', 0.5)` → '#FFAA0080'). */
export const hexA = (hex: string, alpha: number) => `${hex.slice(0, 7)}${Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0')}`;

/** Text filled with a gradient (chrome, metal). */
export const gradientText = (gradient: string): CSSProperties => ({
  backgroundImage: gradient,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

export const W = 1080;
export const H = 1920;
