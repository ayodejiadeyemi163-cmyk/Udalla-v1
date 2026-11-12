import Link from "next/link";

import { assignMatter, updateMatterStatus } from "@/app/actions/admin";
import { MatterStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatMoney } from "@/lib/money";
import { getStore } from "@/lib/store";

const STATUSES = ["received", "assigned", "in-progress", "filed", "completed"] as const;

export default async function AdminMattersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const [matters, lawyers] = await Promise.all([store.listAllMatters(), store.listLawyers()]);

  return (
    <div className="space-y-5">
      {params.error ? (
        <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">Saved.</p>
      ) : null}

      <h2 className="font-display text-[22px] tracking-[-0.02em]">Compliance matters</h2>

      {matters.length === 0 ? (
        <p className="text-[13px] text-muted">No matters yet.</p>
      ) : (
        <ul className="space-y-3">
          {matters.map((matter) => (
            <li key={matter.id} className="card p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-[11.5px] text-muted">{matter.reference}</p>
                  <p className="mt-1 text-[14.5px] font-medium">{matter.serviceName}</p>
                  <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink/65">
                    {matter.detail}
                  </p>
                </div>
                <div className="text-right">
                  <MatterStatusBadge status={matter.status} />
                  <p className="mono mt-1 text-[12.5px]">
                    {matter.price === null ? "Quote" : formatMoney(matter.price, matter.currency)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-line pt-3 md:grid-cols-2">
                <form action={assignMatter} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="matterId" value={matter.id} />
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Lawyer
                    </span>
                    <select
                      name="lawyerId"
                      defaultValue={matter.assignedLawyerId ?? ""}
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

                <form action={updateMatterStatus} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="matterId" value={matter.id} />
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Status
                    </span>
                    <select name="status" defaultValue={matter.status} className="field h-10 py-1 text-[12.5px]">
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("-", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex-1">
                    <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      Note
                    </span>
                    <input name="note" className="field h-10 py-1 text-[12.5px]" placeholder="Optional" />
                  </label>
                  <button type="submit" className="btn btn-forest h-10 px-3 text-[12px]">
                    Update
                  </button>
                </form>
              </div>

              <Link
                href={`/dashboard/compliance/${matter.id}`}
                className="mt-3 inline-block text-[11.5px] text-forest hover:underline"
              >
                Open thread
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
