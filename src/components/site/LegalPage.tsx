import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { PageHero } from "./PageHero";
import type { LegalDoc } from "@/content/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} intro={doc.intro}>
        <p className="mono mt-6 text-[11.5px] uppercase tracking-[0.12em] text-slate-muted">
          Last updated {doc.updated}
        </p>
      </PageHero>

      <section className="bg-cream-50">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: doc.title }]} />
          <div className="grid gap-10 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <nav aria-label="On this page" className="lg:sticky lg:top-28">
                <p className="eyebrow mb-3">On this page</p>
                <ul className="space-y-1.5">
                  {doc.sections.map((section, index) => (
                    <li key={section.heading}>
                      <a
                        href={`#section-${index + 1}`}
                        className="text-[12.5px] leading-snug text-navy-950/65 hover:text-navy-900"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-cream-300 pt-4">
                  <p className="eyebrow mb-2">Other policies</p>
                  <ul className="space-y-1.5">
                    {[
                      { href: "/privacy", label: "Privacy" },
                      { href: "/terms", label: "Terms" },
                      { href: "/cookies", label: "Cookies" },
                      { href: "/refunds", label: "Refunds" },
                      { href: "/disclaimer", label: "Disclaimer" },
                    ]
                      .filter((entry) => entry.href !== `/${doc.slug}`)
                      .map((entry) => (
                        <li key={entry.href}>
                          <Link href={entry.href} className="text-[12.5px] text-navy-900 hover:underline">
                            {entry.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </nav>
            </aside>

            <div className="lg:col-span-9">
              <div className="prose-editorial">
                {doc.sections.map((section, index) => (
                  <section key={section.heading} id={`section-${index + 1}`}>
                    <h2>{section.heading}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet.slice(0, 40)}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
