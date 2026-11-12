export type CountrySlug = "nigeria" | "united-kingdom" | "united-states";

export interface Country {
  slug: CountrySlug;
  name: string;
  shortName: string;
  currency: "NGN" | "GBP" | "USD";
  fromPrice: number;
  governmentLine: string;
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
    fromPrice: 35000,
    governmentLine: "CAC filings. Government fees from 10,000.",
    mark: "ng",
    timezone: "Africa/Lagos",
    active: true,
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    shortName: "UK",
    currency: "GBP",
    fromPrice: 49,
    governmentLine: "Companies House filings. Government fee 100.",
    mark: "uk",
    timezone: "Europe/London",
    active: true,
  },
  {
    slug: "united-states",
    name: "United States",
    shortName: "US",
    currency: "USD",
    fromPrice: 49,
    governmentLine: "State filings in Delaware and Wyoming.",
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
