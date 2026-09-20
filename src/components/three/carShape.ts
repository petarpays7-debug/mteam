import * as THREE from 'three';

/**
 * Parametarski oblik karoserije — jedini izvor istine za oblik vozila.
 *
 * Koriste ga dvije scene:
 *   1. hero morph, koji po povrsini karoserije rasporeduje solarne module
 *   2. M-CARS scena, koja od iste povrsine gradi punu geometriju
 *
 * Oblik je definiran nizom poprecnih presjeka po duzini vozila. Svaki presjek
 * ima visinu krova, visinu praga i polusirinu, a izmedu presjeka se interpolira
 * glatkom krivuljom. Tako se dobiva prepoznatljiva silueta (hauba, vjetrobran,
 * krov, zadnje staklo) bez ucitavanja vanjskog modela.
 */

type Section = {
  /** Polozaj po duzini vozila. */
  x: number;
  /** Visina gornje linije (hauba / krov / prtljaznik). */
  top: number;
  /** Visina donje linije (prag / branik). */
  bottom: number;
  /** Polusirina karoserije na tom presjeku. */
  halfWidth: number;
};

/** Presjeci idu od prednjeg branika prema straznjem. */
const SECTIONS: Section[] = [
  { x: -3.2, top: 0.74, bottom: 0.26, halfWidth: 0.64 },
  { x: -2.96, top: 0.9, bottom: 0.24, halfWidth: 0.79 },
  { x: -2.54, top: 0.99, bottom: 0.26, halfWidth: 0.88 },
  { x: -1.96, top: 1.04, bottom: 0.28, halfWidth: 0.94 },
  { x: -1.4, top: 1.12, bottom: 0.3, halfWidth: 0.96 },
  { x: -1.0, top: 1.42, bottom: 0.31, halfWidth: 0.945 },
  { x: -0.54, top: 1.66, bottom: 0.32, halfWidth: 0.905 },
  { x: 0.2, top: 1.73, bottom: 0.32, halfWidth: 0.9 },
  { x: 0.86, top: 1.66, bottom: 0.32, halfWidth: 0.905 },
  { x: 1.46, top: 1.36, bottom: 0.3, halfWidth: 0.94 },
  { x: 2.1, top: 1.14, bottom: 0.28, halfWidth: 0.945 },
  { x: 2.7, top: 1.05, bottom: 0.26, halfWidth: 0.88 },
  { x: 3.2, top: 0.84, bottom: 0.26, halfWidth: 0.66 },
];

export const CAR_LENGTH_START = SECTIONS[0].x;
export const CAR_LENGTH_END = SECTIONS[SECTIONS.length - 1].x;

/** Osovine — koriste se i za blatobrane i za kotace. */
export const AXLES = [-1.86, 1.86] as const;
export const WHEEL_RADIUS = 0.5;
export const WHEEL_WIDTH = 0.28;
export const WHEEL_INSET = 0.8;

/** Podizanje donje linije iznad osovina — otvor blatobrana. */
const ARCH_HEIGHT = 0.42;
const ARCH_SPAN = 0.72;

function archLift(x: number): number {
  let lift = 0;
  for (const axle of AXLES) {
    const d = Math.abs(x - axle) / ARCH_SPAN;
    if (d < 1) {
      // Glatki brijeg (smootherstep) umjesto ostrog reza.
      const k = 1 - d * d;
      lift = Math.max(lift, ARCH_HEIGHT * k * k);
    }
  }
  return lift;
}

/** Monotona kubna interpolacija — sprjecava "valove" izmedu presjeka. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function sectionAt(x: number): Section {
  const clamped = THREE.MathUtils.clamp(x, CAR_LENGTH_START, CAR_LENGTH_END);

  let i = 0;
  while (i < SECTIONS.length - 2 && SECTIONS[i + 1].x < clamped) i += 1;

  const a = SECTIONS[i];
  const b = SECTIONS[i + 1];
  const t = smoothstep(THREE.MathUtils.clamp((clamped - a.x) / (b.x - a.x), 0, 1));

  return {
    x: clamped,
    top: THREE.MathUtils.lerp(a.top, b.top, t),
    bottom: THREE.MathUtils.lerp(a.bottom, b.bottom, t) + archLift(clamped),
    halfWidth: THREE.MathUtils.lerp(a.halfWidth, b.halfWidth, t),
  };
}

/**
 * Tocka na povrsini karoserije.
 *
 * @param u 0..1 po duzini vozila (0 = prednji branik)
 * @param v -1..1 oko presjeka (-1 = lijevi prag, 0 = sredina krova, 1 = desni prag)
 */
export function carPoint(u: number, v: number, target = new THREE.Vector3()): THREE.Vector3 {
  const x = THREE.MathUtils.lerp(CAR_LENGTH_START, CAR_LENGTH_END, THREE.MathUtils.clamp(u, 0, 1));
  const s = sectionAt(x);
  const a = THREE.MathUtils.clamp(v, -1, 1) * (Math.PI / 2);

  // Eksponent < 1 daje "kockastiji" presjek: ravniji krov i uspravniji bok.
  const height = Math.pow(Math.max(Math.cos(a), 0), 0.62);

  return target.set(x, s.bottom + (s.top - s.bottom) * height, s.halfWidth * Math.sin(a));
}

export type CarSample = {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  /** Tangenta po duzini vozila. */
  along: THREE.Vector3;
  /** Tangenta oko presjeka. */
  around: THREE.Vector3;
  /** Podrucje na karoseriji — odreduje boju i materijal. */
  region: 'body' | 'glass' | 'light-front' | 'light-rear';
};

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const tmpD = new THREE.Vector3();

