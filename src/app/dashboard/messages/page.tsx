import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export default async function MessagesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/messages");

  const store = getStore();
  const [orders, matters] = await Promise.all([
    store.listOrdersByUser(user.id),
    store.listMattersByUser(user.id),
  ]);

  const threads = await Promise.all([
    ...orders.map(async (order) => {
      const messages = await store.listMessages(order.id);
      return {
        id: order.id,
        href: `/dashboard/orders/${order.id}`,
        title: order.service.replace(/-/g, " "),
        meta: order.reference,
        last: messages[messages.length - 1],
      };
    }),
    ...matters.map(async (matter) => {
      const messages = await store.listMessages(matter.id);
      return {
        id: matter.id,
        href: `/dashboard/compliance/${matter.id}`,
        title: matter.serviceName,
        meta: matter.reference,
        last: messages[messages.length - 1],
      };
    }),
  ]);

  threads.sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));

  return (
    <div>
      <h2 className="font-display text-[24px] tracking-[-0.02em]">Messages</h2>
      <p className="mt-1 text-[13px] text-slate-muted">
        One thread per order and per compliance matter. The team replies here.
      </p>

      {threads.length === 0 ? (
        <div className="card mt-5 p-8 text-center">
          <p className="text-[14px] text-navy-950/70">
            No threads yet. Messages appear once you have an order or a compliance request.
          </p>
          <Link href="/services" className="btn btn-primary mt-4">
            Start an order
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-cream-300 border-y border-cream-300">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link
                href={thread.href}
                className="flex items-start justify-between gap-4 py-4 hover:bg-cream-50"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium capitalize">{thread.title}</p>
                  <p className="mono mt-0.5 text-[11px] text-slate-muted">{thread.meta}</p>
                  <p className="mt-1 truncate text-[12.5px] text-navy-950/65">
                    {thread.last ? thread.last.body : "No messages yet"}
                  </p>
                </div>
                <span className="mono flex-none text-[10.5px] text-slate-muted">
                  {thread.last
                    ? new Date(thread.last.at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
