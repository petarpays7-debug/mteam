import { Reveal } from '@/components/ui/Reveal';
import { company, formattedAddress } from '@/content/company';
import { legalUpdated, supervisoryAuthority } from '@/content/legal';
import type { LegalSection } from '@/content/legal';

/** Zajednički prikaz pravnih tekstova — jednaka tipografija i struktura. */
export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="max-w-prose">
      {sections.map((section, index) => (
        <Reveal key={section.heading} delay={Math.min(index, 4) * 0.05}>
          <section className="mt-12 first:mt-0">
            <h2 className="font-display text-display-sm">{section.heading}</h2>

            {section.paragraphs?.map((text) => (
              <p key={text} className="mt-4 text-[0.95rem] leading-relaxed text-paper/70">
                {text}
              </p>
            ))}

            {section.list ? (
              <ul className="mt-5 flex flex-col gap-3">
                {section.list.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-solar/70"
                    />
                    <span className="text-[0.95rem] leading-relaxed text-paper/70">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.table ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.05]">
                      {section.table.columns.map((col) => (
                        <th
                          key={col}
                          scope="col"
                          className="border border-white/10 px-4 py-3 font-display text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-paper/60"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td
                            key={cell}
                            className="border border-white/10 px-4 py-3 align-top leading-relaxed text-paper/65"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </Reveal>
      ))}

      <Reveal delay={0.1}>
        <div className="mt-14 border-t border-white/10 pt-8 text-sm leading-relaxed text-paper/55">
          <p className="font-display font-semibold text-paper/85">Podaci o društvu</p>
          <p className="mt-3">
            {company.legalName}
            <br />
            Sjedište: {company.registeredOffice.street}, {company.registeredOffice.postalCode}{' '}
            {company.registeredOffice.city}
            <br />
            Adresa za kontakt: {formattedAddress}
            <br />
            {company.vatIdLabel}: {company.vatId} · {company.companyNumberLabel}:{' '}
            {company.companyNumber}
            <br />
            E-mail:{' '}
            <a href={company.email.href} className="text-solar underline underline-offset-4">
              {company.email.display}
            </a>
            <br />
            Telefon:{' '}
            <a href={company.phone.href} className="text-solar underline underline-offset-4">
              {company.phone.display}
            </a>
          </p>

          <p className="mt-6 font-display font-semibold text-paper/85">Nadzorno tijelo</p>
          <p className="mt-3">
            {supervisoryAuthority.name}
            <br />
            {supervisoryAuthority.address}
            <br />
            <a
              href={supervisoryAuthority.web}
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar underline underline-offset-4"
            >
              {supervisoryAuthority.web.replace('https://', '')}
            </a>
          </p>

          <p className="mt-6 text-paper/40">Posljednja izmjena: {legalUpdated}</p>
        </div>
      </Reveal>
    </div>
  );
}
