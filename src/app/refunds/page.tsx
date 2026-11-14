import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Refund policy",
  description:
    "When Udalla refunds a service fee, when a government fee cannot be refunded, and how to ask.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/refunds" } : undefined,
};

export default function RefundsPage() {
  return <LegalPage doc={legalDocs.refunds!} />;
}
