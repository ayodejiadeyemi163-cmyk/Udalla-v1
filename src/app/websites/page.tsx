import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, Check } from "@/components/ui/Marks";
import { priceNote } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { formatMoney, formatRange } from "@/lib/money";

export const metadata: Metadata = {
  title: "Business websites",
  description:
    "Websites, online stores and custom platforms for new businesses. Ranges shown up front, built by the Udalla developer team.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/websites" } : undefined,
};

export default async function WebsitesPage() {
  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);
  const tiers = catalog.websiteTiers;

  return (
    <>
      <PageHero
        eyebrow="Websites and more"
        title="A company needs a front door."

      >
        <div className="mt-8 flex flex-wrap gap-2">
          {tiers.map((tier) => (
            <a key={tier.slug} href={`#${tier.slug}`} className="pill">
              {tier.name}
            </a>
          ))}
        </div>
      </PageHero>

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Websites" }]} />

          <div className="grid gap-4 lg:grid-cols-2">
            {tiers.map((tier) => (
              <article key={tier.slug} id={tier.slug} className="card flex flex-col p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-[26px] tracking-[-0.03em]">{tier.name}</h2>
                  <span className="pill">
                    {tier.quoteOnly ? "By quote" : "Fixed range"}
                  </span>
                </div>
                <p className="mono mt-4 text-[20px] tracking-[-0.02em]">
                  {tier.quoteOnly
                    ? `From ${formatMoney(tier.from, tier.currency)}`
                    : formatRange(tier.from, tier.to, tier.currency)}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-navy-950/70">{tier.summary}</p>
                <ul className="mt-5 grid flex-1 gap-2 sm:grid-cols-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] text-navy-950/75">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-navy-900" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={`#enquiry`}
                  className="btn btn-outline mt-6 w-full sm:w-auto"
                  data-project={tier.name}
                >
                  Speak to our developer
                  <ArrowRight />
                </a>
              </article>
            ))}
          </div>




        </div>
      </section>

      <section id="enquiry" className="border-t border-cream-300 bg-cream-100">
        <div className="wrap grid gap-10 py-14 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Enquiry</p>
            <h2 className="display mt-3 text-[clamp(1.9rem,1.5rem+1.8vw,2.8rem)]">
              Tell us about the site you need
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-navy-950/70">

            </p>

          </div>
          <div className="lg:col-span-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
