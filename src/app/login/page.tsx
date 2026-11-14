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
  description: "Sign in to your Udalla dashboard.",
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
    <section className="bg-cream-50">
      <div className="wrap grid min-h-[78vh] gap-0 py-10 md:py-16 lg:grid-cols-12">
        <div className="relative hidden overflow-hidden rounded-l-[18px] bg-navy-900 p-10 text-cream-100 lg:col-span-5 lg:block">
          <div className="grid-hairlines absolute inset-0 opacity-10" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-between">
            <Link href="/" className="font-display text-[28px] tracking-[-0.045em]">
              {brand.name}
            </Link>
            <div>
              <p className="eyebrow text-cream-100/60">Your dashboard</p>
              <p className="mt-4 font-display text-[clamp(2rem,1.6rem+1.4vw,2.8rem)] leading-[1.02] tracking-[-0.03em]">
                Filings, deadlines and documents.
              </p>
              <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-cream-100/65">
                {brand.filingNote}
              </p>
            </div>
            <p className="mono text-[11px] uppercase tracking-[0.14em] text-cream-100/45">
              {brand.legalName}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-cream-300 bg-cream-100 p-6 md:p-10 lg:col-span-7 lg:rounded-l-none">
          <p className="eyebrow">Log in</p>
          <h1 className="display mt-3 text-[clamp(2rem,1.6rem+1.6vw,3rem)]">
            Log in
          </h1>

          {params.error ? (
            <p className="mt-5 rounded-[10px] bg-danger-100 px-3 py-2 text-[12.5px] text-danger-600">
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
          </form>
          <MagicLinkForm disabled={!hasSupabaseConfig()} />

          {isDemoMode() ? (
            <div className="mt-8 border-t border-cream-300 pt-6">
              <div className="mt-4 grid gap-2">
                {demoAccounts.map((account) => (
                  <form key={account.role} action={signInDemo}>
                    <input type="hidden" name="role" value={account.role} />
                    <input type="hidden" name="next" value={next} />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-cream-300 bg-white/60 px-4 py-3 text-left transition hover:border-navy-900/50"
                    >
                      <span>
                        <span className="block text-[13.5px] font-medium">{account.label}</span>
                        <span className="mt-0.5 block text-[11.5px] text-slate-muted">
                          {account.detail}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-navy-900">
                        &rarr;
                      </span>
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ) : null}


        </div>
      </div>
    </section>
  );
}
