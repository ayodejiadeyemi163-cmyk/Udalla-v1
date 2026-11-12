import "server-only";

import { getStore } from "@/lib/store";

/**
 * Email delivery. In demo mode every message is written to the outbox table
 * shown in the admin panel. With RESEND_API_KEY set, the same message is also
 * sent through Resend.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string;
  template: string;
}

export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const store = getStore();
  await store.logEmail({
    id: crypto.randomUUID(),
    to: email.to,
    subject: email.subject,
    body: email.body,
    template: email.template,
    at: new Date().toISOString(),
  });

  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "notifications@udalla.org",
        to: [email.to],
        subject: email.subject,
        text: email.body,
      }),
    });
    if (!response.ok) {
      console.error("Email delivery failed with status", response.status);
    }
  } catch (error) {
    console.error("Email delivery error", error instanceof Error ? error.message : "unknown");
  }
}

export function orderStatusEmail(input: {
  reference: string;
  status: string;
  service: string;
}): OutgoingEmail["body"] {
  return [
    `Your order ${input.reference} for ${input.service} is now: ${input.status}.`,
    "",
    "Follow every stage in your dashboard.",
    "",
    "Your filing is prepared and submitted by Udalla's filing team.",
  ].join("\n");
}
