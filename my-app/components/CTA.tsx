"use client";

import { Reveal } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section className="gradient-cta relative overflow-hidden py-24 md:py-32">
      <motion.div
        className="pointer-events-none absolute start-1/4 top-1/4 h-64 w-64 rounded-full bg-violet/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute end-1/4 bottom-1/4 h-48 w-48 rounded-full bg-emerald/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {t.cta.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-muted sm:text-lg">
            {t.cta.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-violet px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet/30 transition hover:bg-violet-soft"
            >
              {t.cta.primary}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </a>
            <a
              href="#future"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t.cta.secondary}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
