import { company } from './company';

/**
 * Pravni tekstovi.
 *
 * Sadržaj opisuje isključivo ono što ova implementacija stvarno radi:
 * koje podatke obrazac prima, tko ih obrađuje i koliko dugo. Ne navode se
 * obrade koje ne postoje (nema analitike, praćenja ni marketinških kolačića).
 *
 * Ako se stranici kasnije doda analitika, oglašavanje ili bilo koji vanjski
 * skript, OBAVEZNO je dopuniti popis primatelja i uvesti traku za privolu.
 */

export const legalUpdated = '20. rujna 2026.';

/** Nadležno nadzorno tijelo u Republici Hrvatskoj. */
export const supervisoryAuthority = {
  name: 'Agencija za zaštitu osobnih podataka (AZOP)',
  address: 'Selska cesta 136, 10000 Zagreb',
  web: 'https://azop.hr',
  email: 'azop@azop.hr',
};

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Tablica: [naziv, svrha, rok] */
  table?: { columns: string[]; rows: string[][] };
};

export const privacySections: LegalSection[] = [
  {
    heading: 'Tko obrađuje vaše podatke',
    paragraphs: [
      `Voditelj obrade osobnih podataka je ${company.legalName}, sa sjedištem na adresi ${company.registeredOffice.street}, ${company.registeredOffice.postalCode} ${company.registeredOffice.city}, ${company.vatIdLabel} ${company.vatId}.`,
      `Za sva pitanja u vezi s obradom osobnih podataka obratite se na ${company.email.display} ili na broj ${company.phone.display}.`,
      'Društvo nije imenovalo službenika za zaštitu podataka jer za to nisu ispunjeni uvjeti iz članka 37. Opće uredbe o zaštiti podataka.',
    ],
  },
  {
    heading: 'Koje podatke prikupljamo i zašto',
    paragraphs: [
      'Podatke prikupljamo samo kada nam ih sami pošaljete putem kontaktnog obrasca, e-pošte ili telefona. Na stranici nema registracije, korisničkih računa ni praćenja ponašanja posjetitelja.',
    ],
    table: {
      columns: ['Podatak', 'Svrha', 'Pravna osnova'],
      rows: [
        [
          'Ime i prezime',
          'Obraćanje pošiljatelju i vođenje komunikacije o upitu',
          'Poduzimanje radnji na zahtjev ispitanika prije sklapanja ugovora (čl. 6. st. 1. t. b GDPR-a)',
        ],
        [
          'E-mail adresa',
          'Slanje odgovora na upit i ponude',
          'Poduzimanje radnji na zahtjev ispitanika prije sklapanja ugovora (čl. 6. st. 1. t. b GDPR-a)',
        ],
        [
          'Sadržaj poruke',
          'Razumijevanje upita i priprema tehničkog prijedloga',
          'Poduzimanje radnji na zahtjev ispitanika prije sklapanja ugovora (čl. 6. st. 1. t. b GDPR-a)',
        ],
        [
          'IP adresa pošiljatelja',
          'Ograničavanje broja uzastopnih slanja obrasca i zaštita od zlouporabe',
          'Legitimni interes zaštite sustava (čl. 6. st. 1. t. f GDPR-a)',
        ],
      ],
    },
  },
  {
    heading: 'Koliko dugo čuvamo podatke',
    list: [
      'Upite koji ne dovedu do poslovnog odnosa čuvamo najdulje 12 mjeseci od zadnje komunikacije, nakon čega ih brišemo.',
      'Ako iz upita nastane ugovorni odnos, podaci se čuvaju u okviru poslovne dokumentacije prema rokovima iz propisa o računovodstvu i poreznih propisa.',
      'IP adresa korištena za ograničavanje slanja obrasca čuva se privremeno, u memoriji poslužitelja, i briše se automatski unutar 10 minuta.',
    ],
  },
  {
    heading: 'Kome se podaci prosljeđuju',
    paragraphs: [
      'Osobne podatke ne prodajemo i ne ustupamo trećima za njihove svrhe. Koristimo sljedeće izvršitelje obrade, isključivo za rad stranice i dostavu poruka:',
    ],
    list: [
      'Cloudflare, Inc. — smještaj (hosting) i isporuka web stranice te izvođenje funkcije koja zaprima obrazac.',
      'Davatelj usluge slanja e-pošte — prosljeđuje poruku iz obrasca na našu adresu. Usluga se aktivira tek kada su postavljeni pristupni podaci; dok nije aktivna, obrazac ne šalje poruku nego vas upućuje na telefon i e-mail.',
    ],
  },
  {
    heading: 'Prijenos izvan Europskog gospodarskog prostora',
    paragraphs: [
      'Navedeni pružatelji usluga mogu podatke obrađivati i na poslužiteljima izvan Europskog gospodarskog prostora. U tom slučaju prijenos se temelji na standardnim ugovornim klauzulama Europske komisije ili drugom odgovarajućem mehanizmu iz poglavlja V. Opće uredbe o zaštiti podataka.',
    ],
  },
  {
    heading: 'Vaša prava',
    paragraphs: ['U odnosu na svoje osobne podatke imate pravo:'],
    list: [
      'zatražiti pristup podacima i kopiju podataka koje o vama obrađujemo,',
      'zatražiti ispravak netočnih ili dopunu nepotpunih podataka,',
      'zatražiti brisanje podataka kada za njihovu obradu više ne postoji svrha,',
      'zatražiti ograničenje obrade,',
      'uložiti prigovor na obradu koja se temelji na legitimnom interesu,',
      'zatražiti prenosivost podataka koje ste nam sami dostavili,',
      'podnijeti pritužbu nadzornom tijelu.',
    ],
  },
  {
    heading: 'Kako ostvariti svoja prava',
    paragraphs: [
      `Zahtjev pošaljite na ${company.email.display}. Odgovaramo bez odgode, a najkasnije u roku od mjesec dana od zaprimanja zahtjeva. Ostvarivanje prava je besplatno.`,
      `Ako smatrate da obrađujemo vaše podatke protivno propisima, pritužbu možete podnijeti nadzornom tijelu: ${supervisoryAuthority.name}, ${supervisoryAuthority.address}, ${supervisoryAuthority.email}.`,
    ],
  },
  {
    heading: 'Sigurnost',
    list: [
      'Stranica se poslužuje isključivo preko šifrirane HTTPS veze.',
      'Obrazac se provjerava i na uređaju posjetitelja i na poslužitelju, uz ograničenje broja uzastopnih slanja.',
      'Pristup zaprimljenim upitima imaju samo osobe kojima je to potrebno za obradu upita.',
    ],
  },
  {
    heading: 'Automatizirano odlučivanje',
    paragraphs: [
      'Ne provodimo automatizirano donošenje odluka niti izradu profila u smislu članka 22. Opće uredbe o zaštiti podataka.',
    ],
  },
  {
    heading: 'Izmjene ove izjave',
    paragraphs: [
      'Izjavu ažuriramo kada se promijeni način obrade podataka ili kada to zahtijevaju propisi. Datum posljednje izmjene naveden je na dnu stranice.',
    ],
  },
];

