import "server-only";

import { sendEmail } from "@/lib/mail";
import { getStore } from "@/lib/store";

/**
 * Sends the 30 day and 7 day reminders for every deadline in the window.
 * Each reminder is keyed by template and renewal id, so re-running is safe.
 */
export async function runReminders(): Promise<number> {
  const store = getStore();
  const renewals = await store.listRenewals(31);
  const sent = await store.listEmails();
  const existing = new Set(sent.map((email) => email.template));
  let count = 0;

  for (const renewal of renewals) {
    if (!renewal.email) continue;
    const days = Math.round((new Date(renewal.dueAt).getTime() - Date.now()) / 86_400_000);
    if (days !== 30 && days !== 7) continue;

    const template = `reminder:${renewal.id}:${days}`;
    if (existing.has(template)) continue;

    await sendEmail({
      to: renewal.email,
      subject: `Deadline in ${days} days: ${renewal.label}`,
      template,
      body: [
        `${renewal.label} is due on ${renewal.dueAt}, ${days} days from now.`,
        "",
        "Request the filing from your dashboard and we will confirm the government fee before anything is submitted.",
        "",
        "Yearly services are invoiced and reminded, never charged automatically.",
      ].join("\n"),
    });
    existing.add(template);
    count += 1;
  }

  return count;
}
