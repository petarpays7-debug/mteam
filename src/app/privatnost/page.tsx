import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { company, currentYear } from '@/content/company';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Izjava o privatnosti',
  description: 'Kako M-Team d.o.o. postupa s podacima koje posjetitelji ostave putem kontaktnog obrasca.',
  path: '/privatnost',
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Pravno" title="Izjava o privatnosti" lede="Kratak pregled podataka koje prikupljamo putem ove stranice i načina na koji ih koristimo." />

      <section className="pb-section">
        <div className="shell">
          <div className="max-w-prose">
            {/*
              SADRZAJNI PLACEHOLDER.
              Tekst nize opisuje samo ono sto je tehnicki tocno za ovu
              implementaciju. Prije objave mora ga pregledati i dopuniti
              odgovorna osoba ili pravni savjetnik narucitelja.
            */}
            <p className="rounded-card border border-solar/25 bg-solar/[0.06] px-6 py-5 text-sm leading-relaxed text-paper/75">
              Ovaj tekst je radni predložak. Konačan sadržaj potvrđuje {company.legalName} prije
              objave stranice.
            </p>

            <h2 className="mt-12 font-display text-display-sm">Koje podatke prikupljamo</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Putem kontaktnog obrasca prikupljamo ime i prezime, e-mail adresu i sadržaj poruke koju nam pošaljete. Ta polja unosite dobrovoljno.</p>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Poslužitelj privremeno bilježi IP adresu posjetitelja kako bi ograničio broj uzastopnih slanja obrasca i spriječio zlouporabu.</p>

            <h2 className="mt-12 font-display text-display-sm">Zašto ih obrađujemo</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Podatke iz obrasca koristimo isključivo kako bismo odgovorili na vaš upit i, ako je potrebno, pripremili ponudu. Ne koristimo ih za slanje newslettera niti ih prodajemo trećim stranama.</p>

            <h2 className="mt-12 font-display text-display-sm">Koliko dugo ih čuvamo</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Rok čuvanja poslovne korespondencije utvrđuje voditelj obrade prije objave stranice. Podatke brišemo kada prestane svrha zbog koje su prikupljeni.</p>

            <h2 className="mt-12 font-display text-display-sm">Vaša prava</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Imate pravo zatražiti pristup svojim podacima, njihov ispravak ili brisanje, kao i ograničenje obrade i prigovor na obradu. Zahtjev možete poslati na kontakt adresu navedenu na dnu ove stranice.</p>

            <h2 className="mt-12 font-display text-display-sm">Primatelji podataka</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Za slanje e-pošte s ove stranice koristi se vanjski davatelj usluge, konfiguriran putem environment varijabli. Njegov naziv i uvjeti obrade bit će navedeni ovdje nakon što se odabere i aktivira.</p>

            <div className="mt-12 border-t border-white/10 pt-8 text-sm leading-relaxed text-paper/55">
              <p className="font-display font-semibold text-paper/85">Voditelj obrade</p>
              <p className="mt-2">
                {company.legalName}, {company.address.street}, {company.address.postalCode}{' '}
                {company.address.city}
                <br />
                {company.vatIdLabel}: {company.vatId}
                <br />
                E-mail:{' '}
                <a href={company.email.href} className="text-solar underline underline-offset-4">
                  {company.email.display}
                </a>
                <br />
                Telefon:{' '}
                <a href={company.phone.href} className="text-solar underline underline-offset-4">
                  {company.phone.display}
                </a>
              </p>
              <p className="mt-4 text-paper/40">Zadnja izmjena predloška: {currentYear}.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
