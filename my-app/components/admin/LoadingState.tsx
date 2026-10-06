"use client";

import { Loader2 } from "lucide-react";

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-gray-text"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-violet" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <Loader2
      className={`inline h-4 w-4 animate-spin text-violet ${className}`}
      aria-hidden
    />
  );
}

/** Thin bar while RTK Query refetches in the background */
export function FetchingBar({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-violet/15"
      role="status"
      aria-label="Updating data"
    >
      <div className="h-full w-full animate-pulse bg-violet" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
      <div className="h-3 w-24 rounded bg-gray-soft" />
      <div className="mt-3 h-6 w-32 rounded bg-gray-soft" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-gray-soft/70" />
      ))}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
      {message}
    </div>
  );
}
