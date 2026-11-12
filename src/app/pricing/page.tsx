import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { MobileCtaBar } from "@/components/site/MobileCtaBar";
import { PageHero } from "@/components/site/PageHero";
import { Check, CountryMark } from "@/components/ui/Marks";
import { countries } from "@/config/countries";
import { packageOrder, priceNote, type CurrencyCode, type PackageTier } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Every Udalla package and government fee in one place. Nigeria, the United Kingdom and the United States, with the total shown before you pay.",
  alternates: { canonical: "/pricing" },
};

const PACKAGE_COPY: Record<PackageTier, { name: string; badge?: string; summary: string }> = {
  starter: {
    name: "Starter",
    summary: "The filing itself, the certificate and a dashboard that tracks every stage.",
  },
  standard: {
    name: "Standard",
    badge: "Recommended",
    summary: "Adds tax ID help, the company documents pack and a banking resolution.",
  },
  premium: {
    name: "Premium",
    badge: "Fastest filing",
    summary: "Adds priority processing, a registered office or agent for year one and a consultation.",
  },
};

const FEATURE_ROWS: { label: string; tiers: PackageTier[] }[] = [
  { label: "Filing prepared and submitted by the Udalla filing team", tiers: ["starter", "standard", "premium"] },
  { label: "Certificate and registration documents", tiers: ["starter", "standard", "premium"] },
  { label: "Dashboard tracking for every stage", tiers: ["starter", "standard", "premium"] },
  { label: "Compliance alerts before deadlines", tiers: ["starter", "standard", "premium"] },
  { label: "Tax ID help", tiers: ["standard", "premium"] },
  { label: "Company documents pack", tiers: ["standard", "premium"] },
  { label: "Banking resolution", tiers: ["standard", "premium"] },
  { label: "Registered agent for the first year, where applicable", tiers: ["standard", "premium"] },
  { label: "Priority processing", tiers: ["premium"] },
  { label: "Registered office or agent for year one", tiers: ["premium"] },
  { label: "One 30 minute compliance consultation with a partner lawyer", tiers: ["premium"] },
];

const CURRENCIES: CurrencyCode[] = ["NGN", "GBP", "USD"];

