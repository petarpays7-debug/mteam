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
   * OIB je unesen tocno onako kako je dostavljen od strane narucitelja.
   * Napomena za odrzavanje: standardni hrvatski OIB je 11 znamenki bez slova.
   * Ako je dostavljena vrijednost tipfeler, ispravite je ovdje - mijenja se
   * na svim mjestima u aplikaciji.
   */
  vatId: 'H10707184811',
  vatIdLabel: 'OIB',

  address: {
    street: 'Osječka 188',
    postalCode: '31431',
    city: 'Čepin',
    country: 'Hrvatska',
    countryCode: 'HR',
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

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.m-team.hr';

export const currentYear = new Date().getFullYear();

export const formattedAddress = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;
