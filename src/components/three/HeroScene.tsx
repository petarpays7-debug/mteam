'use client';

import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei';
import { Canvas, invalidate, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  arcFor,
  getHeroStates,
  INSTANCE_COUNT,
  MAX_STAGGER,
  seedFor,
  staggerFor,
} from './layouts';
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
const tmpSpin = new THREE.Quaternion();
const tmpAxis = new THREE.Vector3();
const tmpColor = new THREE.Color();

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Resources = {
  geometry: THREE.BoxGeometry;
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  gloss: THREE.InstancedBufferAttribute;
  glow: THREE.InstancedBufferAttribute;
  metal: THREE.InstancedBufferAttribute;
};

function createResources(simplified: boolean): Resources {
  const geometry = new THREE.BoxGeometry(1, 0.05, 0.62);

  const gloss = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);
  const glow = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);
  const metal = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);

  geometry.setAttribute('aGloss', gloss);
  geometry.setAttribute('aGlow', glow);
  geometry.setAttribute('aMetal', metal);

  const material = simplified
    ? new THREE.MeshStandardMaterial({ metalness: 0.4, roughness: 0.4, envMapIntensity: 2.2 })
    : new THREE.MeshPhysicalMaterial({
        metalness: 0.4,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.09,
        reflectivity: 0.6,
        envMapIntensity: 2.2,
      });

  /*
    Tri atributa po instanci ulaze u standardni PBR shader i daju stvarnu
    razliku materijala unutar jednog instanced mesha: staklo modula,
    brusceni celik konstrukcije, lak karoserije, guma i svjetla vozila.
  */
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute float aGloss;
         attribute float aGlow;
         attribute float aMetal;
         varying float vGloss;
         varying float vGlow;
         varying float vMetal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vGloss = aGloss;
         vGlow = aGlow;
         vMetal = aMetal;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying float vGloss;
         varying float vGlow;
         varying float vMetal;`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = mix(0.8, 0.16, clamp(vGloss, 0.0, 1.0));`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
         metalnessFactor = clamp(vMetal, 0.0, 1.0);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         // vColor je vec4 kada je ukljucena boja po instanci - nuzan je .rgb.
         totalEmissiveRadiance += vColor.rgb * vGlow * 2.6;`,
      );
  };

  return { geometry, material, gloss, glow, metal };
}

function MorphingArray({ world, scrollProgress, reduced, simplified }: SceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const states = useMemo(() => getHeroStates(), []);

  /** Trenutna pozicija u morph prostoru (0 = solar, 1 = mount, 2 = cars). */
  const morph = useRef(0);
  /** Napredak ulazne animacije — instance se postupno slazu. */
  const intro = useRef(reduced ? 1 : 0);

  const perInstance = useMemo(
    () =>
      Array.from({ length: INSTANCE_COUNT }, (_, i) => ({
        seed: seedFor(i),
        stagger: staggerFor(i),
        arc: arcFor(i),
        axis: new THREE.Vector3(
          Math.sin(i * 12.9898),
          Math.cos(i * 78.233),
          Math.sin(i * 39.425),
        ).normalize(),
      })),
    [],
  );

  /*
    Geometrija, materijal i atributi po instanci grade se jednom po mountu.
    Komponenta se remounta kad se promijeni `simplified` (kljuc u roditelju).
  */
  const resources = useMemo(() => createResources(simplified), [simplified]);

  useEffect(() => {
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
    };
  }, [resources]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // Ulazna animacija: objekt se postupno formira umjesto da naglo iskoci.
    intro.current = Math.min(1, intro.current + dt * 0.7);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    const base = WORLD_TO_STATE[world];
    const scrollBias = reduced ? 0 : (scrollProgress.current ?? 0) * 0.3;
    const target = THREE.MathUtils.clamp(base + scrollBias, 0, 2);
    morph.current = THREE.MathUtils.damp(morph.current, target, 3.4, dt);

    const lower = Math.floor(morph.current);
    const upper = Math.min(lower + 1, 2);
    const blend = morph.current - lower;

    const from = states[lower];
    const to = states[upper];

    /*
      Atributi se citaju s meshove geometrije, a ne iz memoizirane vrijednosti:
      rijec je o GPU baferima koje mijenjamo svaki frame, izvan React render toka.
    */
    const attributes = mesh.geometry.attributes as Record<string, THREE.BufferAttribute>;
    const glossAttr = attributes.aGloss;
    const glowAttr = attributes.aGlow;
    const metalAttr = attributes.aMetal;
    const glossData = glossAttr.array as Float32Array;
    const glowData = glowAttr.array as Float32Array;
    const metalData = metalAttr.array as Float32Array;

    for (let i = 0; i < INSTANCE_COUNT; i += 1) {
      const a = from[i];
      const b = to[i];
      const meta = perInstance[i];

      /*
        Stupnjeviti prijelaz: svaka instanca krece s malim kasnjenjem, pa se
        preobrazba prelijeva preko objekta umjesto da se sve pomakne odjednom.
      */
      const raw = (blend - meta.stagger) / (1 - MAX_STAGGER);
      const local = reduced ? blend : easeInOut(THREE.MathUtils.clamp(raw, 0, 1));
      /** 0 na krajevima, 1 na sredini prijelaza — koristi se za luk i rotaciju. */
      const inFlight = Math.sin(local * Math.PI);

      tmpPos.copy(a.position).lerp(b.position, local);
      tmpScale.copy(a.scale).lerp(b.scale, local);
      tmpQuat.copy(a.quaternion).slerp(b.quaternion, local);

      if (!reduced && inFlight > 0.001) {
        // Instanca opise luk i zavrti se oko vlastite osi dok putuje.
        tmpPos.y += inFlight * meta.arc;
        tmpPos.z += inFlight * (meta.seed - 0.5) * 0.8;
        tmpSpin.setFromAxisAngle(tmpAxis.copy(meta.axis), inFlight * (1.1 + meta.seed * 1.4));
        tmpQuat.multiply(tmpSpin);
      }

      if (introEase < 1) {
        const offset = (1 - introEase) * (1.8 + meta.seed * 2.8);
        tmpPos.y -= offset;
        tmpPos.z -= offset * 0.5;
        tmpScale.multiplyScalar(0.35 + 0.65 * introEase);
      }

      if (!reduced) {
        tmpPos.y += Math.sin(time * 0.5 + meta.seed * 12) * 0.018;
      }

      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMatrix);

      tmpColor.copy(a.color).lerp(b.color, local);
      mesh.setColorAt(i, tmpColor);

      glossData[i] = THREE.MathUtils.lerp(a.gloss, b.gloss, local);
      glowData[i] = THREE.MathUtils.lerp(a.glow, b.glow, local);
      metalData[i] = THREE.MathUtils.lerp(a.metal, b.metal, local);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    glossAttr.needsUpdate = true;
    glowAttr.needsUpdate = true;
    metalAttr.needsUpdate = true;

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

    if (!reduced) {
      const px = state.pointer.x;
      const py = state.pointer.y;
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, px * 0.18, 2.6, dt);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -py * 0.09 + 0.04, 2.6, dt);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[resources.geometry, resources.material, INSTANCE_COUNT]}
        frustumCulled={false}
        castShadow={!simplified}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */

/** Pokretno svjetlo koje stvara prelazak sunca preko staklene povrsine modula. */
function SunSweep({ reduced }: { reduced: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  /** Mekani radijalni gradijent — sunce iza scene, bez teksture s mreze. */
  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 232, 178, 0.55)');
    gradient.addColorStop(0.18, 'rgba(245, 185, 0, 0.2)');
    gradient.addColorStop(0.55, 'rgba(245, 185, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(245, 185, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => glowTexture?.dispose(), [glowTexture]);

  useFrame((state) => {
    const t = reduced ? 0.7 : state.clock.elapsedTime * 0.14;
    const x = Math.cos(t) * 10;
    const y = 6 + Math.sin(t * 0.7) * 1.8;
    const z = Math.sin(t) * 6 + 3;

    lightRef.current?.position.set(x, y, z);
    if (glowRef.current) {
      // Sunce stoji daleko iza scene i ostaje diskretno - ne smije progutati kadar.
      glowRef.current.position.set(x * 0.55, y * 0.42 + 1.4, -13);
      glowRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        intensity={3.6}
        color="#FFE7AE"
        castShadow={false}
      />
      {glowTexture ? (
        <mesh ref={glowRef} renderOrder={-1}>
          <planeGeometry args={[13, 13]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={0.75}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ) : null}
    </>
  );
}

/**
 * Uz `prefers-reduced-motion` scena stoji mirno (frameloop = "demand").
 * Ova komponenta kratko pokrece render petlju samo dok traje prijelaz
 * izmedu odabranih svjetova, kako promjena ne bi bila nevidljiva.
 */
function TransitionPump({ world, enabled }: { world: WorldId; enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const until = performance.now() + 2000;
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
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 11.2 - p * 2.4, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 4.4 - p * 2, 2, dt);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.5, 1.6, dt);
    camera.lookAt(0, -0.3, 0);
  });

  return null;
}

/* -------------------------------------------------------------------------- */

type HeroSceneProps = SceneProps & {
  active: boolean;
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
      camera={{ position: [0, 4.4, 11.2], fov: 34, near: 0.1, far: 70 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
        if (onContextLost) gl.domElement.addEventListener('webglcontextlost', onContextLost);
      }}
      /* Scena je dekorativna — cijeli sadrzaj postoji i u tekstualnom obliku. */
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={['#04121B']} />
      <fog attach="fog" args={['#04121B', 17, 38]} />

      <ambientLight intensity={0.95} />
      <SunSweep reduced={reduced} />
      {/* Hladno rubno svjetlo s lijeva — odvaja module od pozadine. */}
      <pointLight position={[-9, 3.5, 5]} intensity={55} color="#5F8499" distance={28} />
      <pointLight position={[9, 1.5, -7]} intensity={9} color="#FF8A4C" distance={20} />

      <MorphingArray
        /* Promjena razine detalja remounta komponentu i ponovno gradi GPU resurse. */
        key={simplified ? 'simplified' : 'full'}
        world={world}
        scrollProgress={scrollProgress}
        reduced={reduced}
        simplified={simplified}
      />

      {/* Tehnicka mreza daje dubinu — jedan plane, jeftino. */}
      <Grid
        position={[0, -2.95, 0]}
        args={[44, 44]}
        cellSize={simplified ? 1 : 0.6}
        cellThickness={0.5}
        cellColor="#123141"
        sectionSize={3}
        sectionThickness={0.9}
        sectionColor="#24576e"
        fadeDistance={simplified ? 22 : 30}
        fadeStrength={1.3}
        infiniteGrid
      />

      {!simplified ? (
        /* Kontaktna sjena prizemljuje objekt — bez nje scena lebdi u praznini. */
        <ContactShadows
          position={[0, -2.9, 0]}
          scale={26}
          far={7}
          blur={2.8}
          opacity={0.55}
          color="#000000"
          resolution={256}
        />
      ) : null}

      {/* Lokalno generirano okruzenje — bez mreznog dohvata HDR datoteka. */}
      <Environment resolution={simplified ? 64 : 160} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#FFE39B"
          position={[5, 6, 2]}
          scale={[9, 5, 1]}
          rotation={[-0.4, 0.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.7}
          color="#A8C2D1"
          position={[-7, 3, -3]}
          scale={[8, 6, 1]}
          rotation={[0.2, -0.9, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.9}
          color="#F5F8F7"
          position={[0, 9, 0]}
          scale={[16, 7, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={1.5}
          color="#FF6B35"
          position={[0, -4, 6]}
          scale={[5, 5, 1]}
        />
      </Environment>

      <CameraRig scrollProgress={scrollProgress} reduced={reduced} />
      <TransitionPump world={world} enabled={reduced} />

      {!simplified && !reduced ? (
        <EffectComposer enableNormalPass={false}>
          {/* Suzdrzan bloom — hvata samo sunceve odbljeske i svjetla vozila. */}
          <Bloom intensity={0.55} luminanceThreshold={0.68} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette offset={0.38} darkness={0.42} eskil={false} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
