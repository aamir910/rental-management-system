"use client";

import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const links = [
    { href: "#home", label: t.footer.home },
    { href: "#features", label: t.footer.features },
    { href: "#how", label: t.footer.how },
    { href: "#future", label: t.footer.comingSoon },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet text-sm font-bold text-white">
                Y
              </span>
              <span className="text-lg font-semibold text-white">
                Yasin <span className="text-violet-soft">RMS</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-muted">
              {t.footer.tagline1}
              <br />
              {t.footer.tagline2}
              <br />
              {t.footer.tagline3}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-muted transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-white">{t.footer.fullName}</p>
          <p className="text-sm text-gray-muted">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
