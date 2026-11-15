import { FONT } from '../fonts';
import { PAPER, SLATE, about, cycle, jitter, pop, starPath, tween, wave, type Visual } from './kit';
import { Draw, Grad, Sparkle } from './parts';

/** Money and business: money, growth, decline, target, trophy, rocket, house. */

const money: Visual = ({ frame, fps, uid }) => {
  const bill = (rotate: number, at: number, dy: number) => (
    <g transform={`translate(0 ${dy}) ${about(200, 226, pop(frame, fps, at), rotate)}`}>
      <rect x={96} y={172} width={208} height={108} rx={14} fill={`url(#${uid}-bill)`} stroke="#0F7A3D" strokeWidth={3} />
      <rect x={108} y={184} width={184} height={84} rx={8} fill="none" stroke="#C9F7DA" strokeWidth={3} opacity={0.8} />
      <circle cx={200} cy={226} r={30} fill="#C9F7DA" />
      <text x={200} y={241} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#0F7A3D">
        $
      </text>
      <circle cx={128} cy={226} r={7} fill="#C9F7DA" opacity={0.8} />
      <circle cx={272} cy={226} r={7} fill="#C9F7DA" opacity={0.8} />
    </g>
  );
  const coin = (x: number, y: number, at: number, phase: number) => {
    const s = pop(frame, fps, at);
    // The coin turns on its axis as it floats.
    const turn = Math.cos((frame / 34 + phase) * Math.PI * 2);
    return (
      <g transform={`translate(0 ${-8 * wave(frame, 40, phase)}) ${about(x, y, [s * Math.max(0.18, Math.abs(turn)), s])}`}>
        <circle cx={x} cy={y} r={27} fill={`url(#${uid}-coin)`} stroke="#B36B00" strokeWidth={4} />
        <circle cx={x} cy={y} r={18} fill="none" stroke="#FFF1B8" strokeWidth={3} opacity={0.8} />
        <text x={x} y={y + 11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#9A5B00">
          $
        </text>
      </g>
    );
  };
  return (
    <g>
      <defs>
        <Grad id={`${uid}-bill`} from="#5FE08F" to="#17A34A" x2={0.4} />
        <Grad id={`${uid}-coin`} from="#FFE680" to="#FFA91F" />
      </defs>
      {bill(-11, 0, 14)}
      {bill(7, 3, 6)}
      {bill(-2, 6, -4)}
      {coin(112, 118, 9, 0)}
      {coin(290, 108, 12, 0.35)}
      {coin(204, 86, 15, 0.7)}
      {frame > 16 && <Sparkle x={330} y={176} size={12} frame={frame} />}
      {frame > 18 && <Sparkle x={70} y={196} size={10} frame={frame} phase={0.5} />}
    </g>
  );
};

/** Shared by growth and decline: four bars, a trend line that draws itself, and an arrow head. */
function chart(frame: number, fps: number, uid: string, up: boolean) {
  const color = up ? '#3DDC84' : '#FF5A5A';
  const heights = up ? [52, 86, 124, 168] : [168, 124, 86, 52];
  const line = up ? 'M 88 252 L 148 214 L 196 234 L 300 122' : 'M 88 128 L 148 166 L 196 146 L 300 258';
  const head = up ? 'M 313 107 L 308 136 L 284 113 Z' : 'M 313 273 L 284 267 L 308 244 Z';
  const drawn = tween(frame, 8, 22);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-bar`} from={color} to={`${color}55`} />
      </defs>
      <path d="M 78 96 L 78 306 L 328 306" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      {[124, 190, 256].map((y) => (
        <line key={y} x1={86} y1={y} x2={322} y2={y} stroke="#fff" strokeWidth={2} strokeDasharray="4 8" opacity={0.16} />
      ))}
      {heights.map((h, k) => {
        const s = tween(frame, 2 + k * 3, 12 + k * 3);
        return <rect key={k} x={100 + k * 54} y={300 - h * s} width={38} height={h * s} rx={7} fill={`url(#${uid}-bar)`} opacity={0.85} />;
      })}
      <Draw d={line} p={drawn} stroke="#0B0D17" strokeWidth={18} opacity={0.55} />
      <Draw d={line} p={drawn} stroke={color} strokeWidth={10} />
      <path d={head} fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round" transform={about(300, up ? 122 : 258, pop(frame, fps, 20))} />
      {up && frame > 22 && <Sparkle x={332} y={86} size={13} frame={frame} />}
    </g>
  );
}

