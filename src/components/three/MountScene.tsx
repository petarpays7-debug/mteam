'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { buildCarBodyGeometry, WHEEL_RADIUS, WHEEL_WIDTH, wheelPositions } from './carShape';
import {
  buildTileGeometry,
  createMountMaterials,
  extrudeProfile,
  FRAME_H,
  MODULE_D,
  MODULE_W,
  PITCH_X,
  PITCH_Z,
  RAIL_OFFSET,
  ribCrests,
  trapezoidProfile,
} from './mountParts';
import type { MountMaterials } from './mountParts';

/**
 * Prikaz nosivog sustava po tipu podloge.
 *
 * Svaki tip ima vlastitu podlogu i vlastiti nacin pricvrscenja: kuke ispod
 * crijepa, stezaljke na rebra lima, balastne trokute na ravnom krovu, zabijene
 * pilote na terenu, stupove i grede carporta te stupove ograde. Moduli i
 * montazni profili su zajednicki jer su u stvarnosti isti dio.
 *
 * Orijentacija: kosina pada prema +Z, dakle prema kameri. Blize je uvijek nizi
 * rub, dalje visi — isto kao kad se gleda s tla prema jugu.
 */

export type MountKind =
  | 'kosi-krov'
  | 'limeni-krov'
  | 'ravni-krov'
  | 'ground-mount'
  | 'carport'
  | 'solar-fence';

type Config = {
  /** Nagib modula u radijanima. */
  tilt: number;
  /** Nagib podloge — kod ravnog krova i terena je 0. */
  baseTilt: number;
  /** Visina sredista ravnine modula iznad ishodista. */
  lift: number;
  cols: number;
  rows: number;
  /** Moduli stoje okomito (solarna ograda). */
  vertical: boolean;
  camera: [number, number, number];
  target: [number, number, number];
};

const CONFIG: Record<MountKind, Config> = {
  'kosi-krov': {
    tilt: 0.4,
    baseTilt: 0.4,
    lift: 0.2,
    cols: 3,
    rows: 2,
    vertical: false,
    camera: [3.5, 2.55, 4.9],
    target: [0, 0.14, 0],
  },
  'limeni-krov': {
    tilt: 0.26,
    baseTilt: 0.26,
    lift: 0.21,
    cols: 4,
    rows: 2,
    vertical: false,
    camera: [3.8, 2.7, 5.2],
    target: [0, 0.1, 0],
  },
  'ravni-krov': {
    tilt: 0.34,
    baseTilt: 0,
    lift: 0.44,
    cols: 3,
    rows: 2,
    vertical: false,
    camera: [3.7, 2.7, 5.2],
    target: [0, 0.26, 0],
  },
  'ground-mount': {
    tilt: 0.5,
    baseTilt: 0,
    lift: 1.0,
    cols: 4,
    rows: 2,
    vertical: false,
    camera: [4.3, 3.0, 5.6],
    target: [0, 0.68, 0],
  },
  carport: {
    tilt: 0.14,
    baseTilt: 0,
    lift: 1.82,
    cols: 4,
    rows: 3,
    vertical: false,
    camera: [4.3, 2.95, 5.7],
    target: [0, 0.92, 0],
  },
  'solar-fence': {
    tilt: 0,
    baseTilt: 0,
    lift: 0.66,
    cols: 4,
    rows: 1,
    vertical: true,
    camera: [3.4, 1.9, 4.5],
    target: [0, 0.52, 0],
  },
};

/** Sirina i dubina polja modula za zadanu konfiguraciju. */
function arraySize(cfg: Config) {
  return { width: cfg.cols * PITCH_X, depth: cfg.rows * PITCH_Z };
}

/** Visina ravnine modula na zadanoj dubini — ravnina pada prema +Z. */
function planeY(cfg: Config, z: number) {
  return cfg.lift - z * Math.tan(cfg.tilt);
}

/** Ravnomjerno rasporedene tocke po sirini, uvucene od ruba. */
function spread(count: number, width: number, inset = 0.16): number[] {
  const usable = width - inset * 2;
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => -usable / 2 + (usable * i) / (count - 1));
}

