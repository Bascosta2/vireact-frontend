import { INK, PAPER, STEEL, about, cycle, pop, tween, wave, type Visual } from './kit';
import { Draw, Grad } from './parts';

/** Ideas and signals: idea, book, search, question, warning, check, cross, lock, time. */

const BULB = 'M 200 84 C 256 84 292 124 292 174 C 292 208 272 228 258 246 C 250 256 248 266 248 276 L 152 276 C 152 266 150 256 142 246 C 128 228 108 208 108 174 C 108 124 144 84 200 84 Z';

const idea: Visual = ({ frame, fps, uid }) => {
  // The bulb flickers twice, then stays on.
  const on = frame < 6 ? 0 : frame < 8 ? 1 : frame < 10 ? 0.15 : Math.min(1, tween(frame, 10, 14));
  const glow = on * (0.85 + 0.15 * wave(frame, 30));
  return (
    <g transform={about(200, 200, 0.92 * pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-bulb`} from="#FFF6C2" to="#FFC21F" />
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0" stopColor="#FFE066" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFE066" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={200} cy={176} r={170} fill={`url(#${uid}-halo)`} opacity={glow} />
      {[-78, -52, -26, 0, 26, 52, 78].map((deg, k) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const s = on > 0.5 ? pop(frame, fps, 11 + k * 0.6) : 0;
        return <line key={deg} x1={200 + 118 * Math.cos(a)} y1={176 + 118 * Math.sin(a)} x2={200 + (118 + 30 * s) * Math.cos(a)} y2={176 + (118 + 30 * s) * Math.sin(a)} stroke="#FFE066" strokeWidth={9} strokeLinecap="round" opacity={s} />;
      })}
      <path d={BULB} fill="#fff" opacity={0.14} />
      <path d={BULB} fill={`url(#${uid}-bulb)`} opacity={glow} />
      <path d={BULB} fill="none" stroke={PAPER} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 174 262 L 174 214 L 187 192 L 200 214 L 213 192 L 226 214 L 226 262" fill="none" stroke={on > 0.5 ? '#E8590C' : STEEL} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 140 150 C 146 126 162 110 184 104" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      <rect x={158} y={282} width={84} height={15} rx={6} fill="#9AA3B2" />
      <rect x={164} y={301} width={72} height={13} rx={6} fill="#7C8598" />
      <rect x={180} y={318} width={40} height={11} rx={5} fill="#5E6678" />
    </g>
  );
};

const book: Visual = ({ frame, fps, accent }) => {
  const flip = cycle(frame - 14, 46);
  const flipping = frame > 14 && flip < 0.6;
  const t = flip / 0.6;
  const tipX = 310 - 220 * t;
  const lift = 34 * Math.sin(Math.PI * t);
  const lines = (x1: number, x2: number, at: number) =>
    [152, 176, 200, 224, 248].map((y, k) => (
      <Draw key={y} d={`M ${x1} ${y} L ${k === 4 ? (x1 + x2) / 2 : x2} ${y}`} p={tween(frame, at + k * 2, at + 8 + k * 2)} stroke="#9AA3B2" strokeWidth={6} />
    ));
  return (
    <g transform={about(200, 206, pop(frame, fps))}>
      <path d="M 78 132 L 200 150 L 322 132 L 322 296 L 200 310 L 78 296 Z" fill={accent} stroke={accent} strokeWidth={10} strokeLinejoin="round" />
      <path d="M 200 134 C 170 114 120 114 90 128 L 90 284 C 120 270 170 270 200 290 Z" fill={PAPER} />
      <path d="M 200 134 C 230 114 280 114 310 128 L 310 284 C 280 270 230 270 200 290 Z" fill="#E3E8F5" />
      {lines(110, 180, 5)}
      {lines(220, 290, 9)}
      {flipping && (
        <path
          d={`M 200 134 Q ${(200 + tipX) / 2} ${116 - lift} ${tipX} ${128 - lift} L ${tipX} ${284 - lift} Q ${(200 + tipX) / 2} ${270 - lift} 200 290 Z`}
          fill="#fff"
          stroke="#C9D1E0"
          strokeWidth={2}
        />
      )}
      <line x1={200} y1={134} x2={200} y2={290} stroke="#B4BCCF" strokeWidth={4} />
    </g>
  );
};

const search: Visual = ({ frame, fps, accent, uid }) => {
  const cx = 186 + 34 * wave(frame, 64);
  const cy = 184 + 20 * wave(frame, 46, 0.2);
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-lens`}>
          <circle cx={cx} cy={cy} r={60} />
        </clipPath>
      </defs>
      {[
        [96, 116, 208], [96, 160, 150], [96, 204, 186], [96, 248, 124], [96, 292, 166],
      ].map(([x, y, w], k) => (
        <rect key={y} x={x} y={y} width={w * tween(frame, k * 2, 10 + k * 2)} height={22} rx={11} fill="#fff" opacity={0.2} />
      ))}
      <g transform={about(cx, cy, pop(frame, fps, 6))}>
        <line x1={cx + 46} y1={cy + 46} x2={cx + 100} y2={cy + 100} stroke="#2B3044" strokeWidth={28} strokeLinecap="round" />
        <line x1={cx + 46} y1={cy + 46} x2={cx + 100} y2={cy + 100} stroke={STEEL} strokeWidth={18} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={60} fill="#5CE1E6" opacity={0.2} />
        {/* What the lens passes over shows up brighter and larger. */}
        <g clipPath={`url(#${uid}-lens)`}>
          {[
            [96, 116, 208], [96, 160, 150], [96, 204, 186], [96, 248, 124], [96, 292, 166],
          ].map(([x, y, w]) => (
            <rect key={y} x={x} y={y} width={w} height={22} rx={11} fill={accent} transform={about(cx, cy, 1.25)} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={60} fill="none" stroke={PAPER} strokeWidth={13} />
        <path d={`M ${cx - 38} ${cy - 14} A 40 40 0 0 1 ${cx - 8} ${cy - 40}`} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
      </g>
    </g>
  );
};

const question: Visual = ({ frame, fps, accent }) => {
  const hook = 'M 146 150 C 146 108 176 86 204 86 C 240 86 264 112 264 144 C 264 178 236 190 216 208 C 206 218 204 230 204 248';
  return (
    <g transform={about(200, 200, 1, 5 * wave(frame, 50))}>
      {[0, 1, 2].map((k) => {
        const a = (frame / 80 + k / 3) * Math.PI * 2;
        return <circle key={k} cx={200 + 146 * Math.cos(a)} cy={200 + 54 * Math.sin(a)} r={7} fill="#fff" opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(a))} />;
      })}
      <Draw d={hook} p={tween(frame, 2, 16)} stroke={INK} strokeWidth={46} opacity={0.5} />
      <Draw d={hook} p={tween(frame, 2, 16)} stroke={accent} strokeWidth={32} />
      <Draw d={hook} p={tween(frame, 2, 16)} stroke="#fff" strokeWidth={8} opacity={0.35} />
      <circle cx={204} cy={300} r={20} fill={accent} transform={about(204, 300, pop(frame, fps, 15, 9))} />
    </g>
  );
};

const TRIANGLE = 'M 200 96 L 314 292 L 86 292 Z';

const warning: Visual = ({ frame, fps, uid }) => {
  const echo = cycle(frame - 8, 34);
  // A quick side-to-side shake as it lands.
  const shake = frame < 16 ? 9 * Math.exp(-frame / 6) * Math.sin(frame * 1.7) : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      <defs>
        <Grad id={`${uid}-warn`} from="#FFE066" to="#FFA91F" />
      </defs>
      {frame > 8 && <path d={TRIANGLE} fill="none" stroke="#FFC53D" strokeWidth={8} strokeLinejoin="round" opacity={0.6 * (1 - echo)} transform={about(200, 226, 1 + 0.32 * echo)} />}
      <g transform={about(200, 226, pop(frame, fps, 0, 10))}>
        <path d={TRIANGLE} fill={`url(#${uid}-warn)`} stroke={`url(#${uid}-warn)`} strokeWidth={26} strokeLinejoin="round" />
        <rect x={187} y={152} width={26} height={84} rx={13} fill="#1B1F2E" />
        <circle cx={200} cy={266} r={15} fill="#1B1F2E" />
      </g>
    </g>
  );
};

/** A round badge with rays that burst when the mark lands. */
function badge(frame: number, fps: number, id: string, from: string, to: string, burstAt: number) {
  return (
    <>
      <defs>
        <Grad id={id} from={from} to={to} x2={0.4} />
      </defs>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const a = (k / 8) * Math.PI * 2 + 0.39;
        const out = tween(frame, burstAt, burstAt + 10);
        return <line key={k} x1={200 + (126 + 22 * out) * Math.cos(a)} y1={200 + (126 + 22 * out) * Math.sin(a)} x2={200 + (138 + 36 * out) * Math.cos(a)} y2={200 + (138 + 36 * out) * Math.sin(a)} stroke={from} strokeWidth={8} strokeLinecap="round" opacity={frame >= burstAt ? 1 - tween(frame, burstAt + 4, burstAt + 16) : 0} />;
      })}
      <circle cx={200} cy={200} r={112} fill={`url(#${id})`} stroke="#fff" strokeOpacity={0.35} strokeWidth={5} transform={about(200, 200, pop(frame, fps))} />
    </>
  );
}