const growth: Visual = ({ frame, fps, uid }) => chart(frame, fps, uid, true);
const decline: Visual = ({ frame, fps, uid }) => chart(frame, fps, uid, false);

const target: Visual = ({ frame, fps }) => {
  const fly = tween(frame, 6, 13);
  const hit = frame >= 13;
  // The arrow quivers for a moment after it lands.
  const quiver = hit ? 5 * Math.exp(-(frame - 13) / 6) * Math.sin((frame - 13) * 1.5) : 0;
  const ring = cycle(frame - 13, 30);
  return (
    <g>
      <g transform={about(200, 205, pop(frame, fps) * (hit ? 1 + 0.04 * Math.exp(-(frame - 13) / 4) : 1))}>
        {[
          [124, '#FF5A5A'], [96, PAPER], [68, '#FF5A5A'], [40, PAPER], [15, '#FF5A5A'],
        ].map(([r, fill]) => (
          <circle key={r} cx={200} cy={205} r={r as number} fill={fill as string} />
        ))}
      </g>
      {hit && <circle cx={200} cy={205} r={20 + 120 * ring} fill="none" stroke="#fff" strokeWidth={5} opacity={frame < 43 ? 0.7 * (1 - ring) : 0} />}
      {frame >= 6 && (
        <g transform={`translate(${(1 - fly) * 170} ${(1 - fly) * -170}) rotate(${quiver} 200 205)`}>
          <line x1={200} y1={205} x2={302} y2={103} stroke="#2B3044" strokeWidth={9} strokeLinecap="round" />
          <line x1={200} y1={205} x2={302} y2={103} stroke="#FFD43B" strokeWidth={5} strokeLinecap="round" />
          <path d="M 286 96 L 322 84 L 310 120 Z" fill="#4DA3FF" />
          <path d="M 270 112 L 306 100 L 294 136 Z" fill="#7FBFFF" />
        </g>
      )}
    </g>
  );
};

const CUP = 'M 138 104 L 262 104 C 262 178 242 214 200 222 C 158 214 138 178 138 104 Z';

const trophy: Visual = ({ frame, fps, uid }) => {
  const shine = cycle(frame - 10, 50);
  return (
    <g transform={about(200, 300, pop(frame, fps))}>
      <defs>
        <Grad id={`${uid}-gold`} from="#FFE680" to="#F29A0B" x2={0.5} />
        <clipPath id={`${uid}-cup`}>
          <path d={CUP} />
        </clipPath>
      </defs>
      <path d="M 142 122 C 96 122 96 182 154 188" fill="none" stroke="#F2A417" strokeWidth={13} strokeLinecap="round" />
      <path d="M 258 122 C 304 122 304 182 246 188" fill="none" stroke="#F2A417" strokeWidth={13} strokeLinecap="round" />
      <rect x={187} y={218} width={26} height={44} fill="#E08E0B" />
      <rect x={150} y={258} width={100} height={22} rx={7} fill="#FFC53D" />
      <rect x={132} y={278} width={136} height={28} rx={8} fill={SLATE} />
      <path d={CUP} fill={`url(#${uid}-gold)`} stroke="#FFF1B8" strokeWidth={4} strokeLinejoin="round" />
      <path d={starPath(200, 156, 26)} fill="#fff" opacity={0.92} transform={about(200, 156, pop(frame, fps, 8))} />
      <g clipPath={`url(#${uid}-cup)`}>
        {frame > 10 && <rect x={90 + 240 * shine} y={90} width={26} height={150} fill="#fff" opacity={0.45 * Math.sin(Math.PI * Math.min(1, shine * 2))} transform={`skewX(-20)`} />}
      </g>
      {frame > 12 && <Sparkle x={104} y={92} size={14} frame={frame} />}
      {frame > 15 && <Sparkle x={300} y={104} size={11} frame={frame} phase={0.4} />}
      {frame > 18 && <Sparkle x={316} y={214} size={9} frame={frame} phase={0.7} />}
    </g>
  );
};

