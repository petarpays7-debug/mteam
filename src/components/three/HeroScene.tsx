'use client';

import { Environment, Grid, Lightformer } from '@react-three/drei';
import { Canvas, invalidate, useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getHeroStates, INSTANCE_COUNT, seedFor } from './layouts';
import type { WorldId } from '@/content/home';

const WORLD_TO_STATE: Record<WorldId, number> = { solar: 0, mount: 1, cars: 2 };

type SceneProps = {
  world: WorldId;
  /** 0..1 napredak scrolla unutar hero sekcije. */
  scrollProgress: RefObject<number>;
  reduced: boolean;
  simplified: boolean;
};

/* -------------------------------------------------------------------------- */

const tmpMatrix = new THREE.Matrix4();
const tmpPos = new THREE.Vector3();
const tmpScale = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpColor = new THREE.Color();

function MorphingArray({ world, scrollProgress, reduced, simplified }: SceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const states = useMemo(() => getHeroStates(), []);

  /** Trenutna pozicija u morph prostoru (0 = solar, 1 = mount, 2 = cars). */
  const morph = useRef(0);
  /** Napredak ulazne animacije - instance se postupno slazu. */
  const intro = useRef(reduced ? 1 : 0);

  const seeds = useMemo(() => Array.from({ length: INSTANCE_COUNT }, (_, i) => seedFor(i)), []);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.05, 0.62), []);

  const material = useMemo(() => {
    if (simplified) {
      // Na slabijim uredjajima nema clearcoata, pa blagi emissive drzi
      // module citljivima i bez jakih refleksija.
      return new THREE.MeshStandardMaterial({
        metalness: 0.35,
        roughness: 0.34,
        envMapIntensity: 1.7,
        emissive: new THREE.Color('#123a52'),
        emissiveIntensity: 0.5,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      metalness: 0.55,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 0.75,
      envMapIntensity: 1.6,
    });
  }, [simplified]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // Ulazna animacija: objekt se postupno formira umjesto da naglo iskoci.
    intro.current = Math.min(1, intro.current + dt * 0.75);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    // Cilj morpha: odabrani svijet uz suptilan doprinos scrolla.
    const base = WORLD_TO_STATE[world];
    const scrollBias = reduced ? 0 : (scrollProgress.current ?? 0) * 0.28;
    const target = THREE.MathUtils.clamp(base + scrollBias, 0, 2);
    morph.current = THREE.MathUtils.damp(morph.current, target, 5.5, dt);

    const lower = Math.floor(morph.current);
    const upper = Math.min(lower + 1, 2);
    const blend = morph.current - lower;

    const from = states[lower];
    const to = states[upper];

    for (let i = 0; i < INSTANCE_COUNT; i += 1) {
      const a = from[i];
      const b = to[i];

      tmpPos.copy(a.position).lerp(b.position, blend);
      tmpScale.copy(a.scale).lerp(b.scale, blend);
      tmpQuat.copy(a.quaternion).slerp(b.quaternion, blend);

      if (introEase < 1) {
        // Instance dolaze iz dubine i sa spustene visine.
        const offset = (1 - introEase) * (1.6 + seeds[i] * 2.4);
        tmpPos.y -= offset;
        tmpPos.z -= offset * 0.5;
        tmpScale.multiplyScalar(0.4 + 0.6 * introEase);
      }

      if (!reduced) {
        // Vrlo blago lebdenje kako scena ne bi djelovala staticno.
        tmpPos.y += Math.sin(time * 0.55 + seeds[i] * 12) * 0.022;
      }

      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMatrix);

      tmpColor.copy(a.color).lerp(b.color, blend);
      mesh.setColorAt(i, tmpColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const group = groupRef.current;
    if (!group) return;

    // Prilagodba kadra omjeru prikaza: na uskim zaslonima scena se smanjuje
    // i podize kako bi ostala vidljiva iznad hero teksta.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = THREE.MathUtils.clamp(aspect / 1.6, 0.62, 1);
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x || fit, fit, 4, dt));

    const scrolled = scrollProgress.current ?? 0;
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      (1 - fit) * 1.9 + (reduced ? 0 : scrolled * 0.6),
      2,
      dt,
    );

    // Parallax prema kursoru - namjerno prigusen.
    if (!reduced) {
      const px = state.pointer.x;
      const py = state.pointer.y;
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, px * 0.16, 2.6, dt);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -py * 0.08 + 0.04, 2.6, dt);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, INSTANCE_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */

