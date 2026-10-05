"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function SolutionSection() {
  const { t } = useLanguage();

  return (
    <Section variant="dark" className="overflow-hidden">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.solution.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-14 flex flex-col items-center gap-6">
        <Reveal>
          <div className="w-full max-w-2xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gray-muted">
              {t.solution.before}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {t.solution.beforeItems.map((item, i) => (
                <motion.span
                  key={item}
                  initial={false}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-full border border-red/30 bg-red/10 px-3.5 py-1.5 text-sm text-red/90"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-2 text-violet-soft"
        >
          <ArrowDown className="animate-bounce" size={22} />
          <div className="rounded-2xl border border-violet/40 bg-violet/15 px-6 py-3">
            <span className="text-lg font-bold tracking-tight text-white">
              Yasin <span className="text-violet-soft">RMS</span>
            </span>
          </div>
          <ArrowDown className="animate-bounce" size={22} />
        </motion.div>

        <Reveal delay={0.1}>
          <div className="w-full max-w-2xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-emerald">
              {t.solution.after}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {t.solution.afterItems.map((item, i) => (
                <motion.span
                  key={item}
                  initial={false}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-full border border-emerald/30 bg-emerald/10 px-3.5 py-1.5 text-sm text-emerald"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
