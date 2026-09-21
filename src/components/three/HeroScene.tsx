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
import type { InstanceTransform } from './layouts';
import { getPanelTexture } from './panelTexture';
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
  panel: THREE.InstancedBufferAttribute;
};

function createResources(simplified: boolean): Resources {
  const geometry = new THREE.BoxGeometry(1, 0.05, 0.62);

  const gloss = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);
  const glow = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);
  const metal = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);
  const panel = new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT), 1);

  geometry.setAttribute('aGloss', gloss);
  geometry.setAttribute('aGlow', glow);
  geometry.setAttribute('aMetal', metal);
  geometry.setAttribute('aPanel', panel);

  const material = simplified
    ? new THREE.MeshStandardMaterial({ metalness: 0.4, roughness: 0.4, envMapIntensity: 3.2 })
    : new THREE.MeshPhysicalMaterial({
        metalness: 0.4,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.09,
        reflectivity: 0.6,
        envMapIntensity: 3.2,
      });

  /*
    Tri atributa po instanci ulaze u standardni PBR shader i daju stvarnu
    razliku materijala unutar jednog instanced mesha: staklo modula,
    brusceni celik konstrukcije, lak karoserije, guma i svjetla vozila.
  */
  const panelMap = getPanelTexture();

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPanelMap = { value: panelMap };
    shader.uniforms.uSweep = { value: 999 };
    shader.uniforms.uSweepWidth = { value: SWEEP_WIDTH };
    shader.uniforms.uSweepStrength = { value: 0 };

    // Shader se cuva da bi se uniformi trake mogli mijenjati svaki frame.
    material.userData.shader = shader;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute float aGloss;
         attribute float aGlow;
         attribute float aMetal;
         attribute float aPanel;
         varying float vGloss;
         varying float vGlow;
         varying float vMetal;
         varying float vPanel;
         varying vec2 vPanelUv;
         varying float vSweepX;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vGloss = aGloss;
         vGlow = aGlow;
         vMetal = aMetal;
         vPanel = aPanel;
         vPanelUv = uv;
         #ifdef USE_INSTANCING
           // Cetvrti stupac matrice instance je njezin pomak — treba nam X.
           vSweepX = instanceMatrix[3][0];
         #else
           vSweepX = 0.0;
         #endif`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform sampler2D uPanelMap;
         uniform float uSweep;
         uniform float uSweepWidth;
         uniform float uSweepStrength;
         varying float vSweepX;
         varying float vGloss;
         varying float vGlow;
         varying float vMetal;
         varying float vPanel;
         varying vec2 vPanelUv;`,
      )
      /*
        Tekstura modula: RGB je mnozitelj svjetline (celije, razmaci, sabirnice),
        a alfa je maska aluminijskog okvira koji ide prema neutralnom srebru.
        Primjenjuje se tek nakon boje po instanci i samo tamo gdje je vPanel = 1.
      */
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         if (vPanel > 0.001) {
           float cells = texture2D(uPanelMap, vPanelUv).r;
           // Okvir se racuna iz UV-a, pa je jednako debeo na svakoj plocici.
           vec2 edge = min(vPanelUv, 1.0 - vPanelUv);
           float border = min(edge.x * 1.65, edge.y);
           float frame = 1.0 - smoothstep(0.016, 0.028, border);

           vec3 lit = diffuseColor.rgb * cells;
           lit = mix(lit, vec3(0.42, 0.47, 0.52), frame);
           diffuseColor.rgb = mix(diffuseColor.rgb, lit, vPanel);
         }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = mix(0.82, 0.26, clamp(vGloss, 0.0, 1.0));
         // Okvir je glatkiji od same celije.
         if (vPanel > 0.001) {
           vec2 rEdge = min(vPanelUv, 1.0 - vPanelUv);
           float rFrame = 1.0 - smoothstep(0.016, 0.028, min(rEdge.x * 1.65, rEdge.y));
           roughnessFactor = mix(roughnessFactor, 0.2, rFrame * vPanel);
         }`,
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
         totalEmissiveRadiance += vColor.rgb * vGlow * 2.6;

         /*
           Traka svjetla koja putuje preko scene.

           Usmjereno svjetlo samo po sebi daje odsjaj tek pod povoljnim kutom,
           pa se na dijelu ploha ne vidi nista. Ova traka jamci da prelazak
           bude citljiv na svemu — modulima, konstrukciji i karoseriji — i na
           uredajima bez bloom-a.

           Na modulima se moduliira teksturom celija, pa svjetlo po njima
           titra umjesto da klizi kao ravna ploha.
         */
         if (uSweepStrength > 0.001) {
           float sweepD = (vSweepX - uSweep) / uSweepWidth;
           float band = exp(-sweepD * sweepD);

           if (band > 0.002) {
             float facing = clamp(dot(normalize(vNormal), normalize(vec3(0.0, 0.55, 0.84))), 0.0, 1.0);
             vec3 rayColor = vec3(1.0, 0.86, 0.58);

             if (vPanel > 0.001) {
               // Staklo modula: svjetlo hvata cijelu plohu, ali titra po celijama.
               float sparkle = texture2D(uPanelMap, vPanelUv).r;
               totalEmissiveRadiance += rayColor * band * uSweepStrength * sparkle * (0.22 + 1.5 * facing);
             } else {
               // Lak i metal: uzak odsjaj koji klizi, a ne ravnomjeran sjaj po cijeloj plohi.
               float streak = band * band;
               totalEmissiveRadiance += rayColor * streak * uSweepStrength * (0.08 + 1.35 * pow(facing, 3.0));
             }
           }
         }`,
      );
  };

  return { geometry, material, gloss, glow, metal, panel };
}

/**
 * Dva medjuspremnika po instanci.
 *
 * `current` se upisuje svaki frame i drzi cisto interpolirano stanje (bez luka,
 * lebdenja i ulazne animacije). `start` je zamrznuta kopija koju uzimamo u
 * trenutku promjene svijeta — ona je pocetak novog prijelaza.
 *
 * Zive na `mesh.userData`, a ne u `useMemo`: rijec je o namjerno mutabilnom
 * stanju izvan React render toka.
 */
type MorphBuffer = {
  position: THREE.Vector3[];
  quaternion: THREE.Quaternion[];
  scale: THREE.Vector3[];
  color: THREE.Color[];
  gloss: Float32Array;
  glow: Float32Array;
  metal: Float32Array;
  panel: Float32Array;
};

function createBuffer(source: InstanceTransform[]): MorphBuffer {
  return {
    position: source.map((t) => t.position.clone()),
    quaternion: source.map((t) => t.quaternion.clone()),
    scale: source.map((t) => t.scale.clone()),
    color: source.map((t) => t.color.clone()),
    gloss: Float32Array.from(source, (t) => t.gloss),
    glow: Float32Array.from(source, (t) => t.glow),
    metal: Float32Array.from(source, (t) => t.metal),
    panel: Float32Array.from(source, (t) => t.panel),
  };
}

function copyBuffer(from: MorphBuffer, to: MorphBuffer) {
  for (let i = 0; i < INSTANCE_COUNT; i += 1) {
    to.position[i].copy(from.position[i]);
    to.quaternion[i].copy(from.quaternion[i]);
    to.scale[i].copy(from.scale[i]);
    to.color[i].copy(from.color[i]);
  }
  to.gloss.set(from.gloss);
  to.glow.set(from.glow);
  to.metal.set(from.metal);
  to.panel.set(from.panel);
}

type MorphMemory = { current: MorphBuffer; start: MorphBuffer; world: WorldId };

function memoryOf(mesh: THREE.InstancedMesh, initial: InstanceTransform[], world: WorldId) {
  const data = mesh.userData as { morph?: MorphMemory };
  if (!data.morph) {
    data.morph = {
      current: createBuffer(initial),
      start: createBuffer(initial),
      world,
    };
  }
  return data.morph;
}

/**
 * Vrijeme u sekundama od ucitavanja stranice.
 *
 * Namjerno NIJE sat scene: taj sat stoji zajedno s render petljom, koju
 * pauziramo kad kartica nije aktivna ili je scena izvan pogleda. Trajanja
 * animacija i ciklus sunca time bi ovisili o tome koliko je frameova
 * nacrtano, a ne o stvarno proteklom vremenu.
 */
function clockSeconds(): number {
  return performance.now() / 1000;
}

/** Trajanje prijelaza izmedu dva svijeta, u sekundama. */
const MORPH_DURATION = 1.5;
/** Trajanje ulazne animacije pri prvom prikazu. */
const INTRO_DURATION = 1.4;

function MorphingArray({ world, scrollProgress, reduced, simplified }: SceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const states = useMemo(() => getHeroStates(), []);

  /*
    Trajanja se mjere satom scene, a ne zbrajanjem delta vrijednosti.

    Zbrajanje `dt` (koji je namjerno ogranicen radi stabilnosti prigusenja)
    znaci da animacija napreduje po BROJU frameova. Ako preglednik prigusi
    render petlju — pozadinska kartica, ugradeni prikaz, slab uredaj — ulazna
    animacija i prijelazi znaju ostati zaglavljeni na pocetku. Sat scene daje
    stvarno proteklo vrijeme, pa animacija uvijek traje onoliko koliko treba.
  */
  const introStart = useRef<number | null>(null);
  const morphStart = useRef<number | null>(null);

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

  /*
    Ulazna animacija se veze uz mount, a ne uz prvi nacrtani frame. Ako je
    scena montirana dok stranica nije vidljiva, prvi frame dolazi tek nakon
    povratka korisnika — tada animacija vise nema smisla i objekt treba biti
    slozen.
  */
  useEffect(() => {
    introStart.current = clockSeconds();
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const time = clockSeconds();

    // Ulazna animacija: objekt se postupno formira umjesto da naglo iskoci.
    const introRaw = reduced || introStart.current === null
      ? 1
      : THREE.MathUtils.clamp((time - introStart.current) / INTRO_DURATION, 0, 1);
    const introEase = 1 - Math.pow(1 - introRaw, 3);

    /*
      Prijelaz ide IZRAVNO iz zatecenog stanja u odabrano.

      Ranije je morph bio jedan broj 0..2 pa je odabir M-CARS-a iz solarnog
      polja usput prolazio kroz konstrukciju. Sada se u trenutku promjene
      zamrzne zatecena slika i iz nje se interpolira u ciljano stanje.
    */
    const to = states[WORLD_TO_STATE[world]];
    const memory = memoryOf(mesh, states[WORLD_TO_STATE[world]], world);

    if (memory.world !== world) {
      copyBuffer(memory.current, memory.start);
      memory.world = world;
      morphStart.current = time;
    }

    const blend =
      morphStart.current === null
        ? 1
        : THREE.MathUtils.clamp((time - morphStart.current) / MORPH_DURATION, 0, 1);

    const start = memory.start;
    const current = memory.current;

    /*
      Atributi se citaju s meshove geometrije, a ne iz memoizirane vrijednosti:
      rijec je o GPU baferima koje mijenjamo svaki frame, izvan React render toka.
    */
    const attributes = mesh.geometry.attributes as Record<string, THREE.BufferAttribute>;
    const glossAttr = attributes.aGloss;
    const glowAttr = attributes.aGlow;
    const metalAttr = attributes.aMetal;
    const panelAttr = attributes.aPanel;
    const glossData = glossAttr.array as Float32Array;
    const glowData = glowAttr.array as Float32Array;
    const metalData = metalAttr.array as Float32Array;
    const panelData = panelAttr.array as Float32Array;

    for (let i = 0; i < INSTANCE_COUNT; i += 1) {
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

      // Cisto interpolirano stanje — bez luka i lebdenja — cuva se za sljedeci prijelaz.
      current.position[i].copy(start.position[i]).lerp(b.position, local);
      current.scale[i].copy(start.scale[i]).lerp(b.scale, local);
      current.quaternion[i].copy(start.quaternion[i]).slerp(b.quaternion, local);
      current.color[i].copy(start.color[i]).lerp(b.color, local);
      current.gloss[i] = THREE.MathUtils.lerp(start.gloss[i], b.gloss, local);
      current.glow[i] = THREE.MathUtils.lerp(start.glow[i], b.glow, local);
      current.metal[i] = THREE.MathUtils.lerp(start.metal[i], b.metal, local);
      current.panel[i] = THREE.MathUtils.lerp(start.panel[i], b.panel, local);

      tmpPos.copy(current.position[i]);
      tmpScale.copy(current.scale[i]);
      tmpQuat.copy(current.quaternion[i]);

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

      mesh.setColorAt(i, tmpColor.copy(current.color[i]));

      glossData[i] = current.gloss[i];
      glowData[i] = current.glow[i];
      metalData[i] = current.metal[i];
      panelData[i] = current.panel[i];
    }

    /*
      Traka svjetla — isti izvor istine kao i usmjereno svjetlo.

      Shader se, kao i atributi iznad, cita s mesha a ne iz memoizirane
      vrijednosti: uniformi su GPU stanje koje mijenjamo svaki frame.
    */
    const sun = reduced
      ? sunState(SWEEP_DELAY + SWEEP_DURATION * 0.5)
      : sunState(clockSeconds());
    const shader = (mesh.material as THREE.Material).userData.shader as
      | { uniforms: Record<string, { value: number }> }
      | undefined;
    if (shader) {
      shader.uniforms.uSweep.value = sun.band;
      shader.uniforms.uSweepStrength.value = sun.strength * (simplified ? 1.35 : 1);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    glossAttr.needsUpdate = true;
    glowAttr.needsUpdate = true;
    metalAttr.needsUpdate = true;
    panelAttr.needsUpdate = true;

    const group = groupRef.current;
    if (!group) return;

    // Prilagodba kadra omjeru prikaza: na uskim zaslonima scena se smanjuje
    // i podize kako bi ostala vidljiva iznad hero teksta.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = THREE.MathUtils.clamp(aspect / 1.6, 0.62, 1);
    // Bez prigusenja: `fit` se mijenja samo pri promjeni velicine prozora,
    // a tada je skok ionako neizbjezan. Prigusenje bi samo odgodilo ispravan kadar.
    group.scale.setScalar(fit);

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

/*
  Prelazak svjetla preko scene.

  Nema suncevog koluta — prelazi samo svjetlost: zraka putuje s jedne strane na
  drugu, a povrsine koje zahvati zasvijetle i presijavaju se. Radi jednako na
  modulima, na konstrukciji i na karoseriji vozila.

  Kretanje je LINEARNO, ne ubrzava u sredini: traka treba ravnomjerno prijeci
  cijelo polje za SWEEP_DURATION sekundi. Nakon toga svjetla nema SWEEP_GAP
  sekundi, pa ciklus krece ispocetka.
*/
const SWEEP_DURATION = 10;
const SWEEP_GAP = 15;
const SWEEP_PERIOD = SWEEP_DURATION + SWEEP_GAP;
const SWEEP_DELAY = 0.4;

/** Traka ulazi izvan jednog ruba scene i izlazi izvan drugog. */
const SWEEP_FROM = 7.6;
const SWEEP_TO = -7.6;
/** Sirina trake u jedinicama scene. */
const SWEEP_WIDTH = 1.7;

type SunState = {
  /** Polozaj trake po osi X, u prostoru objekta. */
  band: number;
  /** 0 dok svjetla nema, do 1 na vrhuncu prelaska. */
  strength: number;
  light: { x: number; y: number; z: number };
};

const IDLE_SUN: SunState = {
  band: 999,
  strength: 0,
  light: { x: 8, y: 6, z: -4 },
};

/**
 * Stanje svjetla za zadano proteklo vrijeme.
 *
 * Cista funkcija, pa je mogu neovisno pozvati i traka u shaderu i usmjereno
 * svjetlo — bez prosljedivanja stanja kroz komponente.
 */
function sunState(elapsed: number): SunState {
  const cycle = (elapsed - SWEEP_DELAY + SWEEP_PERIOD * 2) % SWEEP_PERIOD;
  if (cycle >= SWEEP_DURATION) return IDLE_SUN;

  const p = cycle / SWEEP_DURATION;
  /** Luk: svjetlo se podize i primice, pa se opet udaljava. */
  const arc = Math.sin(p * Math.PI);
  const band = SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * p;

  return {
    band,
    // Meko uranjanje i izranjanje, bez naglog paljenja.
    strength: Math.pow(arc, 0.55),
    light: { x: band * 1.35, y: 5.4 + arc * 2.8, z: 1.5 + arc * 7.5 },
  };
}

function SunSweep({ reduced, simplified }: { reduced: boolean; simplified: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;

    const sun = reduced ? sunState(SWEEP_DELAY + SWEEP_DURATION * 0.5) : sunState(clockSeconds());

    light.position.set(sun.light.x, sun.light.y, sun.light.z);
    // Bez bloom-a na slabijim uredajima prelazak treba jace svjetlo.
    light.intensity = 1.1 + sun.strength * (simplified ? 4.8 : 3.6);
  });

  return <directionalLight ref={lightRef} intensity={1.1} color="#FFE7AE" castShadow={false} />;
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

      <ambientLight intensity={1.25} />
      {/*
        Stalno prednje svjetlo. Sunce je vecinu ciklusa iza scene, pa bez ovoga
        polje modula ostane tamno izmedu dva prelaska.
      */}
      <directionalLight position={[3.5, 6.5, 9]} intensity={3.4} color="#DCE8F0" />
      <SunSweep reduced={reduced} simplified={simplified} />
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
