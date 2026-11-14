import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ClosingBanner } from "@/components/site/ClosingBanner";
import { PageHero } from "@/components/site/PageHero";
import { brand } from "@/config/brand";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getStore().getGuide(slug);
  if (!guide) return { title: "Guide" };
  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: process.env.NODE_ENV === "production" ? { canonical: `/guides/${guide.slug}` } : undefined,
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.excerpt,
      publishedTime: guide.publishedAt,
      url: `${brand.siteUrl}/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = getStore();
  const guide = await store.getGuide(slug);
  if (!guide) notFound();

  const [catalog, all] = await Promise.all([getCatalog(), store.listGuides()]);
  const contact = contactFrom(catalog.settings);
  const related = all.filter((entry) => entry.slug !== guide.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.publishedAt,
    author: { "@type": "Organization", name: brand.name },
    publisher: { "@type": "Organization", name: brand.name, url: brand.siteUrl },
    mainEntityOfPage: `${brand.siteUrl}/guides/${guide.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PageHero eyebrow="Guide" title={guide.title} intro={guide.excerpt}>
        <p className="mono mt-6 text-[11.5px] uppercase tracking-[0.12em] text-slate-muted">
          {guide.readingMinutes} min read · {guide.publishedAt}
        </p>
      </PageHero>

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/guides", label: "Guides" },
              { label: guide.title },
            ]}
          />
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="prose-editorial lg:col-span-8">
              {guide.body.map((block) =>
                block.startsWith("## ") ? (
                  <h2 key={block}>{block.replace("## ", "")}</h2>
                ) : (
                  <p key={block.slice(0, 48)}>{block}</p>
                ),
              )}
              <div className="mt-10 rounded-[14px] border border-cream-300 bg-cream-100/60 p-5 text-[13px] leading-relaxed">
                <p className="eyebrow mb-2">A note on this guide</p>
                <p className="text-navy-950/70">
                  General information, not legal advice. Registry rules change. Your order
                  total and the checklist in your dashboard are the figures that apply.
                </p>
              </div>
            </article>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="card p-6">
                  <p className="eyebrow">Ready to file</p>
                  <p className="mt-2 font-display text-[21px] leading-tight tracking-[-0.02em]">
                    Start with a country and a structure
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy-950/70">
                    Prices are shown up front, government fees at cost.
                  </p>
                  <Link href="/services" className="btn btn-primary mt-4 w-full">
                    Get started
                  </Link>
                  <a href={contact.whatsappHref} className="link-quiet mt-3 inline-block text-[12.5px]">
                    Ask on WhatsApp
                  </a>
                </div>

                {related.length > 0 ? (
                  <div className="mt-4">
                    <p className="eyebrow mb-3">More guides</p>
                    <ul className="space-y-2">
                      {related.map((entry) => (
                        <li key={entry.slug}>
                          <Link
                            href={`/guides/${entry.slug}`}
                            className="card block p-4 text-[13.5px] leading-snug hover:border-navy-950/30"
                          >
                            {entry.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ClosingBanner contact={contact} />
    </>
  );
}
