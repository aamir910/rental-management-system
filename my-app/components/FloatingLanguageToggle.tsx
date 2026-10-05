"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/** Always-visible language control so Urdu mode is easy to reach on any screen size. */
export function FloatingLanguageToggle() {
  return (
    <div className="fixed bottom-5 end-5 z-[100] sm:bottom-6 sm:end-6">
      <LanguageSwitcher />
    </div>
  );
}
