import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, Check, CountryMark } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries, getCountry } from "@/config/countries";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const service = catalog.compliance.find((entry) => entry.slug === slug);
  if (!service) return { title: "Compliance" };
  return {
    title: service.name,
    description: service.summary,
    alternates: process.env.NODE_ENV === "production" ? { canonical: `/compliance/${service.slug}` } : undefined,
  };
}

export default async function ComplianceServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const service = catalog.compliance.find((entry) => entry.slug === slug);
  if (!service) notFound();

  const country = getCountry(service.country);
  const contact = contactFrom(catalog.settings);
  const others = catalog.compliance.filter((entry) => entry.slug !== service.slug);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHero
        eyebrow={`${country?.name ?? ""} compliance`}
        title={service.name}
        intro={service.summary}
      />

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/compliance", label: "Compliance" },
              { label: service.navLabel },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap gap-2">
                <span className="pill pill-emerald-soft">
                  <CountryMark mark={country?.mark ?? "ng"} className="h-3.5 w-3.5" />
                  {country?.name}
                </span>
                <span className="pill">
                  {service.billing === "yearly" ? "Yearly, invoiced" : "One-off filing"}
                </span>
              </div>
              <p className="mt-6 text-[16px] leading-relaxed text-navy-950/80">{service.details}</p>

              <h2 className="mt-10 font-display text-[24px] tracking-[-0.03em]">What is included</h2>
              <ul className="mt-4 space-y-2.5">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-[14px] text-navy-950/80">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-navy-900" />
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="mt-10 font-display text-[24px] tracking-[-0.03em]">How it runs</h2>
              <ol className="mt-4 space-y-4">
                {[
                  "You request the service and confirm the scope.",
                  "We check the registry record and tell you the exact government fee.",
                  "The filing is prepared and submitted once you approve.",
                  "The acknowledgement lands in your dashboard.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4 border-b border-cream-300 pb-4 last:border-0">
                    <span className="numeral w-10 flex-none text-[26px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-[14px] leading-relaxed text-navy-950/75">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-10">
                <h2 className="font-display text-[24px] tracking-[-0.03em]">Questions</h2>
                <div className="mt-3">
                  <FaqList
                    faqs={service.faqs.map((faq, index) => ({
                      ...faq,
                      id: `${service.slug}-${index}`,
                      sortOrder: index,
                    }))}
                  />
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="card p-6 lg:sticky lg:top-28">
                <p className="eyebrow">Price</p>
                <p className="mono mt-2 text-[34px] leading-none tracking-[-0.04em]">
                  {service.quote || service.price === null
                    ? "By quote"
                    : formatMoney(service.price, service.currency)}
                </p>
                {service.billing === "yearly" ? (
                  <p className="mt-1 text-[12.5px] text-slate-muted">per year, invoiced and reminded</p>
                ) : null}
                <p className="mt-4 border-t border-cream-300 pt-4 text-[12.5px] leading-relaxed text-navy-950/70">
                  Government fees are shown separately at cost and confirmed before filing.
                  Nothing is charged automatically.
                </p>
                <Link
                  href={`/dashboard/compliance/new?service=${service.slug}`}
                  className="btn btn-primary mt-5 w-full"
                >
                  Request this service
                  <ArrowRight />
                </Link>
                <p className="mt-3 text-[11.5px] leading-relaxed text-slate-muted">
                  You will be asked to log in. Every request becomes a matter with a timeline
                  and messages.
                </p>
                <div className="mt-5 border-t border-cream-300 pt-4">
                  <p className="text-[12px] leading-relaxed text-navy-950/70">{brand.filingNote}</p>
                  <a href={contact.whatsappHref} className="link-quiet mt-2 inline-block text-[12.5px]">
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-12 border-t border-cream-300 pt-8">
            <p className="eyebrow mb-4">Other compliance services</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 6).map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/compliance/${entry.slug}`}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-cream-300 px-4 py-3 text-[13px] hover:border-navy-950/30"
                >
                  {entry.name}
                  <span className="mono text-[11.5px] text-slate-muted">
                    {entry.quote || entry.price === null
                      ? "Quote"
                      : formatMoney(entry.price, entry.currency)}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {countries.map((entry) => (
                <Link key={entry.slug} href={`/services/${entry.slug}`} className="pill">
                  {entry.name} registrations
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
