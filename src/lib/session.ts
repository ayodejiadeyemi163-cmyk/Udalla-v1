import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionSecret } from "@/lib/env";
import { getStore } from "@/lib/store";
import type { User } from "@/lib/store/types";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  VISITOR_COOKIE,
  signSession,
  verifySession,
} from "./session-token";

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token, sessionSecret());
  if (!payload) return null;
  return getStore().getUser(payload.userId);
}

export async function setSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  const token = await signSession(
    { userId, expiresAt: Date.now() + SESSION_TTL_MS },
    sessionSecret(),
  );
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getVisitorId(): Promise<string> {
  const jar = await cookies();
  return jar.get(VISITOR_COOKIE)?.value ?? "";
}

export async function requireUser(nextPath = "/dashboard"): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
