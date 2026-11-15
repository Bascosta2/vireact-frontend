import { FONT } from '../fonts';
import { PAPER, INK, STEEL, about, cycle, pop, tween, wave, type Visual } from './kit';
import { Draw, Grad, Sparkle } from './parts';

/** Mind and body: brain, heart, dna, strength, sleep, eye, water, plant. */

const BRAIN_OUTLINE =
  'M 118 212 C 96 200 96 168 116 156 C 112 132 138 112 162 120 C 174 100 210 98 224 114 C 248 104 280 118 282 144 C 304 152 310 186 292 202 C 300 222 282 242 262 238 C 256 256 232 262 220 250 C 204 262 178 256 174 240 C 152 246 124 236 118 212 Z';
const BRAIN_FOLDS = [
  'M 150 150 C 165 140 180 150 176 168 C 172 184 150 184 146 200',
  'M 196 122 C 190 140 206 150 214 142 C 226 132 240 140 236 156',
  'M 250 150 C 262 160 258 178 244 180 C 232 182 226 196 236 206',
  'M 180 200 C 194 192 210 200 206 214 C 202 226 186 226 184 238',
  'M 262 200 C 272 206 274 220 264 226',
  'M 128 190 C 138 196 136 210 126 214',
];
/** Neurons on the brain, then the ones it reaches out to. */
const NEURONS: [number, number][] = [
  [140, 176], [178, 138], [222, 152], [262, 170], [202, 188], [242, 216], [168, 222],
  [76, 112], [326, 100], [340, 232], [82, 266], [204, 58], [306, 286],
];
const SYNAPSES: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 0], [4, 5], [3, 5], [4, 6], [6, 0], [1, 7], [3, 8], [5, 9], [6, 10], [2, 11], [5, 12]];
const SIGNAL = '#7DF9FF';

const brain: Visual = ({ frame, fps, uid }) => {
  const enter = pop(frame, fps);
  const breathe = 1 + 0.015 * wave(frame, 40);
  return (
    <g transform="translate(-3 16)">
      <defs>
        <Grad id={`${uid}-brain`} from="#FFB3D3" to="#E2529A" x2={0.6} />
      </defs>
      <g transform={about(203, 181, enter * breathe)}>
        <path d="M 222 246 C 226 262 232 274 244 282" fill="none" stroke="#C9408A" strokeWidth={18} strokeLinecap="round" />
        <path d={BRAIN_OUTLINE} fill={`url(#${uid}-brain)`} stroke="#FFD9EA" strokeWidth={4} strokeLinejoin="round" />
        <path d="M 132 150 C 150 128 176 124 196 128" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.35} />
        {BRAIN_FOLDS.map((d, k) => (
          <Draw key={k} d={d} p={tween(frame, 3 + k * 2, 15 + k * 2)} stroke="#B93480" strokeWidth={5} />
        ))}
      </g>
      {SYNAPSES.map(([a, b], k) => {
        const [x1, y1] = NEURONS[a];
        const [x2, y2] = NEURONS[b];
        const p = tween(frame, 8 + k, 18 + k);
        if (p <= 0) return null;
        // A signal travels along each connection, each on its own beat.
        const t = cycle(frame - 14, 22, k * 0.37);
        const live = frame > 16 + k;
        return (
          <g key={k}>
            <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={SIGNAL} strokeWidth={b > 6 ? 3 : 2.5} strokeLinecap="round" opacity={b > 6 ? 0.75 : 0.55} />
            {live && <circle cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={5} fill="#fff" opacity={Math.sin(Math.PI * t)} />}
          </g>
        );
      })}
      {NEURONS.map(([x, y], k) => {
        const s = pop(frame, fps, 8 + k * 1.5);
        const glow = 0.5 + 0.5 * wave(frame, 18, k * 0.21);
        const r = k > 6 ? 9 : 6;
        return (
          <g key={k} transform={about(x, y, s)}>
            <circle cx={x} cy={y} r={r + 6 + 4 * glow} fill={SIGNAL} opacity={0.22 + 0.18 * glow} />
            <circle cx={x} cy={y} r={r} fill="#fff" />
          </g>
        );
      })}
    </g>
  );
};

const HEART_SHAPE = 'M 200 304 C 118 244 86 192 108 150 C 128 112 178 112 200 152 C 222 112 272 112 292 150 C 314 192 282 244 200 304 Z';
const ECG = 'M 54 214 L 136 214 L 152 190 L 170 246 L 190 150 L 212 262 L 228 214 L 346 214';

const heart: Visual = ({ frame, fps, uid }) => {
  // Two thumps per cycle: lub-dub.
  const beat = cycle(frame, 28);
  const thump = Math.exp(-((beat - 0.08) ** 2) / 0.004) + 0.7 * Math.exp(-((beat - 0.34) ** 2) / 0.004);
  const scan = cycle(frame - 6, 44);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-heart`} from="#FF7A8F" to="#D81B47" x2={0.5} />
      </defs>
      <g transform={about(200, 205, pop(frame, fps) * (1 + 0.07 * thump))}>
        <path d={HEART_SHAPE} fill={`url(#${uid}-heart)`} stroke="#FFC2CC" strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={152} cy={156} rx={26} ry={14} transform="rotate(-38 152 156)" fill="#fff" opacity={0.32} />
      </g>
      {frame > 6 && (
        <>
          <path d={ECG} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.22} />
          <Draw d={ECG} p={Math.min(1, scan * 1.35)} stroke="#fff" strokeWidth={7} />
        </>
      )}
    </g>
  );
};

