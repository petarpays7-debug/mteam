import { cn } from '@/lib/cn';
import type { WorldId } from '@/content/home';

const accent: Record<WorldId, { line: string; glow: string }> = {
  solar: { line: '#F5B900', glow: 'rgba(245,185,0,0.22)' },
  mount: { line: '#93AEBF', glow: 'rgba(147,174,191,0.2)' },
  cars: { line: '#C90000', glow: 'rgba(201,0,0,0.22)' },
};

/**
 * Staticki vizual koji se koristi kada WebGL nije dostupan, dok se 3D scena
 * ucitava ili kada uredjaj nije prikladan za render petlju.
 *
 * Nacrtan je kao SVG, bez vanjskih datoteka, pa ne utjece na LCP.
 */
export function SceneFallback({
  world = 'solar',
  className,
}: {
  world?: WorldId;
  className?: string;
}) {
  const { line, glow } = accent[world];
  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 55% at 50% 42%, ${glow}, transparent 70%), linear-gradient(180deg, #04121B 0%, #061A26 55%, #0B1014 100%)`,
        }}
      />
      <svg
        viewBox="0 0 1200 700"
        className="absolute inset-0 h-full w-full mask-fade-radial"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="panelFace" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#14374c" />
            <stop offset="55%" stopColor="#0d2534" />
            <stop offset="100%" stopColor="#081c28" />
          </linearGradient>
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Tehnicka mreza u podnozju */}
        <g stroke="#1F3D4E" strokeWidth="1" opacity="0.5">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={430 + i * 18} x2="1200" y2={430 + i * 18} />
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <line key={`v${i}`} x1={i * 52} y1="430" x2={i * 52 - 240} y2="700" />
          ))}
        </g>

        {/* Perspektivno polje fotonaponskih modula */}
        {rows.map((r) =>
          cols.map((c) => {
            const depth = 1 - r * 0.14;
            const w = 118 * depth;
            const h = 52 * depth;
            const x = 600 + (c - 3.5) * (132 * depth);
            const y = 250 + r * 46;
            return (
              <g key={`${r}-${c}`} transform={`translate(${x - w / 2} ${y})`}>
                <polygon
                  points={`0,${h} ${w * 0.12},0 ${w},0 ${w * 0.88},${h}`}
                  fill="url(#panelFace)"
                  stroke={line}
                  strokeOpacity={0.16}
                  strokeWidth="1"
                />
                <polygon
                  points={`0,${h} ${w * 0.12},0 ${w},0 ${w * 0.88},${h}`}
                  fill="url(#sheen)"
                  opacity={r === 1 ? 0.9 : 0.35}
                />
              </g>
            );
          }),
        )}

        {/* Akcentna linija energije */}
        <path
          d="M120 236 H1080"
          stroke={line}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeDasharray="3 10"
        />
      </svg>
    </div>
  );
}
