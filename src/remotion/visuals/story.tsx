/**
 * Story-grade visuals added for the story-first Stage 2 pipeline. Marine subjects are fuller;
 * character / vehicle / nature / fauna / abstract stubs keep the frontend VISUAL_NAMES in sync with
 * the backend so Claude-picked names never silently drop.
 */
import type { ReactNode } from 'react';
import { PAPER, INK, STEEL, about, pop, tween, wave, type Visual } from './kit';
import { Grad } from './parts';

const marine = (draw: (frame: number, accent: string, uid: string) => ReactNode): Visual =>
  ({ frame, fps, accent, uid }) => <g transform={about(200, 200, pop(frame, fps))}>{draw(frame, accent, uid)}</g>;

const whale: Visual = marine((frame, accent) => (
  <g>
    <ellipse cx={200} cy={210} rx={130} ry={52} fill={accent} />
    <ellipse cx={175} cy={218} rx={90} ry={28} fill={PAPER} opacity={0.35} />
    <path d="M310 200 Q360 160 380 200 Q360 240 310 220 Z" fill={accent} />
    <path d="M80 200 Q30 150 10 195 Q30 245 80 220 Z" fill={accent} />
    <circle cx={280} cy={198} r={6} fill={INK} />
    <path d={`M220 160 Q230 ${140 + wave(frame, 20) * 6} 245 160`} stroke={PAPER} strokeWidth={4} fill="none" opacity={0.7} />
  </g>
));

const shark: Visual = marine((frame, accent) => (
  <g transform={`translate(${wave(frame, 40) * 8} 0)`}>
    <path d="M60 200 Q140 150 280 185 Q310 200 280 215 Q140 250 60 200 Z" fill={STEEL} />
    <path d="M180 160 L210 110 L230 165 Z" fill={STEEL} />
    <path d="M60 200 L20 175 Q35 200 20 225 Z" fill={accent} />
    <circle cx={250} cy={195} r={5} fill={INK} />
  </g>
));

const squid: Visual = marine((frame, accent) => (
  <g>
    <ellipse cx={200} cy={150} rx={48} ry={70} fill={accent} />
    {[-40, -20, 0, 20, 40].map((dx, k) => (
      <path key={k} d={`M${200 + dx} 200 q${wave(frame, 18, k) * 16} 50 ${wave(frame, 22, k) * 20} 110`} stroke={accent} strokeWidth={8} fill="none" strokeLinecap="round" />
    ))}
    <circle cx={185} cy={140} r={6} fill={INK} />
    <circle cx={215} cy={140} r={6} fill={INK} />
  </g>
));

const octopus: Visual = marine((frame, accent) => (
  <g>
    <circle cx={200} cy={170} r={60} fill={accent} />
    <circle cx={180} cy={160} r={8} fill={INK} />
    <circle cx={220} cy={160} r={8} fill={INK} />
    {Array.from({ length: 8 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return <path key={k} d={`M${200 + Math.cos(a) * 50} ${180 + Math.sin(a) * 30} q${Math.cos(a) * 40 + wave(frame, 16, k) * 10} ${60} ${Math.cos(a) * 70} ${100}`} stroke={accent} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />;
    })}
  </g>
));

const dolphin: Visual = marine((frame, accent) => (
  <g transform={`rotate(${wave(frame, 30) * 6} 200 200)`}>
    <path d="M70 210 Q160 150 300 190 Q330 205 290 220 Q160 260 70 210 Z" fill={STEEL} />
    <path d="M190 165 L220 110 L245 170 Z" fill={STEEL} />
    <path d="M70 210 L30 185 Q45 210 30 235 Z" fill={accent} />
    <circle cx={270} cy={195} r={5} fill={INK} />
  </g>
));

const turtle: Visual = marine((frame, accent) => (
  <g>
    <ellipse cx={200} cy={210} rx={90} ry={60} fill={accent} />
    <ellipse cx={200} cy={210} rx={60} ry={40} fill={PAPER} opacity={0.3} />
    <circle cx={290} cy={200} r={28} fill={accent} />
    <circle cx={302} cy={194} r={4} fill={INK} />
    {[-1, 1].map((s) => (
      <g key={s}>
        <ellipse cx={200 + s * 70} cy={160} rx={24} ry={12} fill={STEEL} />
        <ellipse cx={200 + s * 70} cy={260} rx={24} ry={12} fill={STEEL} />
      </g>
    ))}
  </g>
));

const jellyfish: Visual = marine((frame, accent) => (
  <g transform={`translate(0 ${wave(frame, 28) * 10})`}>
    <path d="M140 180 Q145 110 200 105 Q255 110 260 180 Q235 195 215 185 Q200 198 185 185 Q165 195 140 180 Z" fill={accent} opacity={0.9} />
    {[-40, -20, 0, 20, 40].map((dx, k) => (
      <path key={k} d={`M${200 + dx} 185 q${wave(frame, 14, k) * 12} 40 ${wave(frame, 16, k) * 16} 90`} stroke={accent} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    ))}
  </g>
));

