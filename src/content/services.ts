export type Service = {
  slug: string;
  title: string;
  summary: string;
  points: string[];
  icon: IconName;
};

export type IconName =
  | 'sun'
  | 'blueprint'
  | 'shield'
  | 'package'
  | 'compass'
  | 'document'
  | 'bolt'
  | 'car'
  | 'frame';

export const services: Service[] = [
  {
    slug: 'solarne-elektrane',
    title: 'Solarne elektrane ključ u ruke',
    summary:
      'Preuzimamo cijeli proces izgradnje fotonaponskog sustava — od analize lokacije do puštanja elektrane u pogon.',
    points: [
      'Analiza lokacije i potrošnje',
      'Dimenzioniranje sustava',
      'Montaža i puštanje u pogon',
    ],
    icon: 'sun',
  },
  {
    slug: 'projektiranje',
    title: 'Projektiranje i tehnička dokumentacija',
    summary:
      'Izrada projektne i tehničke dokumentacije potrebne za ishođenje dozvola i priključenje sustava na mrežu.',
    points: ['Glavni i izvedbeni projekt', 'Tehnički opisi i sheme', 'Priprema za administraciju'],
    icon: 'blueprint',
  },
  {
    slug: 'inzenjering-i-nadzor',
    title: 'Inženjering i stručni nadzor',
    summary:
      'Vođenje i nadzor radova kako bi izvedba odgovarala projektu, propisima i pravilima struke.',
    points: ['Nadzor nad izvedbom', 'Kontrola kvalitete ugradnje', 'Koordinacija izvođača'],
    icon: 'shield',
  },
  {
    slug: 'distribucija-opreme',
    title: 'Distribucija solarne opreme',
    summary:
      'Isporuka fotonaponskih modula, invertera, konstrukcija i prateće električne opreme za instalatere i investitore.',
    points: ['Fotonaponski moduli', 'Inverteri i električna oprema', 'Konstrukcije i montažni pribor'],
    icon: 'package',
  },
  {
    slug: 'tehnicko-savjetovanje',
    title: 'Tehničko savjetovanje',
    summary:
      'Savjetovanje pri odabiru tehničkog rješenja, opreme i načina priključenja prema stvarnim potrebama objekta.',
    points: ['Odabir opreme', 'Provjera tehničkih ograničenja', 'Podrška u odlučivanju'],
    icon: 'compass',
  },
  {
    slug: 'elektroenergetski-elaborati',
    title: 'Elektroenergetski elaborati',
    summary:
      'Izrada elaborata potrebnih za sigurno i pravilno priključenje elektrane na elektroenergetsku mrežu.',
    points: ['EUEM, EPZ, EMP', 'EOTRP i OPIP', 'Ovlaštena pravna osoba HEP ODS-a'],
    icon: 'document',
  },
];

export type Elaborate = {
  abbr: string;
  title: string;
  description: string;
};

export const elaborates: Elaborate[] = [
  {
    abbr: 'EUEM',
    title: 'Elaborat utjecaja elektrane na mrežu',
    description:
      'Analiza utjecaja planirane elektrane na distribucijsku mrežu i uvjete rada postojećih potrošača.',
  },
  {
    abbr: 'EPZ',
    title: 'Elaborat podešenja zaštite',
    description:
      'Definiranje parametara zaštitnih uređaja kako bi elektrana radila usklađeno sa zaštitom mreže.',
  },
  {
    abbr: 'EMP',
    title: 'Elaborat mogućnosti priključenja',
    description:
      'Provjera tehničkih mogućnosti priključenja elektrane na postojeću elektroenergetsku mrežu.',
  },
  {
    abbr: 'EOTRP',
    title: 'Elaborat optimalnog tehničkog rješenja priključenja',
    description:
      'Usporedba i odabir tehnički najprikladnijeg rješenja priključenja za konkretnu lokaciju.',
  },
  {
    abbr: 'OPIP',
    title: 'Operativni plan i program ispitivanja u pokusnom radu',
    description:
      'Plan i program ispitivanja koja se provode tijekom pokusnog rada prije redovnog pogona.',
  },
];

/** Potvrdjena kvalifikacija - ne dodavati brojeve rjesenja koji nisu dostavljeni. */
export const hepAuthorisation =
  'M-Team d.o.o. ovlaštena je pravna osoba od strane HEP ODS-a za izradu elektroenergetskih elaborata.';
