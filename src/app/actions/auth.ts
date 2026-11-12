"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { siteUrl } from "@/lib/env";
import { isDemoMode } from "@/lib/env";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { getStore } from "@/lib/store";
import { DEMO_IDS } from "@/lib/store/demo";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { safeNextPath } from "@/lib/security";
import { supabaseAuth } from "@/lib/supabase-auth";
import type { FormState } from "@/lib/form-state";

const DEMO_BY_ROLE = {
  customer: { id: DEMO_IDS.customer, email: "demo.customer@udalla.org" },
  lawyer: { id: DEMO_IDS.lawyer, email: "demo.lawyer@udalla.org" },
  admin: { id: DEMO_IDS.admin, email: "demo.admin@udalla.org" },
} as const;

export async function signInDemo(formData: FormData): Promise<void> {
  if (!isDemoMode()) {
    redirect("/login?error=" + encodeURIComponent("Demo sign in is disabled."));
  }

  const role = String(formData.get("role") ?? "customer");
  if (!(role in DEMO_BY_ROLE)) {
    redirect("/login?error=" + encodeURIComponent("Unknown account."));
  }

  const account = DEMO_BY_ROLE[role as keyof typeof DEMO_BY_ROLE];
  const store = getStore();
  const user = await store.getUserByEmail(account.email);
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Demo account is not available."));
  }

  await setSessionCookie(user.id);
  const next = safeNextPath(String(formData.get("next") ?? ""));
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}

export async function sendMagicLink(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const requestHeaders = await headers();
  const limit = checkRateLimit(clientKey(requestHeaders, "magic-link"), {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return { ok: false, errors: {}, message: "Too many attempts. Try again shortly." };
  }

  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .safeParse(formData.get("email"));

  if (!parsed.success) {
    return {
      ok: false,
      errors: { email: parsed.error.issues[0]?.message ?? "Enter a valid email." },
      message: "",
    };
  }

  const client = await supabaseAuth();
  if (!client) {
    return {
      ok: false,
      errors: {},
      message:
        "Email sign in needs Supabase keys. In this preview, use one of the demo accounts.",
    };
  }

  const { error } = await client.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });

  if (error) {
    return { ok: false, errors: {}, message: "The link could not be sent. Try again." };
  }

  return {
    ok: true,
    errors: {},
    message: "Check your inbox. The link signs you in and expires after one use.",
  };
}

export async function signInWithGoogle(): Promise<void> {
  const client = await supabaseAuth();
  if (!client) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "Google sign in needs Supabase keys. Use a demo account in this preview.",
        ),
    );
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=" + encodeURIComponent("Google sign in is unavailable."));
  }

  redirect(data.url);
}