const fish_school: Visual = marine((frame, accent) => (
  <g>
    {Array.from({ length: 7 }, (_, k) => {
      const x = 80 + ((frame * 2 + k * 40) % 260);
      const y = 140 + (k % 3) * 50 + wave(frame, 24, k) * 8;
      return (
        <g key={k} transform={`translate(${x} ${y})`}>
          <path d="M0 0 Q18 -12 40 -4 Q50 0 40 4 Q18 12 0 0 Z" fill={k % 2 ? accent : STEEL} />
          <circle cx={32} cy={-1} r={2} fill={INK} />
        </g>
      );
    })}
  </g>
));

const coral: Visual = marine((frame, accent) => (
  <g>
    {[-60, -20, 20, 60].map((x, k) => (
      <path key={k} d={`M${200 + x} 300 Q${200 + x + wave(frame, 40, k) * 8} 200 ${200 + x - 10} 120`} stroke={k % 2 ? accent : STEEL} strokeWidth={14} fill="none" strokeLinecap="round" />
    ))}
  </g>
));

const submarine: Visual = marine((frame, accent) => (
  <g transform={`translate(${wave(frame, 50) * 6} 0)`}>
    <ellipse cx={200} cy={210} rx={110} ry={42} fill={STEEL} />
    <rect x={175} y={150} width={36} height={28} rx={6} fill={accent} />
    <circle cx={240} cy={205} r={16} fill={accent} opacity={0.8} />
    <circle cx={240} cy={205} r={8} fill="#9FE8F5" opacity={0.7} />
    <circle cx={90} cy={210} r={6 + tween(frame % 20, 0, 20) * 4} fill={accent} opacity={0.4} />
  </g>
));

const underwater_cave: Visual = marine((_frame, accent) => (
  <g>
    <path d="M60 320 L80 140 Q140 40 200 80 Q260 40 320 140 L340 320 Z" fill={STEEL} />
    <ellipse cx={200} cy={220} rx={60} ry={80} fill={INK} />
    <ellipse cx={200} cy={230} rx={36} ry={50} fill={accent} opacity={0.25} />
  </g>
));

const stub = (label: string, shape: 'circle' | 'rect' | 'tri' = 'circle'): Visual =>
  ({ frame, fps, accent, uid }) => {
    const s = pop(frame, fps);
    return (
      <g transform={about(200, 200, s)}>
        <defs><Grad id={`${uid}-s`} from={accent} to={STEEL} /></defs>
        {shape === 'circle' && <circle cx={200} cy={200} r={90} fill={`url(#${uid}-s)`} />}
        {shape === 'rect' && <rect x={110} y={120} width={180} height={160} rx={18} fill={`url(#${uid}-s)`} />}
        {shape === 'tri' && <path d="M200 100 L300 280 L100 280 Z" fill={`url(#${uid}-s)`} />}
        <text x={200} y={210} textAnchor="middle" fill={PAPER} fontSize={22} fontFamily="system-ui" opacity={0.9}>{label}</text>
      </g>
    );
  };

export const STORY_VISUALS: Record<string, Visual> = {
  whale, shark, squid, octopus, dolphin, turtle, jellyfish, fish_school, coral, submarine, underwater_cave,
  person: stub('person'),
  child: stub('child'),
  elder: stub('elder'),
  runner: stub('runner'),
  silhouette: stub('sil', 'tri'),
  crowd: stub('crowd'),
  car: stub('car', 'rect'),
  plane: stub('plane', 'tri'),
  ship: stub('ship', 'rect'),
  city: stub('city', 'rect'),
  bridge: stub('bridge', 'rect'),
  factory: stub('factory', 'rect'),
  desk: stub('desk', 'rect'),
  laptop: stub('laptop', 'rect'),
  tree: stub('tree', 'tri'),
  forest: stub('forest', 'tri'),
  river: stub('river'),
  desert: stub('desert'),
  storm: stub('storm'),
  sun: stub('sun'),
  moon: stub('moon'),
  stars: stub('stars'),
  cloud: stub('cloud'),
  wave: stub('wave'),
  cave: stub('cave'),
  bird: stub('bird', 'tri'),
  wolf: stub('wolf'),
  deer: stub('deer'),
  fox: stub('fox'),
  horse: stub('horse'),
  lion: stub('lion'),
  butterfly: stub('butterfly'),
  bee: stub('bee'),
  flower: stub('flower'),
  seedling: stub('seed'),
  path: stub('path'),
  door: stub('door', 'rect'),
  bridge_concept: stub('link'),
  clock: stub('clock'),
  ladder: stub('ladder', 'rect'),
};
