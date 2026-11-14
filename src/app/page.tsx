import type { Metadata } from "next";
import Link from "next/link";

import { StartForm } from "@/components/home/StartForm";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { GuideCards } from "@/components/site/GuideCards";
import { PackageCards } from "@/components/site/PackageCards";
import { CountryMark } from "@/components/ui/Marks";
import { countries, isCountrySlug, type CountrySlug } from "@/config/countries";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: { absolute: "Business registration in Nigeria, the UK and the US | Udalla" },
  description:
    "Register a business name, limited company or LLC in Nigeria, the UK or the US. Fixed service fees and government fees shown before you pay.",
  alternates:
    process.env.NODE_ENV === "production" ? { canonical: "/" } : undefined,
};

const HERO_COUNTRIES: {
  slug: CountrySlug;
  mark: "ng" | "uk" | "us";
  registry: string;
  fromLabel: string;
}[] = [
  { slug: "nigeria", mark: "ng", registry: "CAC", fromLabel: "Business Name from ₦35,000" },
  {
    slug: "united-kingdom",
    mark: "uk",
    registry: "Companies House",
    fromLabel: "Limited Company from £49",
  },
  {
    slug: "united-states",
    mark: "us",
    registry: "Delaware and Wyoming",
    fromLabel: "LLC from $49",
  },
];

const REGISTER_TILES = [
  {
    slug: "business-name",
    country: "nigeria" as const,
    name: "Business Name",
    label: "Small trades and sole traders",
  },
  {
    slug: "limited-company",
    country: "nigeria" as const,
    name: "Limited Company",
    label: "Growing companies",
  },
  {
    slug: "ngo",
    country: "nigeria" as const,
    name: "NGO and Incorporated Trustees",
    label: "Foundations and associations",
  },
  {
    slug: "private-limited-company",
    country: "united-kingdom" as const,
    name: "UK Private Limited Company",
    label: "Run it from abroad",
  },
  {
    slug: "delaware-llc",
    country: "united-states" as const,
    name: "Delaware LLC",
    label: "Startups and investors",
  },
  {
    slug: "wyoming-llc",
    country: "united-states" as const,
    name: "Wyoming LLC",
    label: "Solo and remote founders",
  },
];

const HOME_QUESTIONS = [
  {
    question: "How much does it cost?",
    answer:
      "Service fee by package plus the government fee at cost, shown before you pay.",
  },
  {
    question: "Are government fees included?",
    answer: "No, charged at cost and shown separately.",
  },
  {
    question: "How long does it take?",
    answer: "Timing depends on the registry. Your dashboard shows each stage.",
  },
  {
    question: "Who files my registration?",
    answer:
      "Udalla's filing team prepares and submits it. Licensed partner lawyers handle regulatory compliance.",
  },
  {
    question: "Can I register from abroad?",
    answer:
      "UK and US yes. Nigeria needs a Nigerian address and ID for every owner.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const store = getStore();
  const [guides] = await Promise.all([store.listGuides()]);
  const contact = contactFrom(catalog.settings);

  const selectedCountry: CountrySlug = isCountrySlug(params.country)
    ? params.country
    : "nigeria";

  const formCountries = countries.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    services: catalog.services
      .filter((service) => service.country === entry.slug)
      .map((service) => ({ slug: service.slug, name: service.name })),
  }));

  const featuredService =
    catalog.services.find(
      (service) => service.country === selectedCountry && service.slug === "limited-company",
    ) ??
    catalog.services.find(
      (service) => service.country === selectedCountry && service.slug === "private-limited-company",
    ) ??
    catalog.services.find(
      (service) => service.country === selectedCountry && service.slug === "delaware-llc",
    ) ??
    catalog.services.find((service) => service.country === selectedCountry);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-14 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1 className="display text-[clamp(2.7rem,2rem+4.4vw,5.1rem)]">
              Register your business in Nigeria, the UK or the US.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-navy-950/75">
              Business names from ₦35,000. UK companies from £49. US LLCs from $49. Plus government fees.
            </p>

            <StartForm countries={formCountries} selectedCountry={selectedCountry} />
            <p className="mt-4 text-[13px] text-slate-muted">
              Filed with CAC, Companies House, Delaware and Wyoming.
            </p>
          </div>

          <div className="grid gap-3 lg:col-span-5">
            {HERO_COUNTRIES.map((item) => {
              const entry = countries.find((country) => country.slug === item.slug);
              return (
                <Link
                  key={item.slug}
                  href={`/services/${item.slug}`}
                  className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-center gap-3">
                    <CountryMark mark={item.mark} className="h-6 w-6 text-navy-900" />
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.12em] text-slate-muted">
                        {item.registry}
                      </p>
                      <p className="mt-1 font-display text-[22px] tracking-[-0.02em]">
                        {entry?.name}
                      </p>
                      <p className="mt-1 text-[14px] text-navy-950/75">{item.fromLabel}</p>
                    </div>
                  </div>
                  <span aria-hidden="true" className="text-navy-900">
                    &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-cream-300 bg-cream-50">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">
            Choose what to register
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGISTER_TILES.map((tile) => {
              const service = catalog.services.find(
                (item) => item.country === tile.country && item.slug === tile.slug,
              );
              const price = service?.packages[0]?.price ?? 0;
              const currency = service?.currency ?? "NGN";
              return (
                <Link
                  key={tile.slug}
                  href={`/services/${tile.country}/${tile.slug}`}
                  className="card group flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div>
                    <p className="font-display text-[22px] leading-tight tracking-[-0.02em]">
                      {tile.name}
                    </p>
                    <p className="mt-3 text-[13px] text-navy-950/70">{tile.label}</p>
                  </div>
                  <p className="mono mt-6 text-[15px]">From {formatMoney(price, currency)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream-100">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">Packages</h2>
          {featuredService ? (
            <div className="mt-8">
              <PackageCards service={featuredService} country={selectedCountry} basePath="/" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-cream-300 bg-cream-50">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">After you register</h2>
          <p className="mt-4 text-[16px] text-navy-950/80">
            Deadlines tracked. Filings handled with licensed partner lawyers.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/compliance/annual-returns", label: "Annual returns" },
              { href: "/compliance/beneficial-ownership", label: "Beneficial ownership filing" },
              { href: "/compliance/tax-id", label: "Tax ID" },
              { href: "/compliance/us-registered-agent", label: "Registered agent or office" },
              { href: "/compliance/confirmation-statement", label: "UK confirmation statement" },
              { href: "/compliance/us-annual-report", label: "US annual report" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-quiet text-[15px]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream-100">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">Websites</h2>
          <p className="mt-4 text-[16px] text-navy-950/80">
            Starter sites from ₦70,000. Online stores from ₦250,000.
          </p>
          <Link href="/contact?type=website" className="btn btn-outline mt-6">
            Speak to our developer
          </Link>
        </div>
      </section>

      <section className="border-y border-cream-300 bg-cream-50">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">Questions</h2>
          <div className="mt-8">
            {HOME_QUESTIONS.map((item) => (
              <details key={item.question} className="accordion">
                <summary>
                  <span>{item.question}</span>
                  <span className="plus" aria-hidden="true" />
                </summary>
                <div className="answer">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-100">
        <div className="wrap py-16 md:py-24">
          <h2 className="display text-[clamp(2rem,1.5rem+2.2vw,3.4rem)]">Guides</h2>
          <div className="mt-8">
            <GuideCards guides={guides.slice(0, 3)} />
          </div>
        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
