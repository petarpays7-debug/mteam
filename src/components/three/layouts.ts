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
  /** 1 = na instancu se crta tekstura fotonaponskog modula. */
  panel: number;
};

/* Paleta ---------------------------------------------------------------- */

const PANEL_DEEP = new THREE.Color('#2c6b96');
const PANEL_MID = new THREE.Color('#3f8ab5');
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
    panel: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Stanje 0 — solarno polje                                                    */
/* -------------------------------------------------------------------------- */

const COLS = 20;
const ROWS = 16;
/*
  Razmaci su tek nesto veci od samog modula. Sa sirim razmakom polje se izmedu
  dva prelaska sunca raspadalo u niz odvojenih pravokutnika umjesto da izgleda
  kao jedna suvisla ploha.
*/
const GAP_X = 0.5;
const GAP_Z = 0.33;
const PANEL_SCALE = 0.47;
/*
  Pozitivan nagib okrece plohu modula prema promatracu (i prema suncu u sceni).

  Vrijednost nije proizvoljna: kamera gleda polje pod oko 23 stupnja, pa pri
  nagibu 0.55 svaki red zaklanja vise dubine nego sto iznosi razmak do sljedeceg.
  Redovi se tako vizualno preklapaju i polje izgleda kao jedna ploha. S manjim
  nagibom izmedu redova se vide praznine i polje se raspada u niz pravokutnika.
*/
const PANEL_TILT = 0.55;

function buildSolarState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  for (let i = 0; i < INSTANCE_COUNT; i += 1) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const t = emptyTransform();

    // Polje je podijeljeno u tri bloka po dubini, s prolazom izmedu njih —
    // tako izgleda kao stvarna instalacija, a ne kao jednolicna resetka.
    const block = Math.floor(row / 5);
    const aisle = block * 0.2;

    t.position.set(
      (col - (COLS - 1) / 2) * GAP_X,
      -0.5 + (ROWS - 1 - row) * 0.05,
      (row - (ROWS - 1) / 2) * GAP_Z + aisle - 0.2,
    );
    t.quaternion.copy(quatFromEuler(PANEL_TILT, 0, 0));
    t.scale.set(PANEL_SCALE, 1, PANEL_SCALE);
    t.color.copy((col + row) % 7 === 0 ? PANEL_MID : PANEL_DEEP);
    t.gloss = 0.88;
    t.metal = 0.18;
    t.panel = 1;
    out.push(t);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Stanje 1 — konstrukcijski sustav                                            */
/* -------------------------------------------------------------------------- */

const MOUNT_SCALE = 0.86;
const MOUNT_Y_OFFSET = 0.1;

/*
  Konstrukcija je modelirana kao stvarni nagnuti stol.

  Ravnina modula pada prema promatracu (+Z), jer su moduli nagnuti licem prema
  njemu. Zato je straznji red stupova visok, a prednji nizak. Sve visine racunaju
  se iz iste funkcije `arrayPlaneY`, pa nijedna greda ne moze proviriti kroz
  module - to je ranije bio slucaj jer su stupovi imali fiksnu visinu.
*/
const MOUNT_TILT = 0.55;
const MOUNT_SLOPE = Math.tan(MOUNT_TILT);
/** Visina ravnine modula na osi z = 0. */
const ARRAY_BASE_Y = 0.35;
/** Razina tla ispod konstrukcije. */
const GROUND_Y = -1.7;
/*
  Razmak izmedu vrha nosaca i ravnine modula.

  Nagnuti modul seze 0.078 ispod svoje ravnine (polovica debljine puta kosinus
  nagiba, plus polovica dubine puta sinus). Nosac je visok 0.11 i podignut 0.05
  iznad vrha stupa, pa mu vrh zavrsava na -RAIL_CLEARANCE + 0.105.
  Uz 0.32 ostaje oko 0.14 zracnosti; s ranijih 0.13 nosac je virio kroz module.
*/
const RAIL_CLEARANCE = 0.32;

const RAIL_Z = [-1.45, 1.45];
const POST_X = [-4.2, -3.0, -1.8, -0.6, 0.6, 1.8, 3.0, 4.2];

/*
  Raspodjela 320 instanci mora biti tocna:
  16 stupova + 4 nosaca + 8 spona + 6 potpornja = 34 konstrukcije,
  a preostalih 286 cini punu mrezu modula 22 x 13.
*/
const MOUNT_BRACES = 8;
const MOUNT_SUPPORTS = 6;
const MOUNT_PANEL_COLS = 22;
const MOUNT_PANEL_ROWS = 13;

function arrayPlaneY(z: number): number {
  return ARRAY_BASE_Y - z * MOUNT_SLOPE;
}

