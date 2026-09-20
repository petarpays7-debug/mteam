export type MountCategory = {
  slug: string;
  title: string;
  short: string;
  points: string[];
};

export const mountCategories: MountCategory[] = [
  {
    slug: 'kosi-krov',
    title: 'Konstrukcije za kosi krov',
    short: 'Za crijep, biber crijep, šindru i slične pokrove.',
    points: [
      'Za crijep, biber crijep, šindru i slične pokrove',
      'Brza instalacija',
      'Minimalno opterećenje krova',
      'Otpornost na vjetar i snijeg',
    ],
  },
  {
    slug: 'limeni-krov',
    title: 'Konstrukcije za limeni krov',
    short: 'Trapezni i falcani lim, uz minimalno bušenje.',
    points: [
      'Trapezni i falcani lim',
      'Minimalno bušenje krova',
      'Pogodno za industrijske objekte',
      'Otpornost na koroziju',
    ],
  },
  {
    slug: 'ravni-krov',
    title: 'Konstrukcije za ravni krov',
    short: 'Balastni i fiksni sustavi bez oštećenja hidroizolacije.',
    points: [
      'Balastni i fiksni sustavi',
      'Bez oštećenja hidroizolacije',
      'Optimiziran kut nagiba',
      'Fleksibilnost za različite objekte',
    ],
  },
  {
    slug: 'ground-mount',
    title: 'Ground mount sustavi',
    short: 'Za velike projekte i solarne parkove.',
    points: [
      'Za velike projekte i solarne parkove',
      'Stabilna konstrukcija',
      'Prilagodba terenu',
      'Dug vijek trajanja',
    ],
  },
  {
    slug: 'carport',
    title: 'Solarni carporti',
    short: 'Zaštita vozila uz istovremenu proizvodnju energije.',
    points: [
      'Zaštita vozila i proizvodnja energije',
      'Za tvrtke i privatne objekte',
      'Mogućnost integracije EV punionica',
      'Moderan dizajn',
    ],
  },
  {
    slug: 'solar-fence',
    title: 'Solarne ograde',
    short: 'Vertikalni paneli u dvostrukoj funkciji.',
    points: [
      'Vertikalno postavljeni paneli',
      'Dvostruka funkcija: ograda i proizvodnja energije',
      'Za kuće, tvrtke i poljoprivredne objekte',
      'Mogućnost bifacijalnih panela',
      'Optimalno za istok-zapad orijentaciju',
    ],
  },
];

export const mountAdvantages = [
  { title: 'Provjeren proizvođač', text: 'Konstrukcije proizvodi Enerack.' },
  { title: 'Lokalna dostupnost', text: 'Dostupnost i podrška na domaćem tržištu.' },
  { title: 'Brza isporuka', text: 'Brza isporuka i tehnička pomoć.' },
  { title: 'Jednostavna montaža', text: 'Jednostavna i brza montaža na objektu.' },
  { title: 'Omjer cijene i kvalitete', text: 'Optimalan omjer cijene i kvalitete.' },
];
