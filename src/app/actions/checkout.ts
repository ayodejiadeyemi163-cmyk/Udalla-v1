"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCatalog } from "@/lib/catalog";
import { priceSelection } from "@/lib/checkout";
import { loadDraftForVisitor } from "@/lib/draft";
import { siteUrl } from "@/lib/env";
import { sendEmail } from "@/lib/mail";
import { initialisePaystack, paystackEnabled } from "@/lib/payments";
import { recordAudit } from "@/lib/audit";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { referenceNumber } from "@/lib/store/demo";
import type { Draft, Order } from "@/lib/store/types";
import {
  businessDetailsSchema,
  fieldErrors,
  peopleSchema,
} from "@/lib/validation";

async function context(draftId: string) {
  const draft = await loadDraftForVisitor(draftId);
  if (!draft) redirect("/services");
  const catalog = await getCatalog();
  const service = catalog.services.find(
    (entry) => entry.slug === draft.service && entry.country === draft.country,
  );
  if (!service) redirect("/services");
  return { draft, service, store: getStore() };
}

function stepUrl(draft: Draft, step: number, message?: string): string {
  const base = `/start/${draft.country}/${draft.service}?step=${step}`;
  return message ? `${base}&error=${encodeURIComponent(message)}` : base;
}

export async function savePackageStep(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, store } = await context(draftId);
  const tier = String(formData.get("packageTier") ?? "");
  const addOns = formData.getAll("addOns").map(String);

  if (!["starter", "standard", "premium"].includes(tier)) {
    redirect(stepUrl(draft, 1, "Choose a package to continue."));
  }

  await store.saveDraft({
    ...draft,
    packageTier: tier as Draft["packageTier"],
    addOns,
    step: Math.max(draft.step, 2),
    updatedAt: new Date().toISOString(),
  });

  redirect(stepUrl(draft, 2));
}

export async function saveBusinessStep(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, service, store } = await context(draftId);

  const emailResult = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter an email address for order updates.")
    .safeParse(formData.get("contactEmail"));

  if (!emailResult.success) {
    redirect(
      stepUrl(draft, 2, emailResult.error.issues[0]?.message ?? "Enter a valid email."),
    );
  }

  const parsed = businessDetailsSchema.safeParse({
    name1: formData.get("name1"),
    name2: formData.get("name2"),
    name3: formData.get("name3"),
    activity: formData.get("activity"),
    address: formData.get("address"),
    shareCapital: service.shareCapital ? formData.get("shareCapital") : "",
  });

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    const first = Object.values(errors)[0] ?? "Check the details and try again.";
    redirect(stepUrl(draft, 2, first));
  }

  const details = parsed.data;
  const proposedNames = [details.name1, details.name2, details.name3]
    .map((name) => name.trim())
    .filter(Boolean);

  await store.saveDraft({
    ...draft,
    contactEmail: emailResult.data,
    business: {
      proposedNames,
      activity: details.activity,
      address: details.address,
      shareCapital: details.shareCapital ?? "",
      entityKind: draft.business.entityKind || service.entityLabel,
    },
    step: Math.max(draft.step, 3),
    updatedAt: new Date().toISOString(),
  });

  redirect(stepUrl(draft, 3));
}

export async function savePeopleStep(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, store } = await context(draftId);

  let raw: unknown = [];
  try {
    raw = JSON.parse(String(formData.get("people") ?? "[]"));
  } catch {
    redirect(stepUrl(draft, 3, "The people list could not be read. Add each person again."));
  }

  const parsed = peopleSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    const first =
      Object.values(errors)[0] ?? "Add at least one person and check the ownership total.";
    redirect(stepUrl(draft, 3, first));
  }

  await store.saveDraft({
    ...draft,
    people: parsed.data.map((person) => ({
      ...person,
      id: person.id || crypto.randomUUID(),
    })),
    step: Math.max(draft.step, 4),
    updatedAt: new Date().toISOString(),
  });

  redirect(stepUrl(draft, 4));
}

export async function skipDocumentsStep(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, store } = await context(draftId);
  await store.saveDraft({
    ...draft,
    documentsSkipped: true,
    step: Math.max(draft.step, 5),
    updatedAt: new Date().toISOString(),
  });
  redirect(stepUrl(draft, 5));
}

