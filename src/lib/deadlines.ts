import { complianceServices } from "@/config/pricing";
import type { Matter, Order } from "@/lib/store/types";

export interface Deadline {
  id: string;
  label: string;
  date: string;
  href: string;
  reminders: string[];
  tone: "soon" | "later" | "past";
}

function addDays(value: string, days: number): string {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildDeadlines(orders: Order[], matters: Matter[]): Deadline[] {
  const today = new Date().toISOString().slice(0, 10);
  const items: Deadline[] = [];

  for (const matter of matters) {
    if (!matter.deadline) continue;
    items.push({
      id: `matter-${matter.id}`,
      label: `${matter.serviceName}, ${matter.reference}`,
      date: matter.deadline,
      href: `/dashboard/compliance/${matter.id}`,
      reminders: [addDays(matter.deadline, -30), addDays(matter.deadline, -7)],
      tone: matter.deadline < today ? "past" : "later",
    });
  }

  const yearly = new Set(
    complianceServices.filter((service) => service.billing === "yearly").map((entry) => entry.slug),
  );

  for (const order of orders) {
    if (order.status !== "completed") continue;
    if (!order.addOns.some((slug) => yearly.has(slug))) continue;
    const due = new Date(order.createdAt);
    due.setUTCFullYear(due.getUTCFullYear() + 1);
    const date = due.toISOString().slice(0, 10);
    items.push({
      id: `order-${order.id}`,
      label: `Renewal for ${order.reference}`,
      date,
      href: `/dashboard/orders/${order.id}`,
      reminders: [addDays(date, -30), addDays(date, -7)],
      tone: date < today ? "past" : "later",
    });
  }

  return items
    .map((item) => {
      const days = Math.round(
        (new Date(item.date).getTime() - new Date(today).getTime()) / 86_400_000,
      );
      return { ...item, tone: days < 0 ? ("past" as const) : days <= 45 ? ("soon" as const) : ("later" as const) };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function daysUntil(value: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return Math.round(
    (new Date(value).getTime() - new Date(today).getTime()) / 86_400_000,
  );
}
