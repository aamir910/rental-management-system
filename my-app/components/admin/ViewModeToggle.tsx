"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";

export type ViewMode = "grid" | "list";

export function useViewMode(storageKey: string, defaultMode: ViewMode = "grid") {
  const [view, setView] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "grid" || saved === "list") {
        setView(saved);
        return;
      }
      setView(
        window.matchMedia("(min-width: 768px)").matches ? "list" : "grid"
      );
    } catch {
      setView(defaultMode);
    }
  }, [storageKey, defaultMode]);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
  }

  return { view, changeView };
}

export function ViewModeToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl border border-gray-soft bg-surface p-0.5"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          view === "grid"
            ? "bg-white text-ink shadow-sm"
            : "text-gray-text hover:text-ink"
        }`}
        aria-pressed={view === "grid"}
      >
        <LayoutGrid size={14} />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          view === "list"
            ? "bg-white text-ink shadow-sm"
            : "text-gray-text hover:text-ink"
        }`}
        aria-pressed={view === "list"}
      >
        <List size={14} />
        List
      </button>
    </div>
  );
}
