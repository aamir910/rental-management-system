"use client";

import { GlassCard, Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { tenantProfile } from "@/lib/demo-data";
import { motion } from "framer-motion";
import { ArrowDown, User } from "lucide-react";

export function TenantPreview() {
  const { t } = useLanguage();

  return (
    <Section id="how" variant="dark">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.tenant.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            {t.tenant.steps.map((step, i) => (
              <div key={step.num} className="flex w-full max-w-md flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="glass flex w-full items-center gap-4 rounded-2xl p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet/20 font-display text-xl text-violet-soft">
                    {step.num}
                  </span>
                  <p className="text-sm font-medium text-white sm:text-base">{step.title}</p>
                </motion.div>
                {i < t.tenant.steps.length - 1 && (
                  <ArrowDown className="my-2 text-violet-soft/60" size={18} />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-emerald/15 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/20 text-violet-soft">
                <User size={28} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-white">{tenantProfile.name}</h3>
                  <span className="rounded-full bg-emerald/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald">
                    {tenantProfile.status}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { label: t.tenant.tenantId, value: tenantProfile.tenantId },
                    { label: t.tenant.property, value: tenantProfile.property },
                    { label: t.tenant.monthlyRent, value: tenantProfile.monthlyRent },
                    { label: t.tenant.status, value: tenantProfile.status },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between border-b border-white/8 pb-2 last:border-0"
                    >
                      <span className="text-sm text-gray-muted">{row.label}</span>
                      <span className="text-sm font-medium text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}
