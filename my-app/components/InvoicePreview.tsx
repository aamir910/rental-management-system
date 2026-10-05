"use client";

import { Reveal, Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { invoiceData } from "@/lib/demo-data";
import { FileText } from "lucide-react";

export function InvoicePreview() {
  const { t } = useLanguage();

  const rows = [
    { label: t.invoice.tenant, value: invoiceData.tenant },
    { label: t.invoice.property, value: invoiceData.property },
    { label: t.invoice.billingMonth, value: invoiceData.billingMonth },
    { label: t.invoice.monthlyRent, value: invoiceData.monthlyRent },
    { label: t.invoice.utilities, value: invoiceData.utilities },
    { label: t.invoice.dueDate, value: invoiceData.dueDate },
  ];

  return (
    <Section variant="mid">
      <Reveal>
        <SectionHeading light className="mx-auto max-w-3xl text-center">
          {t.invoice.heading}
        </SectionHeading>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="relative mx-auto mt-12 max-w-md">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet/40 via-transparent to-emerald/20 blur-sm" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white text-ink shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-soft bg-navy px-5 py-4 text-white">
              <div>
                <p className="text-xs text-violet-soft">YASIN RMS</p>
                <p className="text-sm font-semibold tracking-wide">{t.invoice.title}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[10px] font-bold text-amber">
                <FileText size={12} />
                {t.invoice.pdfBadge}
              </span>
            </div>

            <div className="space-y-3 p-5">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-text">{row.label}</span>
                  <span className="font-medium text-ink">{row.value}</span>
                </div>
              ))}

              <div className="mt-2 flex items-center justify-between border-t border-gray-soft pt-4">
                <span className="font-semibold text-ink">{t.invoice.total}</span>
                <span className="text-xl font-bold text-violet">{invoiceData.total}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber/10 px-3 py-2.5">
                <span className="text-sm text-gray-text">{t.invoice.status}</span>
                <span className="rounded-full bg-amber/20 px-2.5 py-0.5 text-xs font-bold text-amber">
                  {invoiceData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
