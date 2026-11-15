import { FONT } from '../fonts';
import { HEART, INK, PAPER, STEEL, about, cycle, pop, tween, wave, type Visual } from './kit';
import { Draw, Grad, Sparkle } from './parts';

/** Tech and social: phone, ai, code, chat, audience, video, globe. */

const phone: Visual = ({ frame, fps, uid }) => {
  const scroll = (frame * 2.2) % 80;
  return (
    <g>
      <defs>
        <Grad id={`${uid}-screen`} from="#7C6CFF" to="#FF5FA2" x2={0.6} />
        <clipPath id={`${uid}-glass`}>
          <rect x={140} y={74} width={120} height={252} rx={18} />
        </clipPath>
      </defs>
      <g transform={about(200, 200, pop(frame, fps), -6)}>
        <rect x={128} y={62} width={144} height={276} rx={28} fill={INK} stroke={STEEL} strokeWidth={6} />
        <rect x={140} y={74} width={120} height={252} rx={18} fill={`url(#${uid}-screen)`} />
        <g clipPath={`url(#${uid}-glass)`}>
          {[0, 1, 2, 3, 4].map((k) => {
            const y = 96 + k * 80 - scroll;
            return (
              <g key={k}>
                <rect x={150} y={y} width={100} height={66} rx={10} fill="#fff" opacity={0.22} />
                <circle cx={164} cy={y + 14} r={7} fill="#fff" opacity={0.7} />
                <rect x={176} y={y + 9} width={48} height={9} rx={4.5} fill="#fff" opacity={0.6} />
                <rect x={158} y={y + 46} width={70} height={8} rx={4} fill="#fff" opacity={0.35} />
              </g>
            );
          })}
        </g>
        <rect x={178} y={80} width={44} height={10} rx={5} fill={INK} />
      </g>
      {[0, 1, 2].map((k) => {
        // Likes float up beside the phone.
        const c = cycle(frame - 10, 40, k / 3);
        return (
          <g key={k} transform={`translate(${300 + 16 * wave(frame, 30, k * 0.3)} ${270 - 150 * c}) scale(${0.9 + 0.7 * c})`} opacity={frame > 10 ? Math.sin(Math.PI * c) : 0}>
            <path d={HEART} fill="#FF4D6D" />
          </g>
        );
      })}
      <g transform={about(110, 132, pop(frame, fps, 12, 9))}>
        <circle cx={110} cy={132} r={24} fill="#FF4D4D" stroke="#fff" strokeWidth={4} />
        <text x={110} y={143} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
          1
        </text>
      </g>
    </g>
  );
};

/** Circuit traces out of the chip: pin side, pin offset, then where the trace bends to. */
const TRACES: [number, number, number, number][] = [
  [0, -30, 86, 110], [0, 30, 70, 264], [1, -30, 314, 122], [1, 30, 330, 278], [2, -28, 150, 70], [2, 28, 262, 62], [3, -28, 138, 330], [3, 28, 250, 338],
];

const ai: Visual = ({ frame, fps, accent, uid }) => {
  const core = 0.75 + 0.25 * wave(frame, 24);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-core`} from="#A78BFA" to="#5CE1E6" x2={1} />
      </defs>
      {TRACES.map(([side, off, ex, ey], k) => {
        // Start at the chip edge, run straight out, then bend to the end node.
        const start: [number, number] = side === 0 ? [136, 200 + off] : side === 1 ? [264, 200 + off] : side === 2 ? [200 + off, 136] : [200 + off, 264];
        const mid: [number, number] = side < 2 ? [ex + (side === 0 ? 26 : -26), start[1]] : [start[0], ey + (side === 2 ? 26 : -26)];
        const p = tween(frame, 6 + k, 18 + k);
        const t = cycle(frame - 18, 26, k * 0.29);
        // The signal runs from the outer node into the chip.
        const sx = t < 0.5 ? ex + (mid[0] - ex) * (t * 2) : mid[0] + (start[0] - mid[0]) * (t * 2 - 1);
        const sy = t < 0.5 ? ey + (mid[1] - ey) * (t * 2) : mid[1] + (start[1] - mid[1]) * (t * 2 - 1);
        return (
          <g key={k}>
            <Draw d={`M ${start[0]} ${start[1]} L ${mid[0]} ${mid[1]} L ${ex} ${ey}`} p={p} stroke={accent} strokeWidth={5} opacity={0.75} />
            <circle cx={ex} cy={ey} r={9} fill={accent} transform={about(ex, ey, pop(frame, fps, 16 + k))} />
            {frame > 20 + k && <circle cx={sx} cy={sy} r={5.5} fill="#fff" opacity={Math.sin(Math.PI * t)} />}
          </g>
        );
      })}
      <g transform={about(200, 200, pop(frame, fps))}>
        <rect x={132} y={132} width={136} height={136} rx={24} fill="#171B2C" stroke={accent} strokeWidth={6} />
        <rect x={158} y={158} width={84} height={84} rx={16} fill={`url(#${uid}-core)`} opacity={core} />
        <text x={200} y={216} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">
          AI
        </text>
      </g>
      {frame > 14 && <Sparkle x={292} y={96} size={15} frame={frame} />}
      {frame > 18 && <Sparkle x={100} y={300} size={11} frame={frame} phase={0.5} />}
    </g>
  );
};

