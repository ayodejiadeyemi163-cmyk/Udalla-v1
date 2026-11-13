import Link from "next/link";
import { brand } from "@/config/brand";
import type { ContactDetails } from "@/lib/catalog";
import { ArrowRight, Stamp } from "@/components/ui/Marks";

export function ClosingBanner({ contact }: { contact: ContactDetails }) {
  return (
    <section className="bg-navy-900 text-cream-100">
      <div className="wrap relative overflow-hidden py-16 md:py-24">
        <Stamp className="pointer-events-none absolute -right-10 top-1/2 hidden h-64 w-64 -translate-y-1/2 text-gold-500/25 md:block" />
        <div className="relative max-w-2xl">
          <p className="eyebrow text-cream-100/60">Start with one clear step</p>
          <h2 className="display mt-5 text-[clamp(2.2rem,1.7rem+3vw,4rem)]">
            Pick a country. We handle the filing.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-cream-100/75">
            Prices are shown up front, government fees sit separately at cost, and every
            stage shows in your dashboard until the certificate arrives.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/services" className="btn btn-primary">
              Get started
              <ArrowRight />
            </Link>
            <a
              href={contact.whatsappHref}
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-cream-100/30 px-6 text-[15px] text-cream-100 transition hover:bg-cream-100/10"
            >
              Ask on WhatsApp
            </a>
          </div>
          <p className="mt-5 text-[12.5px] text-cream-100/55">
            {contact.hours} {brand.filingNote}
          </p>
        </div>
      </div>
    </section>
  );
}