const check: Visual = ({ frame, fps, uid }) => (
  <g>
    {badge(frame, fps, `${uid}-ok`, '#5FE08F', '#12994A', 12)}
    <Draw d="M 146 204 L 184 242 L 258 160" p={tween(frame, 5, 14)} stroke="#fff" strokeWidth={28} />
  </g>
);

const cross: Visual = ({ frame, fps, uid }) => {
  const shake = frame > 10 && frame < 26 ? 8 * Math.exp(-(frame - 10) / 5) * Math.sin((frame - 10) * 1.8) : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      {badge(frame, fps, `${uid}-no`, '#FF7A7A', '#D62828', 13)}
      <Draw d="M 156 156 L 244 244" p={tween(frame, 4, 10)} stroke="#fff" strokeWidth={28} />
      <Draw d="M 244 156 L 156 244" p={tween(frame, 8, 14)} stroke="#fff" strokeWidth={28} />
    </g>
  );
};

const lock: Visual = ({ frame, fps, uid }) => {
  // The shackle starts raised and snaps shut.
  const shut = tween(frame, 9, 13);
  const closed = frame >= 13;
  const ring = cycle(frame - 13, 26);
  return (
    <g transform={about(200, 210, pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-lock`} from="#FFD86B" to="#F08C00" />
      </defs>
      {closed && frame < 39 && <rect x={118 - 30 * ring} y={176 - 30 * ring} width={164 + 60 * ring} height={134 + 60 * ring} rx={24 + 12 * ring} fill="none" stroke="#FFD86B" strokeWidth={5} opacity={0.7 * (1 - ring)} />}
      <path d="M 150 190 L 150 138 C 150 92 250 92 250 138 L 250 190" fill="none" stroke={STEEL} strokeWidth={24} strokeLinecap="round" transform={`translate(0 ${-34 * (1 - shut)})`} />
      <rect x={118} y={176} width={164} height={134} rx={24} fill={`url(#${uid}-lock)`} stroke="#FFF1B8" strokeWidth={4} />
      <circle cx={200} cy={228} r={15} fill="#1B1F2E" />
      <rect x={192} y={232} width={16} height={38} rx={7} fill="#1B1F2E" />
      <path d="M 134 204 C 134 192 142 186 154 186" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.55} />
    </g>
  );
};

const time: Visual = ({ frame, fps, accent }) => (
  <g transform={about(200, 200, pop(frame, fps))}>
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M ${200 + (136 + k * 14) * Math.cos(-0.5 - k * 0.1)} ${200 + (136 + k * 14) * Math.sin(-0.5 - k * 0.1)} A ${136 + k * 14} ${136 + k * 14} 0 0 1 ${200 + (136 + k * 14) * Math.cos(0.2 + k * 0.1)} ${200 + (136 + k * 14) * Math.sin(0.2 + k * 0.1)}`} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" opacity={(0.6 - k * 0.18) * (0.5 + 0.5 * wave(frame, 20, -k * 0.2))} />
    ))}
    <circle cx={200} cy={200} r={116} fill={PAPER} stroke={accent} strokeWidth={13} />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => {
      const a = (k / 12) * Math.PI * 2;
      const big = k % 3 === 0;
      return <line key={k} x1={200 + (big ? 84 : 92) * Math.cos(a)} y1={200 + (big ? 84 : 92) * Math.sin(a)} x2={200 + 100 * Math.cos(a)} y2={200 + 100 * Math.sin(a)} stroke={big ? INK : '#9AA3B2'} strokeWidth={big ? 7 : 4} strokeLinecap="round" />;
    })}
    <line x1={200} y1={200} x2={200} y2={144} stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${40 + frame * 1.1} 200 200)`} />
    <line x1={200} y1={200} x2={200} y2={116} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${frame * 13} 200 200)`} />
    <circle cx={200} cy={200} r={11} fill={accent} stroke={INK} strokeWidth={4} />
  </g>
);

export const IDEA_VISUALS = { idea, book, search, question, warning, check, cross, lock, time };
