import type { Metadata } from 'next';
import { LegalDocument } from '@/components/sections/LegalDocument';
import { PageHero } from '@/components/ui/PageHero';
import { cookieSections } from '@/content/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Kolačići',
  description:
    'Web stranica M-Team d.o.o. ne koristi kolačiće za analitiku, oglašavanje ni praćenje posjetitelja. Ovdje je popis onoga što se stvarno pohranjuje.',
  path: '/kolacici',
});

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pravno"
        title="Kolačići"
        lede="Ova stranica ne postavlja kolačiće za analitiku, oglašavanje ni praćenje. Zato nema ni trake za privolu."
      />

      <section className="pb-section">
        <div className="shell">
          <LegalDocument sections={cookieSections} />
        </div>
      </section>
    </>
  );
}
