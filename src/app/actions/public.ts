"use server";

import { headers } from "next/headers";
import { brand } from "@/config/brand";
import { getStore } from "@/lib/store";
import { sendEmail } from "@/lib/mail";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import { fieldErrors, leadSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form-state";

export async function submitEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const requestHeaders = await headers();
  const limit = checkRateLimit(clientKey(requestHeaders, "enquiry"), {
    limit: 8,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      errors: {},
      message: "Too many enquiries from this connection. Try again in a minute.",
    };
  }

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    business: formData.get("business"),
    projectType: formData.get("projectType"),
    budget: formData.get("budget"),
    timeline: formData.get("timeline"),
    consent: formData.get("consent") === "on" ? true : undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Check the fields below." };
  }

  const store = getStore();
  const lead = await store.createLead({
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  });

  await recordAudit({
    actorId: "public",
    action: "lead.created",
    target: lead.id,
    meta: { projectType: lead.projectType },
  });

  await sendEmail({
    to: brand.contactEmail,
    subject: `New enquiry: ${lead.projectType} for ${lead.business}`,
    template: "enquiry",
    body: [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `WhatsApp: ${lead.whatsapp}`,
      `Business: ${lead.business}`,
      `Project: ${lead.projectType}`,
      `Budget: ${lead.budget}`,
      `Timeline: ${lead.timeline}`,
      `Consent: yes`,
    ].join("\n"),
  });

  await sendEmail({
    to: lead.email,
    subject: "We have your enquiry",
    template: "enquiry-receipt",
    body: [
      `Hello ${lead.name},`,
      "",
      "Your enquiry reached the Udalla team. We reply within 24 hours, Monday to Saturday.",
      "",
      "Udalla Global Concepts",
    ].join("\n"),
  });

  return { ok: true, errors: {}, message: "Enquiry received. We reply within 24 hours." };
}
