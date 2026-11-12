import Link from "next/link";
import { countries } from "@/config/countries";

export function CountryTabs({
  current,
  basePath,
  extraParams = {},
}: {
  current: string;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
}) {
  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-full border border-line bg-paper p-1.5"
      role="group"
      aria-label="Choose a country"
    >
      {countries.map((country) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(extraParams)) {
          if (value) params.set(key, value);
        }
        params.set("country", country.slug);
        const active = country.slug === current;
        return (
          <Link
            key={country.slug}
            href={`${basePath}?${params.toString()}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[13px] transition ${
              active
                ? "bg-forest text-ivory"
                : "text-ink/70 hover:bg-ivory hover:text-ink"
            }`}
          >
            {country.shortName}
          </Link>
        );
      })}
    </div>
  );
}
