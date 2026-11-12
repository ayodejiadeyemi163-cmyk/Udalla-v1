import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocumentsStep } from "@/components/checkout/DocumentsStep";
import { PackagePicker } from "@/components/checkout/PackagePicker";
import { PeopleEditor } from "@/components/checkout/PeopleEditor";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { payWithPaystack, payWithTestGateway, saveBusinessStep, saveReviewStep } from "@/app/actions/checkout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Lock } from "@/components/ui/Marks";
import { priceNote } from "@/config/pricing";
import { contactFrom, getCatalog } from "@/lib/catalog";
import { clampStep, priceSelection } from "@/lib/checkout";
import { resolveDraft } from "@/lib/draft";
import { hasSupabaseConfig } from "@/lib/env";
import { isCountrySlug } from "@/config/countries";
import { formatMoney } from "@/lib/money";
import { paystackEnabled } from "@/lib/payments";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = {
  title: "Start your order",
  description: "Guided registration order with a live total and saved steps.",
  robots: { index: false, follow: false },
};

const REQUIRED_DOCUMENTS: Record<string, string[]> = {
  "business-name": [
    "Identification for each owner",
    "Proof of business address",
    "Passport photograph where required",
  ],
  "limited-company": [
    "Identification for each director and shareholder",
    "Proof of address for each person",
    "Signature specimen",
    "Memorandum and articles accepted",
  ],
  ngo: [
    "Identification for each trustee",
    "Constitution, signed",
    "Newspaper publication details",
  ],
  "private-limited-company": [
    "Identification for each director",
    "Proof of UK registered office",
    "Share structure details",
  ],
  "delaware-llc": [
    "Identification for each member",
    "Principal address",
    "Registered agent acceptance",
  ],
  "wyoming-llc": [
    "Identification for each member",
    "Principal address",
    "Registered agent acceptance",
  ],
};

