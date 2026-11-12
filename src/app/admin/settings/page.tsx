import { saveSettings } from "@/app/actions/admin";
import { brand } from "@/config/brand";
import { getStore } from "@/lib/store";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const store = getStore();
  const settings = await store.getSettings();

  return (
    <div className="max-w-2xl space-y-5">
      {params.error ? (
        <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">Saved.</p>
      ) : null}

      <div>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Contact details</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          These override the defaults in the brand config. Brand name, legal name and domain
          live only in the config file.
        </p>
      </div>

      <form action={saveSettings} className="card grid gap-3 p-5">
        <div>
          <label className="label" htmlFor="contactEmail">
            Contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="contactPhone">
            Phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            defaultValue={settings.contactPhone}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="whatsappNumber">
            WhatsApp number, digits only
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            className="field mono"
          />
        </div>
        <div>
          <label className="label" htmlFor="lawyerNote">
            Line under the lawyer cards
          </label>
          <input
            id="lawyerNote"
            name="lawyerNote"
            defaultValue={settings.lawyerNote}
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary w-fit">
          Save contact details
        </button>
      </form>

      <div className="card p-5">
        <p className="eyebrow">Fixed in the brand config</p>
        <dl className="mt-3 space-y-1.5 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Brand</dt>
            <dd>{brand.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Legal name</dt>
            <dd>{brand.legalName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Domain</dt>
            <dd>{brand.domain}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Hours</dt>
            <dd className="text-right">{brand.hours}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
