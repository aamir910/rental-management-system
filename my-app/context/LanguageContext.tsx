"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, type Lang, type TranslationKeys } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
  isUrdu: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "yasin-rms-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "ur" || saved === "en") {
        setLangState(saved);
      }
    } catch {
      // ignore storage errors
    }
    setReady(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "en" ? "ur" : "en";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.setAttribute("lang", lang === "ur" ? "ur" : "en");
    html.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  }, [lang, ready]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: translations[lang],
      dir: lang === "ur" ? "rtl" : "ltr",
      isUrdu: lang === "ur",
    }),
    [lang, setLang, toggleLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        dir={value.dir}
        lang={lang === "ur" ? "ur" : "en"}
        data-lang={lang}
        className={lang === "ur" ? "font-urdu min-h-full" : "min-h-full"}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