/** Staklena povrsina: vjetrobran, bocna stakla i zadnje staklo. */
function isGlass(x: number, heightFactor: number): boolean {
  return x > -1.12 && x < 1.55 && heightFactor > 0.58;
}

export function carSample(u: number, v: number): CarSample {
  const du = 0.004;
  const dv = 0.01;

  const position = carPoint(u, v, new THREE.Vector3());

  const along = carPoint(u + du, v, tmpA).sub(carPoint(u - du, v, tmpB)).normalize();
  const around = carPoint(u, v + dv, tmpC).sub(carPoint(u, v - dv, tmpD)).normalize();
  const normal = new THREE.Vector3().crossVectors(around, along).normalize();

  const x = position.x;
  const s = sectionAt(x);
  const heightFactor = (position.y - s.bottom) / Math.max(s.top - s.bottom, 0.001);

  let region: CarSample['region'] = 'body';
  if (isGlass(x, heightFactor)) region = 'glass';
  else if (x < -2.86 && heightFactor > 0.25 && heightFactor < 0.8) region = 'light-front';
  else if (x > 2.88 && heightFactor > 0.25 && heightFactor < 0.8) region = 'light-rear';

  return {
    position,
    normal,
    along: along.clone(),
    around: around.clone(),
    region,
  };
}

/** Kotaci: po dvije osovine, lijevo i desno. */
export function wheelPositions(): Array<{ x: number; z: number }> {
  const out: Array<{ x: number; z: number }> = [];
  for (const x of AXLES) {
    out.push({ x, z: -WHEEL_INSET }, { x, z: WHEEL_INSET });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Puna geometrija za M-CARS scenu                                            */
/* -------------------------------------------------------------------------- */

/**
 * Gradi zatvorenu mrezu karoserije iz iste parametarske povrsine.
 * Vraca i indeks grupe za staklo, pa se stakla mogu obojiti zasebnim materijalom.
 */
export function buildCarBodyGeometry(segmentsX = 72, segmentsV = 34): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const bodyIndices: number[] = [];
  const glassIndices: number[] = [];

  const point = new THREE.Vector3();

  for (let i = 0; i <= segmentsX; i += 1) {
    const u = i / segmentsX;
    for (let j = 0; j <= segmentsV; j += 1) {
      const v = -1 + (2 * j) / segmentsV;
      carPoint(u, v, point);
      positions.push(point.x, point.y, point.z);
      uvs.push(u, (v + 1) / 2);
    }
  }

  const rowSize = segmentsV + 1;
  const center = new THREE.Vector3();

  for (let i = 0; i < segmentsX; i += 1) {
    for (let j = 0; j < segmentsV; j += 1) {
      const a = i * rowSize + j;
      const b = a + rowSize;
      const c = b + 1;
      const d = a + 1;

      // Pripadnost kvadratica odreduje se po njegovom sredistu.
      carPoint((i + 0.5) / segmentsX, -1 + (2 * (j + 0.5)) / segmentsV, center);
      const s = sectionAt(center.x);
      const heightFactor = (center.y - s.bottom) / Math.max(s.top - s.bottom, 0.001);
      const target = isGlass(center.x, heightFactor) ? glassIndices : bodyIndices;

      /*
        Smjer namotavanja mora dati normalu `around x along` (prema van) —
        isti smjer koji koristi `carSample`. S obrnutim redoslijedom karoserija
        se osvjetljava iznutra i izgleda kao tamna vrpca.
      */
      target.push(a, d, b, b, d, c);
    }
  }

  // Zatvaranje podnice, da karoserija nije otvorena odozdo.
  const floorStart = positions.length / 3;
  for (let i = 0; i <= segmentsX; i += 1) {
    const u = i / segmentsX;
    carPoint(u, -1, point);
    positions.push(point.x, point.y, point.z);
    uvs.push(u, 0);
    carPoint(u, 1, point);
    positions.push(point.x, point.y, point.z);
    uvs.push(u, 1);
  }
  for (let i = 0; i < segmentsX; i += 1) {
    const a = floorStart + i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    // Podnica gleda prema dolje.
    bodyIndices.push(a, b, c, b, d, c);
  }

  /*
    Zatvaranje prednjeg i straznjeg presjeka. Bez poklopaca je karoserija
    otvorena na krajevima, pa se kroz otvor vidi njezina unutrasnjost.
    Poklopac je lepeza iz sredista presjeka prema obrisu.
  */
  for (const end of [0, segmentsX] as const) {
    const ringStart = end * rowSize;

    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let j = 0; j <= segmentsV; j += 1) {
      cx += positions[(ringStart + j) * 3];
      cy += positions[(ringStart + j) * 3 + 1];
      cz += positions[(ringStart + j) * 3 + 2];
    }
    const count = segmentsV + 1;
    const centreIndex = positions.length / 3;
    positions.push(cx / count, cy / count, cz / count);
    uvs.push(end === 0 ? 0 : 1, 0.5);

    for (let j = 0; j < segmentsV; j += 1) {
      const p0 = ringStart + j;
      const p1 = ringStart + j + 1;
      bodyIndices.push(centreIndex, p0, p1);
    }
    // Donji rub presjeka izmedu dva praga.
    bodyIndices.push(centreIndex, ringStart + segmentsV, ringStart);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex([...bodyIndices, ...glassIndices]);
  geometry.addGroup(0, bodyIndices.length, 0);
  geometry.addGroup(bodyIndices.length, glassIndices.length, 1);
  geometry.computeVertexNormals();

  return geometry;
}
