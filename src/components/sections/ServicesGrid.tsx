import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { services } from '@/content/services';

export function ServicesGrid({ linkToDetails = true }: { linkToDetails?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const content = (
          <>
            <div
              aria-hidden
              className="tech-grid pointer-events-none absolute inset-0 bg-grid-sm opacity-40 mask-fade-b"
            />
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-solar">
              <Icon name={service.icon} className="h-5 w-5" />
            </span>

            <h3 className="relative mt-6 font-display text-[1.05rem] font-semibold leading-snug tracking-tight text-paper">
              {service.title}
            </h3>
            <p className="relative mt-3 flex-1 text-sm leading-relaxed text-paper/60">
              {service.summary}
            </p>

            <ul className="relative mt-5 flex flex-col gap-2 border-t border-white/8 pt-5">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[0.82rem] text-paper/50">
                  <span
                    aria-hidden
                    className="mt-[0.42rem] h-1 w-1 shrink-0 rounded-full bg-solar/70"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </>
        );

        const cardClass =
          'card card-solar corner-marks flex h-full flex-col p-6 text-paper/70 sm:p-7';

        return (
          <Reveal key={service.slug} delay={index * 0.06} className="h-full">
            <TiltCard glow="solar" intensity={3} className="group h-full rounded-card">
              {linkToDetails ? (
                <Link href={`/usluge#${service.slug}`} className={cardClass}>
                  {content}
                </Link>
              ) : (
                <article id={service.slug} className={cardClass}>
                  {content}
                </article>
              )}
            </TiltCard>
          </Reveal>
        );
      })}
    </div>
  );
}
