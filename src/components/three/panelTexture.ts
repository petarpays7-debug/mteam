import * as THREE from 'three';

/**
 * Proceduralna tekstura fotonaponskog modula.
 *
 * Bez nje su moduli obicne plave plocice. Ovako dobivaju ono po cemu se modul
 * prepoznaje: mrezu celija, tanke razmake izmedu njih, sabirnice preko celija
 * i zakosene uglove monokristalnih celija.
 *
 * Tekstura nosi SAMO mnozitelj svjetline (sivi tonovi): 1.0 je puna celija,
 * oko 0.3 razmak izmedu celija, a sabirnice su svjetlije od celije. Boja modula
 * i dalje dolazi iz boje po instanci, pa se ista tekstura koristi i za tamnije
 * module na konstrukciji i za plocice na karoseriji vozila.
 *
 * Aluminijski okvir se NE crta ovdje — racuna se u shaderu iz UV koordinata,
 * pa je uvijek jednako debeo bez obzira na velicinu plocice.
 */

/** Omjer priblizno odgovara stvarnom modulu (oko 1.65 : 1). */
const WIDTH = 660;
const HEIGHT = 400;

const CELL_COLS = 10;
const CELL_ROWS = 6;

/** Prazan rub teksture — tu u shaderu dolazi okvir. */
const MARGIN = 16;
/** Razmak izmedu celija. */
const GAP = 5;
/** Zakoseni ugao monokristalne celije. */
const CHAMFER = 9;

const BACKSHEET = 0.26;
const CELL_TOP = 1.0;
const CELL_BOTTOM = 0.82;
const BUSBAR = 1.28;
const FINGER = 1.1;

function grey(value: number): string {
  const v = Math.max(0, Math.min(255, Math.round(value * 255)));
  return `rgb(${v},${v},${v})`;
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + CHAMFER, y);
  ctx.lineTo(x + w - CHAMFER, y);
  ctx.lineTo(x + w, y + CHAMFER);
  ctx.lineTo(x + w, y + h - CHAMFER);
  ctx.lineTo(x + w - CHAMFER, y + h);
  ctx.lineTo(x + CHAMFER, y + h);
  ctx.lineTo(x, y + h - CHAMFER);
  ctx.lineTo(x, y + CHAMFER);
  ctx.closePath();

  // Blagi okomiti prijelaz — celija nije posve ravnomjerna.
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, grey(CELL_TOP));
  grad.addColorStop(1, grey(CELL_BOTTOM));
  ctx.fillStyle = grad;
  ctx.fill();

  // Tanki prsti okomiti na sabirnice.
  ctx.fillStyle = grey(FINGER);
  for (let f = 1; f < 13; f += 1) {
    ctx.fillRect(x + 3, y + (h * f) / 13, w - 6, 1);
  }

  // Tri sabirnice preko celije.
  ctx.fillStyle = grey(BUSBAR);
  for (let b = 1; b <= 3; b += 1) {
    ctx.fillRect(x + (w * b) / 4 - 1.5, y + 2, 3, h - 4);
  }
}

let cached: THREE.CanvasTexture | null = null;

export function getPanelTexture(): THREE.CanvasTexture | null {
  if (cached) return cached;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = grey(BACKSHEET);
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const innerW = WIDTH - MARGIN * 2;
  const innerH = HEIGHT - MARGIN * 2;
  const cellW = (innerW - GAP * (CELL_COLS - 1)) / CELL_COLS;
  const cellH = (innerH - GAP * (CELL_ROWS - 1)) / CELL_ROWS;

  for (let r = 0; r < CELL_ROWS; r += 1) {
    for (let c = 0; c < CELL_COLS; c += 1) {
      paintCell(ctx, MARGIN + c * (cellW + GAP), MARGIN + r * (cellH + GAP), cellW, cellH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  cached = texture;
  return texture;
}

let cachedColor: THREE.CanvasTexture | null = null;

/**
 * Ista tekstura, ali pripremljena kao obicna mapa boje (`map`).
 *
 * Hero je uzorkuje rucno u shaderu, pa joj tamo treba `NoColorSpace`. Kada se
 * koristi kao `map` na standardnom materijalu, three ocekuje sRGB — inace
 * modul ispadne ispran. Zato posebna kopija; platno se dijeli, ne crta dvaput.
 */
export function getPanelColorTexture(): THREE.CanvasTexture | null {
  if (cachedColor) return cachedColor;

  const base = getPanelTexture();
  if (!base) return null;

  const texture = base.clone();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  cachedColor = texture;
  return texture;
}
