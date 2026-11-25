import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { cloud, hill, rain, stars, sun, svgFrame } from '../styles/kit/scenery';
import { SampleScreen, type ScreenId } from './screens';

/**
 * Backdrops for story mode: what a scene shows behind its words when the style has no scene of its own.
 * The sample screens of the library covers plus nature, ocean, space, a room and an abstract field, all
 * drawn in code and pure functions of the frame. Keep the ids in step with BACKDROPS in the backend
 * (vireact-backend src/service/editor/storyboard.service.js).
 */
export type BackdropId = ScreenId | 'nature' | 'ocean' | 'space' | 'room' | 'abstract';

function Nature() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#7EC8F2, #BFE6FA 45%, #E8F4E4)' }}>
      {svgFrame(
        <g>
          {sun(820, 360, 110, { colors: ['#FFF2B0', '#FFD36E'], id: 'bd-sun' })}
          {cloud(240 + (f * 0.6) % 900, 330, 260, '#FFFFFF', { opacity: 0.95 })}
          {cloud(700 - (f * 0.4) % 900, 520, 200, '#FFFFFF', { opacity: 0.85 })}
          {hill(1050, 260, '#8FA9C9', { freq: 1.6, seed: 2, peaks: 0.8 })}
          {hill(1180, 200, '#6E8FB0', { freq: 2.2, seed: 5, peaks: 0.7 })}
          <rect x={0} y={1230} width={1080} height={160} fill="#7DB9D9" />
          <rect x={0} y={1236 + Math.sin(f / 20) * 3} width={1080} height={4} fill="#FFFFFF" opacity={0.6} />
          {hill(1400, 90, '#5E9F57', { freq: 2.6, seed: 8 })}
          {Array.from({ length: 9 }, (_, k) => (
            <path key={k} d={`M ${60 + k * 120} ${1460 + (k % 3) * 30} l 40 -${170 + (k % 2) * 60} l 40 ${170 + (k % 2) * 60} z`} fill={k % 2 ? '#2F6B3A' : '#3E7F45'} />
          ))}
          <rect x={0} y={1600} width={1080} height={320} fill="#4E8A47" />
        </g>,
      )}
    </AbsoluteFill>
  );
}

function Ocean() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#F7B267 0%, #F4845F 30%, #6C9BD2 52%, #1D4E89 100%)' }}>
      {svgFrame(
        <g>
          {sun(540, 920, 150, { colors: ['#FFE6A7', '#FF9F5A'], id: 'bd-osun' })}
          <rect x={0} y={960} width={1080} height={960} fill="#1D4E89" />
          {Array.from({ length: 16 }, (_, k) => {
            const y = 980 + k * 60 + k * k * 1.5;
            return <path key={k} d={Array.from({ length: 12 }, (_, i) => `${i ? 'L' : 'M'} ${i * 100 - 50} ${y + Math.sin(i * 0.9 + f / 14 + k) * (4 + k * 1.4)}`).join(' ')} stroke="#9CC9F0" strokeWidth={2 + k * 0.3} fill="none" opacity={0.35 + k * 0.03} />;
          })}
          <rect x={470} y={970} width={140} height={600} fill="#FFD39A" opacity={0.18} />
        </g>,
      )}
    </AbsoluteFill>
  );
}

function Space() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 30% 20%, #2A2466, #0A0A23 60%, #05050F)' }}>
      {svgFrame(
        <g>
          {stars(f, { n: 160, seed: 9, bottom: 1920, size: 3 })}
          <g transform={`translate(760 ${1300 + Math.sin(f / 60) * 10})`}>
            <ellipse rx={260} ry={60} fill="none" stroke="#E8C77A" strokeWidth={16} transform="rotate(-16)" />
            <circle r={170} fill="#6C7FE0" />
            <path d="M -170 0 A 170 170 0 0 0 170 0 A 200 120 0 0 1 -170 0" fill="#4A5BC0" />
            <path d="M -258 74 A 260 60 0 0 0 258 -74" fill="none" stroke="#E8C77A" strokeWidth={16} />
          </g>
          <circle cx={240} cy={420} r={70} fill="#E6E6F0" />
          <circle cx={215} cy={400} r={14} fill="#C9C9D6" />
          <circle cx={262} cy={445} r={9} fill="#C9C9D6" />
        </g>,
      )}
    </AbsoluteFill>
  );
}

function Room() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#E9DCC9' }}>
      {svgFrame(
        <g>
          {/* Window with a moving sky. */}
          <rect x={560} y={260} width={400} height={520} fill="#9ED0F0" stroke="#FFFFFF" strokeWidth={20} />
          {cloud(620 + (f * 0.5) % 380, 420, 160, '#FFFFFF')}
          <line x1={760} y1={260} x2={760} y2={780} stroke="#FFFFFF" strokeWidth={14} />
          <line x1={560} y1={520} x2={960} y2={520} stroke="#FFFFFF" strokeWidth={14} />
          {/* Lamp glow, desk, plant, books. */}
          <circle cx={250} cy={700} r={220} fill="#FFE7A8" opacity={0.35 + 0.05 * Math.sin(f / 30)} />
          <path d="M 190 620 H 310 L 280 540 H 220 Z" fill="#D9643A" />
          <rect x={244} y={620} width={12} height={360} fill="#3A2E28" />
          <rect x={60} y={980} width={960} height={40} fill="#8A5A34" />
          <rect x={100} y={1020} width={30} height={500} fill="#6E4628" />
          <rect x={950} y={1020} width={30} height={500} fill="#6E4628" />
          {[0, 1, 2].map((k) => <rect key={k} x={600 + k * 54} y={860 - k * 10} width={44} height={120 + k * 10} fill={['#3E7CB1', '#E76F51', '#2A9D8F'][k]} />)}
          <rect x={410} y={900} width={90} height={80} rx={10} fill="#C9703A" />
          {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={455 + (k - 1.5) * 30} cy={860 - (k % 2) * 30} rx={20} ry={50} fill="#4E9A47" transform={`rotate(${(k - 1.5) * 20 + Math.sin(f / 25 + k) * 3} ${455} 900)`} />)}
          <rect x={0} y={1520} width={1080} height={400} fill="#B9926C" />
        </g>,
      )}
    </AbsoluteFill>
  );
}

function Abstract({ accent }: { accent: string }) {
  const f = useCurrentFrame();
  const t = f / 60;
  return (
    <AbsoluteFill style={{ background: '#14151C' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + 15 * Math.sin(t)}% ${30 + 10 * Math.cos(t * 0.8)}%, ${accent}AA, transparent 42%), radial-gradient(circle at ${70 + 12 * Math.cos(t * 0.7)}% ${70 + 12 * Math.sin(t)}%, #5B7CFA99, transparent 45%), radial-gradient(circle at 50% 50%, #FF6B8B55, transparent 60%)`,
          filter: 'blur(30px)',
        }}
      />
      {svgFrame(<g>{rain(f, { n: 24, color: '#FFFFFF', speed: 6, len: 0, width: 6, opacity: 0.15 })}</g>)}
    </AbsoluteFill>
  );
}

/** One backdrop by id; `accent` colours the abstract field. */
export function Backdrop({ id, accent }: { id: BackdropId; accent: string }) {
  switch (id) {
    case 'nature':
      return <Nature />;
    case 'ocean':
      return <Ocean />;
    case 'space':
      return <Space />;
    case 'room':
      return <Room />;
    case 'abstract':
      return <Abstract accent={accent} />;
    default:
      return <SampleScreen id={id} />;
  }
}
