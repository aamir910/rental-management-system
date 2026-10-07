export type PaymentChannel = "cash" | "account";

export type AccountProvider =
  | "easypaisa"
  | "jazzcash"
  | "ubl"
  | "meezan"
  | "askari"
  | "alfalah"
  | "hbl"
  | "other";

export const ACCOUNT_PROVIDERS: {
  value: AccountProvider;
  label: string;
}[] = [
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "ubl", label: "UBL" },
  { value: "meezan", label: "Meezan" },
  { value: "askari", label: "Askari" },
  { value: "alfalah", label: "Bank Alfalah" },
  { value: "hbl", label: "HBL" },
  { value: "other", label: "Other account" },
];

export function isAccountProvider(value: string): value is AccountProvider {
  return ACCOUNT_PROVIDERS.some((p) => p.value === value);
}

export function parsePaymentChannel(value: unknown): PaymentChannel | null {
  const v = String(value || "").trim();
  if (v === "cash" || v === "account") return v;
  return null;
}

export function parseAccountProvider(value: unknown): AccountProvider | null {
  const v = String(value || "").trim();
  if (!v) return null;
  return isAccountProvider(v) ? v : null;
}

export function accountProviderLabel(
  provider: AccountProvider | null | undefined
) {
  if (!provider) return "Account";
  return ACCOUNT_PROVIDERS.find((p) => p.value === provider)?.label ?? provider;
}

export function paymentChannelLabel(
  channel: PaymentChannel | null | undefined,
  provider?: AccountProvider | null
) {
  if (!channel) return "—";
  if (channel === "cash") return "Cash";
  return accountProviderLabel(provider);
}

/** Normalize channel + provider from form/API values. */
export function normalizePaymentFields(values: {
  payment_channel?: string;
  account_provider?: string;
}): {
  payment_channel: PaymentChannel;
  account_provider: AccountProvider | null;
} {
  const channel = parsePaymentChannel(values.payment_channel) ?? "cash";
  const provider =
    channel === "account"
      ? parseAccountProvider(values.account_provider) ?? "other"
      : null;
  if (channel === "account" && !provider) {
    throw new Error("Select an account (EasyPaisa, UBL, Meezan, …).");
  }
  return { payment_channel: channel, account_provider: provider };
}
