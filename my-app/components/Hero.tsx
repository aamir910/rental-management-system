"use client";

import { Badge, Reveal } from "@/components/ui/Section";
import { AnimatedCounter, FakeBarChart } from "@/components/ui/Charts";
import { useLanguage } from "@/context/LanguageContext";
import { chartBars, heroStats } from "@/lib/demo-data";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="home" className="gradient-mesh relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge>
              <Sparkles size={12} />
              {t.hero.badge}
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display mt-6 text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <span className="text-gradient">{t.hero.heading}</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-base leading-relaxed text-gray-muted sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            {t.hero.supporting}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet/30 transition hover:bg-violet-soft"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.p
            className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-violet-soft/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t.hero.label}
          </motion.p>
        </div>

        <Reveal delay={0.15}>
          <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-2xl shadow-violet/10 sm:p-6">
            <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-violet/20 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{t.hero.dashboardTitle}</h3>
                <span className="rounded-full bg-emerald/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald">
                  LIVE DEMO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.hero.properties, value: heroStats.properties, numeric: true },
                  { label: t.hero.activeTenants, value: heroStats.activeTenants, numeric: true },
                  { label: t.hero.monthlyRent, value: heroStats.monthlyRent, numeric: false },
                  { label: t.hero.pendingRent, value: heroStats.pendingRent, numeric: false, warn: true },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-xl border border-white/8 bg-white/5 p-3.5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <p className="text-[11px] text-gray-muted">{stat.label}</p>
                    <p
                      className={`mt-1 text-lg font-semibold ${
                        stat.warn ? "text-amber" : "text-white"
                      }`}
                    >
                      {stat.numeric ? (
                        <AnimatedCounter value={stat.value as number} />
                      ) : (
                        (stat.value as string)
                      )}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald/20 bg-emerald/10 p-3">
                  <p className="text-[11px] text-emerald/80">{t.hero.todayIncome}</p>
                  <p className="mt-0.5 text-base font-semibold text-emerald">
                    {heroStats.todayIncome}
                  </p>
                </div>
                <div className="rounded-xl border border-violet/20 bg-violet/10 p-3">
                  <p className="text-[11px] text-violet-soft/80">{t.hero.todayExpenses}</p>
                  <p className="mt-0.5 text-base font-semibold text-violet-soft">
                    {heroStats.todayExpenses}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/8 bg-navy/40 p-3">
                <FakeBarChart data={[...chartBars]} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
