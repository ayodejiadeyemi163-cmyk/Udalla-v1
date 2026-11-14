export type CountrySlug = "nigeria" | "united-kingdom" | "united-states";

export interface Country {
  slug: CountrySlug;
  name: string;
  shortName: string;
  currency: "NGN" | "GBP" | "USD";
  mark: "ng" | "uk" | "us";
  timezone: string;
  active: boolean;
}

export const countries: Country[] = [
  {
    slug: "nigeria",
    name: "Nigeria",
    shortName: "Nigeria",
    currency: "NGN",
    mark: "ng",
    timezone: "Africa/Lagos",
    active: true,
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    shortName: "UK",
    currency: "GBP",
    mark: "uk",
    timezone: "Europe/London",
    active: true,
  },
  {
    slug: "united-states",
    name: "United States",
    shortName: "US",
    currency: "USD",
    mark: "us",
    timezone: "America/New_York",
    active: true,
  },
];

export function getCountry(slug: string | undefined): Country | undefined {
  return countries.find((country) => country.slug === slug);
}

export function isCountrySlug(value: string | undefined): value is CountrySlug {
  return countries.some((country) => country.slug === value);
}

export function countryName(slug: string): string {
  return getCountry(slug)?.name ?? "";
}