const rocket: Visual = ({ frame, fps, uid }) => {
  const enter = pop(frame, fps, 0, 15);
  const flicker = 1 + 0.16 * jitter(frame, 3);
  return (
    <g>
      <defs>
        <Grad id={`${uid}-hull`} from="#FFFFFF" to="#CBD3E6" x2={1} y2={0} />
        <Grad id={`${uid}-flame`} from="#FFD43B" to="#FF5A1F" />
      </defs>
      {[0, 1, 2, 3, 4].map((k) => {
        // Stars streak past, down and to the left.
        const c = cycle(frame, 26, k * 0.21);
        const x = 300 - 250 * c + (k % 2) * 40 - 20;
        const y = 70 + 250 * c + (k % 3) * 24 - 30;
        return <line key={k} x1={x} y1={y} x2={x - 16} y2={y + 16} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55 * Math.sin(Math.PI * c)} />;
      })}
      <g transform={`translate(${(1 - enter) * -90 + 3 * jitter(frame, 1)} ${(1 - enter) * 90 + 3 * jitter(frame, 2)}) rotate(40 200 200)`}>
        <g transform={about(200, 250, [1, flicker])}>
          <path d="M 172 250 C 170 296 200 344 200 344 C 200 344 230 296 228 250 Z" fill={`url(#${uid}-flame)`} />
          <path d="M 186 250 C 185 278 200 306 200 306 C 200 306 215 278 214 250 Z" fill="#FFF3B0" />
        </g>
        <path d="M 164 212 L 124 270 L 168 252 Z" fill="#FF4D6D" />
        <path d="M 236 212 L 276 270 L 232 252 Z" fill="#FF4D6D" />
        <path d="M 200 70 C 242 112 250 190 236 252 L 164 252 C 150 190 158 112 200 70 Z" fill={`url(#${uid}-hull)`} />
        <path d="M 200 70 C 222 92 234 118 240 142 L 160 142 C 166 118 178 92 200 70 Z" fill="#FF4D6D" />
        <circle cx={200} cy={184} r={21} fill="#4DA3FF" stroke="#2B3044" strokeWidth={7} />
        <circle cx={193} cy={177} r={6} fill="#fff" opacity={0.7} />
      </g>
    </g>
  );
};

const house: Visual = ({ frame, fps }) => (
  <g>
    {[0, 0.5].map((phase) => {
      const c = cycle(frame - 14, 50, phase);
      return <circle key={phase} cx={258 + 14 * c} cy={112 - 54 * c} r={8 + 9 * c} fill="#fff" opacity={frame > 14 ? 0.45 * (1 - c) : 0} />;
    })}
    <rect x={246} y={112} width={24} height={56} fill="#B5432F" transform={about(258, 168, [1, tween(frame, 8, 14)])} />
    <g transform={about(200, 306, [1, tween(frame, 0, 10)])}>
      <rect x={118} y={182} width={164} height={124} rx={6} fill={PAPER} />
      <rect x={138} y={208} width={36} height={36} rx={4} fill="#7FD8FF" stroke={SLATE} strokeWidth={4} />
      <rect x={226} y={208} width={36} height={36} rx={4} fill="#7FD8FF" stroke={SLATE} strokeWidth={4} />
      <rect x={184} y={236} width={40} height={70} rx={5} fill="#8A5630" />
      <circle cx={215} cy={272} r={4} fill="#FFD43B" />
    </g>
    <path d="M 96 192 L 200 100 L 304 192 Z" fill="#FF6B57" stroke="#FF6B57" strokeWidth={14} strokeLinejoin="round" transform={`translate(0 ${(1 - pop(frame, fps, 6)) * -80})`} opacity={tween(frame, 6, 9)} />
    <line x1={70} y1={308} x2={330} y2={308} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
  </g>
);

export const MONEY_VISUALS = { money, growth, decline, target, trophy, rocket, house };
