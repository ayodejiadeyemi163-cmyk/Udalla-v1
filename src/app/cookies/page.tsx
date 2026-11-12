import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "The cookies Udalla uses, what each one does, and how to reject the optional ones.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <LegalPage doc={legalDocs.cookies!} />;
}