function buildMountState(): InstanceTransform[] {
  const out: InstanceTransform[] = [];

  /* Stupovi — visina svakog slijedi nagib ravnine modula. */
  for (const z of RAIL_Z) {
    const top = arrayPlaneY(z) - RAIL_CLEARANCE;
    const height = top - GROUND_Y;

    for (const x of POST_X) {
      const t = emptyTransform();
      t.position.set(x, GROUND_Y + height / 2, z);
      t.scale.set(0.11, height / 0.05, 0.17);
      t.color.copy(STEEL_DARK);
      t.gloss = 0.45;
      t.metal = 0.82;
      out.push(t);
    }
  }

  /* Uzduzni nosaci na vrhu stupova. */
  for (const z of RAIL_Z) {
    const y = arrayPlaneY(z) - RAIL_CLEARANCE + 0.05;
    for (const offset of [-0.05, 0.05]) {
      const t = emptyTransform();
      t.position.set(0, y, z + offset * 2);
      t.scale.set(9.4, 2.2, 0.28);
      t.color.copy(STEEL);
      t.gloss = 0.55;
      t.metal = 0.85;
      out.push(t);
    }
  }

  /* Kose spone koje povezuju prednji i straznji red — prate nagib. */
  const braceRise = arrayPlaneY(RAIL_Z[0]) - arrayPlaneY(RAIL_Z[1]);
  const braceSpan = RAIL_Z[1] - RAIL_Z[0];
  const braceLength = Math.hypot(braceSpan, braceRise);
  const braceAngle = Math.atan2(braceRise, braceSpan);

  for (let i = 0; i < MOUNT_BRACES; i += 1) {
    const t = emptyTransform();
    t.position.set(
      -3.6 + i * 1.03,
      (arrayPlaneY(RAIL_Z[0]) + arrayPlaneY(RAIL_Z[1])) / 2 - RAIL_CLEARANCE - 0.1,
      0,
    );
    // Rotacija oko Y postavlja gredu po dubini, rotacija oko Z daje nagib.
    t.quaternion.copy(quatFromEuler(0, Math.PI / 2, braceAngle));
    t.scale.set(braceLength, 1.9, 0.2);
    t.color.copy(STEEL_WARM);
    t.gloss = 0.4;
    t.metal = 0.8;
    out.push(t);
  }

  /* Okomiti potpornji izmedu spona i tla. */
  for (let i = 0; i < MOUNT_SUPPORTS; i += 1) {
    const z = i % 2 === 0 ? -0.5 : 0.5;
    const top = arrayPlaneY(z) - RAIL_CLEARANCE - 0.2;
    const height = top - GROUND_Y;
    const t = emptyTransform();
    t.position.set(-3.1 + Math.floor(i / 2) * 2.05, GROUND_Y + height / 2, z);
    t.scale.set(0.08, height / 0.05, 0.12);
    t.color.copy(STEEL_DARK);
    t.gloss = 0.4;
    t.metal = 0.8;
    out.push(t);
  }

  /*
    Moduli popunjavaju punu pravokutnu mrezu.

    Broj potpornja gore odabran je tako da preostali broj instanci bude tocno
    MOUNT_PANEL_COLS * MOUNT_PANEL_ROWS. Ranije se koristio `Math.ceil`, pa je
    zadnji red ostajao nepotpun i u polju su nedostajala dva modula.
  */
  const panelCount = MOUNT_PANEL_COLS * MOUNT_PANEL_ROWS;
  const pCols = MOUNT_PANEL_COLS;

  for (let i = 0; i < panelCount; i += 1) {
    const col = i % pCols;
    const row = Math.floor(i / pCols);
    const z = (row - (MOUNT_PANEL_ROWS - 1) / 2) * 0.26;

    const t = emptyTransform();
    t.position.set((col - (pCols - 1) / 2) * 0.42, arrayPlaneY(z), z);
    t.quaternion.copy(quatFromEuler(MOUNT_TILT, 0, 0));
    t.scale.set(0.38, 1, 0.38);
    t.color.copy(col % 5 === 0 ? PANEL_MID : PANEL_DEEP);
    t.gloss = 0.88;
    t.metal = 0.18;
    t.panel = 1;
    out.push(t);
  }

  if (out.length !== INSTANCE_COUNT) {
    // Zastita: broj elemenata mora tocno odgovarati, inace se u polju vide rupe.
    throw new Error(
      `MT Mount raspored: ${out.length} instanci umjesto ${INSTANCE_COUNT}.`,
    );
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
          // Karoserija je poplocana modulima — i ona nosi teksturu celija.
          t.panel = 1;
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
