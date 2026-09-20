'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { company } from '@/content/company';
import { mainNav } from '@/content/navigation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';

export function Header() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Prozirna traka nad herojem postaje citljiva nakon kratkog scrolla. */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // Prvo citanje ide kroz rAF kako se stanje ne bi postavljalo sinkrono u efektu.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /*
    Zatvaranje izbornika pri promjeni rute. Stanje se prilagodjava tijekom rendera
    (sluzbeni React obrazac) umjesto u efektu - bez dodatnog commita i treperenja.
  */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  /* Escape zatvara overlay i vraca fokus na gumb koji ga je otvorio. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <a
        href="#glavni-sadrzaj"
        className="sr-only z-[60] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-solar focus:px-5 focus:py-2.5 focus:font-display focus:text-sm focus:font-semibold focus:text-petrol-900"
      >
        Prijeđi na glavni sadržaj
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-brand',
          solid
            ? 'border-b border-white/10 bg-petrol-900/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0 text-paper transition-opacity duration-300 hover:opacity-80"
            aria-label="M-Team d.o.o. — početna stranica"
          >
            <Logo />
          </Link>

          <nav aria-label="Glavna navigacija" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative inline-flex h-10 items-center rounded-full px-4 font-display text-[0.84rem] font-medium tracking-tight transition-colors duration-300',
                        active ? 'text-solar' : 'text-paper/70 hover:text-paper',
                      )}
                    >
                      {item.label}
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-px h-px bg-solar"
                          transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={company.phone.href}
              className="inline-flex items-center gap-2 font-display text-[0.84rem] font-medium text-paper/75 transition-colors hover:text-solar"
            >
              <Icon name="phone" className="h-4 w-4" />
              {company.phone.display}
            </a>
            <Link
              href="/kontakt"
              className="inline-flex h-10 items-center rounded-full bg-solar px-5 font-display text-[0.84rem] font-semibold text-petrol-900 transition-all duration-300 ease-brand hover:bg-solar-soft hover:shadow-glow"
            >
              Zatražite ponudu
            </Link>
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobilni-izbornik"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-paper transition-colors hover:border-solar/50 hover:text-solar lg:hidden"
          >
            <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
            <span className="sr-only">{open ? 'Zatvori izbornik' : 'Otvori izbornik'}</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobilni-izbornik"
            ref={panelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-petrol-900/97 pt-[var(--header-h)] backdrop-blur-xl lg:hidden"
          >
            <div className="tech-grid pointer-events-none absolute inset-0 opacity-40 mask-fade-b" />
            <nav
              aria-label="Mobilna navigacija"
              className="relative flex-1 overflow-y-auto px-5 pb-10 pt-6 sm:px-8"
            >
              <ul className="flex flex-col">
                {mainNav.map((item, index) => {
                  const active =
                    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduced ? 0.15 : 0.45,
                        delay: reduced ? 0 : 0.05 + index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="border-b border-white/8"
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className="group flex items-baseline justify-between gap-4 py-5"
                      >
                        <span>
                          <span
                            className={cn(
                              'block font-display text-2xl font-semibold tracking-tight transition-colors',
                              active ? 'text-solar' : 'text-paper group-hover:text-solar',
                            )}
                          >
                            {item.label}
                          </span>
                          {item.description ? (
                            <span className="mt-1 block text-sm text-paper/50">
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                        <Icon
                          name="arrow-up-right"
                          className="h-5 w-5 shrink-0 text-paper/35 transition-all duration-300 group-hover:text-solar"
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={company.phone.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-solar font-display text-sm font-semibold text-petrol-900"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  {company.phone.display}
                </a>
                <a
                  href={company.email.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 font-display text-sm font-semibold text-paper"
                >
                  <Icon name="mail" className="h-4 w-4" />
                  {company.email.display}
                </a>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
