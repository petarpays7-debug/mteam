export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

/** Glavna navigacija - URL-ovi namjerno prate postojecu strukturu stranice. */
export const mainNav: NavItem[] = [
  { label: 'Početna', href: '/', description: 'Solarna energija, mobilnost i konstrukcije' },
  { label: 'O nama', href: '/o-nama', description: 'Tko smo i kako radimo' },
  { label: 'Usluge', href: '/usluge', description: 'Projektiranje, izvedba, elaborati' },
  { label: 'M-CARS', href: '/mobilnost', description: 'Rabljena vozila i leasing' },
  { label: 'MT Mount', href: '/mt-mount', description: 'Solarne konstrukcije i nosači' },
  { label: 'Kontakt', href: '/kontakt', description: 'Upit, telefon i lokacija' },
];

export const legalNav: NavItem[] = [
  { label: 'Privatnost', href: '/privatnost' },
  { label: 'Kolačići', href: '/kolacici' },
];