/* -------------------------------------------------------------------------- */
/* Sitni gradivni elementi                                                    */
/* -------------------------------------------------------------------------- */

function Box({
  size,
  position,
  rotation,
  material,
  cast = true,
  receive = true,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  material: THREE.Material;
  cast?: boolean;
  receive?: boolean;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      material={material}
      castShadow={cast}
      receiveShadow={receive}
    >
      <boxGeometry args={size} />
    </mesh>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Greda izmedu dvije tocke.
 *
 * Kosnici i kosnicima nagib slijedi iz same geometrije, pa se nigdje ne
 * racunaju kutovi rukom — a time ni ne grijesi u predznaku.
 */
function Strut({
  a,
  b,
  thickness,
  material,
}: {
  a: [number, number, number];
  b: [number, number, number];
  thickness: number;
  material: THREE.Material;
}) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize());

  return (
    <mesh position={mid} quaternion={quaternion} material={material} castShadow receiveShadow>
      <boxGeometry args={[thickness, length, thickness]} />
    </mesh>
  );
}

/**
 * Jedan modul: aluminijski okvir i laminat uvucen unutar njega.
 *
 * Bez okvira je modul samo ploca — rub je ono po cemu se prepoznaje da je
 * rijec o uramljenom fotonaponskom modulu, a ne o obicnom staklu.
 */
function Module({
  position,
  m,
  bifacial = false,
}: {
  position: [number, number, number];
  m: MountMaterials;
  bifacial?: boolean;
}) {
  const inset = 0.035;
  return (
    <group position={position}>
      <Box size={[MODULE_W, FRAME_H, MODULE_D]} position={[0, 0, 0]} material={m.alu} />
      <Box
        size={[MODULE_W - inset * 2, FRAME_H * 0.6, MODULE_D - inset * 2]}
        position={[0, FRAME_H * 0.32, 0]}
        material={m.laminate}
        receive={false}
      />
      {/* Bifacijalni modul radi objema stranama, pa i donja strana nosi celije. */}
      {bifacial ? (
        <Box
          size={[MODULE_W - inset * 2, FRAME_H * 0.3, MODULE_D - inset * 2]}
          position={[0, -FRAME_H * 0.36, 0]}
          material={m.laminateBack}
          receive={false}
        />
      ) : null}
    </group>
  );
}

