import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, Check, CountryMark } from "@/components/ui/Marks";
import { countries, getCountry, isCountrySlug } from "@/config/countries";
import { priceNote } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const entry = getCountry(country);
  if (!entry) return { title: "Services" };
  return {
    title: `Business registration in ${entry.name}`,
    description: `Register a business in ${entry.name}. Fixed package prices, government fees at cost and a dashboard that tracks every stage.`,
    alternates: { canonical: `/services/${entry.slug}` },
  };
}

export default async function CountryServicesPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!isCountrySlug(country)) notFound();

  const entry = getCountry(country);
  if (!entry) notFound();

  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);
  const services = catalog.services.filter((service) => service.country === country);
  const compliance = catalog.compliance.filter((service) => service.country === country);

  return (
    <>
      <PageHero
        eyebrow={`${entry.name} registrations`}
        title={`Register a business in ${entry.name}`}
        intro={`Choose the structure, see the package prices and the government fee before you start. ${entry.governmentLine}`}
      >
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {countries.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              aria-current={other.slug === country ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-[13px] transition ${
                other.slug === country
                  ? "border-forest bg-forest text-ivory"
                  : "border-line bg-paper text-ink/70 hover:border-ink/40"
              }`}
            >
              {other.name}
            </Link>
          ))}
        </div>
      </PageHero>

      <section className="bg-paper">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/services", label: "Services" },
              { label: entry.name },
            ]}
          />

          <div className="grid gap-4">
            {services.map((service) => (
              <article
                key={service.slug}
                className="card grid gap-6 p-6 md:grid-cols-12 md:p-8"
              >
                <div className="md:col-span-7">
                  <div className="flex items-center gap-2">
                    <CountryMark mark={entry.mark} className="h-5 w-5 text-forest" />
                    <span className="eyebrow">{service.entityLabel}</span>
                  </div>
                  <h2 className="mt-3 font-display text-[clamp(1.6rem,1.3rem+1.2vw,2.2rem)] tracking-[-0.03em]">
                    <Link href={`/services/${country}/${service.slug}`} className="hover:text-forest">
                      {service.name}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink/70">
                    {service.description}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-[13px] text-ink/75">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-forest" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-5 md:border-l md:border-line md:pl-6">
                  <p className="eyebrow">Packages from</p>
                  <p className="mono mt-1 text-[32px] leading-none tracking-[-0.04em]">
                    {formatMoney(service.packages[0]?.price ?? 0, service.currency)}
                  </p>
                  <p className="mt-2 text-[12.5px] text-muted">
                    Government fee {service.governmentFeeWaived ? "waived" : "at cost"}{" "}
                    {service.governmentFeeWaived
                      ? ""
                      : `${service.governmentFeeFrom ? "from " : ""}${formatMoney(service.governmentFee, service.currency)}`}
                  </p>
                  <p className="mt-3 text-[12px] text-muted">{service.processing}</p>
                  <Link
                    href={`/services/${country}/${service.slug}`}
                    className="btn btn-primary mt-5 w-full"
                  >
                    View packages
                    <ArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {compliance.length > 0 ? (
            <div className="mt-12">
              <h2 className="font-display text-[26px] tracking-[-0.03em]">
                Keep it compliant afterwards
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {compliance.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/compliance/${service.slug}`}
                      className="flex items-center justify-between rounded-[12px] border border-line bg-ivory/60 px-4 py-3 text-[13.5px] hover:border-ink/30"
                    >
                      <span>{service.name}</span>
                      <span className="mono text-[12px] text-muted">
                        {service.quote || service.price === null
                          ? "By quote"
                          : `${formatMoney(service.price, service.currency)}${service.billing === "yearly" ? " a year" : ""}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-10 max-w-3xl text-[12px] text-muted">{priceNote}</p>
        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