export default async function PricingPage() {
  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);

  function minimumFor(tier: PackageTier, currency: CurrencyCode): number {
    const amounts = catalog.services
      .filter((service) => service.currency === currency)
      .map(
        (service) =>
          service.packages.find((entry) => entry.tier === tier)?.price ?? Number.MAX_SAFE_INTEGER,
      );
    return amounts.length > 0 ? Math.min(...amounts) : 0;
  }

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="The price you see is the price you pay."
        intro="Three packages per service. Government fees are separate and shown at cost, because the registries set them, not us."
      >
        <p className="mt-6 max-w-2xl text-[13px] text-ink/65">{priceNote}</p>
      </PageHero>

      <section className="bg-paper">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Pricing" }]} />

          <div className="grid gap-4 md:grid-cols-3">
            {packageOrder.map((tier) => {
              const copy = PACKAGE_COPY[tier];
              const highlighted = tier === "standard";
              return (
                <article
                  key={tier}
                  className={`relative flex flex-col rounded-[16px] border p-6 ${
                    highlighted ? "border-forest bg-ivory shadow-lift" : "border-line bg-ivory/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[24px] tracking-[-0.03em]">{copy.name}</h2>
                    {copy.badge ? (
                      <span className={`pill ${highlighted ? "pill-marigold" : "pill-forest"}`}>
                        {copy.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{copy.summary}</p>
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="eyebrow">From</p>
                    <div className="mt-1 space-y-0.5">
                      {CURRENCIES.map((currency) => (
                        <p key={currency} className="mono text-[17px] tracking-[-0.02em]">
                          {formatMoney(minimumFor(tier, currency), currency)}
                        </p>
                      ))}
                    </div>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2">
                    {FEATURE_ROWS.filter((row) => row.tiers.includes(tier)).slice(0, 6).map((row) => (
                      <li key={row.label} className="flex gap-2 text-[12.5px] leading-snug text-ink/75">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-forest" />
                        {row.label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/services"
                    className={`btn mt-6 w-full ${highlighted ? "btn-primary" : "btn-outline"}`}
                  >
                    Choose a service
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-14">
            <h2 className="display text-[clamp(1.8rem,1.4rem+1.6vw,2.6rem)]">
              Every service, every package
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink/70">
              Grouped by country. Government fees sit in their own column, at cost.
            </p>

            <div className="mt-8 space-y-10">
              {countries.map((country) => {
                const services = catalog.services.filter(
                  (service) => service.country === country.slug,
                );
                return (
                  <div key={country.slug}>
                    <div className="mb-3 flex items-center gap-2">
                      <CountryMark mark={country.mark} className="h-4 w-4 text-forest" />
                      <h3 className="font-display text-[21px] tracking-[-0.025em]">
                        {country.name}
                      </h3>
                    </div>
                    <div className="-mx-1 overflow-x-auto px-1">
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="border-y border-line">
                            <th className="py-3 pr-4 text-[11px] uppercase tracking-[0.12em] text-muted">
                              Service
                            </th>
                            {packageOrder.map((tier) => (
                              <th
                                key={tier}
                                className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-muted"
                              >
                                {PACKAGE_COPY[tier].name}
                              </th>
                            ))}
                            <th className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-muted">
                              Government fee
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((service) => (
                            <tr key={service.slug} className="border-b border-line">
                              <td className="py-4 pr-4">
                                <Link
                                  href={`/services/${service.country}/${service.slug}`}
                                  className="text-[13.5px] font-medium hover:text-forest"
                                >
                                  {service.name}
                                </Link>
                                <p className="mono mt-0.5 text-[11px] text-muted">
                                  {service.processing}
                                </p>
                              </td>
                              {packageOrder.map((tier) => {
                                const pack = service.packages.find((entry) => entry.tier === tier);
                                return (
                                  <td key={tier} className="mono px-3 py-4 text-[13px]">
                                    {formatMoney(pack?.price ?? 0, service.currency)}
                                  </td>
                                );
                              })}
                              <td className="mono px-3 py-4 text-[13px]">
                                {service.governmentFeeWaived ? (
                                  <span className="text-forest">Waived</span>
                                ) : (
                                  <>
                                    {service.governmentFeeFrom ? "from " : ""}
                                    {formatMoney(service.governmentFee, service.currency)}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14">
            <h2 className="display text-[clamp(1.8rem,1.4rem+1.6vw,2.6rem)]">
              What each package includes
            </h2>
            <div className="mt-6 -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line">
                    <th className="py-3 pr-4 text-[11px] uppercase tracking-[0.12em] text-muted">
                      Included
                    </th>
                    {packageOrder.map((tier) => (
                      <th
                        key={tier}
                        className="w-28 px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-muted"
                      >
                        {PACKAGE_COPY[tier].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-line">
                      <td className="py-3 pr-4 text-[13px] text-ink/80">{row.label}</td>
                      {packageOrder.map((tier) => (
                        <td key={tier} className="px-3 py-3">
                          {row.tiers.includes(tier) ? (
                            <Check className="h-4 w-4 text-forest" />
                          ) : (
                            <span className="text-[13px] text-muted">Not included</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mt-12 p-6 md:p-8">
            <h2 className="font-display text-[22px] tracking-[-0.025em]">Compliance after registration</h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink/70">
              Yearly and one-off compliance services are priced separately. They are invoiced
              and reminded, never charged automatically.
            </p>
            <Link href="/compliance" className="btn btn-outline mt-5">
              See compliance prices
            </Link>
          </div>

          <p className="mt-8 max-w-3xl text-[12px] text-muted">{priceNote}</p>
        </div>
      </section>

      <ClosingBanner contact={contact} />
      <MobileCtaBar href="/services" label="Choose a service" />
    </>
  );
}