/** Polje modula s razmakom, centrirano oko ishodista grupe. */
function ModuleGrid({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const items: ReactNode[] = [];
  for (let r = 0; r < cfg.rows; r += 1) {
    for (let c = 0; c < cfg.cols; c += 1) {
      items.push(
        <Module
          key={`${r}-${c}`}
          m={m}
          bifacial={cfg.vertical}
          position={[(c - (cfg.cols - 1) / 2) * PITCH_X, 0, (r - (cfg.rows - 1) / 2) * PITCH_Z]}
        />,
      );
    }
  }
  return <>{items}</>;
}

/**
 * Montazni profili i stezaljke.
 *
 * Po redu modula idu dva profila, a na svakom spoju sjedi stezaljka — srednja
 * izmedu dva modula, krajnja na rubu polja.
 */
function RailSet({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const { width } = arraySize(cfg);
  const railLength = width + 0.24;

  const parts: ReactNode[] = [];

  for (let r = 0; r < cfg.rows; r += 1) {
    const rowZ = (r - (cfg.rows - 1) / 2) * PITCH_Z;
    for (const offset of [-RAIL_OFFSET, RAIL_OFFSET]) {
      const z = rowZ + offset;
      parts.push(
        <group key={`rail-${r}-${offset}`}>
          <Box
            size={[railLength, 0.072, 0.046]}
            position={[0, -FRAME_H / 2 - 0.038, z]}
            material={m.alu}
          />
          {/* Gornja usadna traka profila — po njoj kliznu stezaljke. */}
          <Box
            size={[railLength, 0.016, 0.068]}
            position={[0, -FRAME_H / 2 - 0.004, z]}
            material={m.aluDark}
          />
        </group>,
      );

      for (let c = 0; c <= cfg.cols; c += 1) {
        const edge = c === 0 || c === cfg.cols;
        parts.push(
          <Box
            key={`clamp-${r}-${offset}-${c}`}
            size={[edge ? 0.05 : 0.075, 0.072, 0.05]}
            position={[(c - cfg.cols / 2) * PITCH_X, 0.002, z]}
            material={m.aluDark}
          />,
        );
      }
    }
  }

  return <>{parts}</>;
}

/* -------------------------------------------------------------------------- */
/* Podloge                                                                    */
/* -------------------------------------------------------------------------- */

const ROOF_W = 4.4;
const ROOF_D = 2.64;

/** Kosi krov: crijep, streha s olukom i krovne kuke ispod pokrova. */
function PitchedRoof({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const tileGeometry = useMemo(() => buildTileGeometry(0.305, 0.44, 0.05), []);

  const tiles = useMemo(() => {
    const cols = 15;
    const rows = 8;
    const pitchX = 0.295;
    const pitchZ = 0.33;
    const mesh = new THREE.InstancedMesh(tileGeometry, m.tile, cols * rows);
    const matrix = new THREE.Matrix4();
    // Donji kraj crijepa lezi preko gornjeg kraja crijepa ispod njega.
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.055, 0, 0));
    const scale = new THREE.Vector3(1, 1, 1);
    const position = new THREE.Vector3();

    let i = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        position.set((c - (cols - 1) / 2) * pitchX, 0.034, (r - (rows - 1) / 2) * pitchZ);
        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(i, matrix);
        i += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, [tileGeometry, m.tile]);

  const hookX = spread(4, arraySize(cfg).width);
  const eaveZ = ROOF_D / 2;

  return (
    <>
      <Box size={[ROOF_W, 0.11, ROOF_D]} position={[0, -0.028, 0]} material={m.deck} />
      <primitive object={tiles} />

      {/* Streha: zavrsna daska i oluk na donjem rubu kosine. */}
      <Box size={[ROOF_W + 0.08, 0.12, 0.055]} position={[0, -0.02, eaveZ + 0.03]} material={m.deck} />
      <mesh
        position={[0, -0.085, eaveZ + 0.095]}
        rotation={[0, Math.PI, Math.PI / 2]}
        material={m.aluDark}
        castShadow
      >
        <cylinderGeometry args={[0.052, 0.052, ROOF_W + 0.08, 14, 1, true, 0, Math.PI]} />
      </mesh>

      {/* Sljeme na vrhu kosine. */}
      <mesh
        position={[0, 0.07, -ROOF_D / 2 + 0.02]}
        rotation={[0, 0, Math.PI / 2]}
        material={m.tile}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, ROOF_W, 12, 1, true, 0, Math.PI]} />
      </mesh>

      {/* Krovne kuke: stopa lezi na letvi ispod crijepa, krak nosi profil. */}
      {hookX.flatMap((x) =>
        [-RAIL_OFFSET, RAIL_OFFSET].flatMap((offset) =>
          Array.from({ length: cfg.rows }, (_, r) => {
            const z = (r - (cfg.rows - 1) / 2) * PITCH_Z + offset;
            return (
              <group key={`${x}-${offset}-${r}`}>
                <Box size={[0.05, 0.022, 0.21]} position={[x, 0.042, z + 0.08]} material={m.steel} />
                <Box
                  size={[0.048, cfg.lift, 0.03]}
                  position={[x, cfg.lift / 2, z]}
                  material={m.steel}
                />
              </group>
            );
          }),
        ),
      )}
    </>
  );
}

