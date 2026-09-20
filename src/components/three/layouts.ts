import * as THREE from 'three';

/**
 * Proceduralni rasporedi za hero scenu.
 *
 * Bazna geometrija instance je BoxGeometry(1, 0.05, 0.62) - tanka ploca.
 * Sve `scale` vrijednosti nize su izrazene u odnosu na te dimenzije.
 *
 * Jedan instanced mesh (96 instanci) prelazi kroz tri stanja:
 *   0 - SOLAR  : polje fotonaponskih modula
 *   1 - MOUNT  : nosiva konstrukcija s modulima
 *   2 - CARS   : silueta automobila
 *
 * Nema ucitavanja vanjskih modela - sve je izracunato u pregledniku.
 */

export const INSTANCE_COUNT = 96;
export const STATE_COUNT = 3;

export type InstanceTransform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  color: THREE.Color;
};

const X_AXIS = new THREE.Vector3(1, 0, 0);

const PANEL_DARK = new THREE.Color('#15384e');
const PANEL_LIGHT = new THREE.Color('#1f5270');
const STEEL = new THREE.Color('#c3d2db');
const STEEL_DARK = new THREE.Color('#7d95a5');
const CAR_BODY = new THREE.Color('#55616b');
const CAR_ACCENT = new THREE.Color('#e23a3a');

function quatFromEuler(x: number, y: number, z: number) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
}

function emptyTransform(): InstanceTransform {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(1, 1, 1),
    color: new THREE.Color(PANEL_DARK),
  };
}

/* -------------------------------------------------------------------------- */
/* Stanje 0 - solarno polje                                                    */
/* -------------------------------------------------------------------------- */

const COLS = 12;
const ROWS = 8;
const GAP_X = 0.84;
const GAP_Z = 0.66;
const PANEL_SCALE = 0.74;
const PANEL_TILT = -0.4;

function buildSolarState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  for (let i = 0; i < INSTANCE_COUNT; i += 1) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const t = emptyTransform();

    t.position.set(
      (col - (COLS - 1) / 2) * GAP_X,
      // Udaljeniji redovi su blago podignuti - daje dubinu bez modeliranja krova.
      -0.35 + (ROWS - 1 - row) * 0.11,
      (row - (ROWS - 1) / 2) * GAP_Z,
    );
    t.quaternion.copy(quatFromEuler(PANEL_TILT, 0, 0));
    t.scale.set(PANEL_SCALE, 1, PANEL_SCALE);
    t.color.copy((col + row) % 5 === 0 ? PANEL_LIGHT : PANEL_DARK);
    out.push(t);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Stanje 1 - konstrukcijski sustav                                            */
/* -------------------------------------------------------------------------- */

const STRUCTURE_COUNT = 24;

/** Kadriranje konstrukcije - kompaktnija je i pomaknuta desno od hero teksta. */
const MOUNT_SCALE = 0.82;
const MOUNT_X_OFFSET = 1.0;
const MOUNT_Y_OFFSET = 0.3;

