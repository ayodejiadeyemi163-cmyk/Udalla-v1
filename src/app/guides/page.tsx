import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideCards } from "@/components/site/GuideCards";
import { PageHero } from "@/components/site/PageHero";
import { countries, isCountrySlug } from "@/config/countries";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain guides to registering and running a business in Nigeria, the United Kingdom and the United States.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const all = await store.listGuides();
  const active = isCountrySlug(params.country) ? params.country : null;
  const guides = active ? all.filter((guide) => guide.country === active) : all;

  return (
    <>
      <PageHero
        eyebrow="Guides"
        title="Read once, file once."
        intro="Short explanations of the parts founders get stuck on: names, ownership, registered addresses and the deadlines that follow."
      />

      <section className="bg-paper">
        <div className="wrap py-12 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Guides" }]} />

          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/guides"
              aria-current={!active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-[13px] ${
                !active
                  ? "border-forest bg-forest text-ivory"
                  : "border-line text-ink/70 hover:border-ink/40"
              }`}
            >
              All
            </Link>
            {countries.map((country) => (
              <Link
                key={country.slug}
                href={`/guides?country=${country.slug}`}
                aria-current={active === country.slug ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-[13px] ${
                  active === country.slug
                    ? "border-forest bg-forest text-ivory"
                    : "border-line text-ink/70 hover:border-ink/40"
                }`}
              >
                {country.name}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            {guides.length > 0 ? (
              <GuideCards guides={guides} />
            ) : (
              <p className="text-[14px] text-ink/70">
                No guides for this country yet. The full list is still available.
              </p>
            )}
          </div>

          {guides.length > 3 ? (
            <div className="mt-10">
              <h2 className="font-display text-[22px] tracking-[-0.02em]">More reading</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {guides.slice(3).map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="flex items-center justify-between gap-4 py-4 text-[14px] hover:text-forest"
                    >
                      {guide.title}
                      <span className="mono text-[11.5px] text-muted">
                        {guide.readingMinutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
