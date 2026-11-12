import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply when you order a registration or compliance service from Udalla.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage doc={legalDocs.terms!} />;
}
