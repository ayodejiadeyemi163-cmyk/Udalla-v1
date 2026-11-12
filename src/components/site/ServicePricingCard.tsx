"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "@/components/ui/Marks";
import type { PackageTier, ServiceDefinition } from "@/config/pricing";
import { formatMoney } from "@/lib/money";

export function ServicePricingCard({
  service,
  initialTier,
  priceNote,
}: {
  service: ServiceDefinition;
  initialTier?: PackageTier;
  priceNote: string;
}) {
  const [tier, setTier] = useState<PackageTier>(initialTier ?? "standard");
  const selected = service.packages.find((entry) => entry.tier === tier) ?? service.packages[0];
  const government = service.governmentFeeWaived ? 0 : service.governmentFee;
  const total = (selected?.price ?? 0) + government;

  return (
    <div className="card p-5 shadow-lift md:p-6">
      <p className="eyebrow">Your estimate</p>
      <div className="mt-4 grid gap-1.5" role="radiogroup" aria-label="Choose a package">
        {service.packages.map((entry) => {
          const active = entry.tier === (selected?.tier ?? "standard");
          return (
            <button
              key={entry.tier}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTier(entry.tier)}
              className={`flex items-center justify-between gap-2 rounded-[10px] border px-3 py-2.5 text-left transition ${
                active
                  ? "border-forest bg-forest/[0.06]"
                  : "border-line hover:border-ink/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full border ${
                    active ? "border-forest bg-forest text-ivory" : "border-ink/25"
                  }`}
                >
                  {active ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                <span className="text-[13.5px]">{entry.name}</span>
                {entry.badge ? (
                  <span className="pill hidden sm:inline-flex">{entry.badge}</span>
                ) : null}
              </span>
              <span className="mono text-[13px]">
                {formatMoney(entry.price, service.currency)}
              </span>
            </button>
          );
        })}
      </div>

      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">{selected?.name ?? "Package"} service fee</dt>
          <dd className="mono">{formatMoney(selected?.price ?? 0, service.currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">{service.governmentFeeLabel}</dt>
          <dd className="mono">
            {service.governmentFeeWaived ? (
              <span className="text-forest">Waived</span>
            ) : (
              <>
                {service.governmentFeeFrom ? "from " : ""}
                {formatMoney(service.governmentFee, service.currency)}
              </>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-[15px]">
          <dt className="font-medium">Total</dt>
          <dd className="mono text-[18px]">{formatMoney(total, service.currency)}</dd>
        </div>
      </dl>

      {service.governmentFeeWaived ? (
        <p className="mt-3 rounded-[10px] bg-forest/[0.06] px-3 py-2 text-[11.5px] text-forest">
          Government fee waived for a limited time
        </p>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Government fee shown at cost.{" "}
          {service.governmentFeeFrom
            ? "The exact amount is confirmed before submission."
            : ""}
        </p>
      )}

      <Link
        href={`/start/${service.country}/${service.slug}?package=${selected?.tier ?? "standard"}`}
        className="btn btn-primary mt-4 w-full"
      >
        Get started
      </Link>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">{priceNote}</p>
    </div>
  );
}