/** Limeni krov: trapezni lim i stezaljke koje obuhvacaju rebro. */
function MetalRoof({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const ribs = 12;
  const ribHeight = 0.075;

  const sheet = useMemo(
    () => extrudeProfile(trapezoidProfile(ROOF_W, ribs, ribHeight), ROOF_D, 0.016),
    [],
  );
  const crests = useMemo(() => ribCrests(ROOF_W, ribs), []);

  /** Stezaljka ide na rebro najblize svakom osloncu. */
  const supportX = spread(4, arraySize(cfg).width).map((x) =>
    crests.reduce((best, c) => (Math.abs(c - x) < Math.abs(best - x) ? c : best), crests[0]),
  );

  return (
    <>
      <Box size={[ROOF_W, 0.1, ROOF_D]} position={[0, -0.055, 0]} material={m.deck} />
      <mesh geometry={sheet} material={m.sheet} castShadow receiveShadow />

      {/* Opsav na strehi i sljemenjak. */}
      <Box
        size={[ROOF_W + 0.05, 0.11, 0.05]}
        position={[0, 0.015, ROOF_D / 2 + 0.02]}
        material={m.sheet}
      />
      <Box
        size={[ROOF_W + 0.05, 0.05, 0.14]}
        position={[0, ribHeight + 0.01, -ROOF_D / 2 + 0.05]}
        material={m.sheet}
      />

      {supportX.flatMap((x, i) =>
        [-RAIL_OFFSET, RAIL_OFFSET].flatMap((offset) =>
          Array.from({ length: cfg.rows }, (_, r) => {
            const z = (r - (cfg.rows - 1) / 2) * PITCH_Z + offset;
            return (
              <group key={`${i}-${offset}-${r}`}>
                {/* Stezaljka obuhvaca rebro — lim se ne busi. */}
                <Box
                  size={[0.115, 0.065, 0.115]}
                  position={[x, ribHeight + 0.005, z]}
                  material={m.aluDark}
                />
                <Box
                  size={[0.05, cfg.lift - ribHeight, 0.05]}
                  position={[x, ribHeight + (cfg.lift - ribHeight) / 2, z]}
                  material={m.steel}
                />
              </group>
            );
          }),
        ),
      )}
    </>
  );
}

/** Ravni krov: hidroizolacija, atika i balastni trokuti bez probijanja krova. */
function FlatRoof({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const { width, depth } = arraySize(cfg);
  const lowZ = depth / 2 + 0.1;
  const highZ = -depth / 2 - 0.1;
  const lowY = planeY(cfg, lowZ) - 0.1;
  const highY = planeY(cfg, highZ) - 0.1;
  const baseY = 0.04;

  const roofW = 4.6;
  const roofD = 3.1;
  const frameX = spread(4, width);

  return (
    <>
      <Box size={[roofW, 0.14, roofD]} position={[0, -0.07, 0]} material={m.membrane} />
      {/* Preklopi hidroizolacijskih traka. */}
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <Box
          key={x}
          size={[0.03, 0.016, roofD]}
          position={[x, 0.005, 0]}
          material={m.deck}
          cast={false}
        />
      ))}

      {/* Atika po obodu krova. */}
      {[-1, 1].map((s) => (
        <Box
          key={`z${s}`}
          size={[roofW + 0.18, 0.22, 0.09]}
          position={[0, 0.04, (s * roofD) / 2 + (s * 0.045)]}
          material={m.concrete}
        />
      ))}
      {[-1, 1].map((s) => (
        <Box
          key={`x${s}`}
          size={[0.09, 0.22, roofD + 0.18]}
          position={[(s * roofW) / 2 + s * 0.045, 0.04, 0]}
          material={m.concrete}
        />
      ))}

      {frameX.map((x) => (
        <group key={x}>
          {/* Donja greda nosi balast, kosnik nosi montazne profile. */}
          <Box
            size={[0.055, 0.05, lowZ - highZ + 0.18]}
            position={[x, baseY, (lowZ + highZ) / 2]}
            material={m.alu}
          />
          <Box
            size={[0.048, Math.max(lowY - baseY, 0.02), 0.048]}
            position={[x, (lowY + baseY) / 2, lowZ]}
            material={m.alu}
          />
          <Box
            size={[0.048, highY - baseY, 0.048]}
            position={[x, (highY + baseY) / 2, highZ]}
            material={m.alu}
          />
          <Strut
            a={[x, lowY, lowZ]}
            b={[x, highY, highZ]}
            thickness={0.045}
            material={m.alu}
          />
          {/* Betonski balast drzi sustav na mjestu umjesto sidrenja. */}
          {[-0.3, 0.3].map((dz) => (
            <Box
              key={dz}
              size={[0.3, 0.075, 0.26]}
              position={[x, baseY + 0.062, (lowZ + highZ) / 2 + dz]}
              material={m.concrete}
            />
          ))}
        </group>
      ))}
    </>
  );
}

