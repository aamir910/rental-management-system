"use client";

import { InlineSpinner } from "@/components/admin/LoadingState";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        disabled={loading}
        className="absolute inset-0 bg-navy/50 backdrop-blur-[2px] transition"
        onClick={() => {
          if (!loading) onCancel();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl border border-gray-soft bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-soft sm:hidden" />

        <div className="flex items-start gap-3 px-5 pb-2 pt-4 sm:pt-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red/10 text-red">
            <AlertTriangle size={22} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-ink sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1.5 text-sm leading-relaxed text-gray-text">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl p-1.5 text-gray-text hover:bg-gray-soft/60 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <p className="mx-5 mt-2 rounded-xl border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col-reverse gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:pb-5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="w-full rounded-xl border border-gray-soft bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-gray-soft/50 disabled:opacity-60 sm:w-auto sm:py-2.5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red px-4 py-3 text-sm font-semibold text-white hover:bg-red/90 disabled:opacity-60 sm:w-auto sm:py-2.5"
          >
            {loading && <InlineSpinner className="text-white" />}
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
