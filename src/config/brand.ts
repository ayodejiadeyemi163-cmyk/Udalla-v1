/**
 * Brand configuration. Every page, email and metadata reads from here.
 * Nothing in the app should type the brand name, legal name, domain or
 * contact details a second time.
 */

export const brand = {
  name: "Udalla",
  legalName: "Udalla Global Concepts",
  domain: "udalla.org",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://udalla.org",
  tagline: "Business registration and compliance, handled.",
  contactEmail: process.env.CONTACT_EMAIL || "eoisama@gmail.com",
  contactPhone: process.env.CONTACT_PHONE || "+1 (713) 887-5886",
  contactPhoneHref: "tel:+17138875886",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "17138875886",
  whatsappHref: `https://wa.me/${process.env.WHATSAPP_NUMBER || "17138875886"}`,
  hours: "We reply within 24 hours, Monday to Saturday.",
  filingNote:
    "Your filing is prepared and submitted by Udalla's filing team. Licensed partner lawyers handle regulatory compliance.",
  notLawFirm:
    "Udalla Global Concepts is not a law firm and does not provide legal advice.",
  lawyerNote:
    "Lawyers are independent, licensed practitioners engaged through Udalla.",
  priceNote:
    "Government fees are set by the registries and can change. Your total is shown before you pay.",
  lawyerSectionTitle: "Compliance, handled by lawyers",
  proofPoints: ["3 countries", "Prices shown up front", "We reply within 24 hours"],
  dataContact: "eoisama@gmail.com",
} as const;

export const socialImage = {
  alt: "Udalla, business registration and compliance",
} as const;
