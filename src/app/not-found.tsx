import Link from "next/link";
import { ArrowRight, Stamp } from "@/components/ui/Marks";
import { brand } from "@/config/brand";

export default function NotFound() {
  return (
    <section className="bg-cream-100 surface-texture">
      <div className="wrap relative py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow">Page not found</p>
            <h1 className="display mt-5 text-[clamp(2.6rem,2rem+4vw,4.8rem)]">
              This page moved, or never existed.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-navy-950/70">
              The link may be old. Everything below is still in the same place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="btn btn-primary">
                Go to the home page
                <ArrowRight />
              </Link>
              <Link href="/services" className="btn btn-outline">
                Browse registrations
              </Link>
            </div>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/compliance", label: "Compliance" },
                { href: "/guides", label: "Guides" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13.5px] text-navy-900 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[18px] border border-cream-300 bg-navy-900 p-8 text-cream-100">
              <Stamp className="absolute -right-6 -top-6 h-32 w-32 text-gold-500/40" />
              <p className="mono text-[80px] leading-none tracking-[-0.06em]">404</p>
              <p className="mt-6 max-w-[24ch] text-[13px] leading-relaxed text-cream-100/70">
                Need a hand? Write to {brand.contactEmail} and we will point you to the right
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
