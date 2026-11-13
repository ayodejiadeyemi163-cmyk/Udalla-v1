import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { ArrowRight } from "@/components/ui/Marks";
import { ORDER_STATUS_FLOW } from "@/lib/store/types";
import { buildDeadlines, daysUntil } from "@/lib/deadlines";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  const store = getStore();
  const [orders, matters] = await Promise.all([
    store.listOrdersByUser(user.id),
    store.listMattersByUser(user.id),
  ]);
  const deadlines = buildDeadlines(orders, matters).slice(0, 3);
  const open = orders.filter((order) => order.status !== "completed");

  const recentMessages = await Promise.all(
    orders.slice(0, 3).map(async (order) => ({
      order,
      messages: await store.listMessages(order.id),
    })),
  );
  const latest = recentMessages
    .flatMap((entry) => entry.messages.map((message) => ({ message, order: entry.order })))
    .sort((a, b) => b.message.at.localeCompare(a.message.at))[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <p className="eyebrow">Open orders</p>
          <p className="mono mt-2 text-[30px] leading-none">{open.length}</p>
          <p className="mt-1 text-[12px] text-slate-muted">of {orders.length} total</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Compliance matters</p>
          <p className="mono mt-2 text-[30px] leading-none">
            {matters.filter((matter) => matter.status !== "completed").length}
          </p>
          <p className="mt-1 text-[12px] text-slate-muted">assigned to a partner lawyer</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Next deadline</p>
          <p className="mono mt-2 text-[30px] leading-none">
            {deadlines[0] ? `${daysUntil(deadlines[0].date)}d` : "--"}
          </p>
          <p className="mt-1 text-[12px] text-slate-muted">
            {deadlines[0]?.label ?? "Nothing due yet"}
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[23px] tracking-[-0.02em]">Your orders</h2>
          <Link href="/services" className="text-[12.5px] font-medium text-navy-900 hover:underline">
            New order
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="font-display text-[21px] tracking-[-0.02em]">No orders yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-navy-950/65">
              Pick a country and a business type. Your progress saves as you go.
            </p>
            <Link href="/services" className="btn btn-primary mt-5">
              Start your first order
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => {
              const stage = ORDER_STATUS_FLOW.findIndex((entry) => entry.value === order.status);
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mono text-[11.5px] text-slate-muted">{order.reference}</p>
                      <p className="mt-1 font-display text-[19px] tracking-[-0.02em]">
                        {order.service.replace(/-/g, " ")}
                      </p>
                      <p className="mt-0.5 text-[12px] capitalize text-slate-muted">
                        {order.country.replace(/-/g, " ")} · {order.packageTier} package
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <ArrowRight className="text-navy-900" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1" aria-hidden="true">
                    {ORDER_STATUS_FLOW.map((step, index) => (
                      <span
                        key={step.value}
                        className={`h-1 flex-1 rounded-full ${
                          index <= stage ? "bg-navy-900" : "bg-cream-300"
                        }`}
                      />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Compliance calendar</h2>
            <Link href="/dashboard/compliance" className="text-[12px] text-navy-900 hover:underline">
              Open
            </Link>
          </div>
          {deadlines.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-muted">
              No deadlines yet. They appear once an entity is registered.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-cream-300">
              {deadlines.map((deadline) => (
                <li key={deadline.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[13px]">{deadline.label}</p>
                    <p className="mono text-[11px] text-slate-muted">
                      Reminders {deadline.reminders.join(" and ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-[12.5px]">{deadline.date}</p>
                    <p
                      className={`text-[11px] ${
                        deadline.tone === "soon" ? "text-danger-600" : "text-slate-muted"
                      }`}
                    >
                      {daysUntil(deadline.date)} days
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/compliance/new"
            className="btn btn-outline mt-4 h-10 px-4 text-[12.5px]"
          >
            Request a compliance service
          </Link>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Latest message</h2>
            <Link href="/dashboard/messages" className="text-[12px] text-navy-900 hover:underline">
              All messages
            </Link>
          </div>
          {latest ? (
            <div className="mt-3">
              <p className="text-[12.5px] font-medium">
                {latest.message.authorName} on {latest.order.reference}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-navy-950/75">
                {latest.message.body.slice(0, 220)}
                {latest.message.body.length > 220 ? "..." : ""}
              </p>
              <Link
                href={`/dashboard/orders/${latest.order.id}`}
                className="mt-3 inline-block text-[12.5px] text-navy-900 hover:underline"
              >
                Open the thread
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-slate-muted">
              No messages yet. The team writes here if the registry asks for anything.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
