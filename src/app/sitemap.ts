import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/company';
import { legalNav, mainNav } from '@/content/navigation';

/** Generira se u build vremenu (staticki export). */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [...mainNav, ...legalNav].map((item) => ({
    url: `${siteUrl}${item.href === '/' ? '' : item.href}`,
    lastModified: now,
    changeFrequency: item.href === '/' ? 'monthly' : 'yearly',
    priority: item.href === '/' ? 1 : 0.7,
  }));
}
