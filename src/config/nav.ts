import type { Catalog } from "@/lib/catalog";

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  main: NavLink;
  links: NavLink[];
  width: "wide" | "narrow";
}

export function buildNav(catalog: Catalog): NavGroup[] {
  const register = catalog.services.map((service) => ({
    href: `/services/${service.country}/${service.slug}`,
    label: service.name,
    description: service.shortDescription,
  }));

  return [
    {
      label: "Register a business",
      main: { href: "/services", label: "All business registrations" },
      links: register,
      width: "wide",
    },
    {
      label: "Compliance",
      main: { href: "/compliance", label: "Compliance hub" },
      links: [
        { href: "/compliance/annual-returns", label: "Annual returns" },
        { href: "/compliance/beneficial-ownership", label: "Beneficial ownership filing" },
        { href: "/compliance/tax-id", label: "Tax ID" },
        {
          href: "/compliance/us-registered-agent",
          label: "Registered agent or office",
        },
        {
          href: "/compliance/confirmation-statement",
          label: "UK confirmation statement",
        },
        { href: "/compliance/us-annual-report", label: "US annual report" },
      ],
      width: "narrow",
    },
    {
      label: "Websites and more",
      main: { href: "/websites", label: "Business websites" },
      links: [
        { href: "/websites#marketing", label: "Marketing and apps" },
        { href: "/guides", label: "Guides" },
        { href: "/faq", label: "FAQ" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ],
      width: "narrow",
    },
  ];
}