export default async function StartOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string; service: string }>;
  searchParams: Promise<{ step?: string; error?: string; package?: string }>;
}) {
  const [{ country, service }, query] = await Promise.all([params, searchParams]);
  if (!isCountrySlug(country)) notFound();

  const catalog = await getCatalog();
  const entry = catalog.services.find(
    (item) => item.country === country && item.slug === service,
  );
  if (!entry) notFound();

  const draft = await resolveDraft(country, entry);
  const step = clampStep(Number(query.step ?? draft.step));
  const totals = priceSelection(entry, draft.packageTier, entry.addOns.map((a) => a.slug).filter((slug) => draft.addOns.includes(slug)));
  const basePath = `/start/${country}/${entry.slug}`;
  const contact = contactFrom(catalog.settings);
  const selectedPackage = entry.packages.find((pack) => pack.tier === draft.packageTier);
  const selectedAddOns = entry.addOns.filter((addOn) => draft.addOns.includes(addOn.slug));
  const demo = isDemoMode();

  return (
    <div className="bg-ivory">
      <div className="wrap py-8 md:py-10">
        <Breadcrumbs
          items={[
            { href: "/services", label: "Services" },
            { href: `/services/${country}/${entry.slug}`, label: entry.name },
            { label: "Start order" },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Order in progress</p>
            <h1 className="display mt-2 text-[clamp(1.9rem,1.5rem+2vw,2.9rem)]">
              {entry.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="eyebrow">Total so far</p>
            <p className="mono text-[24px]" aria-live="polite">
              {formatMoney(totals.total, entry.currency)}
            </p>
            <p className="text-[11px] text-muted">Draft saved on this device</p>
          </div>
        </div>

        <div className="mt-6">
          <StepIndicator current={step} basePath={basePath} furthest={draft.step} />
        </div>

        {query.error ? (
          <p className="mt-5 rounded-[10px] bg-clay/10 px-3 py-2 text-[13px] text-clay">
            {query.error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {step === 1 ? (
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.02em]">Choose your package</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  The total updates as you choose. Government fees stay separate and at cost.
                </p>
                <div className="mt-5">
                  <PackagePicker
                    draftId={draft.id}
                    packages={entry.packages.map((pack) => ({
                      tier: pack.tier,
                      name: pack.name,
                      badge: pack.badge,
                      price: pack.price,
                      features: pack.features,
                    }))}
                    addOns={entry.addOns.map((addOn) => ({
                      slug: addOn.slug,
                      name: addOn.name,
                      price: addOn.price,
                      billing: addOn.billing,
                      description: addOn.description,
                    }))}
                    initialTier={draft.packageTier}
                    initialAddOns={draft.addOns}
                    currency={entry.currency}
                    governmentFee={entry.governmentFee}
                    governmentFeeWaived={entry.governmentFeeWaived}
                    governmentFeeFrom={entry.governmentFeeFrom}
                    governmentFeeLabel={entry.governmentFeeLabel}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <form action={saveBusinessStep}>
                <input type="hidden" name="draftId" value={draft.id} />
                <h2 className="font-display text-[24px] tracking-[-0.02em]">
                  Business details
                </h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  Exactly as they should appear on the registry record.
                </p>

                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="label" htmlFor="contactEmail">
                      Email for order updates
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      className="field"
                      defaultValue={draft.contactEmail}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <fieldset className="card p-4 md:p-5">
                    <legend className="px-1 eyebrow">Proposed names, in order</legend>
                    <div className="mt-2 grid gap-3">
                      {[0, 1, 2].map((index) => (
                        <div key={index}>
                          <label className="label" htmlFor={`name${index + 1}`}>
                            Name {index + 1}
                            {index === 0 ? " (first choice)" : ""}
                          </label>
                          <input
                            id={`name${index + 1}`}
                            name={`name${index + 1}`}
                            className="field"
                            defaultValue={draft.business.proposedNames[index] ?? ""}
                            required={index === 0}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11.5px] text-muted">
                      We file the first name that clears the registry search.
                    </p>
                  </fieldset>

                  <div>
                    <label className="label" htmlFor="activity">
                      {entry.activityLabel}
                    </label>
                    <input
                      id="activity"
                      name="activity"
                      className="field"
                      defaultValue={draft.business.activity}
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="address">
                      Registered address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      className="field min-h-24"
                      defaultValue={draft.business.address}
                      required
                    />
                    {entry.shareCapital ? (
                      <p className="mt-1 text-[11.5px] text-muted">
                        You can add a registered office later if you chose Premium.
                      </p>
                    ) : null}
                  </div>

                  {entry.shareCapital ? (
                    <div>
                      <label className="label" htmlFor="shareCapital">
                        Share capital
                      </label>
                      <input
                        id="shareCapital"
                        name="shareCapital"
                        inputMode="numeric"
                        className="field mono"
                        defaultValue={draft.business.shareCapital}
                        placeholder="1000000"
                      />
                      <p className="mt-1 text-[11.5px] text-muted">
                        Amount in {entry.currency === "NGN" ? "naira" : entry.currency === "GBP" ? "pounds" : "dollars"}. The government fee can change with share capital.
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary">
                    Continue to people
                  </button>
                  <Link href={`${basePath}?step=1`} className="text-[13px] text-ink/60 hover:text-ink">
                    Back to package
                  </Link>
                </div>
              </form>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.02em]">People</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  Directors, shareholders, members or trustees. Ownership must total 100
                  percent.
                </p>
                <div className="mt-5">
                  <PeopleEditor
                    draftId={draft.id}
                    initialPeople={draft.people}
                    entityLabel={entry.entityLabel}
                  />
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.02em]">Documents</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  Private storage only. Nothing is public.
                </p>
                <div className="mt-5">
                  <DocumentsStep
                    draftId={draft.id}
                    serviceName={entry.name}
                    required={REQUIRED_DOCUMENTS[entry.slug] ?? ["Identification for each person"]}
                    existing={draft.documents}
                    demo={demo || !hasSupabaseConfig()}
                  />
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.02em]">Review</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  Check everything before payment. You can go back to any step.
                </p>

                <div className="mt-5 space-y-3">
                  <section className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Package</p>
                      <Link href={`${basePath}?step=1`} className="text-[12px] text-forest hover:underline">
                        Edit
                      </Link>
                    </div>
                    <p className="mt-2 text-[14px]">
                      {selectedPackage?.name ?? "Package"}
                      {selectedAddOns.length > 0
                        ? `, plus ${selectedAddOns.map((addOn) => addOn.name).join(", ")}`
                        : ""}
                    </p>
                  </section>

                  <section className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Business</p>
                      <Link href={`${basePath}?step=2`} className="text-[12px] text-forest hover:underline">
                        Edit
                      </Link>
                    </div>
                    <dl className="mt-3 space-y-1.5 text-[13px]">
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">Names:</dt>
                        <dd>{draft.business.proposedNames.join(" / ") || "Not added"}</dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">{entry.activityLabel}:</dt>
                        <dd>{draft.business.activity || "Not added"}</dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">Address:</dt>
                        <dd>{draft.business.address || "Not added"}</dd>
                      </div>
                      {entry.shareCapital && draft.business.shareCapital ? (
                        <div className="flex flex-wrap gap-x-2">
                          <dt className="text-muted">Share capital:</dt>
                          <dd className="mono">{draft.business.shareCapital}</dd>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">Updates:</dt>
                        <dd>{draft.contactEmail || "Not added"}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">People</p>
                      <Link href={`${basePath}?step=3`} className="text-[12px] text-forest hover:underline">
                        Edit
                      </Link>
                    </div>
                    {draft.people.length === 0 ? (
                      <p className="mt-2 text-[13px] text-clay">No people added yet.</p>
                    ) : (
                      <ul className="mt-3 divide-y divide-line">
                        {draft.people.map((person) => (
                          <li key={person.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                            <span>
                              {person.name}{" "}
                              <span className="text-muted">({person.role})</span>
                            </span>
                            <span className="mono text-[12px]">{person.ownership}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Documents</p>
                      <Link href={`${basePath}?step=4`} className="text-[12px] text-forest hover:underline">
                        Edit
                      </Link>
                    </div>
                    <p className="mt-2 text-[13px] text-ink/70">
                      {draft.documents.length > 0
                        ? `${draft.documents.length} file(s) uploaded.`
                        : demo
                          ? "Documents are disabled in this preview. Add them from the dashboard after payment."
                          : "No files uploaded yet. You can add them from the dashboard."}
                    </p>
                  </section>
                </div>

                <form action={saveReviewStep} className="mt-6">
                  <input type="hidden" name="draftId" value={draft.id} />
                  <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/80">
                    <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 flex-none accent-forest" />
                    <span>
                      I confirm the information is accurate and I agree to the{" "}
                      <Link href="/terms" className="link-quiet">
                        terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="link-quiet">
                        privacy policy
                      </Link>
                      . I understand that government fees are set by the registry and shown
                      separately.
                    </span>
                  </label>
                  <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto">
                    Continue to payment
                  </button>
                </form>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.02em]">Payment</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  {demo
                    ? "This preview runs with demo data. A test payment creates the order and charges nothing."
                    : "Pay securely. Your order begins as soon as payment is confirmed."}
                </p>

                <div className="card mt-5 p-5 md:p-6">
                  <dl className="space-y-2 text-[13.5px]">
                    <div className="flex justify-between">
                      <dt className="text-ink/70">{selectedPackage?.name ?? "Package"}</dt>
                      <dd className="mono">{formatMoney(totals.packagePrice, entry.currency)}</dd>
                    </div>
                    {totals.addOnsTotal > 0 ? (
                      <div className="flex justify-between">
                        <dt className="text-ink/70">Add-ons</dt>
                        <dd className="mono">{formatMoney(totals.addOnsTotal, entry.currency)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <dt className="text-ink/70">{entry.governmentFeeLabel}</dt>
                      <dd className="mono">
                        {entry.governmentFeeWaived
                          ? "Waived"
                          : formatMoney(totals.governmentFee, entry.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3 text-[16px]">
                      <dt className="font-medium">Total</dt>
                      <dd className="mono text-[20px]">{formatMoney(totals.total, entry.currency)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{priceNote}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {!paystackEnabled() || entry.currency !== "NGN" ? (
                    <form action={payWithTestGateway}>
                      <input type="hidden" name="draftId" value={draft.id} />
                      <button type="submit" className="btn btn-primary w-full">
                        Test payment, no live gateway keys
                      </button>
                      <p className="mt-2 text-[11.5px] text-muted">
                        Clearly labelled test payment. No money moves. The order is created so
                        you can see the dashboard.
                      </p>
                    </form>
                  ) : (
                    <form action={payWithPaystack}>
                      <input type="hidden" name="draftId" value={draft.id} />
                      <button type="submit" className="btn btn-primary w-full">
                        Pay {formatMoney(totals.total, entry.currency)} with Paystack
                      </button>
                    </form>
                  )}

                  <div className="flex items-center gap-2 text-[11.5px] text-muted">
                    <Lock /> Card details are handled by the payment provider. We never see them.
                  </div>
                </div>

                <Link href={`${basePath}?step=5`} className="mt-5 inline-block text-[13px] text-ink/60 hover:text-ink">
                  Back to review
                </Link>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="card p-5 lg:sticky lg:top-28">
              <p className="eyebrow">Order summary</p>
              <p className="mt-2 font-display text-[19px] tracking-[-0.02em]">{entry.name}</p>
              <p className="text-[12px] text-muted">{entry.processing}</p>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[12.5px]">
                <div className="flex justify-between">
                  <dt className="text-ink/70">Package</dt>
                  <dd>{selectedPackage?.name ?? "Not chosen"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/70">Government fee</dt>
                  <dd className="mono">
                    {entry.governmentFeeWaived
                      ? "Waived"
                      : formatMoney(totals.governmentFee, entry.currency)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-[14px]">
                  <dt className="font-medium">Total</dt>
                  <dd className="mono">{formatMoney(totals.total, entry.currency)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Draft saved automatically. Close this page and come back on the same device to
                continue.
              </p>
              <a
                href={contact.whatsappHref}
                className="mt-4 inline-block text-[12.5px] font-medium text-forest hover:underline"
              >
                Need help? Message the team
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
