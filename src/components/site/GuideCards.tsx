import Link from "next/link";
import type { Guide } from "@/lib/store/types";

function countryLabel(country: string): string {
  if (country === "nigeria") return "Nigeria";
  if (country === "united-kingdom") return "UK";
  if (country === "united-states") return "US";
  return "All countries";
}

export function GuideCards({ guides }: { guides: Guide[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {guides.slice(0, 3).map((guide) => (
        <article key={guide.slug} className="card p-6">
          <p className="eyebrow">{countryLabel(guide.country)}</p>
          <h3 className="mt-4 font-display text-[22px] leading-[1.1] tracking-[-0.025em]">
            <Link href={`/guides/${guide.slug}`} className="hover:text-navy-900">
              {guide.title}
            </Link>
          </h3>
        </article>
      ))}
    </div>
  );
}
