"use client";

import { useState } from "react";
import { savePackageStep } from "@/app/actions/checkout";
import { Check } from "@/components/ui/Marks";
import type { CurrencyCode, PackageTier } from "@/config/pricing";
import { formatMoney } from "@/lib/money";

interface PackView {
  tier: PackageTier;
  name: string;
  badge?: string;
  price: number;
  features: string[];
}

interface AddOnView {
  slug: string;
  name: string;
  price: number;
  billing: "one-off" | "yearly";
  description: string;
}

export function PackagePicker({
  draftId,
  packages,
  addOns,
  initialTier,
  initialAddOns,
  currency,
  governmentFee,
  governmentFeeWaived,
  governmentFeeFrom,
  governmentFeeLabel,
}: {
  draftId: string;
  packages: PackView[];
  addOns: AddOnView[];
  initialTier: PackageTier;
  initialAddOns: string[];
  currency: CurrencyCode;
  governmentFee: number;
  governmentFeeWaived: boolean;
  governmentFeeFrom: boolean;
  governmentFeeLabel: string;
}) {
  const [tier, setTier] = useState<PackageTier>(initialTier);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(initialAddOns);

  const selected = packages.find((entry) => entry.tier === tier) ?? packages[0];
  const addOnsTotal = addOns
    .filter((entry) => selectedAddOns.includes(entry.slug))
    .reduce((sum, entry) => sum + entry.price, 0);
  const fee = governmentFeeWaived ? 0 : governmentFee;
  const total = (selected?.price ?? 0) + addOnsTotal + fee;

  function toggleAddOn(slug: string) {
    setSelectedAddOns((current) =>
      current.includes(slug) ? current.filter((entry) => entry !== slug) : [...current, slug],
    );
  }

  return (
    <form action={savePackageStep}>
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="packageTier" value={tier} />
      {selectedAddOns.map((slug) => (
        <input key={slug} type="hidden" name="addOns" value={slug} />
      ))}

      <div className="grid gap-3" role="radiogroup" aria-label="Package">
        {packages.map((entry) => {
          const active = entry.tier === tier;
          return (
            <button
              key={entry.tier}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTier(entry.tier)}
              className={`rounded-[14px] border p-4 text-left transition ${
                active
                  ? "border-forest bg-forest/[0.05] shadow-soft"
                  : "border-line hover:border-ink/30"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full border ${
                      active ? "border-forest bg-forest text-ivory" : "border-ink/25"
                    }`}
                  >
                    {active ? <Check className="h-2.5 w-2.5" /> : null}
                  </span>
                  <span className="font-display text-[19px] tracking-[-0.02em]">
                    {entry.name}
                  </span>
                  {entry.badge ? (
                    <span className="pill pill-marigold">{entry.badge}</span>
                  ) : null}
                </span>
                <span className="mono text-[15px]">{formatMoney(entry.price, currency)}</span>
              </span>
              <span className="mt-2 block pl-6 text-[12.5px] leading-relaxed text-ink/65">
                {entry.features.slice(0, 3).join(" · ")}
              </span>
            </button>
          );
        })}
      </div>

      {addOns.length > 0 ? (
        <div className="mt-6">
          <p className="eyebrow">Add-ons</p>
          <div className="mt-2 divide-y divide-line border-y border-line">
            {addOns.map((addOn) => {
              const active = selectedAddOns.includes(addOn.slug);
              return (
                <label
                  key={addOn.slug}
                  className="flex cursor-pointer items-start gap-3 py-3"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleAddOn(addOn.slug)}
                    className="mt-0.5 h-4 w-4 flex-none accent-forest"
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px]">{addOn.name}</span>
                      <span className="mono text-[12.5px]">
                        {formatMoney(addOn.price, currency)}
                        {addOn.billing === "yearly" ? " a year" : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">
                      {addOn.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="card mt-6 p-4">
        <dl className="space-y-1.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-ink/70">{selected?.name ?? "Package"}</dt>
            <dd className="mono">{formatMoney(selected?.price ?? 0, currency)}</dd>
          </div>
          {addOnsTotal > 0 ? (
            <div className="flex justify-between">
              <dt className="text-ink/70">Add-ons</dt>
              <dd className="mono">{formatMoney(addOnsTotal, currency)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink/70">{governmentFeeLabel}</dt>
            <dd className="mono">
              {governmentFeeWaived ? (
                <span className="text-forest">Waived</span>
              ) : (
                <>
                  {governmentFeeFrom ? "from " : ""}
                  {formatMoney(governmentFee, currency)}
                </>
              )}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-[15px]">
            <dt className="font-medium">Total today</dt>
            <dd className="mono text-[17px]" aria-live="polite">
              {formatMoney(total, currency)}
            </dd>
          </div>
        </dl>
        {governmentFeeWaived ? (
          <p className="mt-2 text-[11.5px] text-forest">
            Government fee waived for a limited time
          </p>
        ) : null}
      </div>

      <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto">
        Continue to business details
      </button>
    </form>
  );
}
