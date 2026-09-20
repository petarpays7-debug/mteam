import * as THREE from 'three';
import {
  CAR_LENGTH_END,
  CAR_LENGTH_START,
  carSample,
  WHEEL_RADIUS,
  WHEEL_WIDTH,
  wheelPositions,
} from './carShape';

/**
 * Proceduralni rasporedi za hero scenu.
 *
 * Bazna geometrija instance je BoxGeometry(1, 0.05, 0.62) — tanka ploca.
 * Sve `scale` vrijednosti nize izrazene su u odnosu na te dimenzije.
 *
 * Jedan instanced mesh prelazi kroz tri stanja:
 *   0 — SOLAR : polje fotonaponskih modula na krovu
 *   1 — MOUNT : nosiva konstrukcija s modulima
 *   2 — CARS  : karoserija vozila poplocana modulima
 *
 * Nema ucitavanja vanjskih modela — sve se racuna u pregledniku.
 */

export const INSTANCE_COUNT = 320;
export const STATE_COUNT = 3;

export type InstanceTransform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  color: THREE.Color;
  /** 0 = mat metal, 1 = staklo. Scena ga pretvara u hrapavost materijala. */
  gloss: number;
  /** 0 = ne svijetli, 1 = svjetlo vozila. Hvata ga bloom. */
  glow: number;
  /** 0 = dielektrik (staklo, guma), 1 = metal (celik, lak). */
  metal: number;
};

/* Paleta ---------------------------------------------------------------- */

const PANEL_DEEP = new THREE.Color('#1f4f74');
const PANEL_MID = new THREE.Color('#2f7099');
const STEEL = new THREE.Color('#d6e2ea');
const STEEL_DARK = new THREE.Color('#93a9b7');
const STEEL_WARM = new THREE.Color('#b4c4cf');

const CAR_PAINT = new THREE.Color('#3d4954');
const CAR_PAINT_HI = new THREE.Color('#5b6a78');
const CAR_GLASS = new THREE.Color('#0e161d');
const CAR_TYRE = new THREE.Color('#0d1013');
const CAR_RIM = new THREE.Color('#aab6bf');
const LIGHT_FRONT = new THREE.Color('#ffeec9');
const LIGHT_REAR = new THREE.Color('#c90000');

function quatFromEuler(x: number, y: number, z: number) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
}

function emptyTransform(): InstanceTransform {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(1, 1, 1),
    color: new THREE.Color(PANEL_DEEP),
    gloss: 0.35,
    glow: 0,
    metal: 0.5,
  };
}

/* -------------------------------------------------------------------------- */
/* Stanje 0 — solarno polje                                                    */
/* -------------------------------------------------------------------------- */

const COLS = 20;
const ROWS = 16;
const GAP_X = 0.52;
const GAP_Z = 0.42;
const PANEL_SCALE = 0.46;
/*
  Pozitivan nagib okrece plohu modula prema promatracu (i prema suncu u sceni).
  S negativnim nagibom moduli se vide iskosa, pa polje izgleda kao niz crta.
*/
const PANEL_TILT = 0.4;

function buildSolarState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  for (let i = 0; i < INSTANCE_COUNT; i += 1) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const t = emptyTransform();

    // Polje je podijeljeno u tri bloka po dubini, s prolazom izmedu njih —
    // tako izgleda kao stvarna instalacija, a ne kao jednolicna resetka.
    const block = Math.floor(row / 5);
    const aisle = block * 0.26;

    t.position.set(
      (col - (COLS - 1) / 2) * GAP_X,
      -0.5 + (ROWS - 1 - row) * 0.062,
      (row - (ROWS - 1) / 2) * GAP_Z + aisle - 0.26,
    );
    t.quaternion.copy(quatFromEuler(PANEL_TILT, 0, 0));
    t.scale.set(PANEL_SCALE, 1, PANEL_SCALE);
    t.color.copy((col + row) % 7 === 0 ? PANEL_MID : PANEL_DEEP);
    t.gloss = 0.88;
    t.metal = 0.18;
    out.push(t);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Stanje 1 — konstrukcijski sustav                                            */
/* -------------------------------------------------------------------------- */

const MOUNT_SCALE = 0.86;
const MOUNT_Y_OFFSET = 0.1;

