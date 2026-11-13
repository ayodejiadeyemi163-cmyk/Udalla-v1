import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MessageThread } from "@/components/dashboard/MessageThread";
import { MatterStatusBadge } from "@/components/dashboard/StatusBadge";
import { canAccessMatter } from "@/lib/access";
import { daysUntil } from "@/lib/deadlines";
import { formatMoney } from "@/lib/money";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

const STATUS_LABELS = ["received", "assigned", "in-progress", "filed", "completed"] as const;

export default async function MatterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/dashboard/compliance/${id}`);

  const store = getStore();
  const matter = await store.getMatter(id);
  if (!canAccessMatter(user, matter) || !matter) notFound();

  const [messages, lawyers] = await Promise.all([
    store.listMessages(matter.id),
    store.listLawyers(true),
  ]);
  const lawyer = lawyers.find((entry) => entry.id === matter.assignedLawyerId);
  const lawyerLabel = lawyer
    ? lawyer.showName
      ? lawyer.displayName
      : `Partner lawyer, ${lawyer.jurisdiction}`
    : "Awaiting assignment";

  return (
    <div>
      <Link href="/dashboard/compliance" className="text-[12.5px] text-navy-900 hover:underline">
        &larr; Compliance
      </Link>

      {query.created ? (
        <p className="mt-4 rounded-[10px] bg-navy-900/10 px-3 py-2 text-[12.5px] text-navy-900">
          Request received. The lawyer has been notified and will reply in this thread.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono text-[12px] text-slate-muted">{matter.reference}</p>
          <h1 className="display mt-1 text-[clamp(1.8rem,1.4rem+1.6vw,2.5rem)]">
            {matter.serviceName}
          </h1>
          <p className="mt-1 text-[13px] text-slate-muted">
            Opened {new Date(matter.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
        <MatterStatusBadge status={matter.status} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Your request</h2>
            <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-navy-950/80">
              {matter.detail}
            </p>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Timeline</h2>
            <ol className="mt-4 space-y-3">
              {matter.timeline.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="flex gap-3">
                  <span className="numeral w-8 flex-none text-[20px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[13.5px] capitalize">{entry.status.replace("-", " ")}</p>
                    <p className="mono text-[11px] text-slate-muted">
                      {new Date(entry.at).toLocaleDateString("en-GB")}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-1" aria-hidden="true">
              {STATUS_LABELS.map((status) => {
                const index = STATUS_LABELS.indexOf(matter.status);
                const stepIndex = STATUS_LABELS.indexOf(status);
                return (
                  <span
                    key={status}
                    className={`h-1 flex-1 rounded-full ${
                      stepIndex <= index ? "bg-navy-900" : "bg-cream-300"
                    }`}
                  />
                );
              })}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-[20px] tracking-[-0.02em]">Messages</h2>
            <div className="mt-3">
              <MessageThread
                messages={messages}
                threadId={matter.id}
                kind="matter"
                currentUserId={user.id}
                error={query.error}
              />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="card p-6">
            <p className="eyebrow">Lawyer</p>
            <p className="mt-2 font-display text-[18px] tracking-[-0.02em]">{lawyerLabel}</p>
            <p className="mt-1 text-[12px] text-slate-muted">
              Independent, licensed practitioner. Lawyers handle regulatory compliance, not
              registration filings.
            </p>

            <dl className="mt-4 space-y-1.5 border-t border-cream-300 pt-4 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-navy-950/70">Service fee</dt>
                <dd className="mono">
                  {matter.price === null ? "By quote" : formatMoney(matter.price, matter.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-950/70">Deadline</dt>
                <dd className="mono">
                  {matter.deadline
                    ? `${matter.deadline} (${daysUntil(matter.deadline)}d)`
                    : "To be set"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-muted">
              Government fees are confirmed in this thread before filing. Nothing is charged
              automatically.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
