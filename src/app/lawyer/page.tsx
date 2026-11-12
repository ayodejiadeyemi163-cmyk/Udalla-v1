import Link from "next/link";

import { updateMatterStatus } from "@/app/actions/admin";
import { signOutAction } from "@/app/actions/auth";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { MatterStatusBadge } from "@/components/dashboard/StatusBadge";
import { requireLawyer } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getStore } from "@/lib/store";

const STATUSES = ["received", "assigned", "in-progress", "filed", "completed"] as const;

export default async function LawyerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const lawyer = await requireLawyer();
  const store = getStore();
  const matters =
    lawyer.role === "admin"
      ? await store.listAllMatters()
      : await store.listMattersByLawyer(lawyer.id);

  const threads = await Promise.all(
    matters.map(async (matter) => ({
      matter,
      messages: await store.listMessages(matter.id),
    })),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {params.error ? (
          <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">
            {params.error}
          </p>
        ) : (
          <p className="text-[12.5px] text-muted">
            {matters.length} matter{matters.length === 1 ? "" : "s"} on your desk.
          </p>
        )}
        <form action={signOutAction}>
          <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
            Sign out
          </button>
        </form>
      </div>

      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">Saved.</p>
      ) : null}

      {threads.length === 0 ? (
        <div className="card p-9 text-center">
          <p className="font-display text-[21px] tracking-[-0.02em]">Nothing assigned yet</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink/65">
            Compliance requests appear here once an administrator assigns them to you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map(({ matter, messages }) => (
            <article key={matter.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-[11px] text-muted">{matter.reference}</p>
                  <h2 className="mt-1 font-display text-[20px] tracking-[-0.02em]">
                    {matter.serviceName}
                  </h2>
                  <p className="text-[12px] text-muted">
                    Opened {new Date(matter.createdAt).toLocaleDateString("en-GB")}
                    {matter.deadline ? ` · deadline ${matter.deadline}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <MatterStatusBadge status={matter.status} />
                  <p className="mono mt-1 text-[12.5px]">
                    {matter.price === null ? "Quote" : formatMoney(matter.price, matter.currency)}
                  </p>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink/75">
                {matter.detail}
              </p>

              <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-[13px] font-medium">Update the matter</h3>
                  <form action={updateMatterStatus} className="mt-2 grid gap-2">
                    <input type="hidden" name="matterId" value={matter.id} />
                    <select name="status" defaultValue={matter.status} className="field h-10 py-1 text-[12.5px]">
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("-", " ")}
                        </option>
                      ))}
                    </select>
                    <input
                      name="note"
                      placeholder="Note for the timeline, optional"
                      className="field h-10 py-1 text-[12.5px]"
                    />
                    <button type="submit" className="btn btn-forest h-10 w-fit px-3 text-[12px]">
                      Save status
                    </button>
                  </form>

                  <ol className="mt-4 space-y-2">
                    {matter.timeline.map((entry, index) => (
                      <li key={`${entry.status}-${index}`} className="flex gap-2 text-[12px]">
                        <span className="mono w-6 flex-none text-[10.5px] text-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="capitalize">{entry.status.replace("-", " ")}</span>{" "}
                          <span className="mono text-[10.5px] text-muted">
                            {new Date(entry.at).toLocaleDateString("en-GB")}
                          </span>
                          {entry.note ? (
                            <span className="block text-[11.5px] text-muted">{entry.note}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-[13px] font-medium">Messages</h3>
                  <div className="mt-2">
                    <MessageThread
                      messages={messages}
                      threadId={matter.id}
                      kind="matter"
                      currentUserId={lawyer.id}
                    />
                  </div>
                </div>
              </div>

              <Link
                href={`/dashboard/compliance/${matter.id}`}
                className="mt-3 inline-block text-[11.5px] text-forest hover:underline"
              >
                Open the customer thread view
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
