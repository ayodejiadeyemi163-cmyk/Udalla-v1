import Link from "next/link";
import { redirect } from "next/navigation";

import { requestCompliance } from "@/app/actions/compliance";
import { getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getSessionUser } from "@/lib/session";

export default async function NewCompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/compliance/new");

  const catalog = await getCatalog();
  const selected = catalog.compliance.find((entry) => entry.slug === params.service);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/compliance" className="text-[12.5px] text-forest hover:underline">
        &larr; Compliance
      </Link>
      <h2 className="display mt-3 text-[clamp(1.8rem,1.4rem+1.6vw,2.5rem)]">
        Request a compliance service
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink/70">
        A request becomes a matter with a timeline and a message thread. A partner lawyer
        reviews the scope and any government fee before anything is filed.
      </p>

      {params.error ? (
        <p className="mt-4 rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">
          {params.error}
        </p>
      ) : null}

      <form action={requestCompliance} className="card mt-5 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="serviceSlug">
            Service
          </label>
          <select
            id="serviceSlug"
            name="serviceSlug"
            className="field"
            defaultValue={selected?.slug ?? catalog.compliance[0]?.slug}
          >
            {catalog.compliance.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}{" "}
                {service.quote || service.price === null
                  ? "(by quote)"
                  : `(${formatMoney(service.price, service.currency)}${service.billing === "yearly" ? " a year" : ""})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="detail">
            What do you need done?
          </label>
          <textarea
            id="detail"
            name="detail"
            className="field min-h-32"
            placeholder="Company name, registry number and anything the lawyer should know."
            required
          />
          <p className="mt-1 text-[11.5px] text-muted">
            Include the entity name and current registration number if you have one.
          </p>
        </div>

        <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-ink/80">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 flex-none accent-forest" />
          <span>
            I agree that my request and contact details are shared with an independent
            partner lawyer, as described in the{" "}
            <Link href="/privacy" className="link-quiet">
              privacy policy
            </Link>
            .
          </span>
        </label>

        <button type="submit" className="btn btn-primary">
          Send request
        </button>
      </form>
    </div>
  );
}
