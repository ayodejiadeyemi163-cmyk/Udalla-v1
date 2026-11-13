import Link from "next/link";
import { brand } from "@/config/brand";
import type { ServiceDefinition } from "@/config/pricing";
import type { ContactDetails } from "@/lib/catalog";

export function Footer({
  services,
  contact,
}: {
  services: ServiceDefinition[];
  contact: ContactDetails;
}) {
  const columns = [
    {
      title: "Business types",
      links: services.map((service) => ({
        href: `/services/${service.country}/${service.slug}`,
        label: service.name,
      })),
    },
    {
      title: "Resources",
      links: [
        { href: "/guides", label: "Guides" },
        { href: "/faq", label: "FAQ" },
        { href: "/about", label: "About Udalla" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { href: "/compliance", label: "Compliance hub" },
        { href: "/websites", label: "Business websites" },
        { href: "/pricing", label: "Pricing" },
        { href: "/services", label: "All registrations" },
      ],
    },
    {
      title: "Quick links",
      links: [
        { href: "/login", label: "Log in" },
        { href: "/services", label: "Start an order" },
        { href: "/dashboard", label: "Your dashboard" },
        { href: "/compliance/annual-returns", label: "Annual returns" },
      ],
    },
  ];

  return (
    <footer className="border-t border-cream-300 bg-cream-100 surface-texture">
      <div className="wrap relative py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="font-display text-[30px] tracking-[-0.045em]">
              {brand.name}
            </Link>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-navy-950/70">
              Business registration and compliance in Nigeria, the United Kingdom and the
              United States.
            </p>
            <div className="mt-6 space-y-1.5 text-[14px]">
              <a href={`mailto:${contact.email}`} className="block text-navy-900 hover:underline">
                {contact.email}
              </a>
              <a href={contact.phoneHref} className="mono block text-navy-950/80">
                {contact.phone}
              </a>
              <a href={contact.whatsappHref} className="block text-navy-950/80 hover:text-navy-900">
                WhatsApp {contact.whatsappNumber}
              </a>
              <p className="pt-1 text-[12.5px] text-slate-muted">{contact.hours}</p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:col-span-8 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="eyebrow mb-3">{column.title}</p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-[13.5px] leading-snug text-navy-950/75 hover:text-navy-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-cream-300 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-navy-950/65">
              <Link href="/privacy" className="hover:text-navy-900">Privacy</Link>
              <Link href="/terms" className="hover:text-navy-900">Terms</Link>
              <Link href="/cookies" className="hover:text-navy-900">Cookies</Link>
              <Link href="/refunds" className="hover:text-navy-900">Refunds</Link>
              <Link href="/disclaimer" className="hover:text-navy-900">Disclaimer</Link>
            </div>
            <p className="text-[12px] text-slate-muted">
              &copy; {new Date().getFullYear()} {brand.legalName}. All rights reserved.
            </p>
          </div>
          <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-slate-muted">
            {contact.notLawFirm} {brand.filingNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
