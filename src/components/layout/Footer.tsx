import Link from 'next/link';
import { company, currentYear, formattedAddress } from '@/content/company';
import { legalNav, mainNav } from '@/content/navigation';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div
        aria-hidden
        className="tech-grid pointer-events-none absolute inset-0 opacity-[0.35] mask-fade-b"
      />

      <div className="shell relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-block text-paper" aria-label="M-Team — početna">
              <Logo />
            </Link>
            <p className="mt-5 font-display text-lg font-semibold tracking-tight text-paper">
              {company.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper/55">
              Obnovljivi izvori energije, solarne elektrane po principu ključ u ruke, projektiranje,
              elaborati, inženjering, nadzor i distribucija solarne opreme.
            </p>
          </div>

          <nav aria-label="Navigacija u podnožju">
            <h2 className="eyebrow-muted">Navigacija</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper/65 transition-colors hover:text-solar"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow-muted">Kontakt</h2>
            <address className="mt-5 flex flex-col gap-3 not-italic">
              <span className="flex items-start gap-3 text-sm text-paper/65">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-solar/70" />
                <span>
                  {company.legalName}
                  <br />
                  {formattedAddress}
                </span>
              </span>
              <a
                href={company.phone.href}
                className="flex items-center gap-3 text-sm text-paper/65 transition-colors hover:text-solar"
              >
                <Icon name="phone" className="h-4 w-4 shrink-0 text-solar/70" />
                {company.phone.display}
              </a>
              <a
                href={company.email.href}
                className="flex items-center gap-3 text-sm text-paper/65 transition-colors hover:text-solar"
              >
                <Icon name="mail" className="h-4 w-4 shrink-0 text-solar/70" />
                {company.email.display}
              </a>
              <span className="text-sm text-paper/45">
                {company.vatIdLabel}: {company.vatId}
              </span>
            </address>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-4 text-sm text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {company.foundedYear}–{currentYear} {company.shortName}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-solar">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
