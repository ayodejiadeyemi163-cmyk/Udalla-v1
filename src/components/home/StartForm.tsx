"use client";

import { useMemo, useState } from "react";

export interface StartFormCountry {
  slug: string;
  name: string;
  services: { slug: string; name: string }[];
}

export function StartForm({ countries }: { countries: StartFormCountry[] }) {
  const [countrySlug, setCountrySlug] = useState(countries[0]?.slug ?? "nigeria");
  const country = useMemo(
    () => countries.find((entry) => entry.slug === countrySlug) ?? countries[0],
    [countries, countrySlug],
  );

  return (
    <form action="/start" method="get" className="mt-8">
      <div className="card p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
          <label className="block">
            <span className="sr-only">Country</span>
            <select
              name="country"
              value={countrySlug}
              onChange={(event) => setCountrySlug(event.target.value)}
              className="field border-transparent bg-ivory/70 focus:bg-white"
            >
              {countries.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Business type</span>
            <select
              name="service"
              className="field border-transparent bg-ivory/70 focus:bg-white"
              defaultValue={country?.services[0]?.slug}
              key={countrySlug}
            >
              {countries.map((entry) => (
                <optgroup key={entry.slug} label={entry.name}>
                  {entry.services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Start your business
          </button>
        </div>
      </div>
      <noscript>
        <p className="mt-2 text-[12.5px] text-muted">
          Choose the country first, then the business type. Both lists are grouped by country
          above.
        </p>
      </noscript>
    </form>
  );
}
