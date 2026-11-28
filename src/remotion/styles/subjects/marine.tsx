/**
 * Style-agnostic marine subject drawings for SubjectDraw seams. Each theme passes its own palette
 * so a paper-cut whale looks layered and a sumi-e whale looks ink-stroked, without duplicating geometry.
 */
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { H, W } from '../theme';
import { foldId } from '../subject-fit';

export const MARINE_VOCABULARY = [
  'whale', 'shark', 'squid', 'octopus', 'dolphin', 'turtle', 'jellyfish',
  'fish_school', 'coral', 'submarine', 'underwater_cave',
] as const;

export type MarineId = (typeof MARINE_VOCABULARY)[number];

export type MarinePalette = {
  body: string;
  accent: string;
  shadow?: string;
  ink?: string;
};

const bob = (frame: number, amp = 18, period = 50) => Math.sin(frame / period) * amp;

function Whale({ frame, p }: { frame: number; p: MarinePalette }) {
  const y = 980 + bob(frame, 22, 55);
  return (
    <g transform={`translate(${W / 2} ${y})`} opacity={0.96}>
      <ellipse cx={0} cy={0} rx={220} ry={90} fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 14px 18px ${p.shadow})` : undefined }} />
      <ellipse cx={-40} cy={10} rx={150} ry={55} fill={p.accent} opacity={0.55} />
      <path d="M210 -10 Q280 -70 310 -20 Q280 40 210 20 Z" fill={p.body} />
      <path d="M-200 -20 Q-280 -90 -300 -10 Q-280 60 -200 30 Z" fill={p.body} />
      <circle cx={140} cy={-20} r={10} fill={p.ink ?? '#0B2036'} />
      <path d={`M40 -70 Q50 ${-110 + Math.sin(frame / 12) * 8} 60 -70`} fill="none" stroke={p.accent} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

function Shark({ frame, p }: { frame: number; p: MarinePalette }) {
  const x = ((frame * 3) % (W + 400)) - 200;
  const y = 900 + bob(frame, 12, 40);
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.95}>
      <path d="M-160 0 Q-40 -70 120 -20 Q160 0 120 20 Q-40 70 -160 0 Z" fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 10px 14px ${p.shadow})` : undefined }} />
      <path d="M0 -50 L30 -120 L60 -40 Z" fill={p.body} />
      <path d="M-160 0 L-220 -30 Q-200 0 -220 30 Z" fill={p.accent} />
      <circle cx={80} cy={-8} r={6} fill={p.ink ?? '#0B2036'} />
    </g>
  );
}

function Squid({ frame, p }: { frame: number; p: MarinePalette }) {
  const y = 1000 + bob(frame, 28, 45);
  return (
    <g transform={`translate(${W / 2} ${y})`} opacity={0.95}>
      <ellipse cx={0} cy={-40} rx={70} ry={100} fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 12px 16px ${p.shadow})` : undefined }} />
      <ellipse cx={0} cy={-60} rx={40} ry={50} fill={p.accent} opacity={0.6} />
      {[-50, -25, 0, 25, 50].map((dx, k) => (
        <path
          key={k}
          d={`M${dx} 40 q${Math.sin(frame / 10 + k) * 20} 80 ${Math.sin(frame / 12 + k) * 28} 160`}
          stroke={p.body}
          strokeWidth={10 - Math.abs(k - 2)}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}
      <circle cx={-22} cy={-50} r={8} fill={p.ink ?? '#0B2036'} />
      <circle cx={22} cy={-50} r={8} fill={p.ink ?? '#0B2036'} />
    </g>
  );
}

function Octopus({ frame, p }: { frame: number; p: MarinePalette }) {
  const y = 1050 + bob(frame, 16, 60);
  return (
    <g transform={`translate(${W / 2} ${y})`}>
      <circle cx={0} cy={-20} r={90} fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 12px 16px ${p.shadow})` : undefined }} />
      <circle cx={-28} cy={-30} r={12} fill={p.ink ?? '#0B2036'} />
      <circle cx={28} cy={-30} r={12} fill={p.ink ?? '#0B2036'} />
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        const sway = Math.sin(frame / 11 + k) * 30;
        return (
          <path
            key={k}
            d={`M${Math.cos(a) * 70} ${Math.sin(a) * 40 + 40} q${Math.cos(a) * 80 + sway} ${90 + Math.sin(a) * 40} ${Math.cos(a) * 120} ${150 + sway * 0.4}`}
            stroke={p.accent}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}
    </g>
  );
}

