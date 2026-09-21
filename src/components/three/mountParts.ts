import * as THREE from 'three';
import { getPanelColorTexture } from './panelTexture';

/**
 * Geometrije i materijali za prikaz konstrukcija na /mt-mount.
 *
 * Sve je proceduralno — nema vanjskih modela ni tekstura. Mjere su otprilike
 * u metrima, pa se odnosi izmedu modula, nosaca i podloge drze stvarnih
 * proporcija: modul je oko 1,08 x 0,68, crijep oko 0,30 sirok, stup 0,14.
 */

/* -------------------------------------------------------------------------- */
/* Osnovne mjere                                                              */
/* -------------------------------------------------------------------------- */

/** Sirina modula (os X). */
export const MODULE_W = 1.08;
/** Dubina modula (os Z — uz nagib to je duljina niz kosinu). */
export const MODULE_D = 0.68;
/** Razmak izmedu susjednih modula. */
export const MODULE_GAP = 0.035;
/** Visina aluminijskog okvira. */
export const FRAME_H = 0.055;

export const PITCH_X = MODULE_W + MODULE_GAP;
export const PITCH_Z = MODULE_D + MODULE_GAP;

/** Nosaci idu ispod modula, na oko cetvrtini dubine od svakog ruba. */
export const RAIL_OFFSET = MODULE_D * 0.27;

/* -------------------------------------------------------------------------- */
/* Izvlacenje 2D profila                                                      */
/* -------------------------------------------------------------------------- */

/** Tocke presjeka u ravnini XY, redom slijeva nadesno. */
export type Profile = Array<[number, number]>;

/**
 * Izvlaci presjek duz osi Z i daje mu debljinu prema dolje.
 *
 * Ponovljena tocka u profilu lomi normalu, pa se istim postupkom dobiva i
 * mekana obla povrsina (crijep) i ostri prijelom (trapezni lim).
 */
