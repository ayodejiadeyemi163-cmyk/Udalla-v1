import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MagicLinkForm } from "@/components/forms/MagicLinkForm";
import { signInDemo, signInWithGoogle } from "@/app/actions/auth";
import { brand } from "@/config/brand";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { getSessionUser } from "@/lib/session";
import { safeNextPath } from "@/lib/security";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Udalla dashboard with Google or an email link.",
  robots: { index: false, follow: false },
};

const demoAccounts = [
  {
    role: "customer",
    label: "Demo customer",
    detail: "Two orders, one compliance matter and a calendar.",
  },
  {
    role: "lawyer",
    label: "Demo lawyer",
    detail: "Only the matters assigned to this lawyer.",
  },
  {
    role: "admin",
    label: "Demo admin",
    detail: "Every order, lead, price and setting.",
  },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const user = await getSessionUser();
  if (user) redirect(next);

  return (
    <section className="bg-paper">
      <div className="wrap grid min-h-[78vh] gap-0 py-10 md:py-16 lg:grid-cols-12">
        <div className="relative hidden overflow-hidden rounded-l-[18px] bg-forest p-10 text-ivory lg:col-span-5 lg:block">
          <div className="grid-hairlines absolute inset-0 opacity-10" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-between">
            <Link href="/" className="font-display text-[28px] tracking-[-0.045em]">
              {brand.name}
            </Link>
            <div>
              <p className="eyebrow text-ivory/60">Your dashboard</p>
              <p className="mt-4 font-display text-[clamp(2rem,1.6rem+1.4vw,2.8rem)] leading-[1.02] tracking-[-0.03em]">
                Every filing, deadline and document in one place.
              </p>
              <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-ivory/65">
                {brand.filingNote}
              </p>
            </div>
            <p className="mono text-[11px] uppercase tracking-[0.14em] text-ivory/45">
              {brand.legalName}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-ivory p-6 md:p-10 lg:col-span-7 lg:rounded-l-none">
          <p className="eyebrow">Log in</p>
          <h1 className="display mt-3 text-[clamp(2rem,1.6rem+1.6vw,3rem)]">
            Sign in, no password to remember.
          </h1>

          {params.error ? (
            <p className="mt-5 rounded-[10px] bg-clay/10 px-3 py-2 text-[12.5px] text-clay">
              {params.error}
            </p>
          ) : null}

          <form action={signInWithGoogle}>
            <button type="submit" className="btn btn-outline mt-7 w-full">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M17.6 9.2c0-.6-.05-1.2-.16-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
                  fill="#14483A"
                />
                <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.8H.8v2.3A9 9 0 0 0 9 18Z" fill="#14483A" opacity=".8" />
                <path d="M3.9 10.6a5.4 5.4 0 0 1 0-3.4V4.9H.8a9 9 0 0 0 0 8.2l3.1-2.5Z" fill="#C8553D" opacity=".8" />
                <path d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.5-2.5A9 9 0 0 0 .8 4.9l3.1 2.3C4.6 5.1 6.6 3.6 9 3.6Z" fill="#F2B01E" />
              </svg>
              Continue with Google
            </button>
            {!hasSupabaseConfig() ? (
              <p className="mt-2 text-[11.5px] text-muted">
                Google sign in needs Supabase keys. The demo accounts below work now.
              </p>
            ) : null}
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-muted">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <h2 className="text-[14px] font-medium">Email magic link</h2>
          <MagicLinkForm disabled={!hasSupabaseConfig()} />

          {isDemoMode() ? (
            <div className="mt-8 border-t border-line pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-medium">Demo accounts</h2>
                <span className="pill pill-marigold">Preview</span>
              </div>
              <p className="mt-1 text-[12px] text-muted">
                These sign in instantly and read the demo store. No real data is created.
              </p>
              <div className="mt-4 grid gap-2">
                {demoAccounts.map((account) => (
                  <form key={account.role} action={signInDemo}>
                    <input type="hidden" name="role" value={account.role} />
                    <input type="hidden" name="next" value={next} />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-line bg-white/60 px-4 py-3 text-left transition hover:border-forest/50"
                    >
                      <span>
                        <span className="block text-[13.5px] font-medium">{account.label}</span>
                        <span className="mt-0.5 block text-[11.5px] text-muted">
                          {account.detail}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-forest">
                        &rarr;
                      </span>
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-8 text-[11.5px] leading-relaxed text-muted">
            By signing in you agree to the{" "}
            <Link href="/terms" className="link-quiet">
              terms
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="link-quiet">
              privacy policy
            </Link>
            . No passwords are stored.
          </p>
        </div>
      </div>
    </section>
  );
}
