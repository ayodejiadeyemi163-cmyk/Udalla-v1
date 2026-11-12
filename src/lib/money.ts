import type { CurrencyCode } from "@/config/pricing";

const locales: Record<CurrencyCode, string> = {
  NGN: "en-NG",
  GBP: "en-GB",
  USD: "en-US",
};

/**
 * Formats money with a symbol only. Body copy must never show NGN, GBP or USD.
 */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRange(
  from: number,
  to: number | null,
  currency: CurrencyCode,
): string {
  if (to === null) return `from ${formatMoney(from, currency)}`;
  return `${formatMoney(from, currency)} to ${formatMoney(to, currency)}`;
}
