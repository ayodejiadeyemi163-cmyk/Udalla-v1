import type { Metadata } from "next";
import Link from "next/link";

import { StartForm } from "@/components/home/StartForm";
import {
  DeadlineCard,
  DeadlineMock,
  EnquiryMock,
  OrderTrackerMock,
  PhotoPlaceholder,
  StatusCard,
  UploadMock,
} from "@/components/mocks/Screens";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { FaqList } from "@/components/site/FaqList";
import { GuideCards } from "@/components/site/GuideCards";
import { LawyerCards } from "@/components/site/LawyerCards";
import { PackageCards } from "@/components/site/PackageCards";
import { Reviews } from "@/components/site/Reviews";
import { ArrowRight, CountryMark, SectionHeading } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries, isCountrySlug, type CountrySlug } from "@/config/countries";
import { heroPriceLine } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: { absolute: "Business registration in Nigeria, the UK and the US | Udalla" },
  description:
    "Register a business name, limited company or LLC with guided filing and fixed prices. Compliance reminders, documents and lawyer supported filings in one dashboard.",
  alternates: { canonical: "/" },
};

const FEATURED_SERVICE: Record<CountrySlug, string> = {
  nigeria: "limited-company",
  "united-kingdom": "private-limited-company",
  "united-states": "delaware-llc",
};

const STEPS = [
  {
    id: "register",
    numeral: "01",
    label: "Register",
    title: "Give us the details once",
    body: "Choose the country and business type, pick a package and follow one guided form. Your total updates as you add services, before you pay.",
    bullets: [
      "Three proposed names in priority order",
      "Ownership adds up to 100 percent",
      "Documents uploaded privately",
      "Consent recorded before payment",
    ],
    screen: <UploadMock />,
  },
  {
    id: "setup",
    numeral: "02",
    label: "Get set up",
    title: "Watch the filing move",
    body: "Every order shows its stage, from received to completed. Messages, documents and downloads live in the same place.",
    bullets: [
      "Six clear stages on every order",
      "Tax ID help in Standard and Premium",
      "Certificate and documents pack",
      "Banking resolution where it applies",
    ],
    screen: <OrderTrackerMock />,
  },
  {
    id: "compliance",
    numeral: "03",
    label: "Stay compliant",
    title: "Deadlines handled before they bite",
    body: "Annual returns, confirmation statements and registered agent renewals sit in a calendar with reminders 30 and 7 days before each date.",
    bullets: [
      "Reminders by email",
      "Filings requested from the dashboard",
      "Yearly items invoiced, never auto charged",
      "Partner lawyers for regulatory matters",
    ],
    screen: <DeadlineMock />,
  },
  {
    id: "grow",
    numeral: "04",
    label: "Grow",
    title: "Then build the front door",
    body: "Our developer team builds the website, the store or the custom platform behind your new company, quoted clearly before work starts.",
    bullets: [
      "Starter sites and online stores",
      "Paystack checkout built in",
      "Marketing and apps by quote",
      "One enquiry, one reply",
    ],
    screen: <EnquiryMock />,
  },
];

