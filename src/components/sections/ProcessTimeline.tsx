'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { processSteps, solarBenefits } from '@/content/home';

export function ProcessTimeline() {
  const containerRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  /* "Energijska linija" prati scroll kroz vremensku crtu. */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 72%', 'end 55%'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const lineScale = useTransform(progress, (v) => (reduced ? 1 : v));

  return (
    <section className="aura-solar relative overflow-hidden py-section" aria-labelledby="proces-naslov">
      <div
        aria-hidden
        className="tech-grid pointer-events-none absolute inset-0 opacity-[0.45] mask-fade-b"
      />

      <div className="shell relative">
        <SectionHeader
          eyebrow="Solarne elektrane ključ u ruke"
          title={<span id="proces-naslov">Od prve analize do vlastite energije.</span>}
          lede="M-Team vodi cijeli proces — od analize lokacije i projektiranja do nabave, montaže, dokumentacije i puštanja elektrane u pogon."
        />

        <ol ref={containerRef} className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {/* Vodoravna os na desktopu */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[1.4rem] hidden h-px bg-white/10 lg:block"
          >
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-solar via-solar to-ember"
              style={{ scaleX: lineScale }}
            />
          </div>

          {/* Okomita os na mobitelu */}
          <div
            aria-hidden
            className="absolute bottom-4 left-[1.4rem] top-4 w-px bg-white/10 lg:hidden"
          >
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-solar via-solar to-ember"
              style={{ scaleY: lineScale }}
            />
          </div>

          {processSteps.map((step, index) => (
            <Reveal
              as="li"
              key={step.step}
              delay={index * 0.08}
              className="relative pl-16 lg:pl-0"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-solar/40 bg-petrol-800 font-display text-[0.8rem] font-bold text-solar lg:relative lg:mb-7"
              >
                {step.step}
              </span>
              <h3 className="font-display text-lg font-semibold tracking-tight text-paper lg:mt-0">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-paper/60">{step.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="card mt-20 p-7 sm:p-10">
          <h3 className="font-display text-display-sm">Što time dobivate</h3>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {solarBenefits.map((benefit, index) => (
              <Reveal as="li" key={benefit.title} delay={index * 0.06} className="flex gap-3.5">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-solar" />
                <span>
                  <span className="block font-display text-[0.95rem] font-semibold text-paper">
                    {benefit.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-paper/55">
                    {benefit.text}
                  </span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
