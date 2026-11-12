import Link from "next/link";

import { assignOrder, updateOrderStatus } from "@/app/actions/admin";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { ORDER_STATUS_FLOW } from "@/lib/store/types";
import { formatMoney } from "@/lib/money";
import { getStore } from "@/lib/store";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const [orders, lawyers, leads, matters] = await Promise.all([
    store.listAllOrders(),
    store.listLawyers(),
    store.listLeads(),
    store.listAllMatters(),
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const open = orders.filter((order) => order.status !== "completed").length;

  return (
    <div className="space-y-6">
      {params.error ? (
        <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">
          Saved.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Orders", value: String(orders.length) },
          { label: "Open", value: String(open) },
          { label: "Leads", value: String(leads.length) },
          { label: "Matters", value: String(matters.length) },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="eyebrow">{stat.label}</p>
            <p className="mono mt-1.5 text-[26px] leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[22px] tracking-[-0.02em]">All orders</h2>
        <div className="flex gap-2">
          <form action="/admin/export/orders" method="get">
            <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
              Export orders CSV
            </button>
          </form>
          <form action="/admin/export/leads" method="get">
            <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
              Export leads CSV
            </button>
          </form>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-[13px] text-muted">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="card p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-[11.5px] text-muted">{order.reference}</p>
                  <p className="mt-1 text-[14.5px] font-medium capitalize">
                    {order.service.replace(/-/g, " ")}
                  </p>
                  <p className="text-[12px] capitalize text-muted">
                    {order.country.replace(/-/g, " ")} · {order.packageTier} ·{" "}
                    {order.guestEmail || "no email"}
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mono mt-1 text-[13px]">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="mt-1 inline-block text-[11.5px] text-forest hover:underline"
                  >
                    Open thread
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-line pt-3 md:grid-cols-2">
                <form action={updateOrderStatus} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Status
                    </span>
                    <select name="status" defaultValue={order.status} className="field h-10 py-1 text-[12.5px]">
                      {ORDER_STATUS_FLOW.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Note to customer
                    </span>
                    <input name="note" className="field h-10 py-1 text-[12.5px]" placeholder="Optional" />
                  </label>
                  <button type="submit" className="btn btn-forest h-10 px-3 text-[12px]">
                    Update
                  </button>
                </form>

                <form action={assignOrder} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Assigned lawyer
                    </span>
                    <select
                      name="lawyerId"
                      defaultValue={order.assignedLawyerId ?? ""}
                      className="field h-10 py-1 text-[12.5px]"
                    >
                      <option value="">Unassigned</option>
                      {lawyers.map((lawyer) => (
                        <option key={lawyer.id} value={lawyer.id}>
                          {lawyer.showName ? lawyer.displayName : `Partner lawyer, ${lawyer.jurisdiction}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="btn btn-outline h-10 px-3 text-[12px]">
                    Assign
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11.5px] text-muted">
        Paid value across all orders: <span className="mono">{formatMoney(revenue, "NGN")}</span>{" "}
        equivalent, mixed currencies. Exports give exact figures per order.
      </p>
    </div>
  );
}
