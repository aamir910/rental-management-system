"use client";

import {
  ACCOUNT_PROVIDERS,
  type AccountProvider,
  type PaymentChannel,
} from "@/lib/payment-channels";

export function PaymentChannelFields({
  channel,
  provider,
  onChannelChange,
  onProviderChange,
  compact = false,
  channelLabel = "Via",
}: {
  channel: PaymentChannel;
  provider: AccountProvider | "";
  onChannelChange: (channel: PaymentChannel) => void;
  onProviderChange: (provider: AccountProvider | "") => void;
  compact?: boolean;
  channelLabel?: string;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div>
        <span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-text">
          {channelLabel}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChannelChange("cash")}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              channel === "cash"
                ? "border-violet bg-violet/10 text-violet"
                : "border-gray-soft bg-white text-gray-text hover:border-violet/30"
            }`}
          >
            Cash
          </button>
          <button
            type="button"
            onClick={() => onChannelChange("account")}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              channel === "account"
                ? "border-violet bg-violet/10 text-violet"
                : "border-gray-soft bg-white text-gray-text hover:border-violet/30"
            }`}
          >
            Account
          </button>
        </div>
      </div>

      {channel === "account" ? (
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-text">
            Account
          </span>
          <select
            value={provider}
            onChange={(e) =>
              onProviderChange(e.target.value as AccountProvider | "")
            }
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="">Select account…</option>
            {ACCOUNT_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
