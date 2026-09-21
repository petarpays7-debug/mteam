import type { Metadata, Viewport } from 'next';
import { Manrope, Sora } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { company, siteUrl } from '@/content/company';
import { organizationJsonLd } from '@/lib/seo';
import './globals.css';

/*
  Naslovni rez. Sora je geometrijski grotesk s izrazenijim karakterom od
  Montserrata — na velikim naslovima djeluje tehnicnije i manje genericno.
  Za povratak na Montserrat dovoljno je zamijeniti uvoz i ovaj poziv;
  ostatak stilova ide preko CSS varijable --font-display.
*/
const display = Sora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.legalName} — ${company.tagline}`,
    template: `%s | ${company.legalName}`,
  },
  description:
    'Solarne elektrane po principu ključ u ruke, projektiranje, elektroenergetski elaborati, inženjering, nadzor i distribucija solarne opreme. M-CARS rabljena vozila i MT Mount solarne konstrukcije.',
  applicationName: company.legalName,
  authors: [{ name: company.legalName }],
  formatDetection: { telephone: true, address: false, email: true },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    siteName: company.legalName,
    url: siteUrl,
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: company.legalName }],
  },
};

export const viewport: Viewport = {
  themeColor: '#061A26',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <Header />
        <main id="glavni-sadrzaj">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          /* Sadrzi iskljucivo provjerene podatke iz src/content/company.ts. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
