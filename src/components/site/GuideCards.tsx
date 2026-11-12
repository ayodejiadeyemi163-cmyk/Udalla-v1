import Link from "next/link";
import type { Guide } from "@/lib/store/types";

export function GuideCards({ guides }: { guides: Guide[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {guides.slice(0, 3).map((guide) => (
        <article key={guide.slug} className="card group flex flex-col p-6">
          <p className="eyebrow">
            {guide.country === "all" ? "All countries" : guide.country.replace("-", " ")} ·{" "}
            {guide.readingMinutes} min read
          </p>
          <h3 className="mt-4 font-display text-[22px] leading-[1.1] tracking-[-0.025em]">
            <Link href={`/guides/${guide.slug}`} className="hover:text-forest">
              {guide.title}
            </Link>
          </h3>
          <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink/70">{guide.excerpt}</p>
          <Link
            href={`/guides/${guide.slug}`}
            className="mt-5 text-[13px] font-medium text-forest hover:underline"
          >
            Read the guide
          </Link>
        </article>
      ))}
    </div>
  );
}
