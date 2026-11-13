"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE = "udalla_consent";

function readConsent(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match?.[1] ?? null;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(value: "accepted" | "rejected") {
    const maxAge = 60 * 60 * 24 * 180;
    document.cookie = `${COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed bottom-4 left-4 right-4 z-40 md:left-6 md:right-auto md:max-w-md"
    >
      <div className="card p-5 shadow-lift">
        <p className="text-[14px] leading-relaxed text-navy-950/85">
          We use essential cookies to keep your session and your order drafts. Nothing else
          loads until you allow it.{" "}
          <Link href="/cookies" className="link-quiet">
            Cookie policy
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => choose("accepted")} className="btn btn-navy h-10 px-4 text-[13px]">
            Accept all
          </button>
          <button type="button" onClick={() => choose("rejected")} className="btn btn-outline h-10 px-4 text-[13px]">
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
