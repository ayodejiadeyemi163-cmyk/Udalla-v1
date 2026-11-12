import type { DocumentRecord, Matter, Order, Role, User } from "@/lib/store/types";

/**
 * Authorisation rules shared by pages, actions and API routes.
 * Customer A must never read customer B's documents, orders or matters.
 */

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function hasRole(user: User | null, role: Role): boolean {
  return user?.role === role;
}

export function canAccessOrder(user: User | null, order: Order | null): boolean {
  if (!user || !order) return false;
  if (user.role === "admin") return true;
  return order.userId === user.id;
}

export function canAccessDocument(
  user: User | null,
  document: DocumentRecord | null,
  order: Order | null,
): boolean {
  if (!user || !document) return false;
  if (user.role === "admin") return true;
  if (document.userId !== user.id) return false;
  if (!order) return false;
  return order.id === document.orderId && order.userId === user.id;
}

export function canAccessMatter(user: User | null, matter: Matter | null): boolean {
  if (!user || !matter) return false;
  if (user.role === "admin") return true;
  if (matter.userId === user.id) return true;
  return user.role === "lawyer" && matter.assignedLawyerId === user.id;
}

export function canAccessLawyerDesk(user: User | null): boolean {
  return user?.role === "lawyer" || user?.role === "admin";
}
