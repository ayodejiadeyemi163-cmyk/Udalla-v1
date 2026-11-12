import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { supabaseAuth } from "@/lib/supabase-auth";
import { getStore } from "@/lib/store";
import { safeNextPath } from "@/lib/security";

/**
 * Supabase OAuth and magic link callback. Exchanges the code, creates or
 * updates the profile, then issues the app session cookie.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=Missing%20code", url.origin));
  }

  const client = await supabaseAuth();
  if (!client) {
    return NextResponse.redirect(new URL("/login?error=Supabase%20is%20not%20configured", url.origin));
  }

  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/login?error=Link%20expired", url.origin));
  }

  const store = getStore();
  const existing = await store.getUserByEmail(data.user.email);
  const user =
    existing ??
    (await store.upsertUser({
      id: crypto.randomUUID(),
      email: data.user.email,
      name:
        (data.user.user_metadata?.full_name as string | undefined) ??
        data.user.email.split("@")[0] ??
        "Customer",
      role: "customer",
      createdAt: new Date().toISOString(),
    }));

  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL(next, url.origin));
}
