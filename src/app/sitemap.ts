import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/company';
import { legalNav, mainNav } from '@/content/navigation';
import { photos } from '@/content/photos';

/** Generira se u build vremenu (staticki export). */
export const dynamic = 'force-static';

/** Slike po ruti — ulaze u sitemap i pomazu pretrazivanju slika. */
const routeImages: Record<string, string[]> = {
  '/': [photos.elektranaIzZraka.src, photos.carport.src, photos.ravniKrovMontaza.src],
  '/o-nama': [photos.ravniKrovMontaza.src],
  '/usluge': [photos.montazaDetalj.src, photos.elektranaIzZraka.src, photos.inverterOprema.src],
  '/mobilnost': [photos.carport.src, photos.pregledVozila.src],
  '/mt-mount': [photos.kosiKrov.src, photos.limeniKrov.src, photos.solarnaOgrada.src],
};

/** Stranice koje se cesce mijenjaju imaju visi prioritet. */
const priorities: Record<string, number> = {
  '/': 1,
  '/usluge': 0.9,
  '/mt-mount': 0.85,
  '/mobilnost': 0.85,
  '/o-nama': 0.7,
  '/kontakt': 0.8,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [...mainNav, ...legalNav].map((item) => {
    const images = routeImages[item.href];

    return {
      url: `${siteUrl}${item.href === '/' ? '' : item.href}`,
      lastModified: now,
      changeFrequency: item.href === '/' ? ('monthly' as const) : ('yearly' as const),
      priority: priorities[item.href] ?? 0.4,
      ...(images ? { images: images.map((src) => `${siteUrl}${src}`) } : {}),
    };
  });
}
