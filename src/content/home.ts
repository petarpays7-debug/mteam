import type { IconName } from './services';

export type WorldId = 'solar' | 'cars' | 'mount';

export type World = {
  id: WorldId;
  eyebrow: string;
  title: string;
  claim: string;
  description: string;
  href: string;
  accent: 'solar' | 'cars' | 'mount';
  icon: IconName;
};

export const worlds: World[] = [
  {
    id: 'solar',
    eyebrow: 'Energija',
    title: 'Solarne elektrane',
    claim: 'Energija pod vašom kontrolom.',
    description:
      'Fotonaponski sustavi po principu ključ u ruke — analiza, projektiranje, montaža i puštanje u pogon.',
    href: '/usluge',
    accent: 'solar',
    icon: 'sun',
  },
  {
    id: 'cars',
    eyebrow: 'Mobilnost',
    title: 'M-CARS',
    claim: 'Kvaliteta koju vidiš. Sigurnost koju osjetiš.',
    description:
      'Pažljivo odabrana rabljena vozila s jamstvom, transparentnom kupnjom i mogućnošću leasinga.',
    href: '/mobilnost',
    accent: 'cars',
    icon: 'car',
  },
  {
    id: 'mount',
    eyebrow: 'Konstrukcije',
    title: 'MT Mount by Enerack',
    claim: 'Konstrukcije koje nose energiju budućnosti.',
    description:
      'Nosači i montažni sustavi za kose, limene i ravne krovove, ground mount, carporte i solarne ograde.',
    href: '/mt-mount',
    accent: 'mount',
    icon: 'frame',
  },
];

export const heroStats = [
  { value: 'od 2017.', label: 'Iskustvo', detail: 'M-Team posluje od 2017. godine.' },
  { value: 'do 70%', label: 'Manji računi', detail: 'Ovisno o potrošnji i veličini sustava.' },
  { value: '5–8 god.', label: 'Povrat investicije', detail: 'Ovisno o konkretnom projektu.' },
];

export const heroDisclaimer =
  'Navedene uštede i rokovi povrata su okvirni. Stvarni rezultat ovisi o potrošnji, lokaciji, veličini sustava i uvjetima konkretnog projekta.';

export const processSteps = [
  {
    step: '01',
    title: 'Besplatna analiza',
    text: 'Pregledavamo lokaciju, potrošnju i tehničke mogućnosti objekta te utvrđujemo je li sustav izvediv.',
  },
  {
    step: '02',
    title: 'Izrada rješenja',
    text: 'Dimenzioniramo sustav, biramo opremu i pripremamo projektnu te tehničku dokumentaciju.',
  },
  {
    step: '03',
    title: 'Instalacija',
    text: 'Preuzimamo nabavu opreme, montažu konstrukcije i modula te izvedbu elektroinstalacija.',
  },
  {
    step: '04',
    title: 'Proizvodnja energije',
    text: 'Elektrana se pušta u pogon, a mi ostajemo dostupni za nadzor, optimizaciju i podršku.',
  },
];

export const solarBenefits = [
  { title: 'Do 70% manji računi', text: 'Vlastita proizvodnja smanjuje ovisnost o cijeni iz mreže.' },
  { title: 'Povrat investicije 5–8 godina', text: 'Okvirni raspon koji ovisi o projektu i potrošnji.' },
  { title: 'Dugoročna stabilnost', text: 'Predvidljiviji troškovi energije kroz duži niz godina.' },
  { title: 'Kompletna usluga', text: 'Jedan partner od analize do puštanja u pogon.' },
  { title: 'Podrška nakon instalacije', text: 'Nadzor, optimizacija i tehnička pomoć i nakon predaje.' },
];

/** Cinjenice bez izmisljenih logotipa, brojeva i referenci. */
export const trustPoints = [
  { title: 'Iskustvo od 2017.', text: 'Tvrtka posluje u području obnovljivih izvora energije od osnutka.' },
  { title: 'Provjerena oprema', text: 'Distribuiramo i ugrađujemo opremu provjerenih proizvođača.' },
  { title: 'Individualni pristup', text: 'Rješenje se dimenzionira prema stvarnim potrebama objekta.' },
  {
    title: 'Projektiranje, izvedba i distribucija',
    text: 'Pokrivamo tehnički i izvedbeni dio te opskrbu opremom.',
  },
  { title: 'Tehnička podrška', text: 'Dostupni smo i nakon puštanja elektrane u pogon.' },
  {
    title: 'Sigurno priključenje na mrežu',
    text: 'Elaborati i dokumentacija za pravilno priključenje na elektroenergetsku mrežu.',
  },
];
