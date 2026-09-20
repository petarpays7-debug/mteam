'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interaktivni "exploded view" nosivog sustava.
 *
 * Sve je proceduralno: podloga, nosaci, stezaljke i moduli.
 * Promjenom kategorije mijenjaju se nagib, tip podloge i razmak elemenata.
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
  /** Nagib podloge (kosi krov). */
  baseTilt: number;
  baseKind: 'roof' | 'flat' | 'ground' | 'posts' | 'none';
  /** Visina na kojoj stoje moduli. */
  lift: number;
  /** Moduli okomito (solarna ograda). */
  vertical: boolean;
};

const CONFIG: Record<MountKind, Config> = {
  'kosi-krov': { tilt: 0.42, baseTilt: 0.42, baseKind: 'roof', lift: 0.16, vertical: false },
  'limeni-krov': { tilt: 0.28, baseTilt: 0.28, baseKind: 'roof', lift: 0.12, vertical: false },
  'ravni-krov': { tilt: 0.36, baseTilt: 0, baseKind: 'flat', lift: 0.34, vertical: false },
  'ground-mount': { tilt: 0.52, baseTilt: 0, baseKind: 'ground', lift: 0.95, vertical: false },
  carport: { tilt: 0.14, baseTilt: 0.14, baseKind: 'posts', lift: 1.5, vertical: false },
  'solar-fence': { tilt: 0, baseTilt: 0, baseKind: 'none', lift: 1.05, vertical: true },
};

const PANEL_COLS = 3;
const PANEL_ROWS = 2;

function Rig({
  kind,
  reduced,
}: {
  kind: MountKind;
  reduced: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const arrayRef = useRef<THREE.Group>(null);
  const railRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);

  /** 0 = sastavljeno, 1 = rastavljeno. Kratko skoci na promjenu kategorije. */
  const explode = useRef(0);
  const lastKind = useRef<MountKind>(kind);
  const sinceChange = useRef(99);

  const cfg = CONFIG[kind];

  const materials = useMemo(
    () => ({
      alu: new THREE.MeshStandardMaterial({ color: '#c3d2db', metalness: 0.85, roughness: 0.28 }),
      aluDark: new THREE.MeshStandardMaterial({
        color: '#7d95a5',
        metalness: 0.8,
        roughness: 0.38,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#27638a',
        metalness: 0.3,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.8,
      }),
      base: new THREE.MeshStandardMaterial({ color: '#071822', metalness: 0.05, roughness: 1 }),
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (lastKind.current !== kind) {
      lastKind.current = kind;
      sinceChange.current = 0;
    }
    sinceChange.current += dt;

    // Elementi se kratko razmaknu pa se ponovno slozе - citljiv prikaz sastava.
    const target = sinceChange.current < 0.85 ? 1 : 0;
    explode.current = THREE.MathUtils.damp(explode.current, target, 4.5, dt);
    const e = explode.current;

    if (arrayRef.current) {
      arrayRef.current.rotation.x = THREE.MathUtils.damp(
        arrayRef.current.rotation.x,
        cfg.vertical ? -Math.PI / 2 : -cfg.tilt,
        4,
        dt,
      );
      arrayRef.current.position.y = THREE.MathUtils.damp(
        arrayRef.current.position.y,
        cfg.lift + 0.22 + e * 0.75,
        4,
        dt,
      );
    }

    if (railRef.current) {
      railRef.current.rotation.x = THREE.MathUtils.damp(
        railRef.current.rotation.x,
        cfg.vertical ? -Math.PI / 2 : -cfg.tilt,
        4,
        dt,
      );
      railRef.current.position.y = THREE.MathUtils.damp(
        railRef.current.position.y,
        cfg.lift + e * 0.3,
        4,
        dt,
      );
    }

    if (baseRef.current) {
      baseRef.current.rotation.x = THREE.MathUtils.damp(
        baseRef.current.rotation.x,
        -cfg.baseTilt,
        4,
        dt,
      );
    }

    const group = groupRef.current;
    if (group && !reduced) {
      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        -0.5 + state.pointer.x * 0.28,
        2.4,
        dt,
      );
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -state.pointer.y * 0.08, 2.4, dt);
    } else if (group) {
      group.rotation.y = -0.5;
    }
  });

  const panels = [];
  for (let r = 0; r < PANEL_ROWS; r += 1) {
    for (let c = 0; c < PANEL_COLS; c += 1) {
      panels.push(
        <mesh
          key={`${r}-${c}`}
          position={[(c - (PANEL_COLS - 1) / 2) * 1.18, 0, (r - (PANEL_ROWS - 1) / 2) * 0.78]}
          material={materials.glass}
        >
          <boxGeometry args={[1.06, 0.06, 0.66]} />
        </mesh>,
      );
    }
  }

  return (
    <group ref={groupRef}>
      {/* Podloga */}
      <group ref={baseRef}>
        {cfg.baseKind === 'roof' ? (
          <mesh position={[0, -0.12, 0]} material={materials.base}>
            <boxGeometry args={[4.4, 0.12, 2.4]} />
          </mesh>
        ) : null}
        {cfg.baseKind === 'flat' ? (
          <mesh position={[0, -0.12, 0]} material={materials.base}>
            <boxGeometry args={[4.4, 0.12, 2.6]} />
          </mesh>
        ) : null}
        {cfg.baseKind === 'ground' ? (
          <mesh position={[0, -0.14, 0]} material={materials.base}>
            <boxGeometry args={[5.0, 0.1, 3.0]} />
          </mesh>
        ) : null}
      </group>

      {/* Stupovi za ground mount, carport i ogradu */}
      {cfg.baseKind === 'ground' || cfg.baseKind === 'posts' || cfg.vertical
        ? [-1.6, 0, 1.6].map((x) => (
            <mesh key={x} position={[x, cfg.lift / 2 - 0.1, 0]} material={materials.aluDark}>
              <boxGeometry args={[0.12, cfg.lift + 0.2, 0.12]} />
            </mesh>
          ))
        : null}

      {/* Nosaci i stezaljke */}
      <group ref={railRef}>
        {[-0.34, 0.34].map((z) => (
          <mesh key={z} position={[0, 0, z]} material={materials.alu}>
            <boxGeometry args={[3.9, 0.1, 0.12]} />
          </mesh>
        ))}
        {[-1.68, -0.56, 0.56, 1.68].map((x) =>
          [-0.34, 0.34].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.11, z]} material={materials.aluDark}>
              <boxGeometry args={[0.14, 0.12, 0.2]} />
            </mesh>
          )),
        )}
      </group>

      {/* Moduli */}
      <group ref={arrayRef}>{panels}</group>
    </group>
  );
}

/** Drzi kadar na sredini sustava bez obzira na tip konstrukcije. */
function CameraLook() {
  useFrame((state) => state.camera.lookAt(0, 0.15, 0));
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
      gl={{ antialias: !simplified, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [3.25, 2.05, 4.2], fov: 36 }}
      onCreated={({ gl }) => {
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 6, 6]} intensity={3.4} color="#FFE7AE" />
      <pointLight position={[-5, 2.5, 3]} intensity={38} color="#5F8499" distance={20} />

      <group position={[0, -0.45, 0]}>
        <Rig kind={kind} reduced={reduced} />
      </group>

      <CameraLook />

      <Environment resolution={96} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFD65C" position={[4, 5, 2]} scale={[7, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#93AEBF" position={[-5, 2, -3]} scale={[6, 5, 1]} />
      </Environment>
    </Canvas>
  );
}
