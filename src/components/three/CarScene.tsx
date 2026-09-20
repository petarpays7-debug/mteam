'use client';

import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  AXLES,
  buildCarBodyGeometry,
  carPoint,
  WHEEL_INSET,
  WHEEL_RADIUS,
  WHEEL_WIDTH,
} from './carShape';

/**
 * M-CARS scena — vozilo izgradeno iz iste parametarske karoserije koju hero
 * scena poplocava modulima.
 *
 * Namjerno ne prikazuje konkretan model niti marku: to je generican, uredan
 * oblik limuzine. Bez automatske rotacije — pokret ovisi iskljucivo o
 * pokazivacu, i to prigusen.
 */

/** Vozilo stoji na tlu; scena ga spusta da bude u sredini kadra. */
const GROUND_OFFSET = -0.86;

/**
 * Svjetla i detalji citaju polozaj s iste parametarske povrsine kao karoserija,
 * pa uvijek sjede na limu umjesto da vise u zraku.
 */
function onBody(u: number, v: number, outward = 0.02): [number, number, number] {
  const p = carPoint(u, v, new THREE.Vector3());
  const scale = 1 + outward;
  return [p.x * scale, p.y, p.z * scale];
}

function Wheel({
  x,
  z,
  tyre,
  rim,
}: {
  x: number;
  z: number;
  tyre: THREE.Material;
  rim: THREE.Material;
}) {
  const outward = z > 0 ? 1 : -1;

  return (
    <group position={[x, WHEEL_RADIUS, z]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Guma */}
      <mesh material={tyre} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 36]} />
      </mesh>
      {/* Naplatak, blago uvucen u odnosu na vanjski rub gume */}
      <mesh position={[0, outward * (WHEEL_WIDTH / 2 - 0.02), 0]} material={rim}>
        <cylinderGeometry args={[WHEEL_RADIUS * 0.62, WHEEL_RADIUS * 0.62, 0.05, 28]} />
      </mesh>
      {/* Krakovi naplatka */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[0, outward * (WHEEL_WIDTH / 2 - 0.03), 0]}
          rotation={[0, 0, (i / 5) * Math.PI * 2]}
          material={rim}
        >
          <boxGeometry args={[WHEEL_RADIUS * 0.86, 0.04, 0.07]} />
        </mesh>
      ))}
    </group>
  );
}

function Car({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildCarBodyGeometry(), []);

  const materials = useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: '#4c5a66',
      metalness: 0.45,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.4,
      /*
        Obostrano crtanje: poklopci presjeka su lepeze cija orijentacija ovisi
        o obliku, pa ovako nema tamnih rupa ni pod jednim kutom gledanja.
      */
      side: THREE.DoubleSide,
    });
    /* Bez `transmission` — jeftinije je i na tamnoj sceni izgleda uvjerljivije. */
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#131c24',
      metalness: 0.2,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.6,
    });
    const tyre = new THREE.MeshStandardMaterial({
      color: '#262b30',
      metalness: 0.05,
      roughness: 0.85,
    });
    const rim = new THREE.MeshStandardMaterial({
      color: '#cdd7de',
      metalness: 0.9,
      roughness: 0.25,
      envMapIntensity: 2.2,
    });
    const lampFront = new THREE.MeshStandardMaterial({
      color: '#fff1d2',
      emissive: new THREE.Color('#ffe3a8'),
      emissiveIntensity: 2.4,
      toneMapped: false,
    });
    const lampRear = new THREE.MeshStandardMaterial({
      color: '#c90000',
      emissive: new THREE.Color('#ff2020'),
      emissiveIntensity: 2.2,
      toneMapped: false,
    });

    return { paint, glass, tyre, rim, lampFront, lampRear };
  }, []);

  useEffect(() => {
    const list = Object.values(materials);
    return () => {
      geometry.dispose();
      for (const m of list) m.dispose();
    };
  }, [geometry, materials]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (reduced) {
      group.rotation.y = -0.62;
      group.rotation.x = 0.03;
      return;
    }

    const dt = Math.min(delta, 0.05);
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      -0.62 + state.pointer.x * 0.26,
      2.2,
      dt,
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      0.03 - state.pointer.y * 0.07,
      2.2,
      dt,
    );
  });

  return (
    <group ref={groupRef} position={[0, GROUND_OFFSET, 0]}>
      <mesh geometry={geometry} material={[materials.paint, materials.glass]} castShadow />

      {[-WHEEL_INSET, WHEEL_INSET].map((z) =>
        AXLES.map((x) => (
          <Wheel key={`${x}-${z}`} x={x} z={z} tyre={materials.tyre} rim={materials.rim} />
        )),
      )}

      {/* Prednja svjetla */}
      {[-0.5, 0.5].map((v) => (
        <mesh key={`f${v}`} position={onBody(0.035, v)} material={materials.lampFront}>
          <boxGeometry args={[0.1, 0.1, 0.34]} />
        </mesh>
      ))}

      {/* Straznja svjetla */}
      {[-0.5, 0.5].map((v) => (
        <mesh key={`r${v}`} position={onBody(0.965, v)} material={materials.lampRear}>
          <boxGeometry args={[0.09, 0.09, 0.36]} />
        </mesh>
      ))}

      {/* Bocni retrovizori */}
      {[-0.86, 0.86].map((v) => (
        <mesh key={`m${v}`} position={onBody(0.315, v, 0.16)} material={materials.paint}>
          <boxGeometry args={[0.2, 0.09, 0.16]} />
        </mesh>
      ))}
    </group>
  );
}

/** Drzi vozilo u sredini kadra bez obzira na omjer spremnika. */
function CameraLook() {
  useFrame((state) => state.camera.lookAt(0, -0.05, 0));
  return null;
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
      camera={{ position: [6.2, 2.7, 9.6], fov: 30 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 8, 6]} intensity={3.2} color="#F5F8F7" />
      <directionalLight position={[-4, 5, 7]} intensity={1.2} color="#93AEBF" />
      {/* Crveni rub — akcent branda, bez agresivnog neona. */}
      <pointLight position={[-6, 1.6, 2]} intensity={34} color="#C90000" distance={16} />
      <pointLight position={[5, 2.4, -4]} intensity={28} color="#3A5C70" distance={18} />

      <Car reduced={reduced} />
      <CameraLook />

      {!simplified ? (
        <ContactShadows
          position={[0, GROUND_OFFSET + 0.002, 0]}
          scale={14}
          far={3}
          blur={2.4}
          opacity={0.7}
          color="#000000"
          resolution={256}
        />
      ) : null}

      <Environment resolution={simplified ? 64 : 160} frames={1}>
        {/* Duga traka iznad vozila — daje karakteristican odsjaj po karoseriji. */}
        <Lightformer
          form="rect"
          intensity={6}
          color="#F5F8F7"
          position={[0, 7, 1]}
          scale={[18, 3.4, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#C90000"
          position={[-7, 1.5, 3]}
          scale={[6, 4, 1]}
          rotation={[0, 1.1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#7FA3BA"
          position={[7, 2.5, -2]}
          scale={[6, 5, 1]}
          rotation={[0, -1.1, 0]}
        />
        <Lightformer
          form="circle"
          intensity={1.2}
          color="#FFD65C"
          position={[2, 4, 6]}
          scale={[4, 4, 1]}
        />
      </Environment>

      {!simplified && !reduced ? (
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.7} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette offset={0.3} darkness={0.6} eskil={false} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
