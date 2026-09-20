'use client';

import { CarSceneFrame } from '@/components/three/SceneFrame';

/** Staticka zamjena: apstraktna linija vozila i metalne refleksije. */
function CarFallback() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 55%, rgba(201,0,0,0.16), transparent 70%), linear-gradient(180deg, rgba(11,16,20,0) 0%, rgba(11,16,20,0.6) 100%)',
        }}
      />
      <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="carBody" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#2b3238" />
            <stop offset="60%" stopColor="#15191d" />
            <stop offset="100%" stopColor="#0c0f11" />
          </linearGradient>
        </defs>
        <path
          d="M110 250 C112 222 128 210 152 206 C176 200 200 178 226 166 C258 152 300 146 344 150 C388 154 420 168 448 186 C470 200 496 208 516 216 C532 222 538 234 536 250 Z"
          fill="url(#carBody)"
          stroke="#C90000"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
        <path
          d="M236 172 C268 160 312 156 350 160 C382 164 404 174 424 186 L236 186 Z"
          fill="#0B1014"
          fillOpacity="0.8"
          stroke="#93AEBF"
          strokeOpacity="0.2"
        />
        <circle cx="200" cy="250" r="34" fill="none" stroke="#7d95a5" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="448" cy="250" r="34" fill="none" stroke="#7d95a5" strokeOpacity="0.5" strokeWidth="2" />
        <path d="M80 268 H560" stroke="#C90000" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 10" />
      </svg>
    </div>
  );
}

export function CarHeroVisual() {
  return (
    <CarSceneFrame
      className="relative aspect-[5/4] w-full overflow-hidden rounded-card border border-white/8 sm:aspect-[16/10] lg:aspect-square"
      fallback={<CarFallback />}
    />
  );
}
