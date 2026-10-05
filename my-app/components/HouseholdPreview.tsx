"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { householdItems } from "@/lib/demo-data";
import { motion } from "framer-motion";
import {
  AirVent,
  Armchair,
  BedDouble,
  Laptop,
  Refrigerator,
  Tv,
  WashingMachine,
} from "lucide-react";

const iconMap = {
  tv: Tv,
  fridge: Refrigerator,
  sofa: Armchair,
  ac: AirVent,
  washer: WashingMachine,
  bed: BedDouble,
  laptop: Laptop,
};

export function HouseholdPreview() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section variant="light">
      <Reveal>
        <SectionHeading className="mx-auto max-w-3xl text-center">
          {t.household.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {householdItems.map((item, i) => {
          const Icon = iconMap[item.icon];
          return (
            <Reveal key={item.name} delay={(i % 4) * 0.04}>
              <motion.div
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-navy/5 via-violet/5 to-emerald/5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-violet">
                    <Icon size={28} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-ink">
                    {isUrdu ? item.nameUr : item.name}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-text">{t.household.purchaseValue}</span>
                      <span className="font-medium text-ink">{item.purchase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-text">{t.household.currentValue}</span>
                      <span className="font-medium text-violet">{item.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-text">{t.household.condition}</span>
                      <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
                        {isUrdu ? item.conditionUr : item.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
