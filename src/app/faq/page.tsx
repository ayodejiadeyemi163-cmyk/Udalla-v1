import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { brand } from "@/config/brand";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on registration timing, package contents, government fees, documents, compliance reminders and who prepares your filing.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const store = getStore();
  const [faqs, catalog] = await Promise.all([store.listFaqs(), getCatalog()]);
  const contact = contactFrom(catalog.settings);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
        eyebrow="FAQ"
        title="Plain answers, no small print games."
        intro="If something is missing, send it in. We reply within 24 hours, Monday to Saturday."
      />

      <section className="bg-paper">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "FAQ" }]} />
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
            <aside className="lg:col-span-4">
              <div className="card p-6 lg:sticky lg:top-28">
                <p className="eyebrow">Still unsure</p>
                <p className="mt-3 font-display text-[22px] leading-tight tracking-[-0.02em]">
                  Ask the team directly
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/70">{contact.hours}</p>
                <a href={`mailto:${contact.email}`} className="link-quiet mt-3 block text-[13.5px]">
                  {contact.email}
                </a>
                <a href={contact.phoneHref} className="mono mt-1 block text-[13.5px] text-ink/80">
                  {contact.phone}
                </a>
                <a
                  href={contact.whatsappHref}
                  className="btn btn-outline mt-4 w-full"
                >
                  Message on WhatsApp
                </a>
                <div className="mt-5 border-t border-line pt-4 text-[11.5px] leading-relaxed text-muted">
                  {brand.filingNote}
                </div>
                <Link href="/contact" className="link-quiet mt-3 inline-block text-[12.5px]">
                  Open the contact page
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
