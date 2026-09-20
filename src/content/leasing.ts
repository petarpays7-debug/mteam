/**
 * M-CARS leasing sadrzaj.
 *
 * Svi uvjeti su informativni. Tekstovi su namjerno kvalificirani
 * ("ovisno o odobrenju") i ne smiju se prikazivati kao obvezujuca ponuda.
 */

export const leasingTerms = [
  'Kod odabranih leasing opcija moguće je 0% učešća.',
  'Financiranje bez učešća ovisi o odobrenju leasing društva i konkretnim uvjetima.',
  'Mogućnost otplate do 96 mjeseci, ovisno o godištu i vozilu.',
  'Do 50.000 € moguće je ugovoriti leasing bez učešća, ovisno o odobrenju.',
  'Za vozila iznad 50.000 € potrebno je učešće prema uvjetima leasing društva.',
  'Otkupna vrijednost ovisi o starosti vozila i modelu financiranja.',
];

export const leasingVsLoan =
  'Leasing nije isto što i klasični gotovinski kredit — riječ je o drugačijem obliku financiranja s vlastitim uvjetima, obvezama i načinom obračuna. Detalje vezane uz vaš konkretan slučaj, uključujući utjecaj na zaduženost, provjerite s prodajnim savjetnikom i leasing društvom.';

export type RepaymentRow = { year: string; months: string };

export const repaymentTerms: RepaymentRow[] = [
  { year: 'od 2021. godišta', months: 'do 96 mjeseci' },
  { year: 'od 2020. godišta', months: 'do 84 mjeseca' },
  { year: '2019. godište', months: 'do 72 mjeseca' },
  { year: '2018. godište', months: 'do 60 mjeseci' },
  { year: '2017. godište', months: 'do 48 mjeseci' },
];

export const leasingAvailableFor = [
  'Fizičke osobe',
  'Društva s ograničenom odgovornošću (d.o.o.)',
  'Jednostavna društva s ograničenom odgovornošću (j.d.o.o.)',
  'Obrtnici',
  'OPG-ovi',
  'Samostalni poduzetnici',
];

export const minimumConditions = [
  {
    title: 'Minimalni prihod',
    text: 'Minimalni neopterećeni mjesečni prihod iznosi 650,00 € nakon odbitka postojećih obveza.',
  },
  {
    title: 'Umirovljenici',
    text: 'Na kraju ugovora korisnik ne smije imati više od 78 godina. Po potrebi može biti potreban jamac.',
  },
  {
    title: 'Strani državljani',
    text: 'Potreban je stalni boravak ili zaposlenje u Hrvatskoj, uz uvjete leasing društva i po potrebi bonitetnog jamca.',
  },
  {
    title: 'Pomorci i rad kod stranih poslodavaca',
    text: 'Za pomorce i hrvatske državljane zaposlene kod stranih poslodavaca može biti potreban bonitetni jamac.',
  },
  {
    title: 'Pomorci i naftne platforme',
    text: 'Za pomorce i osobe zaposlene na naftnim platformama navedeno je obavezno minimalno učešće od 20%.',
  },
];

export const eligibleGroups = [
  'Zaposlene osobe',
  'Umirovljenici s tuzemnom ili inozemnom mirovinom',
  'Vlasnici obrta i samostalnih djelatnosti',
  'Poljoprivrednici izvan sustava PDV-a',
  'Fizičke osobe zaposlene u inozemstvu',
  'Izaslani radnici',
  'Udomitelji',
  'Svećenici i drugi vjerski službenici',
  'Nezaposlene osobe uz obaveznog jamca',
  'Zaposleni u veleposlanstvima, konzulatima i predstavništvima stranih poduzeća',
];

export const leasingLegalNotice =
  'Mogućnost leasinga bez učešća, rok otplate, otkupna vrijednost i ostali uvjeti ovise o konkretnom vozilu, leasing društvu i odobrenju financiranja. Informativni uvjeti nisu ponuda za sklapanje ugovora.';

export const carsPrinciples = [
  {
    title: 'Poslovanje',
    text: 'Kvalitetna rabljena vozila, sigurnost, transparentnost i zadovoljstvo kupaca.',
  },
  {
    title: 'Sigurnost',
    text: 'Pažljivo provjerena i uredno servisirana vozila.',
  },
  {
    title: 'Jamstvo',
    text: 'Vozila se prodaju s jamstvom u trajanju od 12 mjeseci.',
  },
];