/** Pokretno svjetlo koje stvara prelazak sunca preko staklene povrsine modula. */
function SunSweep({ reduced }: { reduced: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const light = lightRef.current;
    if (!light) return;
    const t = reduced ? 0.6 : state.clock.elapsedTime * 0.16;
    light.position.set(Math.cos(t) * 9, 5.5 + Math.sin(t * 0.7) * 1.4, Math.sin(t) * 6 + 4);
  });

  return <directionalLight ref={lightRef} intensity={3.4} color="#FFE7AE" />;
}

/**
 * Uz `prefers-reduced-motion` scena stoji mirno (frameloop = "demand").
 * Ova komponenta kratko pokrece render petlju samo dok traje prijelaz
 * izmedju odabranih svjetova, kako promjena ne bi bila nevidljiva.
 */
function TransitionPump({ world, enabled }: { world: WorldId; enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const until = performance.now() + 1400;
    const tick = () => {
      invalidate();
      if (performance.now() < until) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [world, enabled]);

  return null;
}

function CameraRig({
  scrollProgress,
  reduced,
}: {
  scrollProgress: RefObject<number>;
  reduced: boolean;
}) {
  useFrame((state, delta) => {
    if (reduced) return;
    const { camera } = state;
    const p = scrollProgress.current ?? 0;
    const dt = Math.min(delta, 0.05);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 11 - p * 2.2, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 4.6 - p * 1.9, 2, dt);
    camera.lookAt(0, -0.4, 0);
  });

  return null;
}

/* -------------------------------------------------------------------------- */

type HeroSceneProps = SceneProps & {
  active: boolean;
  /** Poziva se ako preglednik izgubi WebGL kontekst - vraca staticki prikaz. */
  onContextLost?: () => void;
};

export default function HeroScene({
  world,
  scrollProgress,
  reduced,
  simplified,
  active,
  onContextLost,
}: HeroSceneProps) {
  return (
    <Canvas
      /* Render petlja staje kad kartica nije aktivna ili je scena izvan pogleda. */
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      dpr={simplified ? [1, 1.4] : [1, 1.75]}
      gl={{
        antialias: !simplified,
        powerPreference: 'high-performance',
        alpha: true,
        stencil: false,
      }}
      camera={{ position: [0, 4.6, 11], fov: 34, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      /* Scena je dekorativna - cijeli sadrzaj postoji i u tekstualnom obliku. */
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={['#04121B']} />
      <fog attach="fog" args={['#04121B', 16, 34]} />

      <ambientLight intensity={0.7} />
      <SunSweep reduced={reduced} />
      {/* Hladno rubno svjetlo s lijeva - odvaja module od pozadine. */}
      <pointLight position={[-8, 3.5, 5]} intensity={45} color="#5F8499" distance={26} />
      <pointLight position={[6, 2, -4]} intensity={16} color="#FF6B35" distance={18} />

      <MorphingArray
        world={world}
        scrollProgress={scrollProgress}
        reduced={reduced}
        simplified={simplified}
      />

      {/* Tehnicka mreza daje dubinu i na jednostavnijoj sceni - jedan plane, jeftino. */}
      <Grid
        position={[0, -2.9, 0]}
        args={[40, 40]}
        cellSize={simplified ? 1 : 0.6}
        cellThickness={0.5}
        cellColor="#123141"
        sectionSize={3}
        sectionThickness={0.8}
        sectionColor="#1F3D4E"
        fadeDistance={simplified ? 20 : 26}
        fadeStrength={1.4}
        infiniteGrid
      />

      {/* Lokalno generirano okruzenje - bez mreznog dohvata HDR datoteka. */}
      <Environment resolution={simplified ? 64 : 128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#FFD65C"
          position={[4, 5, 2]}
          scale={[8, 4, 1]}
          rotation={[-0.4, 0.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#93AEBF"
          position={[-6, 2, -3]}
          scale={[7, 5, 1]}
          rotation={[0.2, -0.9, 0]}
        />
        <Lightformer
          form="circle"
          intensity={1.6}
          color="#FF6B35"
          position={[0, -3, 5]}
          scale={[4, 4, 1]}
        />
      </Environment>

      <CameraRig scrollProgress={scrollProgress} reduced={reduced} />
      <TransitionPump world={world} enabled={reduced} />
    </Canvas>
  );
}