const CODE_LINES: [number, number, number, string][] = [
  [100, 162, 92, '#A78BFA'], [120, 190, 148, '#5CE1E6'], [120, 218, 104, '#3DDC84'], [140, 246, 126, '#FFC53D'], [120, 274, 70, '#FF7EB6'], [100, 302, 40, '#A78BFA'],
];

const code: Visual = ({ frame, fps }) => {
  const typing = Math.min(CODE_LINES.length - 1, Math.max(0, Math.floor((frame - 6) / 5)));
  return (
    <g transform={about(200, 210, pop(frame, fps))}>
      <rect x={72} y={92} width={256} height={240} rx={20} fill="#141827" stroke="#39415E" strokeWidth={4} />
      <path d="M 72 132 L 328 132" stroke="#39415E" strokeWidth={3} />
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, k) => (
        <circle key={c} cx={98 + k * 22} cy={112} r={7.5} fill={c} />
      ))}
      {CODE_LINES.map(([x, y, w, color], k) => {
        const p = tween(frame, 6 + k * 5, 11 + k * 5);
        return p > 0 ? <rect key={k} x={x} y={y - 7} width={w * p} height={14} rx={7} fill={color} /> : null;
      })}
      {frame > 6 && Math.floor(frame / 8) % 2 === 0 && (
        <rect x={CODE_LINES[typing][0] + CODE_LINES[typing][2] * tween(frame, 6 + typing * 5, 11 + typing * 5) + 6} y={CODE_LINES[typing][1] - 11} width={6} height={22} rx={2} fill={PAPER} />
      )}
    </g>
  );
};

const chat: Visual = ({ frame, fps, uid }) => (
  <g>
    <defs>
      <Grad id={`${uid}-me`} from="#5AB0FF" to="#2F6BFF" />
    </defs>
    <g transform={about(110, 200, pop(frame, fps, 0, 11))}>
      <path d="M 112 190 L 92 226 L 146 196 Z" fill={PAPER} />
      <rect x={78} y={104} width={184} height={92} rx={32} fill={PAPER} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={134 + k * 36} cy={150 - 9 * Math.max(0, wave(frame, 24, -k * 0.16))} r={11} fill="#8A93A8" />
      ))}
    </g>
    <g transform={about(290, 300, pop(frame, fps, 9, 11))}>
      <path d="M 288 296 L 308 330 L 254 300 Z" fill="#2F6BFF" />
      <rect x={138} y={212} width={184} height={92} rx={32} fill={`url(#${uid}-me)`} />
      <Draw d="M 172 244 L 288 244" p={tween(frame, 14, 22)} stroke="#fff" strokeWidth={10} />
      <Draw d="M 172 272 L 250 272" p={tween(frame, 18, 26)} stroke="#fff" strokeWidth={10} opacity={0.75} />
    </g>
  </g>
);

const PERSON_BODY = 'M -21 24 C -21 3 21 3 21 24 Z';

