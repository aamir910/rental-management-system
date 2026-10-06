"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export function UtilityRefCard({
  title,
  reference,
  checkLabel,
  checkUrl,
}: {
  title: string;
  reference: string | null | undefined;
  checkLabel: string;
  checkUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const value = reference?.trim() || "";

  async function copyRef() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy reference number:", value);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-text">{title}</p>
      <p className="mt-2 break-all font-mono text-base font-semibold text-ink">
        {value || "Not added"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyRef}
          disabled={!value}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-soft px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-soft/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy size={14} />
          {copied ? "Copied" : "Copy"}
        </button>

        <a
          href={checkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-soft"
        >
          <ExternalLink size={14} />
          {checkLabel}
        </a>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-text">
        Copy the reference, then open the bill website and paste it there to check.
      </p>
    </div>
  );
}
