"use client";

import { GlassCard, Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { approvalChecks } from "@/lib/demo-data";
import { Check } from "lucide-react";

export function ApprovalPreview() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section variant="mid">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.approval.heading}
        </SectionHeading>
      </Reveal>

      <Reveal delay={0.1}>
        <GlassCard className="mx-auto mt-12 max-w-lg">
          <h3 className="mb-5 text-sm font-semibold text-white">{t.approval.application}</h3>

          <div className="space-y-2.5">
            {approvalChecks.map((check) => (
              <div
                key={check.key}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5"
              >
                <span className="text-sm text-gray-muted">
                  {isUrdu ? check.ur : check.en}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald/20 text-emerald">
                  <Check size={14} strokeWidth={3} />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald/30 bg-emerald/10 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-emerald/80">
              {t.approval.applicationStatus}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide text-emerald">
              {t.approval.approved}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              type="button"
              className="rounded-xl border border-red/30 bg-red/10 py-2.5 text-xs font-medium text-red transition hover:bg-red/20 sm:text-sm"
            >
              {t.approval.reject}
            </button>
            <button
              type="button"
              className="rounded-xl border border-amber/30 bg-amber/10 py-2.5 text-xs font-medium text-amber transition hover:bg-amber/20 sm:text-sm"
            >
              {t.approval.requestChanges}
            </button>
            <button
              type="button"
              className="rounded-xl border border-emerald/30 bg-emerald/20 py-2.5 text-xs font-medium text-emerald transition hover:bg-emerald/30 sm:text-sm"
            >
              {t.approval.approve}
            </button>
          </div>
        </GlassCard>
      </Reveal>
    </Section>
  );
}
