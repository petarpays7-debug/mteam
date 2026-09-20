import type { Metadata } from 'next';
import { LegalDocument } from '@/components/sections/LegalDocument';
import { PageHero } from '@/components/ui/PageHero';
import { privacySections } from '@/content/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Izjava o privatnosti',
  description:
    'Koje osobne podatke M-Team d.o.o. prikuplja putem web stranice, zašto ih obrađuje, koliko dugo ih čuva i kako ostvariti svoja prava prema Općoj uredbi o zaštiti podataka.',
  path: '/privatnost',
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Pravno"
        title="Izjava o privatnosti"
        lede="Podatke prikupljamo samo kada nam ih sami pošaljete. Ovdje je točno navedeno koje, zašto, koliko dugo i tko im ima pristup."
      />

      <section className="pb-section">
        <div className="shell">
          <LegalDocument sections={privacySections} />
        </div>
      </section>
    </>
  );
}
