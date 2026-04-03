import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const HELIX_HEIGHT = 200;
const VIEW_WIDTH = 120;
const NUM_TURNS = 1.35;
const RADIUS = 22;
const NUM_POINTS = 80;
const BASE_PAIRS = 11;
const ROTATION_SPEED = 0.14;
const ROTATION_SPEED_HOVER = 0.2;
const CENTER_X = VIEW_WIDTH / 2;
const SCALE = 2;

function project3D(
  x: number,
  y: number,
  z: number,
  rotYDeg: number,
  rotXDeg: number
): { sx: number; sy: number; z: number } {
  const ry = (rotYDeg * Math.PI) / 180;
  const rx = (rotXDeg * Math.PI) / 180;
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;
  const y1 = y;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;
  return {
    sx: CENTER_X + x1 * SCALE,
    sy: y2,
    z: z2,
  };
}

interface DNAHelixProps {
  isHovered?: boolean;
}

export default function DNAHelix({ isHovered = false }: DNAHelixProps) {
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, rotY: 0 });
  const rafRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    if (isDragging) return;
    const speed = isHovered ? ROTATION_SPEED_HOVER : ROTATION_SPEED;
    const tick = () => {
      angleRef.current = (angleRef.current + speed) % 360;
      setRotationY(angleRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isDragging, isHovered]);

  useEffect(() => {
    angleRef.current = rotationY;
  }, [rotationY]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, rotY: rotationY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotationY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const newY = (dragStart.current.rotY + dx) % 360;
      angleRef.current = newY;
      setRotationY(newY);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      setIsDragging(false);
    }
  }, []);

  const { path1, path2, basePairs } = useMemo(() => {
    const twoPiN = 2 * Math.PI * NUM_TURNS;
    const points1: { sx: number; sy: number; z: number }[] = [];
    const points2: { sx: number; sy: number; z: number }[] = [];
    for (let i = 0; i <= NUM_POINTS; i++) {
      const t = (i / NUM_POINTS) * twoPiN;
      const y = (i / NUM_POINTS) * HELIX_HEIGHT;
      const x1 = RADIUS * Math.cos(t);
      const z1 = RADIUS * Math.sin(t);
      const x2 = RADIUS * Math.cos(t + Math.PI);
      const z2 = RADIUS * Math.sin(t + Math.PI);
      points1.push(project3D(x1, y, z1, rotationY, rotationX));
      points2.push(project3D(x2, y, z2, rotationY, rotationX));
    }
    const path1 = points1.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.sx} ${p.sy}`).join(' ');
    const path2 = points2.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.sx} ${p.sy}`).join(' ');
    const pairs: { x1: number; y1: number; x2: number; y2: number; z: number }[] = [];
    for (let i = 0; i < BASE_PAIRS; i++) {
      const t = ((i + 1) / (BASE_PAIRS + 1)) * twoPiN;
      const y = ((i + 1) / (BASE_PAIRS + 1)) * HELIX_HEIGHT;
      const x1 = RADIUS * Math.cos(t);
      const z1 = RADIUS * Math.sin(t);
      const x2 = RADIUS * Math.cos(t + Math.PI);
      const z2 = RADIUS * Math.sin(t + Math.PI);
      const a = project3D(x1, y, z1, rotationY, rotationX);
      const b = project3D(x2, y, z2, rotationY, rotationX);
      pairs.push({ x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, z: (a.z + b.z) / 2 });
    }
    return { path1, path2, basePairs: pairs };
  }, [rotationY, rotationX]);

  return (
    <div
      className="dna-container flex items-center justify-center overflow-hidden"
      style={{
        height: HELIX_HEIGHT,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      aria-hidden
    >
      <div
        className="dna-helix relative"
        style={{
          width: VIEW_WIDTH,
          height: HELIX_HEIGHT,
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${HELIX_HEIGHT}`}
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(88, 28, 135, 0.4))' }}
        >
          <defs>
            <linearGradient id="dna-pink" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="dna-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Strand 1 (pink) - back layer with dark purple outline */}
          <path d={path1} fill="none" stroke="#5b21b6" strokeWidth="4" strokeLinecap="round" opacity={0.35} />
          <path d={path1} fill="none" stroke="url(#dna-pink)" strokeWidth="2.5" strokeLinecap="round" opacity={0.5} />
          {/* Strand 2 (blue) - back layer */}
          <path d={path2} fill="none" stroke="#5b21b6" strokeWidth="4" strokeLinecap="round" opacity={0.35} />
          <path d={path2} fill="none" stroke="url(#dna-blue)" strokeWidth="2.5" strokeLinecap="round" opacity={0.5} />
          {/* Strand 1 (pink) - front */}
          <path d={path1} fill="none" stroke="#5b21b6" strokeWidth="4.5" strokeLinecap="round" />
          <path d={path1} fill="none" stroke="url(#dna-pink)" strokeWidth="2.8" strokeLinecap="round" opacity={1} />
          {/* Strand 2 (blue) - front */}
          <path d={path2} fill="none" stroke="#5b21b6" strokeWidth="4.5" strokeLinecap="round" />
          <path d={path2} fill="none" stroke="url(#dna-blue)" strokeWidth="2.8" strokeLinecap="round" opacity={1} />
          {/* Base pairs - blue with purple outline, rounded ends */}
          {basePairs.map((pair, i) => (
            <g key={i}>
              <line
                x1={pair.x1}
                y1={pair.y1}
                x2={pair.x2}
                y2={pair.y2}
                stroke="#5b21b6"
                strokeWidth={pair.z > 0 ? 3.5 : 4}
                strokeLinecap="round"
                opacity={pair.z > 0 ? 0.5 : 0.9}
              />
              <line
                x1={pair.x1}
                y1={pair.y1}
                x2={pair.x2}
                y2={pair.y2}
                stroke="#3b82f6"
                strokeWidth={pair.z > 0 ? 2 : 2.5}
                strokeLinecap="round"
                opacity={pair.z > 0 ? 0.6 : 1}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
