import { brand } from "@/config/brand";
import type { CountrySlug } from "@/config/countries";
import {
  complianceServices as baseCompliance,
  services as baseServices,
  websiteTiers as baseWebsiteTiers,
  type ComplianceService,
  type PackageDefinition,
  type ServiceDefinition,
  type WebsiteTier,
} from "@/config/pricing";
import { getStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/store/types";

/**
 * The catalog merges the pricing config with admin overrides from the store.
 * Pages read prices from here, never from a literal.
 */

export interface GovernmentFee {
  amount: number;
  from: boolean;
  waived: boolean;
  label: string;
}

export interface Catalog {
  services: ServiceDefinition[];
  compliance: ComplianceService[];
  websiteTiers: WebsiteTier[];
  settings: SiteSettings;
}

function withPackages(
  service: ServiceDefinition,
  settings: SiteSettings,
): ServiceDefinition {
  const packages = service.packages.map((entry) => {
    const key = `${service.slug}:${entry.tier}`;
    const price = settings.packagePrices[key] ?? entry.price;
    return {
      ...entry,
      price,
      margin: price - entry.partnerCost,
    } satisfies PackageDefinition;
  });

  const copy = settings.serviceCopy[service.slug] ?? {};

  return {
    ...service,
    name: copy.name ?? service.name,
    shortDescription: copy.shortDescription ?? service.shortDescription,
    packages,
    governmentFee: settings.governmentFees[service.slug] ?? service.governmentFee,
    governmentFeeWaived: settings.governmentFeeWaived.includes(service.slug),
  };
}

export async function getCatalog(): Promise<Catalog> {
  const store = getStore();
  const settings = await store.getSettings();

  return {
    services: baseServices.map((service) => withPackages(service, settings)),
    compliance: baseCompliance.map((service) => {
      const price = settings.compliancePrices[service.slug];
      return price === undefined ? service : { ...service, price, quote: false };
    }),
    websiteTiers: baseWebsiteTiers.map((tier) => {
      const range = settings.websiteRanges[tier.slug];
      if (!range) return tier;
      return { ...tier, from: range.from, to: range.to, quoteOnly: range.to === null };
    }),
    settings: { ...settings, serviceCopy: settings.serviceCopy ?? {} },
  };
}

export function governmentFeeFor(
  service: Pick<ServiceDefinition, "governmentFee" | "governmentFeeFrom" | "governmentFeeWaived" | "governmentFeeLabel">,
): GovernmentFee {
  return {
    amount: service.governmentFeeWaived ? 0 : service.governmentFee,
    from: service.governmentFeeFrom,
    waived: service.governmentFeeWaived,
    label: service.governmentFeeLabel,
  };
}

export function serviceInCountry(
  catalog: Catalog,
  country: CountrySlug,
  slug: string,
): ServiceDefinition | undefined {
  return catalog.services.find(
    (service) => service.country === country && service.slug === slug,
  );
}

export interface ContactDetails {
  email: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  whatsappNumber: string;
  hours: string;
  notLawFirm: string;
  lawyerNote: string;
}

export function contactFrom(settings: SiteSettings): ContactDetails {
  return {
    email: settings.contactEmail || brand.contactEmail,
    phone: settings.contactPhone || brand.contactPhone,
    phoneHref: brand.contactPhoneHref,
    whatsappHref: `https://wa.me/${settings.whatsappNumber || brand.whatsappNumber}`,
    whatsappNumber: settings.whatsappNumber || brand.whatsappNumber,
    hours: brand.hours,
    notLawFirm: brand.notLawFirm,
    lawyerNote: settings.lawyerNote || brand.lawyerNote,
  };
}

export async function getContact(): Promise<ContactDetails> {
  const store = getStore();
  return contactFrom(await store.getSettings());
}
