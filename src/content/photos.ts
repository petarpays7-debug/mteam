/**
 * Fotografije preuzete s postojeće stranice m-team.hr.
 *
 * Većina su vlastite fotografije M-Teamovih izvedbi (krovne i zemljane
 * elektrane, carport, montaža u tijeku). Nekoliko ih je stock materijal koji
 * se već koristi na postojećoj stranici.
 *
 * Datoteke su unaprijed pretvorene u WebP u dvije širine i stoje u
 * `public/slike/`. Uz statički export nema optimizacije u runtimeu.
 *
 * PRIJE OBJAVE: potvrditi da M-Team ima pravo korištenja svake fotografije,
 * posebno onih označenih kao `stock`.
 */

export type Photo = {
  /** Osnovni naziv datoteke bez ekstenzije i bez oznake širine. */
  src: string;
  /** Uža inačica za kartice i uske stupce. */
  small: string;
  alt: string;
  /** Stvarna širina izvozne datoteke — ne izvorne fotografije. */
  width: number;
  height: number;
  /** Stvarna širina uže inačice; ide u `srcset` kao `w` deskriptor. */
  smallWidth: number;
  origin: 'vlastita' | 'stock';
};

export const photos = {
  elektranaIzZraka: {
    src: '/slike/elektrana-iz-zraka.webp',
    small: '/slike/elektrana-iz-zraka-900.webp',
    alt: 'Solarna elektrana na zemlji snimljena iz zraka — tri duga reda fotonaponskih modula uz poljski put.',
    width: 1600,
    height: 903,
    smallWidth: 900,
    origin: 'vlastita',
  },
  kosiKrov: {
    src: '/slike/kosi-krov.webp',
    small: '/slike/kosi-krov-900.webp',
    alt: 'Fotonaponski moduli postavljeni na kosi krov pokriven crijepom, uz dimnjak.',
    width: 1440,
    height: 816,
    smallWidth: 900,
    origin: 'vlastita',
  },
  ravniKrovMontaza: {
    src: '/slike/ravni-krov-montaza.webp',
    small: '/slike/ravni-krov-montaza-900.webp',
    alt: 'Dvojica montera postavljaju module na balastnu konstrukciju na ravnom krovu.',
    width: 1600,
    height: 1200,
    smallWidth: 900,
    origin: 'vlastita',
  },
  limeniKrov: {
    src: '/slike/limeni-krov.webp',
    small: '/slike/limeni-krov-900.webp',
    alt: 'Dovršeno polje fotonaponskih modula na limenom krovu poslovne zgrade.',
    width: 1200,
    height: 1600,
    smallWidth: 900,
    origin: 'vlastita',
  },
  carport: {
    src: '/slike/carport-mcars.webp',
    small: '/slike/carport-mcars-1000.webp',
    alt: 'Solarni carport iz zraka — niz vozila M-CARS parkiran pod aluminijskom konstrukcijom s modulima.',
    width: 1600,
    height: 900,
    smallWidth: 1000,
    origin: 'vlastita',
  },
  solarnaOgrada: {
    src: '/slike/solarna-ograda.webp',
    small: '/slike/solarna-ograda-800.webp',
    alt: 'Prikaz sustava solarne ograde s okomito postavljenim bifacijalnim modulima.',
    width: 1400,
    height: 368,
    smallWidth: 800,
    origin: 'vlastita',
  },
  pregledVozila: {
    src: '/slike/pregled-vozila.webp',
    small: '/slike/pregled-vozila-800.webp',
    alt: 'Serviser s podignutim poklopcem motora upisuje nalaz pregleda vozila.',
    width: 1400,
    height: 787,
    smallWidth: 800,
    origin: 'stock',
  },
  primopredajaVozila: {
    src: '/slike/primopredaja-vozila.webp',
    small: '/slike/primopredaja-vozila-800.webp',
    alt: 'Prodajni savjetnik i kupac rukuju se pri primopredaji ključeva vozila u salonu.',
    width: 1400,
    height: 933,
    smallWidth: 800,
    origin: 'stock',
  },
  inverterOprema: {
    src: '/slike/inverter-oprema.webp',
    small: '/slike/inverter-oprema-800.webp',
    alt: 'Inverter i razvodna oprema fotonaponskog sustava montirani na zid.',
    width: 1400,
    height: 1050,
    smallWidth: 800,
    origin: 'stock',
  },
  montazaDetalj: {
    src: '/slike/montaza-detalj.webp',
    small: '/slike/montaza-detalj-800.webp',
    alt: 'Detalj montaže fotonaponskog modula na nosivu konstrukciju.',
    width: 1400,
    height: 1050,
    smallWidth: 800,
    origin: 'stock',
  },
} satisfies Record<string, Photo>;

/** Odabir za sekciju izvedenih radova na naslovnici. */
export const workGallery: Array<{ photo: Photo; caption: string; tag: string }> = [
  {
    photo: photos.elektranaIzZraka,
    caption: 'Elektrana na zemlji, ground mount konstrukcija',
    tag: 'Ground mount',
  },
  {
    photo: photos.carport,
    caption: 'Solarni carport nad parkiralištem vozila',
    tag: 'Carport',
  },
  {
    photo: photos.ravniKrovMontaza,
    caption: 'Montaža balastnog sustava na ravnom krovu',
    tag: 'Ravni krov',
  },
  {
    photo: photos.kosiKrov,
    caption: 'Moduli na kosom krovu s crijepom',
    tag: 'Kosi krov',
  },
  {
    photo: photos.limeniKrov,
    caption: 'Polje modula na limenom krovu poslovnog objekta',
    tag: 'Limeni krov',
  },
];
