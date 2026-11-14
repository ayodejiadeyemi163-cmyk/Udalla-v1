import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Udalla collects, uses, stores and protects personal data, including documents, filings and account information.",
  alternates: process.env.NODE_ENV === "production" ? { canonical: "/privacy" } : undefined,
};

export default function PrivacyPage() {
  return <LegalPage doc={legalDocs.privacy!} />;
}
