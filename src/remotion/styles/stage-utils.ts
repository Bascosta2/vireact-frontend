import type { CSSProperties } from 'react';
import type { Screen, StyleTheme } from './theme';

/** A window's own box: position, size, turn and shape. */
export const windowStyle = (s: Screen): CSSProperties => ({
  position: 'absolute',
  left: s.x,
  top: s.y,
  width: s.w,
  height: s.h,
  overflow: 'hidden',
  borderRadius: s.shape === 'circle' ? '50%' : (s.radius ?? 0),
  transform: s.rotate ? `rotate(${s.rotate}deg)` : undefined,
  // Clip children (the footage, which carries its own transform and filter) to the shape: a clip-path
  // holds where overflow + border-radius alone can leak square corners.
  clipPath: s.shape === 'circle' ? 'circle(50% at 50% 50%)' : s.radius ? `inset(0 round ${s.radius}px)` : undefined,
  isolation: 'isolate',
  ...s.style,
});

/** Where a point of the footage (0-1 on each axis) lands in the frame, for callouts. */
export const pointInFrame = (theme: StyleTheme, fx: number, fy: number, width: number, height: number) =>
  theme.screen ? { x: theme.screen.x + fx * theme.screen.w, y: theme.screen.y + fy * theme.screen.h } : { x: fx * width, y: fy * height };
