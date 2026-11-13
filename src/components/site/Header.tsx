"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavGroup } from "@/config/nav";
import { Chevron } from "@/components/ui/Marks";

interface HeaderProps {
  groups: NavGroup[];
  contact: {
    email: string;
    phone: string;
    phoneHref: string;
    whatsappHref: string;
    hours: string;
  };
  user: { name: string; role: "customer" | "lawyer" | "admin" } | null;
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="font-display text-[27px] leading-none tracking-[-0.045em] text-navy-950"
      aria-label="Udalla home"
    >
      Udalla
    </Link>
  );
}

export function Header({ groups, contact, user }: HeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dashboardHref =
    user?.role === "admin" ? "/admin" : user?.role === "lawyer" ? "/lawyer" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/80 bg-cream-100/95 backdrop-blur-sm">
      <div className="wrap flex h-[68px] items-center justify-between gap-4 md:h-[78px]">
        <div className="flex items-center gap-6">
          <Wordmark />
          <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:gap-0.5">
            {groups.map((group) => (
              <div key={group.label} className="group relative">
                <Link
                  href={group.main.href}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-medium text-navy-950/85 transition hover:bg-navy-950/5 hover:text-navy-950"
                >
                  {group.label}
                  <Chevron className="mt-0.5 text-slate-muted transition group-hover:rotate-180" />
                </Link>
                <div
                  className={`invisible absolute left-0 top-full z-50 translate-y-1 pt-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${
                    group.width === "wide" ? "w-[620px]" : "w-[340px]"
                  }`}
                >
                  <div className="card overflow-hidden p-2 shadow-lift">
                    <Link
                      href={group.main.href}
                      className="flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-navy-900 hover:bg-navy-900/5"
                    >
                      {group.main.label}
                      <span aria-hidden="true" className="text-navy-900/60">
                        &rarr;
                      </span>
                    </Link>
                    <div className="my-2 border-t border-cream-300" />
                    <ul
                      className={
                        group.width === "wide"
                          ? "grid grid-cols-2 gap-0.5"
                          : "flex flex-col gap-0.5"
                      }
                    >
                      {group.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            className="block rounded-[10px] px-3 py-2 text-[13.5px] leading-snug text-navy-950/80 hover:bg-cream-100 hover:text-navy-950"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden text-right xl:block">
            <a
              href={contact.phoneHref}
              className="mono block text-[12.5px] leading-tight text-navy-950"
            >
              {contact.phone}
            </a>
            <a
              href={contact.whatsappHref}
              className="block text-[11.5px] text-slate-muted hover:text-navy-900"
            >
              WhatsApp, {contact.hours.replace("We reply within ", "").toLowerCase()}
            </a>
          </div>
          <Link
            href={user ? dashboardHref : "/login"}
            className="hidden text-[14px] font-medium text-navy-950/80 hover:text-navy-950 sm:block"
          >
            {user ? "Dashboard" : "Log in"}
          </Link>
          <Link href="/services" className="btn btn-primary hidden h-11 px-5 text-[14px] sm:inline-flex">
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-950/15 lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cream-100 lg:hidden">
          <div className="wrap flex h-[68px] items-center justify-between">
            <Wordmark onClick={() => setOpen(false)} />
            <div className="flex items-center gap-2">
              <Link href="/services" className="btn btn-primary h-10 px-4 text-[13px]" onClick={() => setOpen(false)}>
                Get started
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-950/15"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <nav aria-label="Mobile" className="wrap pb-24 pt-4">
            {groups.map((group) => (
              <div key={group.label} className="border-b border-dashed border-cream-300 py-6">
                <p className="eyebrow mb-3">{group.label}</p>
                <Link
                  href={group.main.href}
                  onClick={() => setOpen(false)}
                  className="font-display block py-1.5 text-[22px] tracking-[-0.02em]"
                >
                  {group.main.label}
                </Link>
                <ul className="mt-2">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-2 text-[16px] text-navy-950/75"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col gap-3 py-8">
              <Link
                href={user ? dashboardHref : "/login"}
                onClick={() => setOpen(false)}
                className="btn btn-outline w-full"
              >
                {user ? "Go to dashboard" : "Log in"}
              </Link>
              <a href={`mailto:${contact.email}`} className="text-[14px] text-navy-950/75">
                {contact.email}
              </a>
              <a href={contact.phoneHref} className="mono text-[14px] text-navy-950/75">
                {contact.phone}
              </a>
              <p className="text-[13px] text-slate-muted">{contact.hours}</p>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
