"use client";

import { AnimatedCounter, FakeBarChart, FakeSimpleBars } from "@/components/ui/Charts";
import { GlassCard, Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import {
  chartBars,
  dashboardStats,
  pendingPayments,
  rentCollectionBars,
} from "@/lib/demo-data";

export function DashboardPreview() {
  const { t } = useLanguage();

  const kpiPrimary = [
    { label: t.dashboard.properties, value: dashboardStats.properties, numeric: true },
    { label: t.dashboard.activeTenants, value: dashboardStats.activeTenants, numeric: true },
    { label: t.dashboard.occupiedUnits, value: dashboardStats.occupiedUnits, numeric: true },
  ];

  const rentKpis = [
    { label: t.dashboard.expectedRent, value: dashboardStats.expectedRent, color: "text-white" },
    { label: t.dashboard.collected, value: dashboardStats.collected, color: "text-emerald" },
    { label: t.dashboard.pending, value: dashboardStats.pending, color: "text-amber" },
  ];

  const todayKpis = [
    { label: t.dashboard.todayIncome, value: dashboardStats.todayIncome, color: "text-emerald" },
    { label: t.dashboard.todayExpenses, value: dashboardStats.todayExpenses, color: "text-violet-soft" },
    { label: t.dashboard.todayBalance, value: dashboardStats.todayBalance, color: "text-white" },
  ];

  return (
    <Section variant="dark" className="!px-0">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading light className="mx-auto max-w-3xl text-center">
            {t.dashboard.heading}
          </SectionHeading>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass mt-12 overflow-hidden rounded-3xl p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{t.dashboard.title}</h3>
              <span className="rounded-full bg-violet/20 px-3 py-1 text-[10px] font-bold tracking-wide text-violet-soft">
                DEMO PREVIEW
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {kpiPrimary.map((kpi) => (
                <GlassCard key={kpi.label} className="!p-4">
                  <p className="text-xs text-gray-muted">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    <AnimatedCounter value={kpi.value as number} />
                  </p>
                </GlassCard>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {rentKpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-white/8 bg-white/5 p-4"
                >
                  <p className="text-xs text-gray-muted">{kpi.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {todayKpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-white/8 bg-white/5 p-4"
                >
                  <p className="text-xs text-gray-muted">{kpi.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-navy/50 p-4 lg:col-span-1">
                <p className="mb-3 text-xs font-medium text-gray-muted">
                  {t.dashboard.incomeChart} / {t.dashboard.expenseChart}
                </p>
                <FakeBarChart data={[...chartBars]} />
              </div>

              <div className="rounded-2xl border border-white/8 bg-navy/50 p-4">
                <p className="mb-3 text-xs font-medium text-gray-muted">
                  {t.dashboard.rentChart}
                </p>
                <FakeSimpleBars data={[...rentCollectionBars]} color="emerald" />
              </div>

              <div className="rounded-2xl border border-white/8 bg-navy/50 p-4">
                <p className="mb-3 text-xs font-medium text-gray-muted">
                  {t.dashboard.pendingList}
                </p>
                <div className="space-y-2">
                  {pendingPayments.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-muted">{p.property}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs font-semibold text-amber">{p.amount}</p>
                        <p className="text-[10px] uppercase text-gray-muted">{p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
