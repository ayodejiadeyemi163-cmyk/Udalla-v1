import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { LawyerCards } from "@/components/site/LawyerCards";
import { PageHero } from "@/components/site/PageHero";
import { CountryMark, Stamp } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries } from "@/config/countries";
import { contactFrom, getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About",
  description:
    "Udalla is a business registration and compliance platform for founders in Nigeria, the United Kingdom and the United States.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Registration should feel like a checklist."
        intro={`${brand.legalName} runs filings in three countries through one dashboard. You always know the price, the stage and the next date that matters.`}
      />

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "About" }]} />

          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="prose-editorial">
                <p>
                  Most founders meet company registration at the worst possible moment: a
                  contract needs signing, a bank asks for a certificate, or a client will only
                  pay an invoice from a registered entity. The process is not complicated, but
                  it is full of small rules that change by country, and none of them are
                  explained on the registry website.
                </p>
                <p>
                  Udalla turns that into a guided order. Pick a country and a structure, see
                  the package price and the government fee, fill one form, upload documents and
                  pay. From there, the order shows its stage until the certificate is in your
                  hands.
                </p>
                <p>
                  After registration, the same dashboard carries the deadlines. Annual returns,
                  confirmation statements, beneficial ownership filings and registered agent
                  renewals are tracked with reminders 30 and 7 days before each date.
                </p>

                <h2>Who does what</h2>
                <p>{brand.filingNote}</p>
                <p>
                  Compliance questions that need a licensed opinion go to an independent
                  partner lawyer in that jurisdiction. Lawyers do not prepare or submit
                  registrations. They handle regulatory compliance, which is a different job.
                </p>

                <h2>What we will not do</h2>
                <p>
                  We do not invent reviews, awards or customer numbers. We do not promise a
                  registry outcome. We do not hide the government fee inside a package price,
                  and we do not charge a yearly service automatically.
                </p>

                <h2>Where we work</h2>
                <p>
                  Nigeria, the United Kingdom and the United States, with a partner lawyer
                  available in each. Prices are quoted in the local currency so there is no
                  conversion surprise at checkout.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {countries.map((country) => (
                  <span key={country.slug} className="pill">
                    <CountryMark mark={country.mark} className="h-3.5 w-3.5" />
                    {country.name}
                  </span>
                ))}
              </div>

              <div className="mt-10 border-t border-cream-300 pt-6">
                <p className="eyebrow">Proof points</p>
                <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                  {brand.proofPoints.map((point) => (
                    <li key={point} className="text-[14px] text-navy-950/75">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="card overflow-hidden">
                <div className="relative bg-navy-900 p-7 text-cream-100">
                  <Stamp className="absolute -right-4 -top-4 h-28 w-28 text-gold-500/40" />
                  <p className="eyebrow text-cream-100/60">In short</p>
                  <p className="mt-4 font-display text-[26px] leading-[1.05] tracking-[-0.03em]">
                    One dashboard from first filing to yearly compliance.
                  </p>
                </div>
                <div className="divide-y divide-cream-300">
                  {[
                    { label: "Legal name", value: brand.legalName },
                    { label: "Domain", value: brand.domain },
                    { label: "Email", value: contact.email },
                    { label: "Phone", value: contact.phone },
                    { label: "Hours", value: contact.hours },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4 px-6 py-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-muted">
                        {row.label}
                      </p>
                      <p className="max-w-[22ch] text-right text-[13px]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[14px] border border-cream-300 p-5">
                <p className="eyebrow">Not a law firm</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-navy-950/70">
                  {contact.notLawFirm}
                </p>
                <Link href="/disclaimer" className="link-quiet mt-2 inline-block text-[12.5px]">
                  Read the full disclaimer
                </Link>
              </div>
            </aside>
          </div>

          <div className="mt-14 border-t border-cream-300 pt-10">
            <p className="eyebrow">Partner lawyers</p>
            <h2 className="display mt-3 text-[clamp(2rem,1.5rem+2vw,3.2rem)]">
              {brand.lawyerSectionTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-950/75">
              {contact.lawyerNote}
            </p>
            <div className="mt-6">
              <LawyerCards />
            </div>
          </div>
        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
