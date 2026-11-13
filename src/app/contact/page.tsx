import type { Metadata } from "next";
import Link from "next/link";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { CountryMark } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { countries } from "@/config/countries";
import { contactFrom, getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Udalla team by email, phone or WhatsApp. We reply within 24 hours, Monday to Saturday.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const contact = contactFrom(catalog.settings);
  const defaultType = params.type === "website" ? "Starter site" : undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a person, not a bot."
        intro="Email, call or send a WhatsApp message. Every message reaches the team that prepares filings, and we reply within 24 hours, Monday to Saturday."
      />

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact" }]} />

          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="card divide-y divide-cream-300">
                <div className="p-6">
                  <p className="eyebrow">Email</p>
                  <a href={`mailto:${contact.email}`} className="mt-2 block font-display text-[22px] tracking-[-0.02em] hover:text-navy-900">
                    {contact.email}
                  </a>
                </div>
                <div className="p-6">
                  <p className="eyebrow">Phone</p>
                  <a href={contact.phoneHref} className="mono mt-2 block text-[18px]">
                    {contact.phone}
                  </a>
                </div>
                <div className="p-6">
                  <p className="eyebrow">WhatsApp</p>
                  <a
                    href={contact.whatsappHref}
                    className="mt-2 block text-[15px] text-navy-900 hover:underline"
                  >
                    Message the team on WhatsApp
                  </a>
                  <p className="mono mt-1 text-[12.5px] text-slate-muted">{contact.phone}</p>
                </div>
                <div className="p-6">
                  <p className="eyebrow">Hours</p>
                  <p className="mt-2 text-[14px] text-navy-950/80">{contact.hours}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[14px] border border-cream-300 p-5">
                <p className="eyebrow">Where we work</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <span key={country.slug} className="pill">
                      <CountryMark mark={country.mark} className="h-3.5 w-3.5" />
                      {country.name}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-slate-muted">
                  We work remotely across all three jurisdictions. {contact.notLawFirm}
                </p>
              </div>

              <p className="mt-4 text-[12.5px] text-slate-muted">
                Looking for a website? The same form reaches the developer team.{" "}
                <Link href="/websites" className="link-quiet">
                  See website ranges
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-7">
              <EnquiryForm defaultType={defaultType} />
              <p className="mt-4 text-[12px] leading-relaxed text-slate-muted">
                By sending an enquiry you agree that {brand.legalName} can contact you about
                it. We do not sell or share enquiry details. Read the{" "}
                <Link href="/privacy" className="link-quiet">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
