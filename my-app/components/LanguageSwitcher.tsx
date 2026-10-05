"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-violet text-white shadow-sm"
            : "text-gray-muted hover:text-white"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ur")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "ur"
            ? "bg-violet text-white shadow-sm"
            : "text-gray-muted hover:text-white"
        }`}
        aria-pressed={lang === "ur"}
      >
        اردو
      </button>
    </div>
  );
}
