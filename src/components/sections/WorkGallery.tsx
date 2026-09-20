import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { Photo } from '@/components/ui/Photo';
import { workGallery } from '@/content/photos';

/**
 * Izvedeni radovi — stvarne fotografije M-Teamovih instalacija.
 *
 * Namjerno bez brojeva, naziva klijenata i lokacija: prikazuju se samo
 * fotografije i tip konstrukcije, dakle ono što je provjerljivo.
 */
export function WorkGallery() {
  const [lead, ...rest] = workGallery;

  return (
    <section
      className="grain relative overflow-hidden border-y border-white/10 bg-ink py-section"
      aria-labelledby="izvedbe-naslov"
    >
      <div className="shell">
        <SectionHeader
          eyebrow="Iz naših izvedbi"
          title={<span id="izvedbe-naslov">Ovako to izgleda na terenu.</span>}
          lede="Fotografije su s izvedenih instalacija — krovne elektrane, ground mount sustavi i solarni carport."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal className="lg:row-span-2">
            <figure className="group relative h-full">
              <Photo
                photo={lead.photo}
                ratio="4 / 3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full transition-transform duration-700 ease-brand group-hover:scale-[1.01]"
                overlay
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
                <span className="inline-flex rounded-full border border-solar/40 bg-petrol-900/70 px-3 py-1 font-display text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-solar backdrop-blur-sm">
                  {lead.tag}
                </span>
                <span className="mt-3 block font-display text-lg font-semibold text-paper">
                  {lead.caption}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {rest.map((item, index) => (
              <Reveal key={item.photo.src} delay={0.08 + index * 0.07}>
                <figure className="group relative">
                  <Photo
                    photo={item.photo}
                    ratio="4 / 3"
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 100vw"
                    className="transition-transform duration-700 ease-brand group-hover:scale-[1.02]"
                    overlay
                  />
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                    <span className="inline-flex rounded-full border border-white/20 bg-petrol-900/70 px-2.5 py-1 font-display text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-paper/80 backdrop-blur-sm">
                      {item.tag}
                    </span>
                    <span className="mt-2 block text-sm font-medium text-paper">
                      {item.caption}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
