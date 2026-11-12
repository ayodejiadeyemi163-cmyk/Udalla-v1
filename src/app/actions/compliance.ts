"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { brand } from "@/config/brand";
import { getCatalog } from "@/lib/catalog";
import { sendEmail } from "@/lib/mail";
import { recordAudit } from "@/lib/audit";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { fieldErrors, complianceRequestSchema } from "@/lib/validation";

export async function requestCompliance(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/compliance/new");

  const parsed = complianceRequestSchema.safeParse({
    serviceSlug: formData.get("serviceSlug"),
    detail: formData.get("detail"),
    consent: formData.get("consent") === "on" ? true : undefined,
  });

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    const first = Object.values(errors)[0] ?? "Check the request and try again.";
    redirect(
      `/dashboard/compliance/new?service=${encodeURIComponent(String(formData.get("serviceSlug") ?? ""))}&error=${encodeURIComponent(first)}`,
    );
  }

  const catalog = await getCatalog();
  const service = catalog.compliance.find((entry) => entry.slug === parsed.data.serviceSlug);
  if (!service) {
    redirect("/dashboard/compliance/new?error=Choose%20a%20service");
  }

  const store = getStore();
  const lawyers = await store.listLawyers(true);
  const matching =
    lawyers.find((lawyer) =>
      lawyer.jurisdiction.toLowerCase().includes(
        service.country === "united-kingdom"
          ? "kingdom"
          : service.country === "united-states"
            ? "united states"
            : "nigeria",
      ),
    ) ?? lawyers[0];

  const now = new Date().toISOString();
  const reference = `UD-M-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  const matter = await store.createMatter({
    id: crypto.randomUUID(),
    reference,
    userId: user.id,
    serviceSlug: service.slug,
    serviceName: service.name,
    price: service.price,
    currency: service.currency,
    detail: parsed.data.detail,
    status: matching ? "assigned" : "received",
    assignedLawyerId: matching?.id ?? null,
    deadline: null,
    timeline: [
      { status: "received", at: now, note: "Request received" },
      ...(matching
        ? [
            {
              status: "assigned" as const,
              at: now,
              note: "Assigned to a partner lawyer",
            },
          ]
        : []),
    ],
    createdAt: now,
  });

  await recordAudit({
    actorId: user.id,
    action: "matter.created",
    target: matter.id,
    meta: { service: service.slug },
  });

  await sendEmail({
    to: brand.contactEmail,
    subject: `Compliance request ${reference}: ${service.name}`,
    template: "compliance-request",
    body: [
      `Request from ${user.name} (${user.email}).`,
      "",
      parsed.data.detail,
      "",
      `Assigned lawyer: ${matching?.displayName ?? "unassigned"}`,
    ].join("\n"),
  });

  await sendEmail({
    to: user.email,
    subject: `We have your compliance request ${reference}`,
    template: "compliance-receipt",
    body: [
      `Hello ${user.name},`,
      "",
      `Your request for ${service.name} is with the team.`,
      "A partner lawyer reviews it and replies in the dashboard.",
      "",
      brand.filingNote,
    ].join("\n"),
  });

  revalidatePath("/dashboard/compliance");
  revalidatePath("/dashboard");
  redirect(`/dashboard/compliance/${matter.id}?created=1`);
}
