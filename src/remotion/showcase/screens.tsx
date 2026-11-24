import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

/**
 * Sample "footage" for the Skills library covers, drawn in code (no stock clips, no licences): the kinds
 * of videos creators edit besides a talking head. Each moves like real footage would: a panning city, a
 * scrolling game, a product turning on a table, an app being tapped through. Covers only, never in an edit.
 * Sizes are for a 1080 x 1920 frame.
 */

export type ScreenId = 'city-night' | 'city-day' | 'product-dark' | 'toy-box' | 'game' | 'race' | 'app';

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const rnd = (n: number, seed = 0) => {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// ---- city b-roll (night or day): parallax skyline, a street with traffic

function skylineLayer(frame: number, layer: number, night: boolean) {
  const speed = [0.4, 0.9, 1.7][layer];
  const base = [1180, 1320, 1500][layer];
  const colors = night ? ['#1B2350', '#141A3D', '#0B0F26'] : ['#A9C4DA', '#7E97AE', '#55687C'];
  const shift = (frame * speed) % 2160;
  const out: ReactNode[] = [];
  for (let k = 0; k < 24; k += 1) {
    const w = 90 + rnd(k, layer) * 110;
    const h = (240 + rnd(k, layer + 3) * 520) * (1 - layer * 0.18);
    const x = ((k * 2160) / 24 - shift + 2160) % 2160 - 120;
    const winCols = Math.floor(w / 26);
    const winRows = Math.floor(h / 34);
    out.push(
      <g key={k}>
        <rect x={x} y={base - h} width={w} height={h + 400} fill={colors[layer]} />
        {layer > 0 &&
          Array.from({ length: winCols * winRows }, (_, i) => {
            const lit = rnd(i + k * 97, layer) > (night ? 0.55 : 0.2);
            if (!lit) return null;
            const flicker = night && rnd(i + Math.floor(frame / 40), k) > 0.97 ? 0.3 : 1;
            return <rect key={i} x={x + 8 + (i % winCols) * 26} y={base - h + 14 + Math.floor(i / winCols) * 34} width={14} height={18} fill={night ? '#FFD98A' : '#C9DCEB'} opacity={(night ? 0.85 : 0.55) * flicker} />;
          })}
      </g>,
    );
  }
  return out;
}

function CityScreen({ night }: { night: boolean }) {
  const frame = useCurrentFrame();
  const cars = Array.from({ length: 6 }, (_, k) => {
    const dir = k % 2 ? 1 : -1;
    const speed = 9 + rnd(k, 2) * 7;
    const x = dir > 0 ? ((frame * speed + k * 420) % (W + 600)) - 300 : W + 300 - ((frame * speed + k * 420) % (W + 600));
    return { x, y: dir > 0 ? 1690 : 1610, dir, color: ['#D9483B', '#3B7DD9', '#E8E8E8', '#F2B33D', '#2E2E2E', '#4CAF7A'][k] };
  });
  return (
    <AbsoluteFill style={{ background: night ? 'linear-gradient(180deg, #070A1C 0%, #1C2452 60%, #3A2F5E 100%)' : 'linear-gradient(180deg, #6FB2E8 0%, #BFE0F5 70%, #E9F4FA 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {night ? <circle cx={820} cy={300} r={60} fill="#F4F1DE" opacity={0.9} /> : <circle cx={820} cy={300} r={80} fill="#FFF3C4" opacity={0.9} />}
        {[0, 1, 2].map((l) => <g key={l}>{skylineLayer(frame, l, night)}</g>)}
        <rect x={0} y={1540} width={W} height={380} fill={night ? '#15151C' : '#5B5E66'} />
        <rect x={0} y={1530} width={W} height={18} fill={night ? '#2A2A35' : '#9A9DA4'} />
        {Array.from({ length: 12 }, (_, k) => <rect key={k} x={((k * 180 - frame * 14) % (W + 180) + W + 180) % (W + 180) - 120} y={1652} width={90} height={8} fill={night ? '#C9B458' : '#F1E6B8'} opacity={0.8} />)}
        {cars.map((c, k) => (
          <g key={k} transform={`translate(${c.x} ${c.y}) scale(${c.dir} 1)`}>
            {night && <rect x={-520} y={-14} width={520} height={10} fill={c.dir > 0 ? '#FF3B3B' : '#FFF6D0'} opacity={0.35} style={{ filter: 'blur(4px)' }} />}
            <rect x={-80} y={-46} width={170} height={46} rx={14} fill={c.color} />
            <rect x={-40} y={-78} width={96} height={38} rx={12} fill={c.color} />
            <rect x={-30} y={-72} width={34} height={26} rx={5} fill={night ? '#26304F' : '#BFE3F7'} />
            <rect x={10} y={-72} width={36} height={26} rx={5} fill={night ? '#26304F' : '#BFE3F7'} />
            <circle cx={-44} cy={0} r={20} fill="#111" />
            <circle cx={54} cy={0} r={20} fill="#111" />
            <rect x={82} y={-36} width={10} height={12} rx={3} fill="#FFF6D0" />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
}

// ---- a product turning on a table (a can in a dark studio, or a toy box in a bright one)

function CanScreen() {
  const frame = useCurrentFrame();
  const spin = (frame * 9) % 600;
  const sweep = ((frame % 90) / 90) * 160 - 30;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 42%, #2A3B48 0%, #0E151B 60%, #06090C 100%)' }}>
      <div style={{ position: 'absolute', left: 240, right: 240, top: 1330, height: 120, borderRadius: '50%', background: 'radial-gradient(ellipse, #31414E 0%, #141C22 70%)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', left: 390, top: 640, width: 300, height: 720, borderRadius: '46px / 30px', overflow: 'hidden', transform: `translateY(${Math.sin(frame / 30) * 10}px)` }}>
        {/* The label slides round the can as it turns. */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg, #C8102E 0 140px, #F2F2F2 140px 170px, #1C1C1C 170px 300px, #F2F2F2 300px 330px, #C8102E 330px 600px)', backgroundSize: '600px 100%', backgroundPosition: `${-spin}px 0` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 250, height: 210, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,0.9) 40px 52px, transparent 52px 150px)', backgroundSize: '600px 100%', backgroundPosition: `${-spin * 1.0}px 0`, opacity: 0.8 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 30%, rgba(255,255,255,0.35) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.8) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '12%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: 'linear-gradient(180deg, #D7DDE2, #8C969E)' }} />
      </div>
      {/* Water drops on a cold can. */}
      {Array.from({ length: 14 }, (_, k) => <div key={k} style={{ position: 'absolute', left: 410 + rnd(k, 4) * 250, top: 720 + rnd(k, 5) * 560 + ((frame * (0.5 + rnd(k, 6))) % 60), width: 8, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }} />)}
    </AbsoluteFill>
  );
}

function ToyBoxScreen() {
  const frame = useCurrentFrame();
  const a = frame * 1.6;
  const face = (bg: string, transform: string, label: string): CSSProperties & { label: string } => ({ background: bg, transform, label });
  const faces = [
    face('#E3000B', 'rotateY(0deg) translateZ(180px)', 'NEW'),
    face('#006CB7', 'rotateY(90deg) translateZ(180px)', '8+'),
    face('#FFCD00', 'rotateY(180deg) translateZ(180px)', '350'),
    face('#00A650', 'rotateY(270deg) translateZ(180px)', 'SET'),
  ];
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFF7E8 0%, #FFE3B8 100%)' }}>
      <div style={{ position: 'absolute', left: 180, right: 180, top: 1290, height: 110, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(120,70,0,0.25), transparent 70%)' }} />
      <div style={{ position: 'absolute', left: 360, top: 760, width: 360, height: 360, perspective: 1400 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateX(-14deg) rotateY(${a}deg) translateY(${Math.sin(frame / 20) * 12}px)` }}>
          {faces.map(({ label, ...st }) => (
            <div key={label} style={{ position: 'absolute', inset: 0, ...st, borderRadius: 18, boxShadow: 'inset 0 0 0 10px rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Arial Black, sans-serif', fontSize: 110, backfaceVisibility: 'hidden' }}>{label}</div>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: '#FF8A1F', transform: 'rotateX(90deg) translateZ(180px)', borderRadius: 18 }} />
        </div>
      </div>
      {/* Confetti-like loose pieces bouncing on the table. */}
      {Array.from({ length: 8 }, (_, k) => {
        const hop = Math.abs(Math.sin(frame / 9 + k)) * 40;
        return <div key={k} style={{ position: 'absolute', left: 170 + k * 100, top: 1330 - hop, width: 54, height: 34, borderRadius: 6, background: ['#E3000B', '#006CB7', '#FFCD00', '#00A650'][k % 4], boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.18)' }} />;
      })}
    </AbsoluteFill>
  );
}

// ---- a side-scrolling platform game (an original little robot, not anyone's character)

const PX = 12;
const ROBOT = ['  hhhh  ', ' hhhhhh ', ' heehhe ', ' hhhhhh ', '  bbbb  ', ' bbbbbb ', ' b bb b ', '  l  l  '];
function sprite(rows: string[], colors: Record<string, string>, x: number, y: number, key: string) {
  return (
    <g key={key} transform={`translate(${x} ${y})`}>
      {rows.flatMap((r, ry) => [...r].map((ch, rx) => (colors[ch] ? <rect key={`${rx}-${ry}`} x={rx * PX} y={ry * PX} width={PX} height={PX} fill={colors[ch]} /> : null)))}
    </g>
  );
}

function GameScreen() {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2) * 2;
  const scroll = f * 7;
  const ground = 1500;
  const jump = Math.max(0, Math.sin(((f % 48) / 48) * Math.PI)) * (f % 96 < 48 ? 220 : 0);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #7FD3F7 0%, #B9ECFF 100%)' }}>
      <svg width={W} height={H} shapeRendering="crispEdges" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 5 }, (_, k) => {
          const x = ((k * 320 - scroll * 0.3) % 1600 + 1600) % 1600 - 260;
          return <path key={k} d={`M${x} ${ground} l200 -${260 + (k % 3) * 80} l200 ${260 + (k % 3) * 80} z`} fill={k % 2 ? '#3FA34D' : '#2E8540'} />;
        })}
        {Array.from({ length: 4 }, (_, k) => {
          const x = ((k * 400 - scroll * 0.15) % 1600 + 1600) % 1600 - 200;
          return <rect key={k} x={x} y={360 + (k % 2) * 140} width={180} height={48} fill="#fff" />;
        })}
        {Array.from({ length: 26 }, (_, k) => {
          const x = ((k * 48 - scroll) % 1248 + 1248) % 1248 - 48;
          return (
            <g key={k}>
              <rect x={x} y={ground} width={48} height={420} fill="#C8763A" />
              <rect x={x} y={ground} width={48} height={18} fill="#6CCB4E" />
              <rect x={x + 6} y={ground + 40} width={12} height={12} fill="#A55D2A" />
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, k) => {
          const x = ((k * 260 + 600 - scroll) % 1560 + 1560) % 1560 - 60;
          const taken = x < 330 && x > 200;
          return taken ? null : <rect key={k} x={x} y={ground - 300 - (k % 2) * 90} width={36} height={48} fill="#FFD43B" stroke="#C99A00" strokeWidth={6} />;
        })}
        {sprite(ROBOT, { h: '#E8E8F0', e: '#2B2B6A', b: '#7A5CFA', l: '#2B2B6A' }, 250, ground - ROBOT.length * PX - jump, 'robot')}
      </svg>
    </AbsoluteFill>
  );
}

// ---- an early-3D style racer: perspective road, roadside posts, a car from behind

function RaceScreen() {
  const frame = useCurrentFrame();
  const horizon = 900;
  const segs = 18;
  const rows = Array.from({ length: segs }, (_, i) => {
    const z = ((i + (frame * 0.35) % 1) / segs);
    return z;
  });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #2B1B5A 0%, #C2477A 55%, #F59E57 75%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={540} cy={760} r={170} fill="#FFD36E" opacity={0.9} />
        <path d={`M0 ${horizon} L140 700 L300 820 L470 640 L640 820 L820 690 L1080 860 L1080 ${horizon} Z`} fill="#3A2A6E" />
        <rect x={0} y={horizon} width={W} height={H - horizon} fill="#2E7D4F" />
        {rows.map((z, i) => {
          // Bands nearer the bottom are bigger: perspective by 1 / depth.
          const y0 = horizon + Math.pow(z, 2.2) * (H - horizon);
          const y1 = horizon + Math.pow(Math.min(1, z + 1 / segs), 2.2) * (H - horizon);
          const half0 = 30 + Math.pow(z, 2.2) * 700;
          const half1 = 30 + Math.pow(Math.min(1, z + 1 / segs), 2.2) * 700;
          const even = (i + Math.floor(frame * 0.35)) % 2 === 0;
          return (
            <g key={i}>
              <path d={`M${540 - half0 * 1.12} ${y0} L${540 + half0 * 1.12} ${y0} L${540 + half1 * 1.12} ${y1} L${540 - half1 * 1.12} ${y1} Z`} fill={even ? '#E8E8E8' : '#D9393B'} />
              <path d={`M${540 - half0} ${y0} L${540 + half0} ${y0} L${540 + half1} ${y1} L${540 - half1} ${y1} Z`} fill={even ? '#55565E' : '#4B4C54'} />
              {even && <path d={`M${540 - half0 * 0.03} ${y0} L${540 + half0 * 0.03} ${y0} L${540 + half1 * 0.03} ${y1} L${540 - half1 * 0.03} ${y1} Z`} fill="#F2F2F2" />}
            </g>
          );
        })}
        <g transform={`translate(${540 + Math.sin(frame / 25) * 40} 1660)`}>
          <path d="M-200 0 L-170 -110 L170 -110 L200 0 L200 80 L-200 80 Z" fill="#D9393B" />
          <path d="M-130 -110 L-100 -190 L100 -190 L130 -110 Z" fill="#B32C2E" />
          <path d="M-110 -120 L-88 -178 L88 -178 L110 -120 Z" fill="#3B4A6B" />
          <rect x={-180} y={-20} width={70} height={26} fill="#FF4040" />
          <rect x={110} y={-20} width={70} height={26} fill="#FF4040" />
          <rect x={-230} y={30} width={60} height={70} rx={8} fill="#141414" />
          <rect x={170} y={30} width={60} height={70} rx={8} fill="#141414" />
        </g>
      </svg>
    </AbsoluteFill>
  );
}

// ---- a screen recording of an app: cards, a chart that grows, a finger tapping through

function AppScreen() {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [40, 80], [0, -260], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
  const grow = (k: number) => interpolate(frame, [10 + k * 5, 30 + k * 5], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
  const tapX = interpolate(frame, [0, 30, 60, 95], [760, 560, 300, 540], clamp);
  const tapY = interpolate(frame, [0, 30, 60, 95], [1600, 1240, 1500, 1720], clamp);
  const tapPulse = (frame % 30) / 30;
  const bars = [0.35, 0.55, 0.45, 0.8, 1];
  return (
    <AbsoluteFill style={{ background: '#EEF2F8', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 210, background: '#4C6FFF' }} />
      <div style={{ position: 'absolute', left: 70, top: 120, color: '#fff', fontSize: 52, fontWeight: 700 }}>Good morning</div>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 280 + scroll, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <div style={{ background: '#fff', borderRadius: 34, padding: 44, boxShadow: '0 12px 30px rgba(40,60,120,0.12)' }}>
          <div style={{ fontSize: 34, color: '#7A86A8' }}>This week</div>
          <div style={{ fontSize: 96, fontWeight: 800, color: '#1E2A4A' }}>12,480</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26, height: 220, marginTop: 20 }}>
            {bars.map((b, k) => <div key={k} style={{ flex: 1, height: `${b * 100 * grow(k)}%`, borderRadius: 14, background: k === 4 ? '#4C6FFF' : '#D5DDF5' }} />)}
          </div>
        </div>
        {['Invite your team', 'Connect a calendar', 'Pick a plan', 'Turn on reminders'].map((t, k) => (
          <div key={t} style={{ background: '#fff', borderRadius: 28, padding: '36px 44px', display: 'flex', alignItems: 'center', gap: 30, boxShadow: '0 8px 20px rgba(40,60,120,0.08)' }}>
            <div style={{ width: 70, height: 70, borderRadius: 20, background: ['#FFE1E1', '#E1F5E8', '#E6E9FF', '#FFF2D6'][k] }} />
            <div style={{ fontSize: 42, color: '#1E2A4A', fontWeight: 600 }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 1690, height: 120, borderRadius: 60, background: '#4C6FFF', color: '#fff', fontSize: 46, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px rgba(76,111,255,0.4)' }}>Get started</div>
      <div style={{ position: 'absolute', left: tapX - 46, top: tapY - 46, width: 92, height: 92, borderRadius: 999, background: 'rgba(30,42,74,0.25)', border: '4px solid rgba(255,255,255,0.9)' }} />
      <div style={{ position: 'absolute', left: tapX - 46 - 40 * tapPulse, top: tapY - 46 - 40 * tapPulse, width: 92 + 80 * tapPulse, height: 92 + 80 * tapPulse, borderRadius: 999, border: '4px solid rgba(76,111,255,0.6)', opacity: 1 - tapPulse }} />
    </AbsoluteFill>
  );
}

/** The sample screen for a cover. */
export function SampleScreen({ id }: { id: ScreenId }) {
  switch (id) {
    case 'city-night':
      return <CityScreen night />;
    case 'city-day':
      return <CityScreen night={false} />;
    case 'product-dark':
      return <CanScreen />;
    case 'toy-box':
      return <ToyBoxScreen />;
    case 'game':
      return <GameScreen />;
    case 'race':
      return <RaceScreen />;
    case 'app':
    default:
      return <AppScreen />;
  }
}