/** Ground mount: teren, zabijeni piloti, kosnice i uzduzne grede. */
function GroundField({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const { width, depth } = arraySize(cfg);
  const lowZ = depth / 2 - 0.1;
  const highZ = -depth / 2 + 0.1;
  const lowY = planeY(cfg, lowZ) - 0.09;
  const highY = planeY(cfg, highZ) - 0.09;

  const pileX = spread(4, width);

  return (
    <>
      <Box size={[9.2, 0.34, 6.4]} position={[0, -0.17, 0]} material={m.soil} cast={false} />

      {pileX.map((x) => (
        <group key={x}>
          {/* Piloti se zabijaju u teren — bez betonskog temelja. */}
          <Box
            size={[0.1, lowY + 0.34, 0.1]}
            position={[x, (lowY - 0.34) / 2, lowZ]}
            material={m.steel}
          />
          <Box
            size={[0.12, highY + 0.34, 0.12]}
            position={[x, (highY - 0.34) / 2, highZ]}
            material={m.steel}
          />
          {/* Kosnica prenosi opterecenje vjetra sa zadnjeg pilota na prednji. */}
          <Strut
            a={[x + 0.08, highY - 0.12, highZ]}
            b={[x + 0.08, 0.06, lowZ]}
            thickness={0.05}
            material={m.steel}
          />
        </group>
      ))}

      {/* Uzduzne grede na vrhu pilota — na njih dolaze montazni profili. */}
      <Box size={[width + 0.44, 0.07, 0.07]} position={[0, lowY, lowZ]} material={m.steel} />
      <Box size={[width + 0.44, 0.07, 0.07]} position={[0, highY, highZ]} material={m.steel} />
    </>
  );
}

/** Carport: asfalt, stupovi, grede, vozilo ispod i punionica uz stup. */
function CarportBase({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const { width, depth } = arraySize(cfg);
  const lowZ = depth / 2 - 0.3;
  const highZ = -depth / 2 + 0.3;
  const lowY = planeY(cfg, lowZ) - 0.17;
  const highY = planeY(cfg, highZ) - 0.17;

  const postX = spread(3, width, 0.34);
  const carGeometry = useMemo(() => buildCarBodyGeometry(52, 26), []);

  return (
    <>
      <Box size={[9.6, 0.22, 6.6]} position={[0, -0.11, 0]} material={m.asphalt} cast={false} />
      {[-1.75, 0, 1.75].map((x) => (
        <Box
          key={x}
          size={[0.055, 0.012, 2.3]}
          position={[x, 0.004, 0.15]}
          material={m.paint}
          cast={false}
        />
      ))}

      {postX.map((x) => (
        <group key={x}>
          <Box size={[0.14, lowY, 0.14]} position={[x, lowY / 2, lowZ]} material={m.steel} />
          <Box size={[0.14, highY, 0.14]} position={[x, highY / 2, highZ]} material={m.steel} />
          {/* Uzduzna greda po dubini nosi poprecne podroznice. */}
          <Strut
            a={[x, lowY + 0.05, lowZ]}
            b={[x, highY + 0.05, highZ]}
            thickness={0.1}
            material={m.steel}
          />
          {/* Kosnik u uglu — carport bez njega nema bocnu krutost. */}
          <Strut
            a={[x, lowY - 0.42, lowZ]}
            b={[x, lowY - 0.02, lowZ - 0.42]}
            thickness={0.055}
            material={m.steel}
          />
        </group>
      ))}

      {/* Podroznice po sirini, ispod svakog reda modula. */}
      {Array.from({ length: cfg.rows }, (_, r) => {
        const z = (r - (cfg.rows - 1) / 2) * PITCH_Z;
        return (
          <Box
            key={r}
            size={[width + 0.34, 0.075, 0.075]}
            position={[0, planeY(cfg, z) - 0.13, z]}
            material={m.steel}
          />
        );
      })}

      {/* Punionica uz stup — carport i EV punjenje idu zajedno. */}
      <group position={[postX[postX.length - 1] + 0.46, 0, lowZ + 0.12]}>
        <Box size={[0.15, 1.0, 0.13]} position={[0, 0.5, 0]} material={m.aluDark} />
        <Box size={[0.22, 0.3, 0.16]} position={[0, 1.12, 0.01]} material={m.steel} />
        <Box size={[0.1, 0.09, 0.02]} position={[0, 1.15, 0.09]} material={m.laminate} cast={false} />
      </group>

      {/* Vozilo pod nadstresnicom — mjerilo koje odmah objasni namjenu. */}
      <group position={[0.05, 0, 0.12]} scale={0.5}>
        <mesh geometry={carGeometry} material={[m.carBody, m.carGlass]} castShadow receiveShadow />
        {wheelPositions().map((wheel) => (
          <mesh
            key={`${wheel.x}-${wheel.z}`}
            position={[wheel.x, WHEEL_RADIUS, wheel.z]}
            rotation={[Math.PI / 2, 0, 0]}
            material={m.tyre}
            castShadow
          >
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 18]} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** Solarna ograda: teren, stupovi i betonska podnozja. */
function FenceBase({ cfg, m }: { cfg: Config; m: MountMaterials }) {
  const postHeight = cfg.lift + MODULE_D / 2 + 0.16;
  const postZ = -0.075;

  return (
    <>
      <Box size={[9.2, 0.3, 5.6]} position={[0, -0.15, 0]} material={m.soil} cast={false} />

      {Array.from({ length: cfg.cols + 1 }, (_, c) => {
        const x = (c - cfg.cols / 2) * PITCH_X;
        return (
          <group key={c}>
            <Box size={[0.24, 0.1, 0.24]} position={[x, 0.035, postZ]} material={m.concrete} />
            <Box
              size={[0.085, postHeight, 0.085]}
              position={[x, postHeight / 2, postZ]}
              material={m.steel}
            />
            <Box
              size={[0.125, 0.028, 0.125]}
              position={[x, postHeight + 0.014, postZ]}
              material={m.aluDark}
            />
          </group>
        );
      })}
    </>
  );
}

function Substrate({ kind, cfg, m }: { kind: MountKind; cfg: Config; m: MountMaterials }) {
  switch (kind) {
    case 'kosi-krov':
      return <PitchedRoof cfg={cfg} m={m} />;
    case 'limeni-krov':
      return <MetalRoof cfg={cfg} m={m} />;
    case 'ravni-krov':
      return <FlatRoof cfg={cfg} m={m} />;
    case 'ground-mount':
      return <GroundField cfg={cfg} m={m} />;
    case 'carport':
      return <CarportBase cfg={cfg} m={m} />;
    case 'solar-fence':
      return <FenceBase cfg={cfg} m={m} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Scena                                                                      */
/* -------------------------------------------------------------------------- */

function Rig({
  kind,
  reduced,
  simplified,
}: {
  kind: MountKind;
  reduced: boolean;
  simplified: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const arrayRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);

  /** 0 = slozeno, 1 = razmaknuto. Kratko skoci na promjenu kategorije. */
  const explode = useRef(0);
  const lastKind = useRef<MountKind>(kind);
  const sinceChange = useRef(99);

  const cfg = CONFIG[kind];
  const materials = useMemo(() => createMountMaterials(simplified), [simplified]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (lastKind.current !== kind) {
      lastKind.current = kind;
      sinceChange.current = 0;
    }
    sinceChange.current += dt;

    const target = sinceChange.current < 0.8 ? 1 : 0;
    explode.current = THREE.MathUtils.damp(explode.current, reduced ? 0 : target, 4.5, dt);

    const array = arrayRef.current;
    if (array) {
      array.rotation.x = THREE.MathUtils.damp(
        array.rotation.x,
        cfg.vertical ? Math.PI / 2 : cfg.tilt,
        4,
        dt,
      );
      array.position.y = THREE.MathUtils.damp(
        array.position.y,
        cfg.lift + explode.current * 0.5,
        4,
        dt,
      );
    }

    const base = baseRef.current;
    if (base) {
      base.rotation.x = THREE.MathUtils.damp(base.rotation.x, cfg.baseTilt, 4, dt);
    }

    const group = groupRef.current;
    if (!group) return;
    if (reduced) {
      group.rotation.y = -0.46;
      return;
    }
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      -0.46 + state.pointer.x * 0.26,
      2.4,
      dt,
    );
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -state.pointer.y * 0.06, 2.4, dt);
  });

  return (
    <group ref={groupRef}>
      <group ref={baseRef}>
        <Substrate kind={kind} cfg={cfg} m={materials} />
      </group>

      {/* Profili i moduli dijele nagib — u stvarnosti su jedan sklop. */}
      <group ref={arrayRef} position={[0, cfg.lift, 0]}>
        <RailSet cfg={cfg} m={materials} />
        <ModuleGrid cfg={cfg} m={materials} />
      </group>
    </group>
  );
}

/** Kadar se mijenja s tipom konstrukcije — carport treba vise visine od krova. */
function CameraRig({ kind, reduced }: { kind: MountKind; reduced: boolean }) {
  const look = useRef(new THREE.Vector3(...CONFIG[kind].target));

  useFrame((state, delta) => {
    const cfg = CONFIG[kind];
    const dt = Math.min(delta, 0.05);
    const lambda = reduced ? 30 : 3.2;
    const camera = state.camera;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, cfg.camera[0], lambda, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cfg.camera[1], lambda, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cfg.camera[2], lambda, dt);

    look.current.x = THREE.MathUtils.damp(look.current.x, cfg.target[0], lambda, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, cfg.target[1], lambda, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, cfg.target[2], lambda, dt);

    camera.lookAt(look.current);
  });

  return null;
}

export default function MountScene({
  kind,
  reduced,
  active,
  simplified,
  onContextLost,
}: {
  kind: MountKind;
  reduced: boolean;
  active: boolean;
  simplified: boolean;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={simplified ? [1, 1.4] : [1, 1.75]}
      /*
        `percentage` je PCFShadowMap. Zadani `true` u R3F-u trazi
        PCFSoftShadowMap, koji je u three 0.186 uklonjen — pa renderer pri
        svakoj promjeni ispisuje upozorenje i svejedno se vrati na PCF.
      */
      shadows={simplified ? false : 'percentage'}
      gl={{ antialias: !simplified, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: CONFIG[kind].camera, fov: 34 }}
      onCreated={({ gl }) => {
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#A9C6DA', '#0A1A22', 0.75]} />
      <directionalLight
        position={[3.6, 6.2, 5.4]}
        intensity={2.6}
        color="#FFEBC4"
        castShadow={!simplified}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0009}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <directionalLight position={[-5, 2.4, -3.2]} intensity={0.7} color="#7FA7BE" />
      <directionalLight position={[1.5, 1.4, 5.5]} intensity={0.55} color="#CFE2EE" />

      <Rig kind={kind} reduced={reduced} simplified={simplified} />

      <CameraRig kind={kind} reduced={reduced} />

      <Environment resolution={96} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#FFD65C"
          position={[4, 5, 3]}
          scale={[7, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#93AEBF"
          position={[-5, 2, -3]}
          scale={[6, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#E7EEF2"
          position={[0, 6, -4]}
          scale={[8, 3, 1]}
        />
      </Environment>
    </Canvas>
  );
}