export function extrudeProfile(
  profile: Profile,
  depth: number,
  thickness: number,
): THREE.BufferGeometry {
  const z0 = -depth / 2;
  const z1 = depth / 2;

  const positions: number[] = [];
  const indices: number[] = [];

  for (const [x, y] of profile) {
    // Redoslijed po tocki: gore/z0, gore/z1, dolje/z0, dolje/z1.
    positions.push(x, y, z0, x, y, z1, x, y - thickness, z0, x, y - thickness, z1);
  }

  const last = profile.length - 1;

  for (let i = 0; i < last; i += 1) {
    const a = i * 4;
    const b = (i + 1) * 4;

    // Gornja ploha.
    indices.push(a + 0, a + 1, b + 1, a + 0, b + 1, b + 0);
    // Donja ploha (obrnuto namotavanje).
    indices.push(a + 2, b + 2, b + 3, a + 2, b + 3, a + 3);
    // Celo na z0 i z1.
    indices.push(a + 0, b + 0, b + 2, a + 0, b + 2, a + 2);
    indices.push(a + 1, a + 3, b + 3, a + 1, b + 3, b + 1);
  }

  // Zatvaranje lijevog i desnog kraja.
  const r = last * 4;
  indices.push(0, 2, 3, 0, 3, 1);
  indices.push(r + 0, r + 1, r + 3, r + 0, r + 3, r + 2);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/* -------------------------------------------------------------------------- */
/* Trapezni lim                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Presjek trapeznog lima: ravno dno, kosina, ravan vrh, kosina.
 *
 * Uglovi su namjerno udvostruceni — bez toga bi `computeVertexNormals`
 * zaoblio rebra i lim bi izgledao kao valovita plastika.
 */
export function trapezoidProfile(width: number, ribs: number, ribHeight: number): Profile {
  const pitch = width / ribs;
  const bottom = pitch * 0.4;
  const slope = pitch * 0.13;
  const top = pitch * 0.34;

  const points: Profile = [];
  const push = (x: number, y: number, hard = true) => {
    points.push([x - width / 2, y]);
    if (hard) points.push([x - width / 2, y]);
  };

  points.push([-width / 2, 0]);
  for (let k = 0; k < ribs; k += 1) {
    const x = k * pitch;
    push(x + bottom, 0);
    push(x + bottom + slope, ribHeight);
    push(x + bottom + slope + top, ribHeight);
    push(x + pitch, 0);
  }
  points.push([width / 2, 0]);

  return points;
}

/** Sredine rebara — tu sjedaju stezaljke za lim. */
export function ribCrests(width: number, ribs: number): number[] {
  const pitch = width / ribs;
  const bottom = pitch * 0.4;
  const slope = pitch * 0.13;
  const top = pitch * 0.34;
  const out: number[] = [];
  for (let k = 0; k < ribs; k += 1) {
    out.push(k * pitch + bottom + slope + top / 2 - width / 2);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Crijep                                                                     */
/* -------------------------------------------------------------------------- */

/** Blago izvijeni crijep — luk po sirini, s debljinom. */
export function buildTileGeometry(width: number, length: number, rise: number) {
  const profile: Profile = [];
  const steps = 9;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    profile.push([(u - 0.5) * width, Math.sin(u * Math.PI) * rise]);
  }
  return extrudeProfile(profile, length, 0.022);
}

/* -------------------------------------------------------------------------- */
/* Materijali                                                                 */
/* -------------------------------------------------------------------------- */

export type MountMaterials = ReturnType<typeof createMountMaterials>;

export function createMountMaterials(simplified: boolean) {
  /** Laminat modula: boja iz materijala, mreza celija iz teksture. */
  const laminate = new THREE.MeshPhysicalMaterial({
    color: '#1d4463',
    map: getPanelColorTexture(),
    metalness: 0.32,
    roughness: 0.16,
    envMapIntensity: 1.9,
    ...(simplified ? {} : { clearcoat: 1, clearcoatRoughness: 0.05 }),
  });

  /** Straznje staklo bifacijalnog modula — svjetlije, bez odsjaja. */
  const laminateBack = new THREE.MeshStandardMaterial({
    color: '#2b4c63',
    map: getPanelColorTexture(),
    metalness: 0.2,
    roughness: 0.42,
  });

  return {
    laminate,
    laminateBack,
    /** Okvir modula i montazni profili. */
    alu: new THREE.MeshStandardMaterial({
      color: '#c8d5dd',
      metalness: 0.88,
      roughness: 0.26,
      envMapIntensity: 1.4,
    }),
    /** Stezaljke i sitni okovi. */
    aluDark: new THREE.MeshStandardMaterial({
      color: '#8ba1ae',
      metalness: 0.84,
      roughness: 0.38,
    }),
    /** Pocincani celik — stupovi, piloti, grede. */
    steel: new THREE.MeshStandardMaterial({
      color: '#768b98',
      metalness: 0.82,
      roughness: 0.5,
    }),
    /** Crijep. */
    tile: new THREE.MeshStandardMaterial({
      color: '#57372d',
      metalness: 0.02,
      roughness: 0.92,
      envMapIntensity: 0.55,
      side: THREE.DoubleSide,
    }),
    /** Trapezni i falcani lim. */
    sheet: new THREE.MeshStandardMaterial({
      color: '#8a9ba6',
      metalness: 0.7,
      roughness: 0.38,
      envMapIntensity: 0.8,
      side: THREE.DoubleSide,
    }),
    /** Krovna ploha ispod pokrova i hidroizolacija ravnog krova. */
    deck: new THREE.MeshStandardMaterial({ color: '#0d1f2b', metalness: 0.04, roughness: 0.96 }),
    membrane: new THREE.MeshStandardMaterial({ color: '#17272f', metalness: 0.05, roughness: 0.9 }),
    /** Betonski balast i podnozja. */
    concrete: new THREE.MeshStandardMaterial({ color: '#69737b', metalness: 0.02, roughness: 0.92 }),
    /** Teren kod ground mount sustava i ograde. */
    soil: new THREE.MeshStandardMaterial({ color: '#1a2417', metalness: 0, roughness: 1, envMapIntensity: 0.4 }),
    /** Asfalt ispod carporta. */
    asphalt: new THREE.MeshStandardMaterial({ color: '#131a1f', metalness: 0.03, roughness: 0.94 }),
    /** Oznake parkirnog mjesta. */
    paint: new THREE.MeshStandardMaterial({ color: '#c9d3d6', metalness: 0, roughness: 0.75 }),
    /** Karoserija vozila pod carportom. */
    carBody: new THREE.MeshPhysicalMaterial({
      color: '#5b6772',
      metalness: 0.7,
      roughness: 0.3,
      ...(simplified ? {} : { clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    }),
    carGlass: new THREE.MeshStandardMaterial({
      color: '#0a161d',
      metalness: 0.5,
      roughness: 0.12,
    }),
    tyre: new THREE.MeshStandardMaterial({ color: '#10151a', metalness: 0.02, roughness: 0.9 }),
  };
}