function Dolphin({ frame, p }: { frame: number; p: MarinePalette }) {
  const x = ((frame * 2.4) % (W + 360)) - 180;
  const y = 880 + bob(frame, 40, 35);
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.sin(frame / 20) * 8})`}>
      <path d="M-120 10 Q-20 -60 130 -10 Q160 10 120 30 Q0 70 -120 10 Z" fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 10px 12px ${p.shadow})` : undefined }} />
      <path d="M10 -40 L40 -100 L70 -30 Z" fill={p.body} />
      <path d="M-120 10 L-170 -20 Q-150 10 -170 40 Z" fill={p.accent} />
      <circle cx={90} cy={-5} r={6} fill={p.ink ?? '#0B2036'} />
    </g>
  );
}

function Turtle({ frame, p }: { frame: number; p: MarinePalette }) {
  const y = 1000 + bob(frame, 14, 70);
  return (
    <g transform={`translate(${W / 2} ${y})`}>
      <ellipse cx={0} cy={0} rx={130} ry={90} fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 12px 14px ${p.shadow})` : undefined }} />
      <ellipse cx={0} cy={0} rx={90} ry={60} fill={p.accent} opacity={0.55} />
      <circle cx={140} cy={-10} r={36} fill={p.body} />
      <circle cx={155} cy={-18} r={5} fill={p.ink ?? '#0B2036'} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={side * 100} cy={-70} rx={34} ry={18} fill={p.accent} transform={`rotate(${side * 20})`} />
          <ellipse cx={side * 100} cy={70} rx={34} ry={18} fill={p.accent} transform={`rotate(${side * -20})`} />
        </g>
      ))}
    </g>
  );
}

function Jellyfish({ frame, p }: { frame: number; p: MarinePalette }) {
  const y = 1100 - ((frame % 320) / 320) * 420 + bob(frame, 10, 30);
  const pulse = 1 + Math.sin(frame / 13) * 0.08;
  return (
    <g transform={`translate(${W / 2} ${y}) scale(${pulse} ${2 - pulse > 1.1 ? 1.1 : 2 - pulse})`} opacity={0.95}>
      <path d="M-92 6 Q-88 -84 0 -88 Q88 -84 92 6 Q60 22 30 8 Q0 24 -30 8 Q-60 22 -92 6 Z" fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 0 22px ${p.shadow})` : undefined }} />
      <path d="M-64 0 Q-60 -58 0 -62 Q60 -58 64 0" fill={p.accent} opacity={0.7} />
      {[-58, -30, 0, 30, 58].map((x, k) => (
        <path
          key={k}
          d={`M${x} 14 q${Math.sin(frame / 11 + k * 1.6) * 17} 60 ${Math.sin(frame / 13 + k) * 22} 118`}
          stroke={p.body}
          strokeWidth={7 - Math.abs(k - 2)}
          fill="none"
          opacity={0.8}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function FishSchool({ frame, p }: { frame: number; p: MarinePalette }) {
  return (
    <g>
      {Array.from({ length: 10 }, (_, k) => {
        const x = W - ((frame * (2 + (k % 4) * 0.4) + k * 160) % (W + 280)) + 140;
        const y = 700 + (k % 4) * 90 + Math.sin(frame / 24 + k) * 16;
        const s = 0.55 + (k % 3) * 0.18;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${-s} ${s})`} opacity={0.9}>
            <path d="M-44 0 Q-10 -24 34 -12 Q52 0 34 12 Q-10 24 -44 0 Z" fill={k % 2 ? p.body : p.accent} />
            <path d="M-44 0 L-70 -18 Q-62 0 -70 18 Z" fill={p.accent} />
            <circle cx={22} cy={-3} r={3} fill={p.ink ?? '#0B2036'} />
          </g>
        );
      })}
    </g>
  );
}

function Coral({ frame, p }: { frame: number; p: MarinePalette }) {
  return (
    <g transform={`translate(${W / 2} ${H - 280})`}>
      {[-180, -60, 60, 180].map((x, k) => (
        <path
          key={k}
          d={`M${x} 200 Q${x + Math.sin(frame / 40 + k) * 20} 80 ${x - 20} 0 Q${x + 40} -40 ${x + 30} 40`}
          stroke={k % 2 ? p.body : p.accent}
          strokeWidth={22}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}
    </g>
  );
}

function Submarine({ frame, p }: { frame: number; p: MarinePalette }) {
  const x = ((frame * 1.6) % (W + 420)) - 210;
  const y = 960 + bob(frame, 10, 80);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={170} ry={70} fill={p.body} style={{ filter: p.shadow ? `drop-shadow(0 12px 14px ${p.shadow})` : undefined }} />
      <rect x={-40} y={-100} width={50} height={40} rx={8} fill={p.accent} />
      <circle cx={60} cy={-10} r={22} fill={p.accent} opacity={0.8} />
      <circle cx={60} cy={-10} r={12} fill="#9FE8F5" opacity={0.7} />
      <rect x={-150} y={20} width={40} height={16} rx={4} fill={p.ink ?? '#0B2036'} opacity={0.5} />
      <circle cx={-150} cy={0} r={8 + Math.sin(frame / 8) * 3} fill={p.accent} opacity={0.45} />
    </g>
  );
}

function UnderwaterCave({ frame, p }: { frame: number; p: MarinePalette }) {
  return (
    <g transform={`translate(${W / 2} ${H - 420})`}>
      <path d="M-320 320 L-280 40 Q-120 -160 0 -80 Q120 -160 280 40 L320 320 Z" fill={p.body} opacity={0.95} />
      <ellipse cx={0} cy={80} rx={110} ry={140} fill="#061018" opacity={0.85} />
      <ellipse cx={0} cy={100} rx={70} ry={90} fill={p.accent} opacity={0.18 + 0.08 * Math.sin(frame / 30)} />
    </g>
  );
}

const DRAW: Record<MarineId, (frame: number, p: MarinePalette) => ReactNode> = {
  whale: (f, p) => <Whale frame={f} p={p} />,
  shark: (f, p) => <Shark frame={f} p={p} />,
  squid: (f, p) => <Squid frame={f} p={p} />,
  octopus: (f, p) => <Octopus frame={f} p={p} />,
  dolphin: (f, p) => <Dolphin frame={f} p={p} />,
  turtle: (f, p) => <Turtle frame={f} p={p} />,
  jellyfish: (f, p) => <Jellyfish frame={f} p={p} />,
  fish_school: (f, p) => <FishSchool frame={f} p={p} />,
  coral: (f, p) => <Coral frame={f} p={p} />,
  submarine: (f, p) => <Submarine frame={f} p={p} />,
  underwater_cave: (f, p) => <UnderwaterCave frame={f} p={p} />,
};

/** Resolve a subject name or visualId to a marine drawing id. */
export function resolveMarineId(subject?: string, visualId?: string): MarineId | null {
  for (const candidate of [visualId, subject]) {
    if (!candidate) continue;
    const id = foldId(candidate) as MarineId;
    if (DRAW[id]) return id;
    // Soft aliases from common story language.
    if (/leviathan|orca/.test(id)) return 'whale';
    if (/medusa/.test(id)) return 'jellyfish';
    if (/tortoise/.test(id)) return 'turtle';
    if (/ruins|grotto/.test(id)) return 'underwater_cave';
    if (/shoal|school/.test(id)) return 'fish_school';
  }
  return null;
}

/** Draw a marine subject centered in the frame using the given palette. */
export function drawMarine(id: MarineId, frame: number, palette: MarinePalette): ReactNode {
  const node = DRAW[id]?.(frame, palette);
  if (!node) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {node}
      </svg>
    </AbsoluteFill>
  );
}
