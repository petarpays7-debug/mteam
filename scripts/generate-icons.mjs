/*
  Generira favicon i ikone aplikacije iz `public/icon.svg`.

  SVG je izvor istine za znak; ostale inacice postoje samo zato sto ih neki
  klijenti jos uvijek traze:
  - `favicon.ico` — alati i citaci koji traze iskljucivo taj put,
  - `apple-touch-icon.png` — iOS ne prikazuje SVG na pocetnom zaslonu,
  - `icon-192.png` / `icon-512.png` — manifest aplikacije.

  Pokretanje: `npm run icons`.
*/
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const PUBLIC = join(process.cwd(), 'public');
const source = await readFile(join(PUBLIC, 'icon.svg'));

const render = (size) => sharp(source, { density: 384 }).resize(size, size).png().toBuffer();

/**
 * ICO zapis s jednim PNG zapisom.
 *
 * Format dopusta da sadrzaj bude PNG umjesto BMP-a, sto podrzavaju svi
 * danasnji preglednici — zaglavlje je zato svega 22 bajta.
 */
function ico(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // rezervirano
  header.writeUInt16LE(1, 2); // tip: ikona
  header.writeUInt16LE(1, 4); // broj slika

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // sirina (0 znaci 256)
  entry.writeUInt8(size === 256 ? 0 : size, 1); // visina
  entry.writeUInt8(0, 2); // broj boja u paleti
  entry.writeUInt8(0, 3); // rezervirano
  entry.writeUInt16LE(1, 4); // ravnine boja
  entry.writeUInt16LE(32, 6); // bitova po pikselu
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

const [ico32, apple, icon192, icon512] = await Promise.all([
  render(32),
  render(180),
  render(192),
  render(512),
]);

await Promise.all([
  writeFile(join(PUBLIC, 'favicon.ico'), ico(ico32, 32)),
  writeFile(join(PUBLIC, 'apple-touch-icon.png'), apple),
  writeFile(join(PUBLIC, 'icon-192.png'), icon192),
  writeFile(join(PUBLIC, 'icon-512.png'), icon512),
]);

console.log('Ikone su generirane u public/.');
