import { INK, PAPER, STEEL, about, cycle, gearPath, jitter, pop, starPath, tween, wave, type Visual } from './kit';
import { Draw, Grad, Sparkle } from './parts';

/** Energy and everything else: fire, lightning, battery, star, shield, atom, gears, calendar, mountain, music. */

const flame = (sway: number) =>
  `M 200 76 C ${238 + sway} 124 286 166 286 226 C 286 276 248 314 200 314 C 152 314 114 276 114 226 C 114 194 130 172 148 152 C 154 178 166 190 178 188 C 170 150 ${180 + sway} 108 200 76 Z`;

const fire: Visual = ({ frame, fps, uid }) => {
  const layer = (scale: number, fill: string, phase: number) => (
    <path d={flame(7 * wave(frame, 16, phase))} fill={fill} transform={about(200, 314, [scale * (1 + 0.03 * wave(frame, 9, phase)), scale * (1 + 0.06 * wave(frame, 7, phase))])} />
  );
  return (
    <g transform={about(200, 314, pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-fire`} from="#FF8A1F" to="#F0281E" />
      </defs>
      {[0, 1, 2, 3].map((k) => {
        const c = cycle(frame - 6, 34, k * 0.27);
        return <circle key={k} cx={150 + k * 34 + 10 * wave(frame, 20, k * 0.3)} cy={150 - 96 * c} r={5 - 2.5 * c} fill="#FFC53D" opacity={frame > 6 ? 1 - c : 0} />;
      })}
      {layer(1, `url(#${uid}-fire)`, 0)}
      {layer(0.68, '#FFB02E', 0.3)}
      {layer(0.4, '#FFF0A3', 0.6)}
    </g>
  );
};

const BOLT = 'M 226 62 L 124 218 L 190 218 L 164 338 L 280 170 L 212 170 Z';

const lightning: Visual = ({ frame, fps, uid }) => {
  // It strikes with a stutter, then holds with a soft pulse.
  const strike = frame < 2 ? 1 : frame < 4 ? 0.25 : frame < 6 ? 1 : frame < 8 ? 0.5 : 1;
  const sparkAt = Math.floor(frame / 5);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-bolt`} from="#FFF3A6" to="#FF9A1F" />
      </defs>
      <path d={BOLT} fill="#FFE066" opacity={0.25 * (0.6 + 0.4 * wave(frame, 14))} transform={about(200, 200, 1.22)} />
      {frame > 6 &&
        [0, 1, 2].map((k) => {
          // Short arcs jump around the bolt, moving every few frames.
          const a = jitter(sparkAt, k + 1) * Math.PI;
          const x = 200 + 128 * Math.cos(a);
          const y = 200 + 128 * Math.sin(a);
          return <path key={k} d={`M ${x} ${y} l ${10 * jitter(sparkAt, k + 7)} 12 l ${-14 * jitter(sparkAt, k + 11)} 10 l ${12 * jitter(sparkAt, k + 17)} 12`} fill="none" stroke="#FFF3A6" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />;
        })}
      <path d={BOLT} fill={`url(#${uid}-bolt)`} stroke="#fff" strokeWidth={5} strokeLinejoin="round" opacity={strike} transform={about(200, 200, pop(frame, fps, 0, 9))} />
    </g>
  );
};

const battery: Visual = ({ frame, fps }) => {
  // Charges up, holds full, then starts again.
  const charge = Math.min(1, cycle(frame - 4, 70) * 1.5);
  const colors = ['#FF5A5A', '#FFA91F', '#C6E33D', '#3DDC84'];
  const full = charge >= 1;
  return (
    <g transform={about(200, 200, pop(frame, fps))}>
      <rect x={66} y={132} width={236} height={136} rx={26} fill="#fff" fillOpacity={0.06} stroke={PAPER} strokeWidth={10} />
      <rect x={308} y={172} width={24} height={56} rx={9} fill={PAPER} />
      {colors.map((c, k) => {
        const lit = tween(charge * 4.4, k + 0.2, k + 0.9);
        return <rect key={c} x={86 + k * 50} y={152} width={42} height={96} rx={10} fill={c} opacity={0.12 + 0.88 * lit} />;
      })}
      {full && <path d="M 200 150 L 162 208 L 192 208 L 180 252 L 226 190 L 196 190 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.6 + 0.4 * wave(frame, 12)} />}
    </g>
  );
};

const star: Visual = ({ frame, fps, uid }) => (
  <g>
    <defs>
      <Grad id={`${uid}-star`} from="#FFEE8C" to="#FFA91F" />
    </defs>
    <path d={starPath(200, 158, 92)} fill="#FFD43B" opacity={0.22} transform={about(200, 158, 1.18 + 0.06 * wave(frame, 28))} />
    <path d={starPath(200, 158, 92)} fill={`url(#${uid}-star)`} stroke="#FFF6CC" strokeWidth={5} strokeLinejoin="round" transform={about(200, 158, pop(frame, fps, 0, 9), -18 * (1 - tween(frame, 0, 12)))} />
    {[0, 1, 2, 3, 4].map((k) => (
      <path key={k} d={starPath(104 + k * 48, 292, 22)} fill={`url(#${uid}-star)`} stroke="#FFF6CC" strokeWidth={3} strokeLinejoin="round" transform={about(104 + k * 48, 292, pop(frame, fps, 8 + k * 3, 9))} />
    ))}
    {frame > 12 && <Sparkle x={308} y={96} size={14} frame={frame} />}
    {frame > 16 && <Sparkle x={92} y={128} size={11} frame={frame} phase={0.45} />}
  </g>
);

const SHIELD = 'M 200 78 L 298 114 L 298 196 C 298 258 254 302 200 326 C 146 302 102 258 102 196 L 102 114 Z';

const shield: Visual = ({ frame, fps, uid }) => {
  const shine = cycle(frame - 12, 54);
  const echo = cycle(frame - 10, 36);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-shield`} from="#63B3FF" to="#2440E0" x2={0.5} />
        <clipPath id={`${uid}-guard`}>
          <path d={SHIELD} />
        </clipPath>
      </defs>
      {frame > 10 && <path d={SHIELD} fill="none" stroke="#63B3FF" strokeWidth={6} strokeLinejoin="round" opacity={0.6 * (1 - echo)} transform={about(200, 204, 1 + 0.28 * echo)} />}
      <g transform={about(200, 204, pop(frame, fps))}>
        <path d={SHIELD} fill={`url(#${uid}-shield)`} stroke="#D6E8FF" strokeWidth={6} strokeLinejoin="round" />
        <path d="M 200 78 L 200 326 C 146 302 102 258 102 196 L 102 114 Z" fill="#fff" opacity={0.1} />
        <g clipPath={`url(#${uid}-guard)`}>{frame > 12 && <rect x={70 + 330 * shine} y={60} width={30} height={290} fill="#fff" opacity={0.4 * Math.sin(Math.PI * Math.min(1, shine * 2))} transform="skewX(-18)" />}</g>
        <Draw d="M 156 202 L 188 234 L 246 168" p={tween(frame, 7, 16)} stroke="#fff" strokeWidth={22} />
      </g>
    </g>
  );
};

const atom: Visual = ({ frame, fps, accent, uid }) => (
  <g transform={about(200, 200, pop(frame, fps))}>
    <defs>
      <radialGradient id={`${uid}-core`} cx="0.35" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#FFB3C7" />
        <stop offset="1" stopColor="#F0345F" />
      </radialGradient>
    </defs>
    {[0, 60, 120].map((deg, k) => {
      const a = frame * 0.16 + k * 2.1;
      return (
        <g key={deg} transform={`rotate(${deg} 200 200)`}>
          <ellipse cx={200} cy={200} rx={138} ry={50} fill="none" stroke={accent} strokeWidth={5} opacity={0.75} />
          <circle cx={200 + 138 * Math.cos(a)} cy={200 + 50 * Math.sin(a)} r={11} fill="#fff" stroke={accent} strokeWidth={4} />
        </g>
      );
    })}
    <circle cx={200} cy={200} r={30 + 2 * wave(frame, 20)} fill={`url(#${uid}-core)`} />
    <circle cx={190} cy={190} r={8} fill="#fff" opacity={0.5} />
  </g>
);

const gears: Visual = ({ frame, fps, accent }) => {
  const turn = frame * 2.2;
  return (
    <g>
      <g transform={`translate(170 222) scale(${pop(frame, fps)}) rotate(${turn})`}>
        <path d={gearPath(10, 92, 72)} fill={STEEL} stroke="#EEF2FA" strokeWidth={4} strokeLinejoin="round" />
        <circle r={46} fill="none" stroke="#8A93A8" strokeWidth={6} />
        <circle r={22} fill="#141827" stroke="#8A93A8" strokeWidth={5} />
      </g>
      {/* The small gear has 6 teeth to the big one's 10, so it turns faster the other way. */}
      <g transform={`translate(272 132) scale(${pop(frame, fps, 5)}) rotate(${-turn * (10 / 6) + 30})`}>
        <path d={gearPath(6, 58, 42)} fill={accent} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} strokeLinejoin="round" />
        <circle r={15} fill="#141827" stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />
      </g>
    </g>
  );
};

const calendar: Visual = ({ frame, fps, accent, uid }) => (
  <g transform={about(200, 210, pop(frame, fps))}>
    <defs>
      <clipPath id={`${uid}-page`}>
        <rect x={88} y={104} width={224} height={212} rx={24} />
      </clipPath>
    </defs>
    <rect x={88} y={104} width={224} height={212} rx={24} fill={PAPER} />
    <rect x={88} y={104} width={224} height={62} fill="#FF5A5A" clipPath={`url(#${uid}-page)`} />
    {[142, 258].map((x) => (
      <rect key={x} x={x - 8} y={84} width={16} height={44} rx={8} fill={STEEL} stroke="#6B7389" strokeWidth={3} />
    ))}
    {[0, 1, 2].flatMap((row) =>
      [0, 1, 2, 3].map((col) => {
        const k = row * 4 + col;
        const marked = k === 6;
        const x = 128 + col * 48;
        const y = 198 + row * 40;
        return (
          <g key={k} transform={about(x, y, pop(frame, fps, 4 + k))}>
            <circle cx={x} cy={y} r={marked ? 18 : 10} fill={marked ? accent : '#C3CADB'} />
            {marked && <Draw d={`M ${x - 8} ${y} L ${x - 2} ${y + 6} L ${x + 9} ${y - 6}`} p={tween(frame, 16, 23)} stroke={INK} strokeWidth={5} />}
          </g>
        );
      })
    )}
  </g>
);

const mountain: Visual = ({ frame, fps, uid }) => {
  const rise = tween(frame, 0, 12);
  const flag = pop(frame, fps, 20, 9);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-peak`} from="#8D9BFF" to="#3443A8" />
        <clipPath id={`${uid}-ground`}>
          <rect x={30} y={40} width={340} height={266} />
        </clipPath>
      </defs>
      <circle cx={292} cy={112} r={26} fill="#FFD43B" opacity={0.9 * tween(frame, 6, 14)} />
      <g clipPath={`url(#${uid}-ground)`}>
        <g transform={`translate(0 ${(1 - rise) * 220})`}>
          <path d="M 150 306 L 254 150 L 350 306 Z" fill="#4B5578" />
          <path d="M 50 306 L 172 116 L 294 306 Z" fill={`url(#${uid}-peak)`} />
          <path d="M 172 116 L 201 161 L 186 152 L 174 170 L 160 150 L 143 161 Z" fill="#fff" />
        </g>
      </g>
      {[0, 1, 2, 3, 4].map((k) => {
        // Footsteps up to the summit.
        const pts = [[96, 290], [128, 252], [118, 214], [150, 184], [160, 150]][k];
        return <circle key={k} cx={pts[0]} cy={pts[1]} r={5} fill="#fff" opacity={0.85} transform={about(pts[0], pts[1], pop(frame, fps, 10 + k * 2))} />;
      })}
      <g transform={about(172, 116, flag)}>
        <line x1={172} y1={118} x2={172} y2={70} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <path d={`M 172 72 Q 192 ${70 + 5 * wave(frame, 16)} 212 ${84 + 3 * wave(frame, 16, 0.3)} Q 192 ${92 + 5 * wave(frame, 16)} 172 98 Z`} fill="#FF5A5A" />
      </g>
      <line x1={46} y1={306} x2={354} y2={306} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
    </g>
  );
};

const music: Visual = ({ frame, fps, uid }) => {
  const bounce = 1 + 0.05 * wave(frame, 15);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-note`} from="#C4A6FF" to="#FF6FB1" x2={1} />
      </defs>
      {[0, 1, 2].map((k) => {
        const c = cycle(frame - 8, 48, k / 3);
        const x = k === 1 ? 318 : 84 + k * 4;
        return (
          <g key={k} transform={`translate(${x + 12 * wave(frame, 26, k * 0.3)} ${250 - 150 * c}) scale(${0.5 + 0.2 * c})`} opacity={frame > 8 ? Math.sin(Math.PI * c) * 0.85 : 0}>
            <ellipse cx={0} cy={0} rx={20} ry={15} transform="rotate(-20)" fill="#fff" />
            <line x1={17} y1={-6} x2={17} y2={-70} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
            <path d="M 17 -70 C 34 -62 44 -50 40 -32" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          </g>
        );
      })}
      <g transform={about(200, 260, pop(frame, fps) * bounce)}>
        <path d="M 172 132 L 286 104 L 286 140 L 172 168 Z" fill={`url(#${uid}-note)`} stroke={`url(#${uid}-note)`} strokeWidth={6} strokeLinejoin="round" />
        {/* Solid colors on the stems: a gradient has no width to span on a straight vertical line. */}
        <line x1={175} y1={136} x2={175} y2={264} stroke="#C4A6FF" strokeWidth={13} strokeLinecap="round" />
        <line x1={283} y1={110} x2={283} y2={238} stroke="#FF6FB1" strokeWidth={13} strokeLinecap="round" />
        <ellipse cx={150} cy={268} rx={32} ry={24} transform="rotate(-20 150 268)" fill="#C4A6FF" />
        <ellipse cx={258} cy={242} rx={32} ry={24} transform="rotate(-20 258 242)" fill="#FF6FB1" />
      </g>
    </g>
  );
};

export const ENERGY_VISUALS = { fire, lightning, battery, star, shield, atom, gears, calendar, mountain, music };
