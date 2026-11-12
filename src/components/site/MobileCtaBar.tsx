import Link from "next/link";

/** Sticky action bar for service and pricing pages on small screens. */
export function MobileCtaBar({ href, label }: { href: string; label: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-ivory/98 px-4 py-3 backdrop-blur md:hidden">
      <Link href={href} className="btn btn-primary w-full">
        {label}
      </Link>
    </div>
  );
}
