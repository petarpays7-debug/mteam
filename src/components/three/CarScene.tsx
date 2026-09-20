'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Apstraktna, ekstrudirana silueta vozila.
 *
 * Namjerno ne prikazuje konkretan model niti marku - sluzi kao materijalni
 * dojam (tamni metal, crveni rub) uz M-CARS sadrzaj. Bez automatske rotacije:
 * pokret ovisi iskljucivo o pokazivacu, i to prigusen.
 */

/**
 * Bocni profil. Prag izmedju osovina namjerno je visi od branika kako bi
 * kotaci ostali vidljivi ispod karoserije.
 */
const PROFILE: Array<[number, number]> = [
  [-3.12, 0.58],
  [-3.24, 0.98],
  [-2.86, 1.18],
  [-1.78, 1.32],
  [-1.14, 1.76],
  [0.14, 1.98],
  [1.26, 1.9],
  [2.26, 1.38],
  [3.0, 1.16],
  [3.24, 0.92],
  [3.12, 0.56],
  [2.4, 0.74],
  [1.4, 0.84],
  [-1.4, 0.84],
  [-2.4, 0.74],
];

/** Dubina ekstruzije (sirina vozila). */
const BODY_DEPTH = 2.4;
/** Vertikalno centriranje: profil je definiran iznad nule, scena ga spusta. */
const GROUND_OFFSET = -1.0;

function buildBodyGeometry() {
  const shape = new THREE.Shape();
  const curve = new THREE.CatmullRomCurve3(
    PROFILE.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    true,
    'catmullrom',
    0.4,
  );
  const points = curve.getSpacedPoints(120);
  shape.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) shape.lineTo(points[i].x, points[i].y);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: BODY_DEPTH,
    bevelEnabled: true,
    bevelSize: 0.16,
    bevelThickness: 0.16,
    bevelSegments: 4,
    curveSegments: 12,
  });
  // Centriramo samo po dubini - X i Y ostaju u koordinatama profila,
  // pa se kotaci mogu postaviti tocno na pozicije iz siluete.
  geometry.translate(0, 0, -BODY_DEPTH / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function Wheel({ x, material }: { x: number; material: THREE.Material }) {
  return (
    <mesh position={[x, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} material={material}>
      <cylinderGeometry args={[0.62, 0.62, BODY_DEPTH - 0.12, 30]} />
    </mesh>
  );
}

function Body({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildBodyGeometry(), []);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        color: '#20262c',
        metalness: 0.85,
        roughness: 0.17,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.4,
      }),
      tyre: new THREE.MeshStandardMaterial({ color: '#0c0f11', metalness: 0.1, roughness: 0.9 }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      materials.body.dispose();
      materials.tyre.dispose();
    };
  }, [geometry, materials]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    if (reduced) {
      group.rotation.y = -0.42;
      group.rotation.x = 0.06;
      return;
    }
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      -0.42 + state.pointer.x * 0.22,
      2.2,
      dt,
    );
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, 0.06 - state.pointer.y * 0.06, 2.2, dt);
  });

  return (
    <group ref={groupRef}>
      <group position={[0, GROUND_OFFSET, 0]}>
        <mesh geometry={geometry} material={materials.body} />
        <Wheel x={-1.86} material={materials.tyre} />
        <Wheel x={1.86} material={materials.tyre} />
      </group>
    </group>
  );
}

export default function CarScene({
  reduced,
  active,
  simplified,
  onContextLost,
}: {
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
      camera={{ position: [1.4, 1.5, 12.6], fov: 30 }}
      onCreated={({ gl }) => {
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 6, 5]} intensity={2.2} color="#F5F8F7" />
      <directionalLight position={[-3, 5, 6]} intensity={1.1} color="#93AEBF" />
      {/* Crveni rub - akcent branda, bez agresivnog neona. */}
      <pointLight position={[-5, 1.5, 2.5]} intensity={40} color="#C90000" distance={16} />
      <pointLight position={[4, 2.5, -3]} intensity={26} color="#93AEBF" distance={16} />

      <Body reduced={reduced} />

      <Environment resolution={96} frames={1}>
        <Lightformer form="rect" intensity={3.4} color="#F5F8F7" position={[0, 6, 2]} scale={[12, 3, 1]} rotation={[-Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#C90000" position={[-6, 1, 3]} scale={[5, 3, 1]} rotation={[0, 1.1, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#3A5C70" position={[6, 2, -2]} scale={[5, 4, 1]} rotation={[0, -1.1, 0]} />
      </Environment>
    </Canvas>
  );
}
