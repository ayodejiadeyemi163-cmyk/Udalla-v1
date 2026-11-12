"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin, requireLawyer } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { sendEmail } from "@/lib/mail";
import { runReminders } from "@/lib/reminders";
import { getStore } from "@/lib/store";
import { orderStatusLabel } from "@/lib/store/types";

const money = z.coerce.number().int().min(0).max(100_000_000);

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function refreshPricing(): void {
  revalidatePath("/");
  revalidatePath("/pricing");
  revalidatePath("/services");
  revalidatePath("/compliance");
  revalidatePath("/websites");
  revalidatePath("/admin/pricing");
}

export async function savePricing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const catalog = await getCatalog();
  const kind = text(formData, "kind");
  const settings = catalog.settings;
  const changeId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (kind === "package") {
    const serviceSlug = text(formData, "serviceSlug");
    const tier = text(formData, "tier");
    const price = money.safeParse(formData.get("price"));
    const service = catalog.services.find((entry) => entry.slug === serviceSlug);
    const pack = service?.packages.find((entry) => entry.tier === tier);
    if (!service || !pack || !price.success) {
      redirect("/admin/pricing?error=Package%20price%20is%20not%20valid");
    }
    if (price.data !== pack.price) {
      settings.packagePrices[`${serviceSlug}:${tier}`] = price.data;
      await store.addPriceChange({
        id: changeId,
        scope: "package",
        key: `${serviceSlug}:${tier}`,
        label: `${service.name} ${pack.name}`,
        previous: formatMoney(pack.price, service.currency),
        next: formatMoney(price.data, service.currency),
        changedBy: admin.email,
        at: now,
      });
    }
  } else if (kind === "government") {
    const serviceSlug = text(formData, "serviceSlug");
    const amount = money.safeParse(formData.get("amount"));
    const waived = formData.get("waived") === "on";
    const service = catalog.services.find((entry) => entry.slug === serviceSlug);
    if (!service || !amount.success) {
      redirect("/admin/pricing?error=Government%20fee%20is%20not%20valid");
    }
    settings.governmentFees[serviceSlug] = amount.data;
    settings.governmentFeeWaived = waived
      ? Array.from(new Set([...settings.governmentFeeWaived, serviceSlug]))
      : settings.governmentFeeWaived.filter((slug) => slug !== serviceSlug);
    if (amount.data !== service.governmentFee || waived !== service.governmentFeeWaived) {
      await store.addPriceChange({
        id: changeId,
        scope: "government",
        key: serviceSlug,
        label: `${service.name} government fee`,
        previous: `${formatMoney(service.governmentFee, service.currency)}${service.governmentFeeWaived ? " (waived)" : ""}`,
        next: `${formatMoney(amount.data, service.currency)}${waived ? " (waived)" : ""}`,
        changedBy: admin.email,
        at: now,
      });
    }
  } else if (kind === "compliance") {
    const slug = text(formData, "slug");
    const price = money.safeParse(formData.get("price"));
    const service = catalog.compliance.find((entry) => entry.slug === slug);
    if (!service || !price.success) {
      redirect("/admin/pricing?error=Compliance%20price%20is%20not%20valid");
    }
    settings.compliancePrices[slug] = price.data;
    await store.addPriceChange({
      id: changeId,
      scope: "compliance",
      key: slug,
      label: service.name,
      previous: service.price === null ? "Quote" : formatMoney(service.price, service.currency),
      next: formatMoney(price.data, service.currency),
      changedBy: admin.email,
      at: now,
    });
  } else if (kind === "website") {
    const slug = text(formData, "slug");
    const from = money.safeParse(formData.get("from"));
    const toRaw = text(formData, "to");
    const to = toRaw === "" ? null : money.safeParse(toRaw);
    const tier = catalog.websiteTiers.find((entry) => entry.slug === slug);
    if (!tier || !from.success || (to !== null && !to.success)) {
      redirect("/admin/pricing?error=Website%20range%20is%20not%20valid");
    }
    settings.websiteRanges[slug] = {
      from: from.data,
      to: to === null ? null : (to.data ?? null),
    };
    await store.addPriceChange({
      id: changeId,
      scope: "website",
      key: slug,
      label: tier.name,
      previous: `${formatMoney(tier.from, tier.currency)} to ${tier.to === null ? "quote" : formatMoney(tier.to, tier.currency)}`,
      next: `${formatMoney(from.data, tier.currency)} to ${to === null ? "quote" : formatMoney(to.data, tier.currency)}`,
      changedBy: admin.email,
      at: now,
    });
  } else {
    redirect("/admin/pricing?error=Unknown%20change");
  }

  await store.updateSettings(settings);
  await recordAudit({
    actorId: admin.id,
    action: "pricing.updated",
    target: kind,
    meta: { kind },
  });
  refreshPricing();
  redirect("/admin/pricing?saved=1");
}