const dna: Visual = ({ frame }) => {
  const beads: { x: number; y: number; z: number; color: string; key: string }[] = [];
  const rungs: { xa: number; xb: number; y: number; key: number; show: number }[] = [];
  for (let i = 0; i < 14; i += 1) {
    const theta = i * 0.52 + frame * 0.09;
    const y = 96 + i * 16;
    const xa = 200 + 62 * Math.sin(theta);
    const xb = 200 - 62 * Math.sin(theta);
    const z = Math.cos(theta);
    const show = tween(frame, i, i + 6);
    rungs.push({ xa, xb, y, key: i, show });
    if (show > 0) {
      beads.push({ x: xa, y, z, color: '#5CE1E6', key: `a${i}` });
      beads.push({ x: xb, y, z: -z, color: '#FF7EB6', key: `b${i}` });
    }
  }
  // Far beads first, so the near strand passes in front.
  beads.sort((p, q) => p.z - q.z);
  return (
    <g transform="rotate(20 200 200)">
      {rungs.map((r) => (
        <line key={r.key} x1={r.xa} y1={r.y} x2={r.xb} y2={r.y} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.3 * r.show} />
      ))}
      {beads.map((b) => (
        <circle key={b.key} cx={b.x} cy={b.y} r={9 + 3.5 * b.z} fill={b.color} opacity={0.7 + 0.3 * ((b.z + 1) / 2)} />
      ))}
    </g>
  );
};

