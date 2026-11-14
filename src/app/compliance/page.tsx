import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, CountryMark } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries } from "@/config/countries";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Compliance",
  description:
    "Annual returns, beneficial ownership filings, tax IDs, confirmation statements and registered agent renewals for Nigeria, the UK and the US.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/compliance" } : undefined,
};

export default async function CompliancePage() {
  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);

  return (
    <>
      <PageHero
        eyebrow="Compliance"
        title="Stay in good standing, without the calendar maths."

      />

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Compliance" }]} />

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Dates tracked",
                body: "Deadlines are added to your calendar after registration.",
              },
              {
                title: "Reminders that arrive early",
                body: "Reminders go out before each deadline.",
              },
              {
                title: "Nothing charged quietly",
                body: "Yearly services are invoiced and reminded. Nothing renews without your approval.",
              },
            ].map((item, index) => (
              <div key={item.title} className="card p-6">
                <p className="numeral text-[34px]">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-3 font-display text-[20px] tracking-[-0.02em]">{item.title}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy-950/70">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 space-y-10">
            {countries.map((country) => {
              const services = catalog.compliance.filter(
                (service) => service.country === country.slug,
              );
              if (services.length === 0) return null;
              return (
                <div key={country.slug}>
                  <div className="mb-3 flex items-center gap-2">
                    <CountryMark mark={country.mark} className="h-4 w-4 text-navy-900" />
                    <h2 className="font-display text-[23px] tracking-[-0.03em]">{country.name}</h2>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/compliance/${service.slug}`}
                        className="card group flex items-start justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                      >
                        <div>
                          <p className="text-[15px] font-medium">{service.name}</p>
                          <p className="mt-1 text-[13px] leading-relaxed text-navy-950/65">
                            {service.summary}
                          </p>
                          {service.billing === "yearly" ? (
                            <span className="pill mt-3">Yearly, invoiced</span>
                          ) : null}
                        </div>
                        <div className="flex-none text-right">
                          <p className="mono text-[14px]">
                            {service.quote || service.price === null
                              ? "By quote"
                              : formatMoney(service.price, service.currency)}
                          </p>
                          {service.billing === "yearly" ? (
                            <p className="text-[11px] text-slate-muted">a year</p>
                          ) : null}
                          <ArrowRight className="ml-auto mt-3 text-navy-900 transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
