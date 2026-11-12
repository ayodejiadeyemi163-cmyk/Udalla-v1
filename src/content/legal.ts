import { brand } from "@/config/brand";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

const updated = "12 November 2026";

export const legalDocs: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    intro:
      "How Udalla collects, uses and protects personal data when you use this site, place an order or ask a compliance question.",
    updated,
    sections: [
      {
        heading: "Who is responsible for your data",
        paragraphs: [
          `${brand.legalName} is the controller of the personal data described here. The data contact for privacy questions is ${brand.dataContact}. Write to that address for access, correction or deletion requests.`,
        ],
      },
      {
        heading: "What we collect",
        bullets: [
          "Account details: name, email address and sign in method.",
          "Order details: proposed company names, business activity, registered address, share capital and the people named as directors, shareholders, members or trustees.",
          "Documents you upload, such as identification and proof of address.",
          "Payment records: the gateway reference, amount, currency and status. We never store full card numbers.",
          "Messages you send through the dashboard, the contact form or WhatsApp.",
          "Technical data needed to run the site, such as session cookies and rate limit counters.",
        ],
      },
      {
        heading: "Why we use it",
        bullets: [
          "To prepare and submit the filing you ordered.",
          "To create your account, dashboard and order timeline.",
          "To take payment and issue receipts.",
          "To send compliance reminders for deadlines that apply to your entity.",
          "To answer enquiries and provide support.",
          "To meet record keeping and anti money laundering obligations that apply to registrations.",
        ],
      },
      {
        heading: "Lawful bases",
        paragraphs: [
          "Where UK GDPR applies, we rely on contract for order processing, legal obligation for registry and anti money laundering records, and legitimate interests for service messages and fraud prevention. Marketing messages need consent and can be withdrawn at any time.",
          "Where the Nigeria Data Protection Act applies, we process on the basis of your consent, the performance of a contract with you, and our legal obligations.",
        ],
      },
      {
        heading: "Documents and storage",
        paragraphs: [
          "Documents are stored in a private bucket. There are no public document URLs. Downloads are issued as signed links that expire after 60 seconds, and every access is written to an append only audit log with the user, the document and the time.",
          "Access is limited to the account that owns the order, the filing team working on it, and the partner lawyer assigned to a related compliance matter.",
        ],
      },
      {
        heading: "Who we share data with",
        bullets: [
          "The relevant registry, because a filing cannot be submitted without it.",
          "The payment provider, to process the payment you approved.",
          "Our hosting and database providers, which store the application and its data.",
          "Our email provider, to deliver transactional messages.",
          "An independent partner lawyer, only when a compliance matter requires a licensed opinion.",
        ],
        paragraphs: [
          "We do not sell personal data. We do not share it for advertising.",
        ],
      },
      {
        heading: "International transfers",
        paragraphs: [
          "Our infrastructure and service providers may process data outside your country. Where data leaves the UK or Nigeria, we rely on the provider's contractual safeguards and keep the transfer limited to what the service needs.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Order and filing records are kept for six years after the last filing, because registries and tax authorities can ask for them. Document access logs are kept for two years. Enquiry records are kept for 24 months. Account data is deleted within 30 days of a verified deletion request, except records we must keep by law.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "Essential cookies keep your session and your order draft working. Nothing else loads until you accept. See the cookie policy for the list.",
        ],
      },
      {
        heading: "Your rights",
        bullets: [
          "Ask for a copy of your data.",
          "Ask us to correct something that is wrong.",
          "Ask for deletion where we are not required to keep it.",
          "Object to processing based on legitimate interests.",
          "Withdraw consent for marketing at any time.",
          "Complain to your data protection authority.",
        ],
        paragraphs: [
          `Send any request to ${brand.dataContact}. We reply within 30 days.`,
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "Sessions are signed and stored in httpOnly cookies. Access to orders and documents is checked on the server for every request. Uploads are checked by file signature, limited to PDF, JPG, PNG and WEBP, and capped at 10 MB. Security headers are set on every response.",
          "No system is perfect. If you believe an account has been compromised, write to us immediately and we will lock it while we investigate.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "The service is for adults. We do not knowingly collect data from anyone under 18.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "If this policy changes in a way that affects your rights, we will tell account holders by email before the change takes effect.",
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of service",
    intro:
      "The agreement between you and Udalla when you use this site, place an order or request a compliance service.",
    updated,
    sections: [
      {
        heading: "Who you are contracting with",
        paragraphs: [
          `These terms are between you and ${brand.legalName}, trading as ${brand.name}. By placing an order you confirm that you are at least 18 and that you have authority to submit the information you provide.`,
        ],
      },
      {
        heading: "What we do",
        paragraphs: [
          brand.filingNote,
          "We prepare and submit filings based on the information and documents you give us. Registries decide whether to approve an application, and their timelines are outside our control.",
          "We are not a law firm. We do not provide legal advice, and nothing on this site is legal advice. Partner lawyers handle regulatory compliance matters only, and they are independent practitioners.",
        ],
      },
      {
        heading: "Your responsibilities",
        bullets: [
          "Give accurate, complete and current information.",
          "Upload documents that are valid and belong to the people named.",
          "Make sure ownership percentages total 100 percent where required.",
          "Tell us promptly if something changes after you submit.",
          "Use the dashboard and the email address on your account, and keep access secure.",
        ],
      },
      {
        heading: "Prices and government fees",
        paragraphs: [
          "Package prices are shown before checkout. Government fees are shown separately at cost and can change when a registry changes its schedule. Where a fee is described as from a figure, the exact amount is confirmed before submission and you can approve or cancel.",
          brand.priceNote,
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "Payments in naira are processed by Paystack. A test payment option appears when no live gateway keys are configured, and it is labelled clearly. Your order starts once payment is confirmed.",
        ],
      },
      {
        heading: "Changes and cancellations",
        paragraphs: [
          "You can change an order before the filing is submitted. After submission, changes depend on the registry and may need a new government fee. Refunds are described in the refund policy.",
        ],
      },
      {
        heading: "Compliance services",
        paragraphs: [
          "Compliance requests become matters with a timeline and messages. Yearly services are invoiced and reminded, never charged automatically. Partner lawyers may need additional information before they can act.",
        ],
      },
      {
        heading: "Availability",
        paragraphs: [
          "We aim to keep the site available, but we may suspend it for maintenance or a security issue. We are not responsible for a registry portal being unavailable.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "We are responsible for preparing and submitting your filing with reasonable care. We are not liable for a registry decision, for a delay caused by a registry, or for losses that were not reasonably foreseeable when you ordered. Nothing in these terms limits liability that cannot be limited by law.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be handled in the courts of Lagos State, unless a mandatory consumer law in your country gives you a different right.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Questions about these terms go to ${brand.contactEmail}.`,
        ],
      },
    ],
  },

  cookies: {
    slug: "cookies",
    title: "Cookie policy",
    intro:
      "The small number of cookies this site uses, what each one does, and how to reject the optional ones.",
    updated,
    sections: [
      {
        heading: "Essential cookies",
        bullets: [
          "udalla_session: keeps you signed in. Signed and httpOnly, expires after 30 days.",
          "udalla_visitor: keeps your order draft attached to this browser so a refresh does not lose your place. Expires after 30 days.",
          "udalla_consent: remembers your cookie choice. Expires after 180 days.",
        ],
        paragraphs: [
          "These cookies are needed for the site to work. They cannot be switched off through the banner.",
        ],
      },
      {
        heading: "Optional cookies",
        paragraphs: [
          "We do not load analytics or advertising cookies today. If that changes, the banner will ask first, and rejecting will keep them off.",
        ],
      },
      {
        heading: "How to reject",
        paragraphs: [
          "Choose Reject non-essential in the cookie banner. You can change your mind by clearing the udalla_consent cookie in your browser settings and choosing again.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "Payments are handled on the payment provider's own page, which sets its own cookies under its policy. We do not receive card details.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [`Write to ${brand.dataContact}.`],
      },
    ],
  },

  refunds: {
    slug: "refunds",
    title: "Refund policy",
    intro:
      "When a service fee is refundable, when a government fee is not, and how to ask.",
    updated,
    sections: [
      {
        heading: "Before the filing is submitted",
        paragraphs: [
          "If you cancel before we submit to the registry, we refund the package fee in full. The government fee has not been paid at that point, so nothing is deducted.",
        ],
      },
      {
        heading: "After the filing is submitted",
        paragraphs: [
          "Government fees are paid to the registry and cannot be recovered, so they are not refundable once submitted. The package fee is not refundable after submission because the work has been done.",
        ],
      },
      {
        heading: "If we made a mistake",
        paragraphs: [
          "If an error on our side causes a rejection, we refile at no extra service cost and cover any government fee that has to be paid again.",
        ],
      },
      {
        heading: "If the registry rejects the application",
        paragraphs: [
          "A rejection for a reason outside our control, such as a restricted name or a document the registry will not accept, is not a refund event. We explain the reason and the options, and you decide whether to continue.",
        ],
      },
      {
        heading: "Compliance and yearly services",
        paragraphs: [
          "Compliance services are refundable before work starts. Once a lawyer has begun the matter, the service fee is not refundable. Yearly services are never charged automatically, so there is nothing to cancel before an invoice is issued.",
        ],
      },
      {
        heading: "Duplicate or wrong payments",
        paragraphs: [
          "Tell us within 14 days with the payment reference. Verified duplicate payments are refunded in full to the original method.",
        ],
      },
      {
        heading: "How to ask",
        paragraphs: [
          `Email ${brand.contactEmail} from the address on the order, with the order reference. We reply within 24 hours, Monday to Saturday, and approved refunds are processed within 10 working days.`,
        ],
      },
    ],
  },

  disclaimer: {
    slug: "disclaimer",
    title: "Disclaimer",
    intro:
      "What Udalla does, what it does not do, and how to read the information on this site.",
    updated,
    sections: [
      {
        heading: "Not a law firm",
        paragraphs: [
          brand.notLawFirm,
          "Nothing on this site is legal, tax or accounting advice. Guides and FAQs are general information, written to explain a process, and they may not fit your circumstances.",
        ],
      },
      {
        heading: "Who prepares filings",
        paragraphs: [
          brand.filingNote,
        ],
      },
      {
        heading: "Registry outcomes",
        paragraphs: [
          "Registries approve or reject applications. We prepare and submit carefully, but we cannot guarantee an approval, a processing time or a particular outcome. Processing times shown are typical, not promised.",
        ],
      },
      {
        heading: "Prices and fees",
        paragraphs: [
          "Government fees are set by the registries and can change without notice. The figure shown on a page is current when the page is built, and the total in your order is the figure that applies.",
        ],
      },
      {
        heading: "Partner lawyers",
        paragraphs: [
          "Partner lawyers are independent, licensed practitioners engaged through Udalla. They are not employees, and their advice is their own professional advice under their own engagement terms.",
        ],
      },
      {
        heading: "External links",
        paragraphs: [
          "Links to registry websites and other resources are provided for convenience. We do not control those sites and are not responsible for their content.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [`Write to ${brand.contactEmail}.`],
      },
    ],
  },
};
