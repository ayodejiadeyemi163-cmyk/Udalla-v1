import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Udalla is not a law firm and does not provide legal advice. What that means for your order.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/disclaimer" } : undefined,
};

export default function DisclaimerPage() {
  return <LegalPage doc={legalDocs.disclaimer!} />;
}
