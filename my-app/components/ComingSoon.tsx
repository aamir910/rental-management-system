"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Bell,
  Brain,
  Building2,
  CreditCard,
  FileText,
  LineChart,
  MessageCircle,
  Smartphone,
} from "lucide-react";

const icons = [
  Smartphone,
  MessageCircle,
  CreditCard,
  FileText,
  Bell,
  LineChart,
  Brain,
  Building2,
];

export function ComingSoon() {
  const { t } = useLanguage();

  return (
    <Section id="future" variant="light">
      <Reveal>
        <SectionHeading className="mx-auto max-w-3xl text-center">
          {t.comingSoon.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.comingSoon.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={(i % 4) * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative h-full overflow-hidden rounded-2xl border border-gray-soft bg-white p-5 shadow-sm"
              >
                <span className="absolute end-3 top-3 rounded-full bg-violet/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-violet">
                  {t.comingSoon.badge}
                </span>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-violet">
                  <Icon size={20} />
                </div>
                <h3 className="pr-16 text-base font-semibold text-ink rtl:pl-16 rtl:pr-0">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-text">{item.desc}</p>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
