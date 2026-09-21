import { company } from './company';

/**
 * Česta pitanja.
 *
 * Svaki odgovor se oslanja isključivo na podatke koje je naručitelj dostavio —
 * nema izmišljenih rokova, cijena, kapaciteta ni referenci. Brojčane tvrdnje
 * zadržavaju iste ograde kao i na ostatku stranice.
 *
 * Sadržaj se prikazuje na stranici i istovremeno se koristi za FAQPage
 * strukturirane podatke. Mora ostati identičan na oba mjesta — Google
 * odbacuje označavanje koje ne odgovara vidljivom tekstu.
 */

export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: 'Što obuhvaća solarna elektrana „ključ u ruke”?',
    answer:
      'Preuzimamo cijeli proces: analizu lokacije i potrošnje, projektiranje i tehničku dokumentaciju, dozvole i administraciju, nabavu opreme, montažu konstrukcije i modula, izvedbu elektroinstalacija te puštanje elektrane u pogon. Nakon predaje ostajemo dostupni za nadzor, optimizaciju i tehničku podršku.',
  },
  {
    question: 'Koje elektroenergetske elaborate izrađujete?',
    answer:
      'Izrađujemo EUEM (elaborat utjecaja elektrane na mrežu), EPZ (elaborat podešenja zaštite), EMP (elaborat mogućnosti priključenja), EOTRP (elaborat optimalnog tehničkog rješenja priključenja) i OPIP (operativni plan i program ispitivanja u pokusnom radu). M-Team d.o.o. ovlaštena je pravna osoba od strane HEP ODS-a za izradu elektroenergetskih elaborata.',
  },
  {
    question: 'Koliko se mogu smanjiti računi za električnu energiju?',
    answer:
      'Vlastita proizvodnja može smanjiti račune do 70%. Stvarni iznos ovisi o potrošnji, lokaciji, veličini sustava i uvjetima konkretnog projekta, pa se utvrđuje tek nakon analize.',
  },
  {
    question: 'Koliki je povrat investicije?',
    answer:
      'Okvirni raspon je 5 do 8 godina. Kao i ušteda, povrat ovisi o konkretnom projektu — potrošnji, lokaciji i veličini sustava — pa ga ne treba shvatiti kao zajamčenu vrijednost.',
  },
  {
    question: 'Možete li izraditi samo projekt ili samo elaborat?',
    answer:
      'Da. Usluge su modularne, pa nas možete angažirati za cjelovitu izvedbu ili samo za jednu fazu — projektiranje, tehničku dokumentaciju, elaborat, stručni nadzor ili isporuku opreme.',
  },
  {
    question: 'Isporučujete li opremu drugim izvođačima i investitorima?',
    answer:
      'Da. Distribuiramo fotonaponske module, invertere, konstrukcije i montažne sustave te električnu opremu i prateće komponente, neovisno o tome izvodimo li mi sami instalaciju.',
  },
  {
    question: 'Za koje tipove krova i terena izrađujete konstrukcije?',
    answer:
      'MT Mount by Enerack pokriva kosi krov, limeni krov, ravni krov, ground mount sustave za veće projekte, solarne carporte i solarne ograde. M-Team djeluje kao službeni distributer, dok je Enerack proizvođač konstrukcija.',
  },
  {
    question: 'Je li kod M-CARS vozila moguć leasing bez učešća?',
    answer:
      'Kod odabranih leasing opcija moguće je 0% učešća, a do 50.000 € moguće je ugovoriti leasing bez učešća. Sve ovisi o odobrenju leasing društva i konkretnom vozilu; za iznose iznad 50.000 € potrebno je učešće prema uvjetima leasing društva. Informativni uvjeti nisu ponuda za sklapanje ugovora.',
  },
  {
    question: 'Kakvo jamstvo imaju vozila M-CARS?',
    answer:
      'Vozila se prodaju s jamstvom u trajanju od 12 mjeseci. Svako vozilo prije prodaje prolazi detaljan pregled i ima urednu servisnu povijest.',
  },
  {
    question: 'Gdje se nalazite i kako vas kontaktirati?',
    answer: `Nalazimo se na adresi ${company.address.street}, ${company.address.postalCode} ${company.address.city}. Dostupni smo na broju ${company.phone.display} i na e-mail adresi ${company.email.display}.`,
  },
];