export async function saveReviewStep(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, store } = await context(draftId);

  if (formData.get("consent") !== "on") {
    redirect(stepUrl(draft, 5, "Tick the consent box before continuing."));
  }

  await store.saveDraft({
    ...draft,
    consent: true,
    step: Math.max(draft.step, 6),
    updatedAt: new Date().toISOString(),
  });

  redirect(stepUrl(draft, 6));
}

async function buildOrder(draft: Draft, provider: Order["payment"]["provider"]): Promise<Order> {
  const catalog = await getCatalog();
  const service = catalog.services.find(
    (entry) => entry.slug === draft.service && entry.country === draft.country,
  );
  if (!service) throw new Error("Service not found.");

  const totals = priceSelection(service, draft.packageTier, draft.addOns);
  const now = new Date().toISOString();
  const user = await getSessionUser();
  const reference = referenceNumber();

  const order: Order = {
    id: crypto.randomUUID(),
    reference,
    userId: user?.id ?? draft.userId ?? null,
    guestEmail: draft.contactEmail,
    country: draft.country,
    service: draft.service,
    packageTier: draft.packageTier,
    addOns: draft.addOns,
    currency: service.currency,
    packagePrice: totals.packagePrice,
    addOnsTotal: totals.addOnsTotal,
    governmentFee: totals.governmentFee,
    total: totals.total,
    status: "received",
    timeline: [
      {
        status: "received",
        at: now,
        note:
          provider === "test"
            ? "Test payment accepted. No live gateway keys are configured."
            : "Order created. Awaiting payment confirmation.",
      },
    ],
    business: draft.business,
    people: draft.people,
    documents: [],
    consentAt: now,
    payment: {
      provider,
      reference,
      paidAt: provider === "test" ? now : "",
    },
    assignedLawyerId: null,
    createdAt: now,
    updatedAt: now,
  };

  return getStore().createOrder(order);
}

export async function payWithTestGateway(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft } = await context(draftId);

  if (!draft.consent) {
    redirect(stepUrl(draft, 5, "Confirm the consent step before paying."));
  }

  const order = await buildOrder(draft, "test");

  await recordAudit({
    actorId: draft.userId ?? draft.visitorId,
    action: "order.created",
    target: order.id,
    meta: { provider: "test", reference: order.reference },
  });

  await sendEmail({
    to: draft.contactEmail,
    subject: `Order ${order.reference} received`,
    template: "order-received",
    body: [
      `Your order ${order.reference} has been received.`,
      "",
      "Your filing is prepared and submitted by Udalla's filing team.",
      "Follow every stage in your dashboard.",
    ].join("\n"),
  });

  await sendEmail({
    to: process.env.CONTACT_EMAIL || "eoisama@gmail.com",
    subject: `New order ${order.reference}`,
    template: "ops-order",
    body: `${order.service} in ${order.country}, package ${order.packageTier}, total ${order.total} ${order.currency}.`,
  });

  revalidatePath("/dashboard");
  redirect(`/thank-you/${order.reference}`);
}

export async function payWithPaystack(formData: FormData): Promise<void> {
  const draftId = String(formData.get("draftId") ?? "");
  const { draft, service } = await context(draftId);

  if (!draft.consent) {
    redirect(stepUrl(draft, 5, "Confirm the consent step before paying."));
  }
  if (!paystackEnabled()) {
    redirect(stepUrl(draft, 6, "Paystack keys are not configured."));
  }
  if (service.currency !== "NGN") {
    redirect(stepUrl(draft, 6, "Paystack handles naira payments only."));
  }

  const order = await buildOrder(draft, "paystack");
  const init = await initialisePaystack({
    email: draft.contactEmail,
    amount: order.total,
    currency: service.currency,
    reference: order.reference,
    callbackUrl: `${siteUrl()}/thank-you/${order.reference}`,
  });

  if (!init.ok) {
    redirect(stepUrl(draft, 6, init.message));
  }

  await recordAudit({
    actorId: draft.userId ?? draft.visitorId,
    action: "payment.initialised",
    target: order.id,
    meta: { provider: "paystack", reference: order.reference },
  });

  redirect(init.redirectUrl);
}
