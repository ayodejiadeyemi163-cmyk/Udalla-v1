import type { Metadata } from "next";
import { requireLawyer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lawyer desk",
  robots: { index: false, follow: false },
};

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lawyer = await requireLawyer();

  return (
    <div className="bg-cream-50">
      <div className="wrap py-8 md:py-10">
        <p className="eyebrow">Lawyer desk</p>
        <h1 className="display mt-2 text-[clamp(1.8rem,1.4rem+1.8vw,2.6rem)]">
          Assigned matters
        </h1>
        <p className="mt-1 text-[12.5px] text-slate-muted">
          {lawyer.name} · matters assigned to you only
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
