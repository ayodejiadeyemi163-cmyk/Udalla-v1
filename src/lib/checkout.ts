import type { ServiceDefinition } from "@/config/pricing";
import type { PackageTier } from "@/config/pricing";
import type { Draft, Order } from "@/lib/store/types";

export interface Totals {
  packagePrice: number;
  addOnsTotal: number;
  governmentFee: number;
  total: number;
}

/** Totals are always recomputed on the server from the catalog. */
export function priceSelection(
  service: ServiceDefinition,
  tier: PackageTier,
  addOnSlugs: string[],
): Totals {
  const pack = service.packages.find((entry) => entry.tier === tier) ?? service.packages[0];
  const validAddOns = service.addOns.filter((addOn) => addOnSlugs.includes(addOn.slug));
  const addOnsTotal = validAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const governmentFee = service.governmentFeeWaived ? 0 : service.governmentFee;
  const packagePrice = pack?.price ?? 0;

  return {
    packagePrice,
    addOnsTotal,
    governmentFee,
    total: packagePrice + addOnsTotal + governmentFee,
  };
}

export function draftTotals(draft: Draft, service: ServiceDefinition): Totals {
  return priceSelection(service, draft.packageTier, draft.addOns);
}

export function orderTotals(order: Order): Totals {
  return {
    packagePrice: order.packagePrice,
    addOnsTotal: order.addOnsTotal,
    governmentFee: order.governmentFee,
    total: order.total,
  };
}

export const ORDER_STEPS = [
  { step: 1, label: "Package" },
  { step: 2, label: "Business details" },
  { step: 3, label: "People" },
  { step: 4, label: "Documents" },
  { step: 5, label: "Review" },
  { step: 6, label: "Payment" },
] as const;

export const MAX_STEP = 6;

export function clampStep(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_STEP, Math.max(1, Math.round(value)));
}
