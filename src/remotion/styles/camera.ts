import type { CameraMove, StyleTheme } from './theme';

/** The camera move of the style's transitions (and its slow drift) at a frame. */
export function styleCamera(theme: StyleTheme, frame: number, transitionFrames: number[]): Required<CameraMove> {
  const out = { scale: 1, x: 0, y: 0, rotate: 0, rotateY: 0, blur: 0 };
  const add = (m: CameraMove) => {
    out.scale *= m.scale ?? 1;
    out.x += m.x ?? 0;
    out.y += m.y ?? 0;
    out.rotate += m.rotate ?? 0;
    out.rotateY += m.rotateY ?? 0;
    out.blur = Math.max(out.blur, m.blur ?? 0);
  };
  if (theme.drift) add(theme.drift(frame));
  const { before, after, camera } = theme.transition;
  if (camera) {
    for (const t of transitionFrames) {
      const d = frame - t;
      if (d >= -before && d < after) add(camera(d));
    }
  }
  return out;
}
