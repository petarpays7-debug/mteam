import type { Metadata } from 'next';
import { LegalDocument } from '@/components/sections/LegalDocument';
import { PageHero } from '@/components/ui/PageHero';
import { company } from '@/content/company';
import { companyDetailsSections } from '@/content/legal';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Podaci o tvrtki',
  description: `Obvezni podaci o trgovačkom društvu ${company.legalName}: tvrtka, sjedište, ${company.vatIdLabel}, matični broj i djelatnost, uz način podnošenja pisanog prigovora potrošača.`,
  path: '/podaci-o-tvrtki',
});

export default function CompanyDetailsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pravno"
        title="Podaci o tvrtki"
        lede="Podaci o društvu koje trgovac navodi na svojoj web stranici, kontakt i način podnošenja pisanog prigovora."
      />

      <section className="pb-section">
        <div className="shell">
          <LegalDocument sections={companyDetailsSections} footer="minimal" />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'Podaci o tvrtki', path: '/podaci-o-tvrtki' },
            ]),
          ),
        }}
      />
    </>
  );
}