const audience: Visual = ({ frame, fps, accent }) => {
  const person = (x: number, y: number, scale: number, fill: string, at: number, key: string | number) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${scale * pop(frame, fps, at, 10)})`}>
      <circle cx={0} cy={-10} r={11.5} fill={fill} />
      <path d={PERSON_BODY} fill={fill} />
    </g>
  );
  const ring = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
    return [200 + 104 * Math.cos(a), 204 + 104 * Math.sin(a)] as const;
  });
  return (
    <g>
      {ring.map(([x, y], k) => {
        const p = tween(frame, 5 + k * 2, 13 + k * 2);
        return <line key={k} x1={200} y1={204} x2={200 + (x - 200) * p} y2={204 + (y - 204) * p} stroke={accent} strokeWidth={4} strokeLinecap="round" opacity={0.6} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => {
        // More people keep joining further out.
        const a = (k / 12) * Math.PI * 2 + 0.26;
        return <circle key={k} cx={200 + 152 * Math.cos(a)} cy={204 + 152 * Math.sin(a)} r={7} fill="#fff" opacity={0.45} transform={about(200 + 152 * Math.cos(a), 204 + 152 * Math.sin(a), pop(frame, fps, 18 + k))} />;
      })}
      {ring.map(([x, y], k) => person(x, y, 1.25, PAPER, 9 + k * 2, k))}
      <circle cx={200} cy={204} r={52 + 5 * wave(frame, 30)} fill={accent} opacity={0.2} />
      {person(200, 200, 2.3, accent, 0, 'me')}
    </g>
  );
};

const video: Visual = ({ frame, fps, uid }) => {
  const played = cycle(frame - 8, 90);
  const ring = cycle(frame - 8, 32);
  return (
    <g transform={about(200, 200, pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-player`} from="#FF5F7E" to="#FF9A3D" x2={1} />
      </defs>
      <rect x={66} y={104} width={268} height={164} rx={24} fill={`url(#${uid}-player)`} />
      <rect x={66} y={104} width={268} height={164} rx={24} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} />
      {frame > 8 && <circle cx={200} cy={186} r={44 + 30 * ring} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6 * (1 - ring)} />}
      <circle cx={200} cy={186} r={44} fill="#fff" opacity={0.25} />
      <path d="M 186 160 L 186 212 L 230 186 Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" transform={about(200, 186, pop(frame, fps, 5, 9))} />
      <rect x={66} y={292} width={268} height={12} rx={6} fill="#fff" opacity={0.25} />
      <rect x={66} y={292} width={Math.max(12, 268 * played)} height={12} rx={6} fill="#FF5F7E" />
      <circle cx={66 + 268 * played} cy={298} r={12} fill="#fff" />
    </g>
  );
};

const globe: Visual = ({ frame, fps, accent, uid }) => {
  // A satellite circles the globe: in front on the lower half of its orbit, behind on the upper half.
  const orbit = (frame / 70) * Math.PI * 2;
  const front = Math.sin(orbit) > 0;
  const satellite = <circle cx={200 + 158 * Math.cos(orbit)} cy={200 + 46 * Math.sin(orbit)} r={10} fill="#fff" stroke={accent} strokeWidth={4} />;
  return (
    <g transform={about(200, 200, pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-sea`} from="#6FE3F0" to="#2456E6" x2={0.5} />
        <clipPath id={`${uid}-ball`}>
          <circle cx={200} cy={200} r={110} />
        </clipPath>
      </defs>
      <g transform="rotate(-18 200 200)">
        <path d="M 42 200 A 158 46 0 0 1 358 200" fill="none" stroke={accent} strokeWidth={5} opacity={0.5} />
        {!front && satellite}
      </g>
      <circle cx={200} cy={200} r={110} fill={`url(#${uid}-sea)`} />
      <g clipPath={`url(#${uid}-ball)`}>
        {[0, 1, 2, 3].map((k) => {
          // Land drifts across as the globe turns.
          const x = ((k * 96 + frame * 1.3) % 384) - 82;
          return <path key={k} d={k % 2 === 0 ? 'M 0 0 C 18 -22 52 -18 60 4 C 70 26 44 40 30 62 C 18 80 -4 60 -8 38 C -12 22 -10 12 0 0 Z' : 'M 0 0 C 22 -10 46 2 44 22 C 42 40 16 44 4 34 C -10 24 -12 8 0 0 Z'} transform={`translate(${x} ${k % 2 === 0 ? 134 : 232})`} fill="#4ADE80" opacity={0.9} />;
        })}
        {[0, 1, 2].map((k) => {
          const c = cycle(frame, 100, k / 3);
          return <ellipse key={k} cx={200} cy={200} rx={Math.abs(110 * Math.cos(Math.PI * c))} ry={110} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4} />;
        })}
        {[-66, 0, 66].map((dy) => (
          <path key={dy} d={`M 80 ${200 + dy} Q 200 ${200 + dy * 1.18} 320 ${200 + dy}`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4} />
        ))}
        <circle cx={160} cy={156} r={70} fill="#fff" opacity={0.12} />
      </g>
      <circle cx={200} cy={200} r={110} fill="none" stroke="#DDF6FF" strokeWidth={4} />
      <g transform="rotate(-18 200 200)">
        <path d="M 42 200 A 158 46 0 0 0 358 200" fill="none" stroke={accent} strokeWidth={5} />
        {front && satellite}
      </g>
    </g>
  );
};

export const TECH_VISUALS = { phone, ai, code, chat, audience, video, globe };
