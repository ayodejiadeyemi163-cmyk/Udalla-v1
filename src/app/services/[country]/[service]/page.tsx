import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { MobileCtaBar } from "@/components/site/MobileCtaBar";
import { ServicePricingCard } from "@/components/site/ServicePricingCard";
import { ArrowRight, Check, CountryMark, Lock } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries, getCountry, isCountrySlug } from "@/config/countries";
import { priceNote, type PackageTier } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

const tiers: PackageTier[] = ["starter", "standard", "premium"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; service: string }>;
}): Promise<Metadata> {
  const { country, service } = await params;
  const catalog = await getCatalog();
  const entry = catalog.services.find(
    (item) => item.country === country && item.slug === service,
  );
  if (!entry) return { title: "Service" };
  return {
    title: entry.name,
    description: entry.shortDescription,
    alternates: { canonical: `/services/${entry.country}/${entry.slug}` },
    openGraph: {
      title: `${entry.name} with Udalla`,
      description: entry.shortDescription,
      url: `${brand.siteUrl}/services/${entry.country}/${entry.slug}`,
    },
  };
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string; service: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const [{ country, service }, query] = await Promise.all([params, searchParams]);
  if (!isCountrySlug(country)) notFound();

  const catalog = await getCatalog();
  const entry = catalog.services.find(
    (item) => item.country === country && item.slug === service,
  );
  if (!entry) notFound();

  const countryEntry = getCountry(country);
  const contact = contactFrom(catalog.settings);
  const initialTier = tiers.find((tier) => tier === query.package) ?? "standard";
  const siblings = catalog.services.filter(
    (item) => item.country === country && item.slug !== entry.slug,
  );

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: entry.name,
    serviceType: entry.name,
    provider: {
      "@type": "Organization",
      name: brand.name,
      url: brand.siteUrl,
    },
    areaServed: countryEntry?.name ?? "",
    description: entry.shortDescription,
    offers: entry.packages.map((pack) => ({
      "@type": "Offer",
      name: pack.name,
      price: pack.price,
      priceCurrency: entry.currency,
      url: `${brand.siteUrl}/start/${entry.country}/${entry.slug}?package=${pack.tier}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-paper">
        <div className="wrap py-8 md:py-12">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/services", label: "Services" },
              { href: `/services/${country}`, label: countryEntry?.name ?? "Country" },
              { label: entry.navLabel },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill pill-forest">
                  <CountryMark mark={countryEntry?.mark ?? "ng"} className="h-3.5 w-3.5" />
                  {countryEntry?.name}
                </span>
                <span className="pill">{entry.entityLabel}</span>
                <span className="pill">
                  <Lock /> Private documents
                </span>
              </div>
              <h1 className="display mt-5 text-[clamp(2.3rem,1.8rem+3vw,4rem)]">
                {entry.name}
              </h1>
              <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-ink/75">
                {entry.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-4">
                <div>
                  <p className="eyebrow">Packages from</p>
                  <p className="mono mt-1 text-[18px]">
                    {formatMoney(entry.packages[0]?.price ?? 0, entry.currency)}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Government fee</p>
                  <p className="mono mt-1 text-[18px]">
                    {entry.governmentFeeWaived
                      ? "Waived"
                      : `${entry.governmentFeeFrom ? "from " : ""}${formatMoney(entry.governmentFee, entry.currency)}`}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Processing</p>
                  <p className="mt-1 max-w-[26ch] text-[13px] text-ink/75">{entry.processing}</p>
                </div>
              </div>

              <h2 className="mt-12 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] tracking-[-0.03em]">
                What happens next
              </h2>
              <ol className="mt-5 space-y-5">
                {entry.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4 border-b border-line pb-5 last:border-0">
                    <span className="numeral w-12 flex-none text-[30px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-ink/70">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h2 className="mt-10 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] tracking-[-0.03em]">
                What is included
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {entry.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-[13.5px] text-ink/80">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-forest" />
                    {item}
                  </li>
                ))}
              </ul>

              {entry.addOns.length > 0 ? (
                <>
                  <h2 className="mt-10 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] tracking-[-0.03em]">
                    Optional add-ons
                  </h2>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {entry.addOns.map((addOn) => (
                      <li key={addOn.slug} className="flex items-start justify-between gap-4 py-3.5">
                        <div>
                          <p className="text-[14px] font-medium">{addOn.name}</p>
                          <p className="mt-0.5 text-[12.5px] text-muted">{addOn.description}</p>
                        </div>
                        <p className="mono whitespace-nowrap text-[13px]">
                          {formatMoney(addOn.price, entry.currency)}
                          {addOn.billing === "yearly" ? " a year" : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <ServicePricingCard
                  service={entry}
                  initialTier={initialTier}
                  priceNote={priceNote}
                />
                <div className="mt-4 rounded-[14px] border border-line bg-ivory/60 p-4">
                  <p className="text-[12.5px] leading-relaxed text-ink/70">
                    {brand.filingNote}
                  </p>
                  <a
                    href={contact.whatsappHref}
                    className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-forest hover:underline"
                  >
                    Ask a question on WhatsApp
                    <ArrowRight />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-y border-line bg-ivory">
        <div className="wrap py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Questions</p>
              <h2 className="display mt-3 text-[clamp(1.8rem,1.4rem+1.6vw,2.6rem)]">
                About this registration
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink/70">
                Something missing? Send it to the team and we will answer in plain language.
              </p>
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={entry.faqs.map((faq, index) => ({ ...faq, id: `${entry.slug}-${index}`, sortOrder: index }))} />
            </div>
          </div>

          {siblings.length > 0 ? (
            <div className="mt-12 border-t border-line pt-8">
              <p className="eyebrow mb-4">Also in {countryEntry?.name}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {siblings.map((sibling) => (
                  <Link
                    key={sibling.slug}
                    href={`/services/${sibling.country}/${sibling.slug}`}
                    className="card flex items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <span className="text-[14px] font-medium">{sibling.name}</span>
                    <span className="mono text-[12.5px] text-muted">
                      from {formatMoney(sibling.packages[0]?.price ?? 0, sibling.currency)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-2">
            {countries
              .filter((entry) => entry.slug !== country)
              .map((entry) => (
                <Link key={entry.slug} href={`/services/${entry.slug}`} className="pill">
                  {entry.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <MobileCtaBar
        href={`/start/${entry.country}/${entry.slug}?package=${initialTier}`}
        label={`Get started, from ${formatMoney(entry.packages[0]?.price ?? 0, entry.currency)}`}
      />
    </>
  );
}
