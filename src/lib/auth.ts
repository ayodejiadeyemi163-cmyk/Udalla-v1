import "server-only";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import type { User } from "@/lib/store/types";

export async function requireAdmin(nextPath = "/admin"): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function requireLawyer(nextPath = "/lawyer"): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "lawyer" && user.role !== "admin") redirect("/dashboard");
  return user;
}