const WHERE_LINKS = [
  {
    id: "exploring",
    label: "Exploring",
    intro: "Work out what to register and what it costs.",
    links: [
      { href: "/guides", label: "Read the country guides" },
      { href: "/pricing", label: "See every package and fee" },
      { href: "/services", label: "How the filing works" },
      { href: "/faq", label: "The common questions" },
    ],
  },
  {
    id: "starting",
    label: "Starting",
    intro: "You have picked a country and you are ready to file.",
    links: [
      { href: "/services", label: "Choose a business type" },
      { href: "/pricing", label: "Compare packages" },
      { href: "/services", label: "Start an order" },
      { href: "/compliance", label: "Add compliance later" },
    ],
  },
  {
    id: "running",
    label: "Running",
    intro: "The company exists. Keep it in good standing.",
    links: [
      { href: "/compliance/annual-returns", label: "File annual returns" },
      { href: "/compliance/tax-id", label: "Register a tax ID" },
      { href: "/compliance/us-registered-agent", label: "Renew a registered agent" },
      { href: "/dashboard", label: "Open your dashboard" },
    ],
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; stage?: string; where?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const store = getStore();
  const [faqs, guides] = await Promise.all([store.listFaqs(), store.listGuides()]);
  const contact = contactFrom(catalog.settings);

  const country: CountrySlug = isCountrySlug(params.country) ? params.country : "nigeria";
  const activeStep = STEPS.find((step) => step.id === params.stage) ?? STEPS[0]!;
  const activeWhere = WHERE_LINKS.find((entry) => entry.id === params.where) ?? WHERE_LINKS[0]!;
  const featuredService =
    catalog.services.find(
      (service) =>
        service.country === country && service.slug === FEATURED_SERVICE[country],
    ) ?? catalog.services.find((service) => service.country === country);

  const formCountries = countries.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    services: catalog.services
      .filter((service) => service.country === entry.slug)
      .map((service) => ({ slug: service.slug, name: service.name })),
  }));

  const organisationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    legalName: brand.legalName,
    url: brand.siteUrl,
    email: brand.contactEmail,
    telephone: brand.contactPhone,
    areaServed: countries.map((entry) => entry.name),
    description:
      "Business registration and compliance platform for Nigeria, the United Kingdom and the United States.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 6).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-14 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Nigeria, the UK and the US</p>
            <h1 className="display mt-5 text-[clamp(2.7rem,2rem+4.4vw,5.1rem)]">
              Register your business, then stay compliant.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/75">
              Guided filing in three countries, prices shown up front, and a dashboard that
              shows exactly where your order stands.
            </p>

            <StartForm countries={formCountries} />
            <p className="mono mt-3 text-[12px] text-ink/60">{heroPriceLine}</p>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
              {brand.proofPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[12.5px] text-ink/70">
                  <span className="h-1 w-1 rounded-full bg-marigold" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-5">
            <PhotoPlaceholder />
            <div className="absolute -left-8 bottom-12 hidden md:block">
              <StatusCard />
            </div>
            <div className="absolute -right-4 top-8 hidden md:block">
              <DeadlineCard />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
              <StatusCard />
              <DeadlineCard />
            </div>
          </div>
        </div>
      </section>

      <section id="steps" className="border-y border-line bg-paper">
        <div className="wrap py-16 md:py-24">
          <SectionHeading
            eyebrow="The whole path"
            title="Four steps, one place"
            intro="Registration is the start. The same dashboard carries the documents, the deadlines and the website that follows."
          />

          <div className="mt-9 flex flex-wrap gap-1.5">
            {STEPS.map((step) => {
              const active = step.id === activeStep.id;
              return (
                <Link
                  key={step.id}
                  href={`/?stage=${step.id}#steps`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-[13px] transition ${
                    active
                      ? "border-forest bg-forest text-ivory"
                      : "border-line text-ink/70 hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  <span className="mono mr-2 text-[11px] opacity-60">{step.numeral}</span>
                  {step.label}
                </Link>
              );
            })}
          </div>

          <div key={activeStep.id} className="step-enter mt-10 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="numeral">{activeStep.numeral}</p>
              <h3 className="mt-4 font-display text-[clamp(1.7rem,1.4rem+1.4vw,2.4rem)] tracking-[-0.03em]">
                {activeStep.title}
              </h3>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink/75">{activeStep.body}</p>
              <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                {activeStep.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-[14px] text-ink/80">
                    <span className="mt-2 h-1 w-1 flex-none rounded-full bg-forest" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">{activeStep.screen}</div>
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="wrap py-16 md:py-24">
          <SectionHeading
            eyebrow="Packages"
            title="Three packages, no hidden extras"
            intro="Every package includes the filing, the certificate and dashboard tracking. Government fees sit separately at cost."
          />
          {featuredService ? (
            <div className="mt-9">
              <PackageCards
                service={featuredService}
                country={country}
                basePath="/"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap py-16 md:py-24">
          <SectionHeading
            eyebrow="Where are you now"
            title="Start from the step you are on"
            intro="Pick the state that sounds like you. Each one leads to the four pages founders use most."
          />

          <div className="mt-8 flex flex-wrap gap-1.5">
            {WHERE_LINKS.map((entry) => {
              const active = entry.id === activeWhere.id;
              return (
                <Link
                  key={entry.id}
                  href={`/?where=${entry.id}#where`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-[13px] transition ${
                    active
                      ? "border-forest bg-forest text-ivory"
                      : "border-line text-ink/70 hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {entry.label}
                </Link>
              );
            })}
          </div>

          <div id="where" key={activeWhere.id} className="step-enter mt-8">
            <p className="text-[15px] text-ink/70">{activeWhere.intro}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {activeWhere.links.map((link, index) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="card group flex flex-col justify-between gap-6 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="mono text-[11px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-end justify-between gap-2">
                    <span className="font-display text-[19px] leading-tight tracking-[-0.02em]">
                      {link.label}
                    </span>
                    <ArrowRight className="mb-1 flex-none text-forest transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Reviews />

      <section className="bg-ivory">
        <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.5rem+2vw,3.2rem)]">
              The things founders ask first
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
              Straight answers on timing, fees and who does what. The full list sits on the
              FAQ page.
            </p>
            <Link href="/faq" className="link-quiet mt-5 inline-block text-[14px]">
              Read all questions
            </Link>
          </div>
          <div className="lg:col-span-8">
            <FaqList faqs={faqs.slice(0, 6)} />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap py-16 md:py-24">
          <SectionHeading
            eyebrow="Guides"
            title="Read before you file"
            intro="Plain explanations of what each registry wants, written by the team that files every week."
            action={
              <Link href="/guides" className="btn btn-outline">
                Browse all guides
              </Link>
            }
          />
          <div className="mt-9">
            <GuideCards guides={guides} />
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="wrap py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Partner lawyers</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.5rem+2vw,3.4rem)]">
                {brand.lawyerSectionTitle}
              </h2>
              <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-ink/75">
                {brand.filingNote}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {countries.map((entry) => (
                  <span key={entry.slug} className="pill">
                    <CountryMark mark={entry.mark} className="h-3.5 w-3.5" />
                    {entry.shortName}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <LawyerCards />
              <p className="mt-5 text-[12.5px] text-muted">{contact.lawyerNote}</p>
            </div>
          </div>
        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
