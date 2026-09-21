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
         varying vec2 vPanelUv;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vGloss = aGloss;
         vGlow = aGlow;
         vMetal = aMetal;
         vPanel = aPanel;
         vPanelUv = uv;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform sampler2D uPanelMap;
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
         totalEmissiveRadiance += vColor.rgb * vGlow * 2.6;`,
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
  Prelazak sunca preko modula.

  Sunce se NE krece jednolikom brzinom. Vidljivi dio putanje — ispred scene,
  preko polja modula — prijede za SUN_SWEEP sekundi, a zatim SUN_GAP sekundi
  putuje iza scene, gdje ga nema.

  Prvi prelazak krene na 0.4 s i zavrsi na 3.4 s, dakle unutar prve cetiri
  sekunde od ucitavanja. Sljedeci krece 15 sekundi nakon sto prethodni zavrsi.
*/
const SUN_SWEEP = 3;
/** Koliko sunca nema izmedu dva prelaska. */
const SUN_GAP = 15;
const SUN_PERIOD = SUN_SWEEP + SUN_GAP;
const SUN_DELAY = 0.4;

/** Kutovi izmedu kojih je sunce ispred scene i odbljesak je vidljiv. */
const SUN_ARC_START = -0.4;
const SUN_ARC_END = Math.PI + 0.4;

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Kut sunca za zadano proteklo vrijeme. */
function sunAngle(elapsed: number): number {
  const cycle = (elapsed - SUN_DELAY + SUN_PERIOD * 2) % SUN_PERIOD;

  if (cycle < SUN_SWEEP) {
    // Brzi, vidljivi prelazak preko modula.
    return SUN_ARC_START + (SUN_ARC_END - SUN_ARC_START) * easeInOutSine(cycle / SUN_SWEEP);
  }

  // Spori povratak iza scene do sljedeceg prelaska.
  const rest = (cycle - SUN_SWEEP) / (SUN_PERIOD - SUN_SWEEP);
  return SUN_ARC_END + (Math.PI * 2 + SUN_ARC_START - SUN_ARC_END) * rest;
}

/** Pokretno svjetlo koje stvara prelazak sunca preko staklene povrsine modula. */
/**
 * Zeljeni polozaj sunca na ekranu tijekom prelaska.
 *
 * Sunce se NE postavlja u prostoru scene nego u prostoru kadra, pa se
 * unproject-om vraca u 3D. Razlog: pri prirodnom polozaju (visoko i ispred
 * scene) kolut zavrsi daleko izvan kadra — na mobitelu i po sedam puta sire od
 * ekrana — pa se vidio samo rub njegova sjaja. Ovako je zajamceno u kadru na
 * svakom omjeru, a vodoravno i dalje prati isti kut kao svjetlo koje stvara
 * odbljesak na modulima.
 */
const SUN_SCREEN_X = 0.8;
const SUN_SCREEN_Y = 0.56;
const SUN_DEPTH = 0.9;
/** Velicina koluta u odnosu na udaljenost od kamere — prividna velicina ostaje ista. */
const SUN_SIZE = 0.34;

const sunNdc = new THREE.Vector3();

function SunSweep({ reduced, simplified }: { reduced: boolean; simplified: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  /** Mekani radijalni gradijent — sunce bez teksture s mreze. */
  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    // Jasna jezgra pa tek onda halo — inace se vidi samo izmaglica.
    gradient.addColorStop(0, 'rgba(255, 253, 244, 1)');
    gradient.addColorStop(0.11, 'rgba(255, 246, 206, 0.96)');
    gradient.addColorStop(0.17, 'rgba(255, 221, 128, 0.62)');
    gradient.addColorStop(0.26, 'rgba(250, 198, 40, 0.26)');
    gradient.addColorStop(0.45, 'rgba(245, 185, 0, 0.1)');
    gradient.addColorStop(0.74, 'rgba(245, 185, 0, 0.03)');
    gradient.addColorStop(1, 'rgba(245, 185, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => glowTexture?.dispose(), [glowTexture]);

  useFrame((state) => {
    const t = reduced ? Math.PI / 2 : sunAngle(clockSeconds());
    /** 0 dok je sunce iza scene, 1 na vrhuncu prelaska. */
    const front = Math.max(Math.sin(t), 0);

    // Svjetlo ostaje u prostoru scene — ono stvara odbljesak na modulima.
    if (lightRef.current) {
      lightRef.current.position.set(Math.cos(t) * 10, 6 + Math.sin(t) * 1.6, Math.sin(t) * 6 + 3);
      // Bez bloom-a na slabijim uredajima prelazak treba jace svjetlo.
      lightRef.current.intensity = 1.2 + front * (simplified ? 4.6 : 3.4);
    }

    const glow = glowRef.current;
    if (!glow) return;

    if (front <= 0.001) {
      glow.visible = false;
      return;
    }

    glow.visible = true;

    // Vodoravno prati kut sunca, okomito opisuje blagi luk pri vrhu kadra.
    sunNdc.set(Math.cos(t) * SUN_SCREEN_X, SUN_SCREEN_Y + Math.sin(t) * 0.1, SUN_DEPTH);
    sunNdc.unproject(state.camera);
    glow.position.copy(sunNdc);
    glow.lookAt(state.camera.position);

    const distance = sunNdc.distanceTo(state.camera.position);
    glow.scale.setScalar(distance * SUN_SIZE);

    const material = glow.material as THREE.MeshBasicMaterial;
    material.opacity = front * (simplified ? 1 : 0.85);
  });

  return (
    <>
      <directionalLight ref={lightRef} intensity={3.6} color="#FFE7AE" castShadow={false} />
      {glowTexture ? (
        <mesh ref={glowRef} renderOrder={-1} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            /* Bez ovoga bi magla scene progutala kolut na toj udaljenosti. */
            fog={false}
            toneMapped={false}
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