function buildMountState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  const postX = [-4.2, -3.35, -2.5, -1.65, -0.8, 0.05, 0.9, 1.75, 2.6, 3.8];
  const postZ = [-1.45, 1.45];

  // Stupovi — straznji red visi, pa konstrukcija dobiva nagib.
  for (let z = 0; z < postZ.length; z += 1) {
    for (let x = 0; x < postX.length; x += 1) {
      const t = emptyTransform();
      const height = postZ[z] < 0 ? 2.35 : 1.35;
      t.position.set(postX[x], -1.45 + height / 2, postZ[z]);
      t.scale.set(0.1, height / 0.05, 0.16);
      t.color.copy(STEEL_DARK);
      t.gloss = 0.45;
      t.metal = 0.82;
      out.push(t);
    }
  }

  // Uzduzni nosaci.
  const rails: Array<[number, number]> = [
    [-0.28, -1.45],
    [-0.92, 1.45],
    [0.2, -1.45],
    [-0.44, 1.45],
    [-1.3, -1.45],
    [-1.3, 1.45],
    [-0.04, -0.72],
    [-0.68, 0.72],
  ];
  for (const [y, z] of rails) {
    const t = emptyTransform();
    t.position.set(0, y, z);
    t.scale.set(8.6, 2.2, 0.3);
    t.color.copy(STEEL);
    t.gloss = 0.55;
    t.metal = 0.85;
    out.push(t);
  }

  // Dijagonale koje zatvaraju resetku.
  for (let i = 0; i < 16; i += 1) {
    const t = emptyTransform();
    const side = i % 2 === 0 ? -1 : 1;
    const slot = Math.floor(i / 2);
    t.position.set(-3.6 + slot * 1.02, -0.72, side * 1.45);
    t.quaternion.copy(quatFromEuler(0, 0, side * 0.68));
    t.scale.set(2.05, 1.5, 0.16);
    t.color.copy(STEEL_WARM);
    t.gloss = 0.4;
    t.metal = 0.8;
    out.push(t);
  }

  // Poprecne spone izmedu redova.
  for (let i = 0; i < 6; i += 1) {
    const t = emptyTransform();
    t.position.set(-3.2 + i * 1.3, -0.6, 0);
    t.quaternion.copy(quatFromEuler(0.52, Math.PI / 2, 0));
    t.scale.set(3.1, 1.4, 0.2);
    t.color.copy(STEEL_DARK);
    t.gloss = 0.4;
    t.metal = 0.8;
    out.push(t);
  }

  // Moduli polozeni na konstrukciju.
  const panelCount = INSTANCE_COUNT - out.length;
  const pCols = 22;
  for (let i = 0; i < panelCount; i += 1) {
    const col = i % pCols;
    const row = Math.floor(i / pCols);
    const t = emptyTransform();
    t.position.set(
      (col - (pCols - 1) / 2) * 0.42,
      0.62 + row * 0.012,
      (row - 5.5) * 0.34 - 0.1,
    );
    t.quaternion.copy(quatFromEuler(0.5, 0, 0));
    t.scale.set(0.38, 1, 0.32);
    t.color.copy(col % 5 === 0 ? PANEL_MID : PANEL_DEEP);
    t.gloss = 0.88;
    t.metal = 0.18;
    out.push(t);
  }

  for (const t of out) {
    t.position.multiplyScalar(MOUNT_SCALE);
    t.position.y += MOUNT_Y_OFFSET;
    t.scale.multiplyScalar(MOUNT_SCALE);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Stanje 2 — karoserija vozila                                                */
/* -------------------------------------------------------------------------- */

/** Kadriranje: vozilo je manje od solarnog polja i pomaknuto desno od teksta. */
const CAR_SCALE = 0.8;
const CAR_X_OFFSET = 1.25;
const CAR_Y_OFFSET = -0.4;

const BODY_SECTIONS = 18;
const BODY_AROUND = 14;
const WHEEL_SEGMENTS = 16;

/** Plocice se blago preklapaju kako karoserija ne bi bila supljikava. */
const TILE_OVERLAP = 1.18;

const basis = new THREE.Matrix4();

function placeOnCar(
  t: InstanceTransform,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  along: THREE.Vector3,
) {
  t.position
    .copy(position)
    .multiplyScalar(CAR_SCALE)
    .add(new THREE.Vector3(CAR_X_OFFSET, CAR_Y_OFFSET, 0));

  // Ploca lezi na povrsini: lokalni Y (tanka os) ide po normali,
  // lokalni X po duzini vozila.
  const up = normal.clone().normalize();
  const forward = along.clone().projectOnPlane(up).normalize();
  const side = new THREE.Vector3().crossVectors(forward, up).normalize();

  basis.makeBasis(forward, up, side);
  t.quaternion.setFromRotationMatrix(basis);
}

function buildCarState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  /* Karoserija poplocana modulima --------------------------------------- */

  /* Duljina karoserije po jednoj plocici (bazna geometrija ima x = 1). */
  const tileAlong = ((CAR_LENGTH_END - CAR_LENGTH_START) / BODY_SECTIONS) * TILE_OVERLAP;
  /* Opseg presjeka je oko 2.7 jedinica; dijelimo ga na BODY_AROUND plocica. */
  const tileAround = (2.7 / BODY_AROUND / 0.62) * TILE_OVERLAP;

  for (let i = 0; i < BODY_SECTIONS; i += 1) {
    const u = 0.02 + (i / (BODY_SECTIONS - 1)) * 0.96;

    for (let j = 0; j < BODY_AROUND; j += 1) {
      const v = -0.985 + (j / (BODY_AROUND - 1)) * 1.97;
      const sample = carSample(u, v);
      const t = emptyTransform();

      placeOnCar(t, sample.position, sample.normal, sample.along);
      t.scale.set(tileAlong * CAR_SCALE, 1, tileAround * CAR_SCALE);

      switch (sample.region) {
        case 'glass':
          t.color.copy(CAR_GLASS);
          t.gloss = 1;
          t.metal = 0.05;
          break;
        case 'light-front':
          t.color.copy(LIGHT_FRONT);
          t.gloss = 0.9;
          t.glow = 1;
          t.metal = 0.1;
          break;
        case 'light-rear':
          t.color.copy(LIGHT_REAR);
          t.gloss = 0.9;
          t.glow = 0.85;
          t.metal = 0.1;
          break;
        default:
          // Gornje plohe hvataju vise svjetla — blago svjetlija nijansa.
          t.color.copy(Math.abs(v) < 0.4 ? CAR_PAINT_HI : CAR_PAINT);
          t.gloss = 0.84;
          t.metal = 0.5;
      }

      out.push(t);
    }
  }

  /* Kotaci --------------------------------------------------------------- */

  const scaledRadius = WHEEL_RADIUS * CAR_SCALE;

  for (const wheel of wheelPositions()) {
    for (let i = 0; i < WHEEL_SEGMENTS; i += 1) {
      const angle = (i / WHEEL_SEGMENTS) * Math.PI * 2;
      const t = emptyTransform();

      t.position.set(
        wheel.x * CAR_SCALE + CAR_X_OFFSET + Math.cos(angle) * scaledRadius,
        WHEEL_RADIUS * CAR_SCALE + CAR_Y_OFFSET + Math.sin(angle) * scaledRadius,
        wheel.z * CAR_SCALE,
      );
      t.quaternion.copy(quatFromEuler(0, 0, angle + Math.PI / 2));
      t.scale.set(
        ((2 * Math.PI * scaledRadius) / WHEEL_SEGMENTS) * 1.4,
        // Radijalna debljina gume — bez nje kotac izgleda kao tanak prsten.
        (0.24 * CAR_SCALE) / 0.05,
        (WHEEL_WIDTH * CAR_SCALE) / 0.62,
      );
      t.color.copy(i % 3 === 0 ? CAR_RIM : CAR_TYRE);
      t.gloss = i % 3 === 0 ? 0.85 : 0.08;
      t.metal = i % 3 === 0 ? 0.95 : 0.05;
      out.push(t);
    }
  }

  /* Preostale instance se sklanjaju u unutrasnjost karoserije. */
  while (out.length < INSTANCE_COUNT) {
    const t = emptyTransform();
    t.position.set(CAR_X_OFFSET, CAR_Y_OFFSET + 0.6, 0);
    t.scale.setScalar(0.0001);
    out.push(t);
  }

  return out;
}

