import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderTimeline } from "@/components/site/OrderTimeline";
import { ArrowRight, Stamp } from "@/components/ui/Marks";
import { brand } from "@/config/brand";
import { getCountry } from "@/config/countries";
import { getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const store = getStore();
  const order = await store.getOrderByReference(reference);
  if (!order) notFound();

  const [user, catalog] = await Promise.all([getSessionUser(), getCatalog()]);
  const service = catalog.services.find(
    (entry) => entry.country === order.country && entry.slug === order.service,
  );
  const country = getCountry(order.country);
  const isOwner = Boolean(user && order.userId && user.id === order.userId);

  return (
    <section className="bg-ivory paper-texture">
      <div className="wrap relative py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative mx-auto h-24 w-24">
            <Stamp className="h-24 w-24 text-forest" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="step-enter grid h-10 w-10 place-items-center rounded-full bg-marigold text-ink">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="m4 10 4 4 8-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>

          <p className="eyebrow mt-6">Order received</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,1.8rem+2.6vw,3.6rem)]">
            Your filing is in our hands.
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink/70">
            A receipt is on its way to the email on the order. Every stage appears in your
            dashboard, and we message you if the registry asks for anything.
          </p>

          <div className="mx-auto mt-7 inline-flex flex-col items-center rounded-[14px] border border-line bg-paper px-6 py-4">
            <span className="eyebrow">Reference</span>
            <span className="mono mt-1 text-[22px] tracking-[-0.02em]">{order.reference}</span>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Order</p>
                <p className="mt-2 font-display text-[21px] tracking-[-0.02em]">
                  {service?.name ?? order.service}
                </p>
                <p className="text-[12.5px] text-muted">{country?.name}</p>
              </div>
              <span className="pill pill-forest">Received</span>
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink/70">Package</dt>
                <dd className="capitalize">{order.packageTier}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/70">Government fee</dt>
                <dd className="mono">{formatMoney(order.governmentFee, order.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-[15px]">
                <dt className="font-medium">Paid</dt>
                <dd className="mono">{formatMoney(order.total, order.currency)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11.5px] text-muted">
              {order.payment.provider === "test"
                ? "Test payment. No money moved and no live gateway keys are configured."
                : "Payment confirmed by the provider."}
            </p>
          </div>

          <div className="card p-6">
            <p className="eyebrow">What happens next</p>
            <div className="mt-4">
              <OrderTimeline status={order.status} timeline={order.timeline} compact />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-3">
          {isOwner ? (
            <Link href={`/dashboard/orders/${order.id}`} className="btn btn-primary">
              Open the order in your dashboard
              <ArrowRight />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Sign in to follow this order
              <ArrowRight />
            </Link>
          )}
          <Link href="/guides" className="text-[13px] text-forest hover:underline">
            Read a guide while you wait
          </Link>
          <p className="max-w-lg pt-2 text-center text-[11.5px] leading-relaxed text-muted">
            {brand.filingNote} {brand.notLawFirm}
          </p>
        </div>
      </div>
    </section>
  );
}
