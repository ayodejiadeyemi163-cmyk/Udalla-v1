import Link from "next/link";
import { redirect } from "next/navigation";

import { MatterStatusBadge } from "@/components/dashboard/StatusBadge";
import { ArrowRight } from "@/components/ui/Marks";
import { daysUntil, buildDeadlines } from "@/lib/deadlines";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export default async function ComplianceDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/compliance");

  const store = getStore();
  const [matters, orders] = await Promise.all([
    store.listMattersByUser(user.id),
    store.listOrdersByUser(user.id),
  ]);
  const deadlines = buildDeadlines(orders, matters);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] tracking-[-0.02em]">Compliance</h2>
          <p className="mt-1 text-[13px] text-muted">
            Requests, filing status and the dates that matter.
          </p>
        </div>
        <Link href="/dashboard/compliance/new" className="btn btn-primary h-11 px-4 text-[13px]">
          New request
        </Link>
      </div>

      <section className="mt-6">
        <h3 className="eyebrow mb-3">Your matters</h3>
        {matters.length === 0 ? (
          <div className="card p-9 text-center">
            <p className="font-display text-[21px] tracking-[-0.02em]">No requests yet</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink/65">
              Ask for annual returns, a tax ID or a beneficial ownership filing. A partner
              lawyer picks up the matter and replies in your dashboard.
            </p>
            <Link href="/dashboard/compliance/new" className="btn btn-primary mt-4">
              Make a request
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matters.map((matter) => {
              const thread = matter.timeline[matter.timeline.length - 1];
              return (
                <Link
                  key={matter.id}
                  href={`/dashboard/compliance/${matter.id}`}
                  className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mono text-[11.5px] text-muted">{matter.reference}</p>
                      <p className="mt-1 font-display text-[19px] tracking-[-0.02em]">
                        {matter.serviceName}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {thread ? `${thread.status.replace("-", " ")} · ${new Date(thread.at).toLocaleDateString("en-GB")}` : "Received"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MatterStatusBadge status={matter.status} />
                      <ArrowRight className="text-forest" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h3 className="eyebrow mb-3">Deadlines and reminders</h3>
        {deadlines.length === 0 ? (
          <p className="text-[13px] text-muted">
            Nothing scheduled. Deadlines are added when an entity is registered or a yearly
            service is invoiced.
          </p>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-3 text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    Filing
                  </th>
                  <th className="px-4 py-3 text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    Due
                  </th>
                  <th className="px-4 py-3 text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    Reminders
                  </th>
                </tr>
              </thead>
              <tbody>
                {deadlines.map((deadline) => (
                  <tr key={deadline.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-[13px]">
                      <Link href={deadline.href} className="hover:text-forest">
                        {deadline.label}
                      </Link>
                    </td>
                    <td className="mono px-4 py-3 text-[12px]">
                      {deadline.date}
                      <span
                        className={`ml-2 text-[10.5px] ${
                          deadline.tone === "soon" ? "text-clay" : "text-muted"
                        }`}
                      >
                        {daysUntil(deadline.date)}d
                      </span>
                    </td>
                    <td className="mono px-4 py-3 text-[11.5px] text-muted">
                      {deadline.reminders.join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11.5px] text-muted">
          Reminders are emailed 30 and 7 days before each deadline. Yearly services are
          invoiced, never charged automatically.
        </p>
      </section>
    </div>
  );
}
