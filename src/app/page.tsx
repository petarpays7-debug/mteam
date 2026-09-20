import type { Metadata } from 'next';
import { FinalCta } from '@/components/sections/FinalCta';
import { Hero } from '@/components/sections/Hero';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { TrustSection } from '@/components/sections/TrustSection';
import { WorldsSection } from '@/components/sections/WorldsSection';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { hepAuthorisation } from '@/content/services';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Solarne elektrane ključ u ruke',
  description:
    'M-Team d.o.o. gradi solarne elektrane po principu ključ u ruke — analiza, projektiranje, elaborati, montaža i puštanje u pogon. Uz M-CARS vozila i MT Mount konstrukcije.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <WorldsSection />
      <ProcessTimeline />

      <section className="relative py-section" aria-labelledby="usluge-naslov">
        <div className="shell">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Usluge"
              title={<span id="usluge-naslov">Modularne usluge, jedan odgovorni partner.</span>}
              lede="Možete nas angažirati za cjelovitu izvedbu ili samo za dio procesa — projektiranje, elaborat, nadzor ili isporuku opreme."
              className="flex-1"
            />
            <Reveal delay={0.1}>
              <Button href="/usluge" variant="outline" icon="arrow-right">
                Sve usluge
              </Button>
            </Reveal>
          </div>

          <div className="mt-12">
            <ServicesGrid />
          </div>

          <Reveal delay={0.1}>
            <p className="mt-8 rounded-card border border-solar/20 bg-solar/[0.06] px-6 py-5 text-sm leading-relaxed text-paper/75">
              {hepAuthorisation}
            </p>
          </Reveal>
        </div>
      </section>

      <TrustSection />
      <FinalCta />
    </>
  );
}
