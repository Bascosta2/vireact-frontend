/**
 * SVG filters that turn the creator's footage into a medium: a thermal camera, an X-ray scanner, a
 * two-ink print, a woodcut, 1-bit dither, line art. A style puts them in `Defs` and names them in
 * `footage` as `url(#id)`; Chromium applies SVG filters to the video frames in both the preview and the
 * render. All are pure color math, so every frame repeats exactly.
 */

const hex = (h: string) => {
  const n = parseInt(h.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};

/** Luminance to grey, as the first step of most filters. */
const LUMA = '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0';

/** Map luminance through a list of colors (dark → light): duotone, tritone, false color. */
export function rampFilter(id: string, colors: string[], { contrast = 1, lift = 0, discrete = false }: { contrast?: number; lift?: number; discrete?: boolean } = {}) {
  const rgb = colors.map(hex);
  const table = (i: number) => rgb.map((c) => c[i].toFixed(3)).join(' ');
  const c = contrast;
  const o = (1 - c) / 2 + lift;
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix type="matrix" values={LUMA} />
      <feComponentTransfer>
        <feFuncR type="linear" slope={c} intercept={o} />
        <feFuncG type="linear" slope={c} intercept={o} />
        <feFuncB type="linear" slope={c} intercept={o} />
      </feComponentTransfer>
      <feComponentTransfer>
        <feFuncR type={discrete ? 'discrete' : 'table'} tableValues={table(0)} />
        <feFuncG type={discrete ? 'discrete' : 'table'} tableValues={table(1)} />
        <feFuncB type={discrete ? 'discrete' : 'table'} tableValues={table(2)} />
      </feComponentTransfer>
    </filter>
  );
}

/** A thermal camera's iron palette: cold black-purple through red and orange to hot white. */
export const thermalFilter = (id: string) => rampFilter(id, ['#05001A', '#2A0A6B', '#7A0F8C', '#C8243C', '#F0631A', '#FFB21F', '#FFF4B8'], { contrast: 1.25 });

/** Dual-energy X-ray: dense things dark blue, soft things orange, empty space white. Inverted. */
export const xrayFilter = (id: string) => rampFilter(id, ['#FFFFFF', '#F7C98A', '#E8862F', '#3FA35B', '#2257B8', '#0B1640'], { contrast: 1.35 });

/** Night vision / phosphor: one hue in steps of brightness. */
export const phosphorFilter = (id: string, color: string, dark = '#000000') => rampFilter(id, [dark, color, '#FFFFFF'], { contrast: 1.2 });

/** Flat posterized color (cel, screen print): `levels` steps per channel. */
export function posterizeFilter(id: string, levels = 4, saturate = 1.3) {
  const steps = Array.from({ length: levels }, (_, k) => (k / (levels - 1)).toFixed(3)).join(' ');
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values={String(saturate)} />
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues={steps} />
        <feFuncG type="discrete" tableValues={steps} />
        <feFuncB type="discrete" tableValues={steps} />
      </feComponentTransfer>
    </filter>
  );
}

/**
 * Two inks with a hard edge: everything darker than `cut` becomes `ink`, the rest `paper` (woodcut,
 * linocut, silhouette, stencil). `soft` widens the edge a little.
 */
export function thresholdFilter(id: string, ink: string, paper: string, cut = 0.45, soft = 0.04) {
  const steps = 24;
  const ramp = (a: number, b: number) =>
    Array.from({ length: steps }, (_, k) => {
      const v = k / (steps - 1);
      const t = Math.max(0, Math.min(1, (v - (cut - soft)) / (2 * soft)));
      return (a + (b - a) * t).toFixed(3);
    }).join(' ');
  const [ir, ig, ib] = hex(ink);
  const [pr, pg, pb] = hex(paper);
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={LUMA} />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={ramp(ir, pr)} />
        <feFuncG type="table" tableValues={ramp(ig, pg)} />
        <feFuncB type="table" tableValues={ramp(ib, pb)} />
      </feComponentTransfer>
    </filter>
  );
}

