"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Eye,
  FolderOpen,
  Layers,
  Puzzle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const icons = [Layers, Puzzle, Eye, FolderOpen, Sparkles, TrendingUp];

export function WhyYasin() {
  const { t } = useLanguage();

  return (
    <Section id="why" variant="dark">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.why.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.why.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={(i % 3) * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                className="glass h-full rounded-2xl p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet/15 text-violet-soft">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-muted">{item.desc}</p>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
