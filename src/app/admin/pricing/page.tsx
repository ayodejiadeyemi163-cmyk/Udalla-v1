import { savePricing, saveServiceCopy } from "@/app/actions/admin";
import { formatMoney } from "@/lib/money";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/store";

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const store = getStore();
  const history = await store.listPriceChanges();

  return (
    <div className="space-y-8">
      {params.error ? (
        <p className="rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="rounded-[10px] bg-forest/10 px-3 py-2 text-[12.5px] text-forest">
          Saved. Every page now reads the new figure.
        </p>
      ) : null}

      <p className="max-w-3xl text-[12.5px] leading-relaxed text-muted">
        Prices here override the values in the pricing config. Every change is written to the
        price history below and every page, card, FAQ and checkout reads the override.
      </p>

      <section className="space-y-4">
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Services and packages</h2>
        {catalog.services.map((service) => (
          <div key={service.slug} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="mono text-[11px] text-muted">
                  {service.country} · {service.slug}
                </p>
                <p className="font-display text-[19px] tracking-[-0.02em]">{service.name}</p>
              </div>
              <p className="mono text-[11.5px] text-muted">
                {service.governmentFeeLabel}:{" "}
                {service.governmentFeeWaived
                  ? "waived"
                  : formatMoney(service.governmentFee, service.currency)}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {service.packages.map((pack) => (
                <form
                  key={pack.tier}
                  action={savePricing}
                  className="rounded-[12px] border border-line p-3"
                >
                  <input type="hidden" name="kind" value="package" />
                  <input type="hidden" name="serviceSlug" value={service.slug} />
                  <input type="hidden" name="tier" value={pack.tier} />
                  <p className="text-[12px] font-medium">{pack.name}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <label className="flex-1">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
                        Price
                      </span>
                      <input
                        name="price"
                        type="number"
                        min={0}
                        defaultValue={pack.price}
                        className="field mono h-9 py-1 text-[12.5px]"
                      />
                    </label>
                    <button type="submit" className="btn btn-outline h-9 px-2.5 text-[11.5px]">
                      Save
                    </button>
                  </div>
                  <p className="mt-1 text-[10.5px] text-muted">
                    Partner cost {formatMoney(pack.partnerCost, service.currency)}, margin{" "}
                    {formatMoney(pack.margin, service.currency)}
                  </p>
                </form>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <form action={savePricing} className="rounded-[12px] border border-line p-3">
                <input type="hidden" name="kind" value="government" />
                <input type="hidden" name="serviceSlug" value={service.slug} />
                <p className="text-[12px] font-medium">Government fee</p>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <label>
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
                      Amount
                    </span>
                    <input
                      name="amount"
                      type="number"
                      min={0}
                      defaultValue={service.governmentFee}
                      className="field mono h-9 w-32 py-1 text-[12.5px]"
                    />
                  </label>
                  <label className="flex items-center gap-2 pb-2 text-[12px]">
                    <input
                      type="checkbox"
                      name="waived"
                      defaultChecked={service.governmentFeeWaived}
                      className="h-4 w-4 accent-forest"
                    />
                    Waived
                  </label>
                  <button type="submit" className="btn btn-outline h-9 px-2.5 text-[11.5px]">
                    Save fee
                  </button>
                </div>
              </form>

              <form action={saveServiceCopy} className="rounded-[12px] border border-line p-3">
                <input type="hidden" name="slug" value={service.slug} />
                <p className="text-[12px] font-medium">Service copy</p>
                <div className="mt-2 grid gap-2">
                  <input
                    name="name"
                    defaultValue={service.name}
                    className="field h-9 py-1 text-[12.5px]"
                    aria-label="Service name"
                  />
                  <input
                    name="shortDescription"
                    defaultValue={service.shortDescription}
                    className="field h-9 py-1 text-[12.5px]"
                    aria-label="Short description"
                  />
                  <button type="submit" className="btn btn-outline h-9 px-2.5 text-[11.5px]">
                    Save copy
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Compliance prices</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {catalog.compliance.map((service) => (
            <form key={service.slug} action={savePricing} className="card flex items-end gap-2 p-3">
              <input type="hidden" name="kind" value="compliance" />
              <input type="hidden" name="slug" value={service.slug} />
              <div className="flex-1">
                <p className="text-[12.5px] font-medium">{service.name}</p>
                <p className="text-[10.5px] text-muted">
                  {service.billing === "yearly" ? "Yearly" : "One-off"} ·{" "}
                  {service.quote || service.price === null
                    ? "By quote"
                    : formatMoney(service.price, service.currency)}
                </p>
              </div>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={service.price ?? 0}
                className="field mono h-9 w-28 py-1 text-[12px]"
                aria-label={`${service.name} price`}
              />
              <button type="submit" className="btn btn-outline h-9 px-2.5 text-[11.5px]">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Website ranges</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {catalog.websiteTiers.map((tier) => (
            <form key={tier.slug} action={savePricing} className="card flex flex-wrap items-end gap-2 p-3">
              <input type="hidden" name="kind" value="website" />
              <input type="hidden" name="slug" value={tier.slug} />
              <p className="w-full text-[12.5px] font-medium">{tier.name}</p>
              <label>
                <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">From</span>
                <input
                  name="from"
                  type="number"
                  min={0}
                  defaultValue={tier.from}
                  className="field mono h-9 w-28 py-1 text-[12px]"
                />
              </label>
              <label>
                <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">
                  To (blank for quote)
                </span>
                <input
                  name="to"
                  type="number"
                  min={0}
                  defaultValue={tier.to ?? ""}
                  className="field mono h-9 w-28 py-1 text-[12px]"
                />
              </label>
              <button type="submit" className="btn btn-outline h-9 px-2.5 text-[11.5px]">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.02em]">Price change history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-muted">No changes yet.</p>
        ) : (
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line">
                  {["When", "Scope", "Item", "From", "To", "By"].map((heading) => (
                    <th key={heading} className="px-4 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((change) => (
                  <tr key={change.id} className="border-b border-line last:border-0">
                    <td className="mono px-4 py-2 text-[11px]">
                      {new Date(change.at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2 text-[11.5px] capitalize">{change.scope}</td>
                    <td className="px-4 py-2 text-[11.5px]">{change.label}</td>
                    <td className="mono px-4 py-2 text-[11px]">{change.previous}</td>
                    <td className="mono px-4 py-2 text-[11px]">{change.next}</td>
                    <td className="px-4 py-2 text-[11px]">{change.changedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