const strength: Visual = ({ frame, fps, accent, uid }) => {
  const lift = -12 * (0.5 + 0.5 * wave(frame, 26));
  return (
    <g>
      <defs>
        <Grad id={`${uid}-plate`} from="#59648A" to="#232839" />
      </defs>
      <g transform={`translate(0 ${lift}) ${about(200, 200, pop(frame, fps), -18)}`}>
        <rect x={72} y={186} width={256} height={28} rx={6} fill={STEEL} />
        <rect x={158} y={187} width={84} height={26} rx={8} fill="#8A93A8" />
        {[172, 186, 200, 214, 228].map((x) => (
          <line key={x} x1={x} y1={190} x2={x} y2={210} stroke="#6B7389" strokeWidth={3} />
        ))}
        {[112, 258].map((x) => (
          <rect key={x} x={x} y={144} width={30} height={112} rx={10} fill={`url(#${uid}-plate)`} stroke={accent} strokeWidth={4} />
        ))}
        {[84, 290].map((x) => (
          <rect key={x} x={x} y={162} width={26} height={76} rx={9} fill={`url(#${uid}-plate)`} stroke={accent} strokeWidth={4} />
        ))}
      </g>
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M ${132 + k * 14} ${112 - k * 16} Q 200 ${86 - k * 18} ${268 - k * 14} ${112 - k * 16}`} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" opacity={frame > 8 ? Math.sin(Math.PI * cycle(frame, 26, -k * 0.16)) * 0.8 : 0} />
      ))}
    </g>
  );
};

const sleep: Visual = ({ frame, fps, uid }) => (
  <g>
    <defs>
      <Grad id={`${uid}-moon`} from="#FFF1B8" to="#FFB829" x2={0.4} />
      <mask id={`${uid}-crescent`}>
        <rect width={400} height={400} fill="#000" />
        <circle cx={186} cy={210} r={92} fill="#fff" />
        <circle cx={232} cy={180} r={78} fill="#000" />
      </mask>
    </defs>
    <g transform={about(186, 210, pop(frame, fps), 4 * wave(frame, 70))}>
      <rect width={400} height={400} fill={`url(#${uid}-moon)`} mask={`url(#${uid}-crescent)`} />
    </g>
    <Sparkle x={270} y={132} size={16} frame={frame} />
    <Sparkle x={306} y={206} size={11} frame={frame} phase={0.3} />
    <Sparkle x={104} y={110} size={10} frame={frame} phase={0.6} />
    <Sparkle x={92} y={276} size={9} frame={frame} phase={0.15} />
    <Sparkle x={282} y={286} size={13} frame={frame} phase={0.8} />
    {[0, 1, 2].map((k) => {
      const c = cycle(frame - 8, 60, k / 3);
      return (
        <text key={k} x={236 + 44 * c} y={186 - 84 * c} fontFamily={FONT} fontWeight={900} fontSize={20 + 26 * c} fill={PAPER} opacity={frame > 8 ? Math.sin(Math.PI * c) : 0}>
          Z
        </text>
      );
    })}
  </g>
);

const EYE_SHAPE = 'M 62 200 Q 200 84 338 200 Q 200 316 62 200 Z';

const eye: Visual = ({ frame, accent, uid }) => {
  const blinkAt = cycle(frame, 72);
  const blink = frame > 14 && blinkAt > 0.9 ? 1 - Math.sin(Math.PI * ((blinkAt - 0.9) / 0.1)) : 1;
  const open = Math.max(0.04, tween(frame, 0, 10) * blink);
  const look = 200 + 30 * wave(frame, 64);
  const lid = about(200, 200, [1, open]);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-iris`} from="#8FE3FF" to="#2B62F0" />
        <clipPath id={`${uid}-eye`}>
          <path d={EYE_SHAPE} transform={lid} />
        </clipPath>
      </defs>
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
        // Lashes along the top lid, pointing away from the middle of the eye.
        const x = (1 - t) ** 2 * 62 + 2 * t * (1 - t) * 200 + t ** 2 * 338;
        const y = 200 - 232 * t * (1 - t) * open;
        const len = Math.hypot(x - 200, y - 300);
        const nx = (x - 200) / len;
        const ny = (y - 300) / len;
        return <line key={t} x1={x + nx * 14} y1={y + ny * 14} x2={x + nx * 36} y2={y + ny * 36} stroke={PAPER} strokeWidth={6} strokeLinecap="round" opacity={tween(frame, 8, 14)} />;
      })}
      <g clipPath={`url(#${uid}-eye)`}>
        <rect x={50} y={80} width={300} height={240} fill={PAPER} />
        <circle cx={look} cy={200} r={60} fill={`url(#${uid}-iris)`} stroke="#1B3FA8" strokeWidth={5} />
        <circle cx={look} cy={200} r={27} fill={INK} />
        <circle cx={look - 20} cy={180} r={11} fill="#fff" />
      </g>
      <path d={EYE_SHAPE} transform={lid} fill="none" stroke={accent} strokeWidth={10} strokeLinejoin="round" />
    </g>
  );
};

const water: Visual = ({ frame, fps, uid }) => {
  const land = pop(frame, fps);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-drop`} from="#9BE4FF" to="#1F7BF2" />
      </defs>
      {[0, 0.5].map((phase) => {
        const c = cycle(frame - 8, 44, phase);
        return <ellipse key={phase} cx={200} cy={306} rx={30 + 96 * c} ry={6 + 16 * c} fill="none" stroke="#7FD8FF" strokeWidth={5} opacity={frame > 8 ? 0.8 * (1 - c) : 0} />;
      })}
      <g transform={`translate(0 ${(1 - land) * -70 + 6 * wave(frame, 36)}) ${about(200, 190, land)}`}>
        <path d="M 200 78 C 242 138 266 172 266 206 C 266 244 236 270 200 270 C 164 270 134 244 134 206 C 134 172 158 138 200 78 Z" fill={`url(#${uid}-drop)`} stroke="#D6F3FF" strokeWidth={4} strokeLinejoin="round" />
        <path d="M 158 208 C 158 232 174 248 196 250" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
        <circle cx={222} cy={168} r={8} fill="#fff" opacity={0.5} />
      </g>
    </g>
  );
};

const LEAF = 'M 0 0 C 18 -34 62 -36 84 -10 C 60 16 18 16 0 0 Z';

const plant: Visual = ({ frame, fps, uid }) => {
  const sway = 2.5 * wave(frame, 50);
  const leaf = (x: number, y: number, rotate: number, flip: boolean, at: number) => {
    const s = pop(frame, fps, at, 11);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${(flip ? -1 : 1) * s} ${s})`}>
        <path d={LEAF} fill={`url(#${uid}-leaf)`} stroke="#B7F5CF" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 6 -1 C 30 -12 54 -12 74 -9" fill="none" stroke="#1F9D57" strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g>
      <defs>
        <Grad id={`${uid}-leaf`} from="#6FEFA2" to="#22B565" />
        <Grad id={`${uid}-pot`} from="#F09A68" to="#C9643A" />
      </defs>
      <g transform={about(200, 262, 1, sway)}>
        <Draw d="M 200 262 C 197 224 204 190 200 132" p={tween(frame, 2, 16)} stroke="#2FBF6E" strokeWidth={10} />
        {leaf(200, 214, -18, false, 9)}
        {leaf(200, 186, -22, true, 13)}
        {leaf(200, 136, -62, false, 17)}
        {leaf(200, 138, -58, true, 19)}
      </g>
      <g transform={about(200, 320, pop(frame, fps))}>
        <path d="M 150 270 L 250 270 L 238 322 L 162 322 Z" fill={`url(#${uid}-pot)`} />
        <rect x={140} y={254} width={120} height={20} rx={7} fill="#F6AE82" />
      </g>
      {frame > 20 && <Sparkle x={262} y={120} size={13} frame={frame} />}
      {frame > 24 && <Sparkle x={132} y={156} size={9} frame={frame} phase={0.4} />}
    </g>
  );
};

export const BODY_VISUALS = { brain, heart, dna, strength, sleep, eye, water, plant };
