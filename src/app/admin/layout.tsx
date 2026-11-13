import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/matters", label: "Matters" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/lawyers", label: "Lawyers" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/outbox", label: "Outbox" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="bg-cream-50">
      <div className="wrap py-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="display mt-2 text-[clamp(1.8rem,1.4rem+1.8vw,2.6rem)]">
              Operations panel
            </h1>
            <p className="mt-1 text-[12.5px] text-slate-muted">Signed in as {admin.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn btn-outline h-10 px-4 text-[12.5px]">
              Customer view
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="btn btn-outline h-10 px-4 text-[12.5px]">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin" className="mt-6 flex flex-wrap gap-1 border-y border-cream-300 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[13px] text-navy-950/70 hover:bg-cream-100 hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
