import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CountryTabs } from "@/components/site/CountryTabs";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, Check, CountryMark } from "@/components/ui/Marks";
import { countries, isCountrySlug, type CountrySlug } from "@/config/countries";
import { priceNote } from "@/config/pricing";
import { getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Business registrations",
  description:
    "Compare business registration services in Nigeria, the United Kingdom and the United States. Packages, government fees and processing times, shown up front.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/services" } : undefined,
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const active: CountrySlug = isCountrySlug(params.country) ? params.country : "nigeria";

  return (
    <>
      <PageHero
        eyebrow="Business registrations"
        title="Six registrations. One guided flow."
        intro="Pick the country, then the structure."
      >
        <div className="mt-8">
          <CountryTabs current={active} basePath="/services" />
        </div>
      </PageHero>

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Services" }]} />

          <div className="grid gap-4 md:grid-cols-2">
            {catalog.services
              .filter((service) => service.country === active)
              .map((service) => (
                <article key={service.slug} className="card flex flex-col p-6 md:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span className="pill pill-emerald-soft">
                      <CountryMark
                        mark={countries.find((entry) => entry.slug === service.country)?.mark ?? "ng"}
                        className="h-3.5 w-3.5"
                      />
                      {service.entityLabel}
                    </span>
                    </div>
                  <h2 className="mt-5 font-display text-[26px] leading-tight tracking-[-0.03em]">
                    <Link href={`/services/${service.country}/${service.slug}`} className="hover:text-navy-900">
                      {service.name}
                    </Link>
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-navy-950/70">
                    {service.shortDescription}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {service.includes.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2 text-[13px] text-navy-950/75">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-navy-900" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-cream-300 pt-4">
                    <div>
                      <p className="eyebrow">From</p>
                      <p className="mono text-[24px] tracking-[-0.03em]">
                        {formatMoney(service.packages[0]?.price ?? 0, service.currency)}
                      </p>
                      <p className="text-[11.5px] text-slate-muted">
                        plus government fee{" "}
                        {service.governmentFeeFrom ? "from " : ""}
                        {formatMoney(service.governmentFee, service.currency)}
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.country}/${service.slug}`}
                      className="inline-flex items-center gap-2 text-[13.5px] font-medium text-navy-900 hover:underline"
                    >
                      View service
                      <ArrowRight />
                    </Link>
                  </div>
                </article>
              ))}
          </div>

          <div className="mt-10 grid gap-6 border-t border-cream-300 pt-8 md:grid-cols-3">
            {countries.map((country) => (
              <div key={country.slug}>
                <p className="eyebrow">{country.name}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy-950/70">
                </p>
                <Link href={`/services/${country.slug}`} className="link-quiet mt-3 inline-block text-[13px]">
                  Open {country.shortName} services
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-[12px] text-slate-muted">{priceNote}</p>
        </div>
      </section>
    </>
  );
}
