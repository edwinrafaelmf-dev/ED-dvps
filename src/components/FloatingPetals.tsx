import type { CSSProperties } from 'react';

interface PetalConfig {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  driftX: string;
  spinDeg: string;
  opacity: number;
}

const PETALS: PetalConfig[] = [
  { id: 1, left: '6%', size: 12, duration: '13s', delay: '0s', driftX: '64px', spinDeg: '220deg', opacity: 0.72 },
  { id: 2, left: '16%', size: 10, duration: '16s', delay: '-4s', driftX: '-45px', spinDeg: '310deg', opacity: 0.55 },
  { id: 3, left: '28%', size: 14, duration: '15s', delay: '-8s', driftX: '80px', spinDeg: '240deg', opacity: 0.65 },
  { id: 4, left: '41%', size: 9, duration: '12s', delay: '-2s', driftX: '40px', spinDeg: '190deg', opacity: 0.5 },
  { id: 5, left: '54%', size: 13, duration: '17s', delay: '-10s', driftX: '-60px', spinDeg: '280deg', opacity: 0.68 },
  { id: 6, left: '67%', size: 11, duration: '14s', delay: '-6s', driftX: '55px', spinDeg: '250deg', opacity: 0.6 },
  { id: 7, left: '79%', size: 15, duration: '18s', delay: '-3s', driftX: '-50px', spinDeg: '300deg', opacity: 0.7 },
  { id: 8, left: '91%', size: 10, duration: '13.5s', delay: '-9s', driftX: '-38px', spinDeg: '210deg', opacity: 0.55 },
  { id: 9, left: '34%', size: 11, duration: '16.5s', delay: '-12s', driftX: '72px', spinDeg: '270deg', opacity: 0.45 },
  { id: 10, left: '72%', size: 12, duration: '14.5s', delay: '-7s', driftX: '48px', spinDeg: '235deg', opacity: 0.6 },
];

interface FloatingPetalsProps {
  tone?: 'light' | 'dark';
}

export function FloatingPetals({ tone = 'dark' }: FloatingPetalsProps) {
  const fillColor = tone === 'light' ? '#F4A6B8' : '#FBCFE8';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      aria-hidden="true"
    >
      {PETALS.map((petal) => {
        const style = {
          left: petal.left,
          top: '-32px',
          width: `${petal.size}px`,
          height: `${petal.size}px`,
          '--fall-duration': petal.duration,
          '--fall-delay': petal.delay,
          '--drift-x': petal.driftX,
          '--spin-deg': petal.spinDeg,
          opacity: petal.opacity,
        } as CSSProperties;

        return (
          <svg
            key={petal.id}
            viewBox="0 0 24 24"
            className="sakura-petal absolute"
            style={style}
          >
            <path
              d="M12 2C9.5 5.5 5 9 5 14.2C5 18.4 8.2 21.5 12 22C15.8 21.5 19 18.4 19 14.2C19 9 14.5 5.5 12 2Z"
              fill={fillColor}
            />
          </svg>
        );
      })}
    </div>
  );
}
