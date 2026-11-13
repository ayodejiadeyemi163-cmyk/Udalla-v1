import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MessageThread } from "@/components/dashboard/MessageThread";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { Lock } from "@/components/ui/Marks";
import { canAccessOrder } from "@/lib/access";
import { getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/dashboard/orders/${id}`);

  const store = getStore();
  const order = await store.getOrder(id);
  if (!canAccessOrder(user, order) || !order) notFound();

  const [catalog, messages] = await Promise.all([
    getCatalog(),
    store.listMessages(order.id),
  ]);
  const service = catalog.services.find(
    (entry) => entry.country === order.country && entry.slug === order.service,
  );
  const pack = service?.packages.find((entry) => entry.tier === order.packageTier);

  return (
    <div>
      <Link href="/dashboard" className="text-[12.5px] text-navy-900 hover:underline">
        &larr; Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono text-[12px] text-slate-muted">{order.reference}</p>
          <h1 className="display mt-1 text-[clamp(1.8rem,1.4rem+1.8vw,2.6rem)]">
            {service?.name ?? order.service}
          </h1>
          <p className="mt-1 text-[13px] capitalize text-slate-muted">
            {order.country.replace(/-/g, " ")} · {order.packageTier} package ·{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Status timeline</h2>
            <div className="mt-4">
              <OrderTimeline status={order.status} timeline={order.timeline} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Business details</h2>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-muted">Proposed names:</dt>
                <dd>{order.business.proposedNames.join(" / ") || "Not provided"}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-muted">Activity:</dt>
                <dd>{order.business.activity || "Not provided"}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-muted">Address:</dt>
                <dd>{order.business.address || "Not provided"}</dd>
              </div>
              {order.business.shareCapital ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-slate-muted">Share capital:</dt>
                  <dd className="mono">{order.business.shareCapital}</dd>
                </div>
              ) : null}
            </dl>

            <h3 className="mt-5 text-[13px] font-medium">People</h3>
            <ul className="mt-2 divide-y divide-cream-300 border-y border-cream-300">
              {order.people.map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                  <span>
                    {person.name} <span className="text-slate-muted">({person.role})</span>
                  </span>
                  <span className="mono text-[12px]">{person.ownership}%</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Documents</h2>
            {order.documents.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-muted">
                No documents on this order. Uploads open in the live deployment with private
                storage configured.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-cream-300 border-y border-cream-300">
                {order.documents.map((document) => (
                  <li key={document.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-[13px]">{document.filename}</span>
                    <a
                      href={`/api/documents/${document.id}`}
                      className="text-[12px] font-medium text-navy-900 hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-muted">
              <Lock /> Private storage. Links expire after 60 seconds.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Messages</h2>
            <div className="mt-3">
              <MessageThread
                messages={messages}
                threadId={order.id}
                kind="order"
                currentUserId={user.id}
                error={query.error}
              />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="card p-6">
            <p className="eyebrow">Payment summary</p>
            <dl className="mt-3 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-navy-950/70">{pack?.name ?? order.packageTier} package</dt>
                <dd className="mono">{formatMoney(order.packagePrice, order.currency)}</dd>
              </div>
              {order.addOnsTotal > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-navy-950/70">Add-ons</dt>
                  <dd className="mono">{formatMoney(order.addOnsTotal, order.currency)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-navy-950/70">Government fee</dt>
                <dd className="mono">{formatMoney(order.governmentFee, order.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-cream-300 pt-2 text-[15px]">
                <dt className="font-medium">Total</dt>
                <dd className="mono">{formatMoney(order.total, order.currency)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11.5px] text-slate-muted">
              {order.payment.provider === "test"
                ? "Test payment used. No money moved."
                : `Paid with ${order.payment.provider}.`}
            </p>
          </div>

          <div className="card mt-4 p-6">
            <p className="eyebrow">Need something else</p>
            <Link
              href="/dashboard/compliance/new"
              className="btn btn-outline mt-3 w-full"
            >
              Request a compliance service
            </Link>
            <Link href="/contact" className="link-quiet mt-3 inline-block text-[12.5px]">
              Contact the team
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
