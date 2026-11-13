import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/downloads", label: "Downloads" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "lawyer") redirect("/lawyer");

  const store = getStore();
  const orders = await store.listOrdersByUser(user.id);
  const open = orders.filter((order) => order.status !== "completed").length;

  return (
    <div className="bg-cream-100">
      <div className="wrap py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              {user.role === "admin" ? "Admin view of your own orders" : "Customer dashboard"}
            </p>
            <h1 className="display mt-2 text-[clamp(1.9rem,1.5rem+2vw,2.8rem)]">
              Hello, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-[13px] text-slate-muted">
              {open === 0 ? "No open orders right now." : `${open} open order${open === 1 ? "" : "s"}.`}
            </p>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-outline h-10 px-4 text-[13px]">
              Sign out
            </button>
          </form>
        </div>

        <nav aria-label="Dashboard" className="mt-7 flex flex-wrap gap-1.5 border-y border-cream-300 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] text-navy-950/70 hover:bg-cream-50 hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/services"
            className="ml-auto rounded-full px-4 py-2 text-[13px] font-medium text-navy-900 hover:underline"
          >
            Start a new order
          </Link>
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
