import type { Metadata } from 'next';
import { company, formattedAddress, siteUrl } from '@/content/company';

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${company.legalName}`,
      description,
      url,
      siteName: company.legalName,
      locale: 'hr_HR',
      type: 'website',
      images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: company.legalName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${company.legalName}`,
      description,
      images: ['/og-default.svg'],
    },
  };
}

/**
 * Strukturirani podaci sadrze iskljucivo provjerene informacije
 * iz src/content/company.ts. Ne dodavati ocjene, recenzije ni reference.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#organizacija`,
    name: company.legalName,
    url: siteUrl,
    foundingDate: String(company.foundedYear),
    telephone: company.phone.display,
    email: company.email.display,
    vatID: company.vatId,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.countryCode,
    },
    areaServed: 'HR',
    description:
      'Obnovljivi izvori energije, solarne elektrane po principu ključ u ruke, projektiranje, elektroenergetski elaborati, inženjering, nadzor i distribucija solarne opreme.',
    slogan: company.tagline,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export const localBusinessSummary = `${company.legalName}, ${formattedAddress}`;
