"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canAccessMatter, canAccessOrder } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

const bodySchema = z.string().trim().min(2, "Write a message first.").max(2000);

export async function addOrderMessage(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    redirect(`/dashboard/orders/${orderId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Write a message.")}`);
  }

  const store = getStore();
  const order = await store.getOrder(orderId);
  if (!canAccessOrder(user, order) || !order) redirect("/dashboard");

  const limit = checkRateLimit(`message:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) {
    redirect(`/dashboard/orders/${orderId}?error=${encodeURIComponent("Slow down for a moment.")}`);
  }

  await store.addMessage({
    id: crypto.randomUUID(),
    threadId: order.id,
    authorId: user.id,
    authorName: user.role === "admin" ? "Udalla filing team" : user.name,
    authorRole: user.role,
    body: parsed.data,
    at: new Date().toISOString(),
  });

  await recordAudit({
    actorId: user.id,
    action: "message.created",
    target: order.id,
    meta: { thread: "order" },
  });

  revalidatePath(`/dashboard/orders/${order.id}`);
  revalidatePath("/dashboard/messages");
}

export async function addMatterMessage(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const matterId = String(formData.get("matterId") ?? "");
  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    redirect(`/dashboard/compliance/${matterId}?error=Write%20a%20message`);
  }

  const store = getStore();
  const matter = await store.getMatter(matterId);
  if (!canAccessMatter(user, matter) || !matter) redirect("/dashboard");

  const limit = checkRateLimit(`message:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) redirect(`/dashboard/compliance/${matterId}`);

  await store.addMessage({
    id: crypto.randomUUID(),
    threadId: matter.id,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    body: parsed.data,
    at: new Date().toISOString(),
  });

  await recordAudit({
    actorId: user.id,
    action: "message.created",
    target: matter.id,
    meta: { thread: "matter" },
  });

  revalidatePath(`/dashboard/compliance/${matter.id}`);
  revalidatePath("/dashboard/messages");
}
