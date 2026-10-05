"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  FileText,
  Receipt,
  UserRound,
  Wallet,
  BarChart3,
  Package,
} from "lucide-react";

const icons = [
  Building2,
  UserRound,
  FileText,
  Wallet,
  Receipt,
  CreditCard,
  BarChart3,
  Wallet,
  Package,
];

export function Features() {
  const { t } = useLanguage();

  return (
    <Section id="features" variant="light">
      <Reveal>
        <SectionHeading className="mx-auto max-w-3xl text-center">
          {t.features.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.features.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={(i % 3) * 0.05}>
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group h-full rounded-2xl border border-gray-soft bg-white p-6 shadow-sm hover:border-violet/20 hover:shadow-lg hover:shadow-violet/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-violet/5 text-violet transition group-hover:from-violet group-hover:to-violet-soft group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-text">{item.desc}</p>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
