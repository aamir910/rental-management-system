"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import {
  ClipboardList,
  FileStack,
  Folders,
  LayoutDashboard,
  Receipt,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

const icons = [Folders, Receipt, Wallet, ClipboardList, LayoutDashboard, FileStack];

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <Section variant="light" className="!pt-16">
      <Reveal>
        <SectionHeading className="mx-auto max-w-3xl text-center">
          {t.problem.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.problem.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border border-gray-soft bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-violet">
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
