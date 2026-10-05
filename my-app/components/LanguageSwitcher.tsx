"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: Props) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/20 bg-navy/80 p-1 text-xs font-semibold shadow-lg shadow-black/20 backdrop-blur-md ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`min-w-[2.75rem] rounded-full px-3 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-violet text-white"
            : "text-white/70 hover:text-white"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ur")}
        className={`min-w-[3.25rem] rounded-full px-3 py-1.5 transition-colors ${
          lang === "ur"
            ? "bg-violet text-white"
            : "text-white/70 hover:text-white"
        }`}
        aria-pressed={lang === "ur"}
      >
        اردو
      </button>
    </div>
  );
}
