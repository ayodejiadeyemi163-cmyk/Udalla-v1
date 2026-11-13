import { sendDueReminders } from "@/app/actions/admin";
import { getStore } from "@/lib/store";

export default async function AdminOutboxPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const [emails, audit] = await Promise.all([store.listEmails(), store.listAudit()]);

  return (
    <div className="space-y-8">
      {params.saved ? (
        <p className="rounded-[10px] bg-navy-900/10 px-3 py-2 text-[12.5px] text-navy-900">
          Reminders processed: {params.saved}.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] tracking-[-0.02em]">Outbox</h2>
          <p className="mt-1 text-[12.5px] text-slate-muted">
            Every message the system would send. In demo mode nothing leaves the server.
          </p>
        </div>
        <form action={sendDueReminders}>
          <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
            Send due reminders (30 and 7 days)
          </button>
        </form>
      </div>

      <section>
        <h3 className="eyebrow mb-2">Emails</h3>
        {emails.length === 0 ? (
          <p className="text-[13px] text-slate-muted">Nothing sent yet.</p>
        ) : (
          <ul className="space-y-2">
            {emails.slice(0, 40).map((email) => (
              <li key={email.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{email.subject}</p>
                  <p className="mono text-[10.5px] text-slate-muted">
                    {new Date(email.at).toLocaleString("en-GB")}
                  </p>
                </div>
                <p className="mono mt-1 text-[11px] text-slate-muted">
                  {email.to} · {email.template}
                </p>
                <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-navy-950/70">
                  {email.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="eyebrow mb-2">Audit log, append only</h3>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-cream-300">
                {["When", "Actor", "Action", "Target"].map((heading) => (
                  <th key={heading} className="px-4 py-2.5 text-[10px] uppercase tracking-[0.1em] text-slate-muted">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id} className="border-b border-cream-300 last:border-0">
                  <td className="mono px-4 py-2 text-[11px]">
                    {new Date(entry.at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-2 text-[11.5px]">{entry.actorId}</td>
                  <td className="px-4 py-2 text-[11.5px]">{entry.action}</td>
                  <td className="mono px-4 py-2 text-[11px]">{entry.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
