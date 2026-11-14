import Link from "next/link";
import type { ContactDetails } from "@/lib/catalog";

export function ClosingBanner({ contact }: { contact: ContactDetails }) {
  return (
    <section className="bg-navy-900 text-cream-100">
      <div className="wrap py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="display text-[clamp(2.2rem,1.7rem+3vw,4rem)]">Ready to register?</h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/start" className="btn btn-primary">
              Start your business
            </Link>
            <a
              href={contact.whatsappHref}
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-cream-100/30 px-6 text-[15px] text-cream-100 transition hover:bg-cream-100/10"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