export async function saveServiceCopy(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const settings = await store.getSettings();
  const slug = text(formData, "slug");
  const name = text(formData, "name");
  const shortDescription = text(formData, "shortDescription");
  if (!slug || !name) redirect("/admin/pricing?error=Service%20name%20is%20required");

  await store.updateSettings({
    ...settings,
    serviceCopy: {
      ...settings.serviceCopy,
      [slug]: { name, shortDescription },
    },
  });
  await recordAudit({ actorId: admin.id, action: "service.updated", target: slug });
  refreshPricing();
  redirect("/admin/pricing?saved=1");
}

export async function saveFaq(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const id = text(formData, "id") || crypto.randomUUID();
  const question = text(formData, "question");
  const answer = text(formData, "answer");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!question || !answer) redirect("/admin/content?error=Question%20and%20answer%20are%20required");

  await store.upsertFaq({ id, question, answer, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 });
  await recordAudit({ actorId: admin.id, action: "faq.saved", target: id });
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function deleteFaq(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  await getStore().deleteFaq(id);
  await recordAudit({ actorId: admin.id, action: "faq.deleted", target: id });
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function saveGuide(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const slug = text(formData, "slug");
  const existing = await store.getGuide(slug);
  if (!existing) redirect("/admin/content?error=Guide%20not%20found");

  const title = text(formData, "title") || existing.title;
  const excerpt = text(formData, "excerpt") || existing.excerpt;
  const bodyRaw = String(formData.get("body") ?? "");
  const body = bodyRaw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  await store.upsertGuide({
    ...existing,
    title,
    excerpt,
    body: body.length > 0 ? body : existing.body,
  });
  await recordAudit({ actorId: admin.id, action: "guide.saved", target: slug });
  revalidatePath("/guides");
  revalidatePath(`/guides/${slug}`);
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function saveLawyer(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const id = text(formData, "id") || crypto.randomUUID();
  const jurisdiction = text(formData, "jurisdiction") || "Nigeria";
  const displayName = text(formData, "displayName") || `Partner lawyer, ${jurisdiction}`;
  const practiceAreas = text(formData, "practiceAreas")
    .split(",")
    .map((area) => area.trim())
    .filter(Boolean);
  const years = Number(formData.get("years") ?? 0);
  const photoUrl = text(formData, "photoUrl");

  await store.upsertLawyer({
    id,
    displayName,
    jurisdiction,
    practiceAreas: practiceAreas.length > 0 ? practiceAreas : ["Corporate compliance"],
    years: Number.isFinite(years) ? years : 0,
    photoUrl,
    showName: formData.get("showName") === "on",
    showPhoto: formData.get("showPhoto") === "on" && photoUrl.length > 0,
    approved: formData.get("approved") === "on",
  });
  await recordAudit({ actorId: admin.id, action: "lawyer.saved", target: id });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/compliance");
  revalidatePath("/admin/lawyers");
  redirect("/admin/lawyers?saved=1");
}

export async function saveSettings(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const settings = await store.getSettings();
  const email = text(formData, "contactEmail");
  if (!email.includes("@")) redirect("/admin/settings?error=Contact%20email%20is%20not%20valid");

  await store.updateSettings({
    ...settings,
    contactEmail: email,
    contactPhone: text(formData, "contactPhone") || settings.contactPhone,
    whatsappNumber:
      text(formData, "whatsappNumber").replace(/[^0-9]/g, "") || settings.whatsappNumber,
    lawyerNote: text(formData, "lawyerNote") || settings.lawyerNote,
  });
  await recordAudit({ actorId: admin.id, action: "settings.updated", target: "site" });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const orderId = text(formData, "orderId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  const allowed = ["received", "in-review", "name-check", "filed", "awaiting-registry", "completed"];

  if (!orderId || !allowed.includes(status)) {
    redirect("/admin?error=Choose%20a%20valid%20status");
  }

  const order = await store.getOrder(orderId);
  if (!order) redirect("/admin?error=Order%20not%20found");

  const now = new Date().toISOString();
  await store.updateOrder(order.id, {
    status: status as typeof order.status,
    timeline: [
      ...order.timeline,
      { status: status as typeof order.status, at: now, note: note || undefined },
    ],
  });

  await recordAudit({
    actorId: admin.id,
    action: "order.status_changed",
    target: order.id,
    meta: { status },
  });

  const email = order.guestEmail;
  if (email) {
    await sendEmail({
      to: email,
      subject: `Order ${order.reference}: ${orderStatusLabel(status as typeof order.status)}`,
      template: "order-status",
      body: [
        `Your order ${order.reference} is now ${orderStatusLabel(status as typeof order.status)}.`,
        note ? `\nNote from the team: ${note}` : "",
        "",
        "Follow every stage in your dashboard.",
      ].join("\n"),
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/dashboard/orders/${order.id}`);
  redirect("/admin?saved=1");
}

export async function assignOrder(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const orderId = text(formData, "orderId");
  const lawyerId = text(formData, "lawyerId");
  const order = await store.getOrder(orderId);
  if (!order) redirect("/admin?error=Order%20not%20found");

  await store.updateOrder(order.id, { assignedLawyerId: lawyerId || null });
  await recordAudit({
    actorId: admin.id,
    action: "order.assigned",
    target: order.id,
    meta: { lawyerId: lawyerId || "none" },
  });
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function assignMatter(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const store = getStore();
  const matterId = text(formData, "matterId");
  const lawyerId = text(formData, "lawyerId");
  const matter = await store.getMatter(matterId);
  if (!matter) redirect("/admin/matters?error=Matter%20not%20found");

  await store.updateMatter(matter.id, { assignedLawyerId: lawyerId || null });
  await recordAudit({
    actorId: admin.id,
    action: "matter.assigned",
    target: matter.id,
    meta: { lawyerId: lawyerId || "none" },
  });
  revalidatePath("/admin/matters");
  redirect("/admin/matters?saved=1");
}

export async function updateMatterStatus(formData: FormData): Promise<void> {
  const lawyer = await requireLawyer();
  const store = getStore();
  const matterId = text(formData, "matterId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  const allowed = ["received", "assigned", "in-progress", "filed", "completed"];

  if (!allowed.includes(status)) {
    redirect("/lawyer?error=Choose%20a%20valid%20status");
  }

  const matter = await store.getMatter(matterId);
  if (!matter) redirect("/lawyer?error=Matter%20not%20found");
  if (lawyer.role !== "admin" && matter.assignedLawyerId !== lawyer.id) {
    redirect("/lawyer?error=This%20matter%20is%20not%20assigned%20to%20you");
  }

  await store.updateMatter(matter.id, {
    status: status as typeof matter.status,
    timeline: [
      ...matter.timeline,
      { status: status as typeof matter.status, at: new Date().toISOString(), note: note || undefined },
    ],
  });

  await recordAudit({
    actorId: lawyer.id,
    action: "matter.status_changed",
    target: matter.id,
    meta: { status },
  });

  revalidatePath("/lawyer");
  revalidatePath(`/dashboard/compliance/${matter.id}`);
  redirect(lawyer.role === "admin" ? "/admin/matters?saved=1" : "/lawyer?saved=1");
}

export async function sendDueReminders(): Promise<void> {
  const admin = await requireAdmin();
  const count = await runReminders();

  await recordAudit({
    actorId: admin.id,
    action: "reminders.sent",
    target: "cron",
    meta: { count: String(count) },
  });

  revalidatePath("/admin/outbox");
  redirect(`/admin/outbox?saved=${count}`);
}
