'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { company } from '@/content/company';
import { contactSchema } from '@/lib/contact-schema';
import type { ContactFieldErrors, ContactResponse } from '@/lib/contact-schema';
import { cn } from '@/lib/cn';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string; fallback: boolean };

const fieldBase =
  'w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-[0.95rem] text-paper placeholder:text-paper/30 transition-colors duration-300';

export function ContactForm() {
  const baseId = useId();
  const reduced = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function fieldProps(name: keyof ContactFieldErrors) {
    const invalid = Boolean(errors[name]);
    return {
      id: `${baseId}-${name}`,
      name,
      'aria-invalid': invalid || undefined,
      'aria-describedby': invalid ? `${baseId}-${name}-error` : undefined,
      className: cn(
        fieldBase,
        invalid
          ? 'border-ember/70 focus:border-ember'
          : 'border-white/12 focus:border-solar/60 hover:border-white/20',
      ),
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'submitting') return;

    const form = new FormData(event.currentTarget);
    const raw = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
      company: String(form.get('company') ?? ''),
    };

    // Klijentska validacija istom shemom kao na posluzitelju.
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const next: ContactFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !(field in next)) {
          next[field as keyof ContactFieldErrors] = issue.message;
        }
      }
      setErrors(next);
      setStatus({ kind: 'idle' });
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`${baseId}-${first}`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as ContactResponse;

      if (result.ok) {
        setStatus({ kind: 'success' });
        formRef.current?.reset();
        return;
      }

      if (result.code === 'validation') {
        setErrors(result.fieldErrors);
        setStatus({ kind: 'idle' });
        return;
      }

      setStatus({
        kind: 'error',
        message: result.message,
        fallback: result.code === 'not_configured' || result.code === 'send_failed',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Došlo je do pogreške u vezi. Provjerite internetsku vezu i pokušajte ponovno.',
        fallback: true,
      });
    }
  }

  if (status.kind === 'success') {
    return (
      <div
        role="status"
        className="rounded-card border border-solar/30 bg-solar/[0.07] p-8 text-center"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-solar/40 text-solar">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold text-paper">Poruka je poslana.</h3>
        <p className="mt-2 text-sm leading-relaxed text-paper/65">
          Zaprimili smo vaš upit i javljamo se u najkraćem roku.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-6 font-display text-sm font-semibold text-solar underline underline-offset-4"
        >
          Pošaljite novi upit
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-card border border-white/10 bg-white/[0.025] p-7 sm:p-9"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label
            htmlFor={`${baseId}-name`}
            className="mb-2 block font-display text-[0.82rem] font-semibold text-paper/80"
          >
            Ime i prezime
          </label>
          <input type="text" autoComplete="name" required {...fieldProps('name')} />
          {errors.name ? (
            <p id={`${baseId}-name-error`} className="mt-2 text-[0.8rem] text-ember">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${baseId}-email`}
            className="mb-2 block font-display text-[0.82rem] font-semibold text-paper/80"
          >
            E-mail adresa
          </label>
          <input type="email" autoComplete="email" required {...fieldProps('email')} />
          {errors.email ? (
            <p id={`${baseId}-email-error`} className="mt-2 text-[0.8rem] text-ember">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${baseId}-message`}
            className="mb-2 block font-display text-[0.82rem] font-semibold text-paper/80"
          >
            Vaša poruka
          </label>
          <textarea
            rows={6}
            required
            placeholder="Opišite objekt, lokaciju i okvirnu potrošnju."
            {...fieldProps('message')}
          />
          {errors.message ? (
            <p id={`${baseId}-message-error`} className="mt-2 text-[0.8rem] text-ember">
              {errors.message}
            </p>
          ) : null}
        </div>

        {/* Skriveno polje protiv automatiziranih slanja. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${baseId}-company`}>Ne popunjavajte ovo polje</label>
          <input
            id={`${baseId}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/*
          Obavijest o obradi na mjestu prikupljanja. Clanak 13. Opce uredbe
          trazi da ispitanik bude obavijesten prije nego preda podatke, pa
          obavijest stoji uz gumb, a ne negdje u podnozju.
        */}
        <p className="text-[0.8rem] leading-relaxed text-paper/45">
          Slanjem upita vaše ime, e-mail adresu i sadržaj poruke koristimo isključivo za odgovor na
          upit i pripremu ponude. Podatke ne prosljeđujemo trećima u njihove svrhe. Više u{' '}
          <Link
            href="/privatnost"
            className="text-paper/70 underline underline-offset-4 transition-colors hover:text-solar"
          >
            Izjavi o privatnosti
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={status.kind === 'submitting'}
          className="mt-1 inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-solar px-7 font-display text-[0.95rem] font-semibold text-petrol-900 transition-all duration-300 ease-brand hover:bg-solar-soft hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60 sm:h-14"
        >
          {status.kind === 'submitting' ? 'Slanje u tijeku…' : 'Pošalji upit'}
          {status.kind === 'submitting' ? null : <Icon name="arrow-right" className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {status.kind === 'error' ? (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-xl border border-ember/35 bg-ember/[0.08] p-5">
              <p className="text-sm leading-relaxed text-paper/80">{status.message}</p>
              {status.fallback ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={company.phone.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-display text-[0.82rem] font-semibold text-paper transition-colors hover:border-solar/50 hover:text-solar"
                  >
                    <Icon name="phone" className="h-4 w-4" />
                    {company.phone.display}
                  </a>
                  <a
                    href={company.email.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-display text-[0.82rem] font-semibold text-paper transition-colors hover:border-solar/50 hover:text-solar"
                  >
                    <Icon name="mail" className="h-4 w-4" />
                    {company.email.display}
                  </a>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
