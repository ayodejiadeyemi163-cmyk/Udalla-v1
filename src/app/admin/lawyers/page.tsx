import { saveLawyer } from "@/app/actions/admin";
import { getStore } from "@/lib/store";

export default async function AdminLawyersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const lawyers = await store.listLawyers();

  return (
    <div className="space-y-5">
      {params.error ? (
        <p className="rounded-[10px] bg-danger-100 px-3 py-2 text-[12.5px] text-danger-600">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-navy-900/10 px-3 py-2 text-[12.5px] text-navy-900">Saved.</p>
      ) : null}

      <div>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Partner lawyers</h2>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-muted">
          Cards show on the home, compliance and about pages. Unapproved lawyers are hidden.
          An approved lawyer without a name and photo shows typography only: Partner lawyer,
          jurisdiction.
        </p>
      </div>

      <div className="space-y-3">
        {lawyers.map((lawyer) => (
          <form key={lawyer.id} action={saveLawyer} className="card grid gap-2 p-4">
            <input type="hidden" name="id" value={lawyer.id} />
            <div className="grid gap-2 md:grid-cols-3">
              <input
                name="displayName"
                defaultValue={lawyer.displayName}
                className="field text-[13px]"
                aria-label="Display name"
              />
              <input
                name="jurisdiction"
                defaultValue={lawyer.jurisdiction}
                className="field text-[13px]"
                aria-label="Jurisdiction"
              />
              <input
                name="years"
                type="number"
                min={0}
                defaultValue={lawyer.years}
                className="field mono text-[13px]"
                aria-label="Years in practice"
              />
            </div>
            <input
              name="practiceAreas"
              defaultValue={lawyer.practiceAreas.join(", ")}
              className="field text-[13px]"
              aria-label="Practice areas, comma separated"
            />
            <input
              name="photoUrl"
              defaultValue={lawyer.photoUrl}
              className="field text-[13px]"
              placeholder="https://"
              aria-label="Photo URL"
            />
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="approved" defaultChecked={lawyer.approved} className="h-4 w-4 accent-navy-900" />
                Approved
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showName" defaultChecked={lawyer.showName} className="h-4 w-4 accent-navy-900" />
                Show name
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showPhoto" defaultChecked={lawyer.showPhoto} className="h-4 w-4 accent-navy-900" />
                Show photo
              </label>
              <button type="submit" className="btn btn-navy ml-auto h-9 px-3 text-[11.5px]">
                Save
              </button>
            </div>
          </form>
        ))}
      </div>

      <form action={saveLawyer} className="card grid gap-2 p-4">
        <p className="text-[12.5px] font-medium">Add a partner lawyer</p>
        <div className="grid gap-2 md:grid-cols-3">
          <input name="displayName" placeholder="Display name" className="field text-[13px]" />
          <input name="jurisdiction" placeholder="Jurisdiction" className="field text-[13px]" required />
          <input name="years" type="number" min={0} placeholder="Years" className="field mono text-[13px]" />
        </div>
        <input name="practiceAreas" placeholder="Practice areas, comma separated" className="field text-[13px]" />
        <input name="photoUrl" placeholder="Photo URL, optional" className="field text-[13px]" />
        <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approved" className="h-4 w-4 accent-navy-900" />
            Approved
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="showName" className="h-4 w-4 accent-navy-900" />
            Show name
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="showPhoto" className="h-4 w-4 accent-navy-900" />
            Show photo
          </label>
          <button type="submit" className="btn btn-primary ml-auto h-9 px-3 text-[11.5px]">
            Add lawyer
          </button>
        </div>
      </form>
    </div>
  );
}