/* -------------------------------------------------------------------------- */

let cached: InstanceTransform[][] | null = null;

/** Rasporedi se racunaju jednom i dijele izmedu svih instanci scene. */
export function getHeroStates(): InstanceTransform[][] {
  if (!cached) {
    cached = [buildSolarState(), buildMountState(), buildCarState()];
    for (const state of cached) {
      while (state.length < INSTANCE_COUNT) state.push(emptyTransform());
      state.length = INSTANCE_COUNT;
    }
  }
  return cached;
}

/** Deterministicki pseudo-random seed po instanci. */
export function seedFor(index: number): number {
  const v = Math.sin(index * 127.1) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Kasnjenje instance u morph prijelazu, 0..MAX_STAGGER.
 *
 * Zahvaljujuci njemu se preobrazba prelijeva preko objekta umjesto da se
 * sve pomakne odjednom — citljivije je i djeluje namjerno.
 */
export const MAX_STAGGER = 0.42;

export function staggerFor(index: number): number {
  const col = (index % COLS) / (COLS - 1);
  return (col * 0.72 + seedFor(index) * 0.28) * MAX_STAGGER;
}

/** Visina luka koji instanca opise dok putuje izmedu dva stanja. */
export function arcFor(index: number): number {
  return 0.35 + seedFor(index) * 1.15;
}