function buildMountState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  // 10 vertikalnih stupova u dva reda po dubini.
  const postX = [-3.4, -1.7, 0, 1.7, 3.4];
  const postZ = [-1.15, 1.15];
  for (let z = 0; z < postZ.length; z += 1) {
    for (let x = 0; x < postX.length; x += 1) {
      const t = emptyTransform();
      const height = postZ[z] < 0 ? 2.1 : 1.25;
      t.position.set(postX[x], -1.3 + height / 2, postZ[z]);
      t.scale.set(0.11, height / 0.05, 0.18);
      t.color.copy(STEEL_DARK);
      out.push(t);
    }
  }

  // 6 uzduznih nosaca.
  const railRows: Array<[number, number]> = [
    [-0.32, -1.15],
    [-0.9, 1.15],
    [0.16, -1.15],
    [-0.42, 1.15],
    [-1.25, -1.15],
    [-1.25, 1.15],
  ];
  for (const [y, z] of railRows) {
    const t = emptyTransform();
    t.position.set(0, y, z);
    t.scale.set(7.4, 2.4, 0.3);
    t.color.copy(STEEL);
    out.push(t);
  }

  // 8 dijagonala koje zatvaraju resetku.
  for (let i = 0; i < 8; i += 1) {
    const t = emptyTransform();
    const side = i % 2 === 0 ? -1 : 1;
    const slot = Math.floor(i / 2);
    t.position.set(-2.55 + slot * 1.7, -0.62, side * 1.15);
    t.quaternion.copy(quatFromEuler(0, 0, side * 0.72));
    t.scale.set(1.9, 1.6, 0.14);
    t.color.copy(STEEL_DARK);
    out.push(t);
  }

  // Preostale instance su moduli polozeni na konstrukciju.
  const panelCount = INSTANCE_COUNT - STRUCTURE_COUNT;
  const pCols = 12;
  for (let i = 0; i < panelCount; i += 1) {
    const col = i % pCols;
    const row = Math.floor(i / pCols);
    const t = emptyTransform();
    t.position.set(
      (col - (pCols - 1) / 2) * 0.64,
      0.52 + row * 0.02,
      (row - 2.5) * 0.52 - 0.1,
    );
    t.quaternion.copy(quatFromEuler(-0.52, 0, 0));
    t.scale.set(0.58, 1, 0.5);
    t.color.copy(col % 4 === 0 ? PANEL_LIGHT : PANEL_DARK);
    out.push(t);
  }

  for (const t of out) {
    t.position.multiplyScalar(MOUNT_SCALE);
    t.position.x += MOUNT_X_OFFSET;
    t.position.y += MOUNT_Y_OFFSET;
    t.scale.multiplyScalar(MOUNT_SCALE);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Stanje 2 - silueta automobila                                               */
/* -------------------------------------------------------------------------- */

/** Bocni profil vozila. Namjerno apstraktan - ne prikazuje konkretan model. */
const CAR_PROFILE: Array<[number, number]> = [
  [-3.12, 0.56],
  [-3.22, 0.96],
  [-2.86, 1.16],
  [-1.78, 1.3],
  [-1.14, 1.74],
  [0.14, 1.96],
  [1.26, 1.88],
  [2.26, 1.36],
  [3.0, 1.14],
  [3.22, 0.9],
  [3.1, 0.5],
  [2.46, 0.42],
  [1.54, 0.46],
  [-1.56, 0.46],
  [-2.48, 0.42],
];

/** Kadriranje siluete: manja je od solarnog polja i pomaknuta desno od teksta. */
const CAR_SCALE = 0.78;
const CAR_X_OFFSET = 1.15;
const CAR_Y_OFFSET = -0.5;
const OUTLINE_COUNT = 64;
const WHEEL_COUNT = 16;

function buildCarState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  const curve = new THREE.CatmullRomCurve3(
    CAR_PROFILE.map(
      ([x, y]) =>
        new THREE.Vector3(x * CAR_SCALE + CAR_X_OFFSET, (y - 1.2) * CAR_SCALE + CAR_Y_OFFSET, 0),
    ),
    true,
    'catmullrom',
    0.4,
  );

  const totalLength = curve.getLength();
  /*
    Duljina jedne plocice uz obris. Faktor > 1 znaci da se susjedne plocice
    blago preklapaju, pa se silueta cita kao neprekinuta linija.
    Plocica MORA ostati duza nego sto je duboka (scale.z nize), inace se
    obris raspada u niz zasebnih blokova.
  */
  const segment = (totalLength / OUTLINE_COUNT) * 1.5;

  for (let i = 0; i < OUTLINE_COUNT; i += 1) {
    const u = i / OUTLINE_COUNT;
    const point = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u).normalize();
    const t = emptyTransform();

    t.position.copy(point);
    t.quaternion.setFromUnitVectors(X_AXIS, tangent);
    /*
      Rotacija preslikava lokalni X na tangentu obrisa, pa lokalni Y postaje
      normala u ravnini siluete - scale.y je stoga debljina same linije.
    */
    t.scale.set(segment, 2.6, 0.22);
    // Akcentna crvena samo na krovnoj liniji - suzdrzano, bez "racing" dojma.
    t.color.copy(i > 6 && i < 16 ? CAR_ACCENT : CAR_BODY);
    out.push(t);
  }

  const wheels: Array<[number, number]> = [
    [-1.86, 0.62],
    [1.86, 0.62],
  ];
  const radius = 0.6 * CAR_SCALE;

  for (const [cx, cy] of wheels) {
    for (let i = 0; i < WHEEL_COUNT; i += 1) {
      const angle = (i / WHEEL_COUNT) * Math.PI * 2;
      const t = emptyTransform();
      t.position.set(
        cx * CAR_SCALE + CAR_X_OFFSET + Math.cos(angle) * radius,
        (cy - 1.2) * CAR_SCALE + CAR_Y_OFFSET + Math.sin(angle) * radius,
        0,
      );
      t.quaternion.copy(quatFromEuler(0, 0, angle + Math.PI / 2));
      t.scale.set(0.3, 2.4, 0.22);
      t.color.copy(STEEL_DARK);
      out.push(t);
    }
  }

  return out;
}

/* -------------------------------------------------------------------------- */

let cached: InstanceTransform[][] | null = null;

/** Rasporedi se racunaju jednom i dijele izmedju svih instanci scene. */
export function getHeroStates(): InstanceTransform[][] {
  if (!cached) {
    cached = [buildSolarState(), buildMountState(), buildCarState()];
    for (const state of cached) {
      // Sigurnosna provjera - svako stanje mora imati tocan broj instanci.
      while (state.length < INSTANCE_COUNT) state.push(emptyTransform());
      state.length = INSTANCE_COUNT;
    }
  }
  return cached;
}

/** Deterministicki pseudo-random seed po instanci (za suptilno lebdenje). */
export function seedFor(index: number): number {
  return (Math.sin(index * 127.1) * 43758.5453) % 1;
}
