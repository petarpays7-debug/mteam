import type { Metadata } from 'next';
import { company, formattedAddress, siteUrl } from '@/content/company';
import { faq } from '@/content/faq';
import { services } from '@/content/services';

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Open Graph slika za rutu; bez nje se koristi zajednička. */
  image?: string;
};

/**
 * Metapodaci rute.
 *
 * Open Graph slike su PNG, ne SVG: Facebook, LinkedIn i X ne renderiraju SVG
 * kao `og:image`, pa bi pregled linka ostao prazan.
 */
export function pageMetadata({ title, description, path, image }: PageMetaInput): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = `${siteUrl}${image ?? '/og-default.png'}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: `${title} | ${company.legalName}`,
      description,
      url,
      siteName: company.legalName,
      locale: 'hr_HR',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${title} — ${company.legalName}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${company.legalName}`,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Strukturirani podaci o tvrtki.
 *
 * Sadrže isključivo provjerene informacije iz `src/content/company.ts`.
 * Ne dodavati ocjene, recenzije, radno vrijeme ni koordinate koje nisu potvrđene —
 * netočni strukturirani podaci mogu dovesti do ručne kazne u tražilici.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#organizacija`,
    name: company.legalName,
    alternateName: company.shortName,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    image: `${siteUrl}/og-default.png`,
    foundingDate: String(company.foundedYear),
    telephone: company.phone.display,
    email: company.email.display,
    vatID: company.vatId,
    taxID: company.vatId,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.countryCode,
    },
    areaServed: { '@type': 'Country', name: 'Hrvatska' },
    knowsAbout: [
      'Solarne elektrane',
      'Fotonaponski sustavi',
      'Elektroenergetski elaborati',
      'Solarne konstrukcije',
    ],
    description:
      'Obnovljivi izvori energije, solarne elektrane po principu ključ u ruke, projektiranje, elektroenergetski elaborati, inženjering, nadzor i distribucija solarne opreme.',
    slogan: company.tagline,
    sameAs: [company.carsListingUrl],
  };
}

/** Popis usluga kao ItemList — pomaže tražilici razumjeti opseg djelatnosti. */
export function servicesJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Usluge — ${company.legalName}`,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        description: service.summary,
        serviceType: service.title,
        url: `${siteUrl}/usluge#${service.slug}`,
        provider: { '@id': `${siteUrl}/#organizacija` },
        areaServed: { '@type': 'Country', name: 'Hrvatska' },
      },
    })),
  };
}

/**
 * Česta pitanja.
 *
 * Tekst mora biti identičan onome što se vidi na stranici — Google odbacuje
 * FAQPage označavanje koje se ne podudara s vidljivim sadržajem.
 */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
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

/** Više blokova strukturiranih podataka u jednom `<script>`. */
export function jsonLdGraph(...blocks: Array<Record<string, unknown>>) {
  return JSON.stringify(blocks.length === 1 ? blocks[0] : blocks);
}

export const localBusinessSummary = `${company.legalName}, ${formattedAddress}`;
