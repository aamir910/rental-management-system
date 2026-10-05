"use client";

import { FakeBarChart } from "@/components/ui/Charts";
import { GlassCard, Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { chartBars, financeSummary } from "@/lib/demo-data";

export function FinancePreview() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section variant="mid">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.finance.heading}
        </SectionHeading>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <GlassCard className="h-full">
            <h3 className="mb-5 text-sm font-semibold text-white">{t.finance.todaySummary}</h3>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald">
                {t.finance.income}
              </p>
              <div className="space-y-2">
                {financeSummary.income.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5"
                  >
                    <span className="text-sm text-gray-muted">
                      {isUrdu ? row.labelUr : row.label}
                    </span>
                    <span className="text-sm font-semibold text-emerald">{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-violet-soft">
                {t.finance.expenses}
              </p>
              <div className="space-y-2">
                {financeSummary.expenses.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5"
                  >
                    <span className="text-sm text-gray-muted">
                      {isUrdu ? row.labelUr : row.label}
                    </span>
                    <span className="text-sm font-semibold text-violet-soft">{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-medium text-white">{t.finance.netBalance}</span>
              <span className="text-xl font-bold text-emerald">{financeSummary.netBalance}</span>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard className="h-full">
            <div className="mb-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-muted">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                {t.finance.income}
              </span>
              <span className="flex items-center gap-1.5 text-gray-muted">
                <span className="h-2 w-2 rounded-full bg-violet" />
                {t.finance.expenses}
              </span>
            </div>
            <FakeBarChart data={[...chartBars]} className="h-48 sm:h-56" />
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}
