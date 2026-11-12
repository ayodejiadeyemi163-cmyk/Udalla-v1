import { getStore } from "@/lib/store";

export default async function AdminLeadsPage() {
  const store = getStore();
  const leads = await store.listLeads();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] tracking-[-0.02em]">Website and marketing leads</h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Every enquiry from the contact and websites forms.
          </p>
        </div>
        <form action="/admin/export/leads" method="get">
          <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
            Export CSV
          </button>
        </form>
      </div>

      {leads.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-[13.5px] text-ink/70">No leads yet.</p>
          <p className="mt-1 text-[12px] text-muted">
            Submit the form on the websites page to see one appear here.
          </p>
        </div>
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["Date", "Name", "Contact", "Business", "Project", "Budget", "Timeline"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-[10.5px] uppercase tracking-[0.1em] text-muted">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line last:border-0">
                  <td className="mono px-4 py-3 text-[11.5px]">
                    {new Date(lead.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-[13px]">{lead.name}</td>
                  <td className="px-4 py-3 text-[12px]">
                    <a href={`mailto:${lead.email}`} className="text-forest hover:underline">
                      {lead.email}
                    </a>
                    <br />
                    <span className="mono text-[11px] text-muted">{lead.whatsapp}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px]">{lead.business}</td>
                  <td className="px-4 py-3 text-[12px]">{lead.projectType}</td>
                  <td className="px-4 py-3 text-[12px]">{lead.budget}</td>
                  <td className="px-4 py-3 text-[12px]">{lead.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
