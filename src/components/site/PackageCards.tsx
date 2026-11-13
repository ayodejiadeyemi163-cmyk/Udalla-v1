import Link from "next/link";
import { priceNote } from "@/config/pricing";
import type { ServiceDefinition } from "@/config/pricing";
import { formatMoney } from "@/lib/money";
import { Check } from "@/components/ui/Marks";
import { CountryTabs } from "./CountryTabs";

export function PackageCards({
  service,
  country,
  basePath,
}: {
  service: ServiceDefinition;
  country: string;
  basePath: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CountryTabs current={country} basePath={basePath} />
        <p className="text-[12.5px] text-slate-muted">
          Packages for{" "}
          <Link
            href={`/services/${service.country}/${service.slug}`}
            className="link-quiet"
          >
            {service.name}
          </Link>
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {service.packages.map((entry) => {
          const highlighted = entry.tier === "standard";
          return (
            <article
              key={entry.tier}
              className={`relative flex flex-col rounded-[16px] border p-6 ${
                highlighted
                  ? "border-navy-900 bg-cream-50 shadow-lift"
                  : "border-cream-300 bg-cream-50/70"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-[22px] tracking-[-0.025em]">{entry.name}</h3>
                {entry.badge ? (
                  <span className={`pill ${highlighted ? "pill-emerald" : "pill-emerald-soft"}`}>
                    {entry.badge}
                  </span>
                ) : null}
              </div>
              <p className="mono mt-5 text-[34px] leading-none tracking-[-0.04em]">
                {formatMoney(entry.price, service.currency)}
              </p>
              <p className="mt-2 text-[12.5px] text-slate-muted">
                {service.governmentFeeWaived
                  ? "Government fee waived for a limited time"
                  : `Plus government fee ${service.governmentFeeFrom ? "from " : ""}${formatMoney(service.governmentFee, service.currency)} at cost`}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 border-t border-cream-300 pt-5">
                {entry.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[13px] leading-snug text-navy-950/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-navy-900" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/start/${service.country}/${service.slug}?package=${entry.tier}`}
                className={`btn mt-6 w-full ${highlighted ? "btn-primary" : "btn-outline"}`}
              >
                Start with {entry.name}
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <p className="text-[12px] text-slate-muted">{priceNote}</p>
        <Link href="/pricing" className="link-quiet self-start text-[13px]">
          Compare all packages and government fees
        </Link>
      </div>
    </div>
  );
}
