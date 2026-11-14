import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers on pricing, government fees, timing and who files your registration.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/faq" } : undefined,
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
      <PageHero eyebrow="FAQ" title="Questions" />

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "FAQ" }]} />
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
            <aside className="lg:col-span-4">
              <div className="card p-6 lg:sticky lg:top-28">
                <a href={`mailto:${contact.email}`} className="link-quiet block text-[13.5px]">
                  {contact.email}
                </a>
                <a href={contact.phoneHref} className="mono mt-1 block text-[13.5px] text-navy-950/80">
                  {contact.phone}
                </a>
                <a href={contact.whatsappHref} className="btn btn-outline mt-4 w-full">
                  Message on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