export const cookieSections: LegalSection[] = [
  {
    heading: 'Stanje na ovoj stranici',
    paragraphs: [
      'Ova web stranica ne postavlja kolačiće za analitiku, oglašavanje, profiliranje ni praćenje posjetitelja. Ne koristimo Google Analytics, Meta Pixel niti bilo koji sličan alat.',
      'Zbog toga se ne prikazuje traka za privolu — prema Zakonu o elektroničkim komunikacijama privola je potrebna samo za pohranu podataka koja nije nužna za pružanje usluge koju ste izričito zatražili.',
    ],
  },
  {
    heading: 'Što se ipak pohranjuje',
    table: {
      columns: ['Vrsta', 'Svrha', 'Trajanje'],
      rows: [
        [
          'Tehnički zapisi poslužitelja',
          'Osnovna sigurnost i ograničavanje broja slanja obrasca. Nisu kolačići i ne pohranjuju se u vašem pregledniku.',
          'Do 10 minuta',
        ],
        [
          'Predmemorija statičkih datoteka',
          'Brže učitavanje slika, stilova i skripti pri ponovnom posjetu. Standardni mehanizam preglednika, bez identifikatora.',
          'Prema zaglavljima predmemorije',
        ],
      ],
    },
  },
  {
    heading: 'Vanjski sadržaj',
    list: [
      'Tipografija je ugrađena u samu stranicu tijekom izrade, pa se pri posjetu ne šalje nijedan zahtjev prema Google Fontsu ni drugim vanjskim poslužiteljima.',
      'Na stranici nema ugrađenih videozapisa, karata ni društvenih dodataka koji bi mogli postavljati kolačiće trećih strana.',
      'Poveznica na ponudu vozila vodi na vanjski oglasnik, koji ima vlastita pravila o kolačićima. Ona vrijede tek nakon što otvorite tu stranicu.',
    ],
  },
  {
    heading: 'Upravljanje kolačićima u pregledniku',
    paragraphs: [
      'Postavke kolačića i pohranjenih podataka možete u svakom trenutku promijeniti u vlastitom pregledniku, uključujući brisanje već pohranjenih podataka i blokiranje novih. Rad ove stranice time neće biti narušen.',
    ],
  },
  {
    heading: 'Ako se uvede analitika',
    paragraphs: [
      'Prije uvođenja bilo kojeg alata za analitiku ili oglašavanje na stranicu će se dodati obavijest s mogućnošću davanja i povlačenja privole, a ovaj popis bit će dopunjen nazivom, svrhom i trajanjem svakog pojedinog kolačića.',
    ],
  },
];
