/**
 * Jedinstveni izvor istine za sve poslovne podatke M-Team d.o.o.
 *
 * VAZNO: prije produkcijskog objavljivanja provjeriti i po potrebi ispraviti
 * vrijednosti u ovoj datoteci. Sve stranice, footer, strukturirani podaci
 * i kontaktne akcije citaju iskljucivo odavde.
 */

export const company = {
  legalName: 'M-Team d.o.o.',
  shortName: 'M-Team',
  foundedYear: 2017,
  tagline: 'Energija. Mobilnost. Bez kompromisa.',
  heroClaim: 'Pretvaramo sunce u vašu energiju!',

  /**
   * OIB prema sudskom registru. Kontrolna znamenka je provjerena
   * (ISO 7064, MOD 11,10) i ispravna.
   *
   * Napomena: ranija vrijednost "H10707184811" bila je tipfeler i pojavljuje se
   * jos uvijek na staroj web stranici - nije valjan OIB jer sadrzi slovo.
   */
  vatId: '10707184811',
  vatIdLabel: 'OIB',

  /** Maticni broj subjekta iz registra. */
  companyNumber: '04705050',
  companyNumberLabel: 'MB',

  /** Pretezita djelatnost prema NKD klasifikaciji. */
  activity: {
    code: '46710',
    name: 'Trgovina na veliko motornim vozilima',
  },

  /**
   * Adresa za kontakt i posjete - onako kako je navedena na postojecoj
   * stranici i u narudzbi.
   */
  address: {
    street: 'Osječka 188',
    postalCode: '31431',
    city: 'Čepin',
    country: 'Hrvatska',
    countryCode: 'HR',
  },

  /**
   * Sjediste prema sudskom registru. Razlikuje se od adrese za kontakt,
   * pa se u pravnim tekstovima navodi ovo, a u kontaktu gornja adresa.
   *
   * PROVJERITI PRIJE OBJAVE: ako je tvrtka preselila, uskladiti obje adrese.
   */
  registeredOffice: {
    street: 'Kralja Tomislava 110',
    postalCode: '31431',
    city: 'Čepin',
    country: 'Hrvatska',
  },

  phone: {
    display: '+385 98 963 0165',
    href: 'tel:+385989630165',
  },

  email: {
    display: 'info@m-team.hr',
    href: 'mailto:info@m-team.hr',
  },

  /** Vanjska ponuda rabljenih vozila (M-CARS). */
  carsListingUrl: 'https://www.njuskalo.hr/trgovina/dm-auto',

  /** Proizvodac solarnih konstrukcija koje M-Team distribuira. */
  mountManufacturer: 'Enerack',
} as const;

/**
 * Podaci iz sudskog registra koje Zakon o trgovackim drustvima (cl. 21.)
 * trazi na web stranici drustva, uz tvrtku i sjediste.
 *
 * PRIJE OBJAVE: popuniti prazna polja. Ono sto ostane prazno NE prikazuje se
 * na stranici — izostavljen podatak je bolji od izmisljenog, a stranica ostaje
 * upotrebljiva dok se podaci ne dobiju.
 */
export type CompanyRegistry = {
  /** Trgovacki sud kod kojeg je drustvo upisano, npr. 'Trgovacki sud u Osijeku'. */
  court: string;
  /** MBS — maticni broj subjekta iz sudskog registra. */
  courtNumber: string;
  /** Iznos temeljnog kapitala s valutom, npr. '20.000,00 EUR'. */
  shareCapital: string;
  /** Je li temeljni kapital uplacen u cijelosti. */
  shareCapitalPaidInFull: boolean;
  /** Clanovi uprave — prezime i najmanje pocetno slovo imena. */
  boardMembers: string[];
  /** Banke kod kojih se vode racuni i pripadajuci IBAN-i. */
  bankAccounts: Array<{ bank: string; iban: string }>;
};

export const companyRegistry: CompanyRegistry = {
  court: '',
  courtNumber: '',
  shareCapital: '',
  shareCapitalPaidInFull: true,
  boardMembers: [],
  bankAccounts: [],
};

/** Ima li dovoljno podataka da se sudski registar uopce prikaze. */
export const hasRegistryData =
  companyRegistry.court !== '' ||
  companyRegistry.courtNumber !== '' ||
  companyRegistry.shareCapital !== '' ||
  companyRegistry.boardMembers.length > 0 ||
  companyRegistry.bankAccounts.length > 0;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.m-team.hr';

export const currentYear = new Date().getFullYear();

export const formattedAddress = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;