/** A 4 x 4 Bayer matrix as a tiny SVG tile, for ordered dither. */
const bayerTile = (cell: number) => {
  const m = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const rects = m.map((v, k) => `<rect x='${(k % 4) * cell}' y='${Math.floor(k / 4) * cell}' width='${cell}' height='${cell}' fill='rgb(${Math.round(((v + 0.5) / 16) * 255)},0,0)'/>`).join('');
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${cell * 4}' height='${cell * 4}'>${rects}</svg>`)}`;
};

/**
 * 1-bit ordered dither in two inks: each grey becomes a fixed pattern of dots (`cell` px per dot), like
 * an old Mac screen or a two-color game.
 */
export function ditherFilter(id: string, ink: string, paper: string, cell = 4) {
  const [ir, ig, ib] = hex(ink);
  const [pr, pg, pb] = hex(paper);
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix type="matrix" in="SourceGraphic" values={LUMA} result="g" />
      <feImage href={bayerTile(cell)} x="0" y="0" width={cell * 4} height={cell * 4} result="tile" />
      <feTile in="tile" result="bayer" />
      {/* grey + pattern - 0.5 (alpha stays opaque), then a hard cut at 0.5: light where grey > 1 - pattern */}
      <feColorMatrix type="matrix" in="bayer" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="b" />
      <feComposite in="g" in2="b" operator="arithmetic" k1="0" k2="1" k3="1" k4="-0.5" result="d" />
      <feComponentTransfer in="d">
        <feFuncR type="discrete" tableValues={`${ir} ${pr}`} />
        <feFuncG type="discrete" tableValues={`${ig} ${pg}`} />
        <feFuncB type="discrete" tableValues={`${ib} ${pb}`} />
        <feFuncA type="linear" slope="0" intercept="1" />
      </feComponentTransfer>
    </filter>
  );
}

/**
 * Line art from the footage: edges found with a convolution, drawn in `ink` on `paper` (urban sketch,
 * engraving, pen plotter). `strength` thickens the lines.
 */
export function edgesFilter(id: string, ink: string, paper: string, strength = 1.6, cut = 0.82) {
  const [ir, ig, ib] = hex(ink);
  const [pr, pg, pb] = hex(paper);
  const steps = 16;
  const ramp = (a: number, b: number) => Array.from({ length: steps }, (_, k) => (k / (steps - 1) < cut ? a : b).toFixed(3)).join(' ');
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix type="matrix" values={LUMA} result="g" />
      <feGaussianBlur in="g" stdDeviation="1.1" result="s" />
      <feConvolveMatrix in="s" order="3" kernelMatrix={`-1 -1 -1 -1 8 -1 -1 -1 -1`} divisor="1" bias="0" preserveAlpha="true" result="e" />
      <feComponentTransfer in="e" result="inv">
        <feFuncR type="linear" slope={-strength * 2.4} intercept="1" />
        <feFuncG type="linear" slope={-strength * 2.4} intercept="1" />
        <feFuncB type="linear" slope={-strength * 2.4} intercept="1" />
      </feComponentTransfer>
      <feComponentTransfer in="inv">
        <feFuncR type="table" tableValues={ramp(ir, pr)} />
        <feFuncG type="table" tableValues={ramp(ig, pg)} />
        <feFuncB type="table" tableValues={ramp(ib, pb)} />
        <feFuncA type="linear" slope="0" intercept="1" />
      </feComponentTransfer>
    </filter>
  );
}

/** Red and cyan pulled apart (chromatic aberration, glitch). */
export function rgbSplitFilter(id: string, offset = 6) {
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="-5%" y="0" width="110%" height="100%">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feOffset in="r" dx={offset} dy="0" result="r2" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
      <feOffset in="gb" dx={-offset} dy="0" result="gb2" />
      <feBlend in="r2" in2="gb2" mode="screen" />
    </filter>
  );
}
