"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function Roadmap() {
  const { t } = useLanguage();

  return (
    <Section variant="mid">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.roadmap.heading}
        </SectionHeading>
      </Reveal>

      <div className="relative mx-auto mt-14 max-w-2xl">
        <div className="absolute start-[1.15rem] top-2 bottom-2 w-px bg-gradient-to-b from-violet via-violet/40 to-transparent sm:start-1/2 sm:-translate-x-1/2 rtl:sm:translate-x-1/2" />

        <div className="space-y-6">
          {t.roadmap.phases.map((phase, i) => {
            const isLeft = i % 2 === 0;
            return (
              <Reveal key={phase.phase} delay={i * 0.04}>
                <div
                  className={`relative flex items-center gap-4 sm:gap-0 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      isLeft ? "sm:pe-10 sm:text-end" : "sm:ps-10 sm:text-start"
                    } ps-12 sm:ps-0`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="inline-block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-start"
                    >
                      <p className="text-xs font-bold tracking-wider text-violet-soft">
                        {phase.phase}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white">{phase.title}</p>
                    </motion.div>
                  </div>

                  <div className="absolute start-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-violet bg-navy-soft sm:static sm:mx-0">
                    <div className="h-2 w-2 rounded-full bg-violet" />
                  </div>

                  <div className="hidden flex-1 sm:block" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
