"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function RentAutomation() {
  const { t } = useLanguage();

  return (
    <Section variant="light">
      <Reveal>
        <SectionHeading className="mx-auto max-w-3xl text-center">
          {t.automation.heading}
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-text">
          {t.automation.desc}
        </p>
      </Reveal>

      <div className="mt-14 overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-[640px] max-w-4xl items-stretch justify-between gap-2">
          {t.automation.steps.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <motion.div
                initial={false}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-violet bg-white text-sm font-bold text-violet shadow-md"
              >
                {i + 1}
              </motion.div>
              {i < t.automation.steps.length - 1 && (
                <div className="pointer-events-none absolute top-7 hidden h-0.5 bg-violet/30 md:block" />
              )}
              <motion.p
                initial={false}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.05 }}
                className="mt-3 text-center text-xs font-medium text-ink sm:text-sm"
              >
                {step}
              </motion.p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 hidden max-w-4xl md:block">
        <div className="relative mx-10 h-0.5 bg-violet/20">
          <motion.div
            className="absolute inset-y-0 start-0 bg-violet"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </Section>
  );
}
