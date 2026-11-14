/**
 * Pricing source of truth.
 *
 * Every page, card, FAQ, guide, email and checkout reads prices from this file
 * (through src/lib/catalog.ts, which applies admin overrides and price history).
 * No price is typed twice anywhere else in the app.
 *
 * Amounts are stored in the smallest display unit (whole naira, pounds, dollars).
 */

import type { CountrySlug } from "@/config/countries";

export type CurrencyCode = "NGN" | "GBP" | "USD";
export type PackageTier = "starter" | "standard" | "premium";

export const packageOrder: PackageTier[] = ["starter", "standard", "premium"];

export interface PackageDefinition {
  tier: PackageTier;
  name: string;
  badge?: string;
  price: number;
  partnerCost: number;
  margin: number;
  features: string[];
}

export interface AddOn {
  slug: string;
  name: string;
  price: number;
  billing: "one-off" | "yearly";
  description: string;
}

export interface ServiceStep {
  title: string;
  body: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDefinition {
  slug: string;
  country: CountrySlug;
  name: string;
  navLabel: string;
  shortDescription: string;
  description: string;
  currency: CurrencyCode;
  governmentFee: number;
  governmentFeeFrom: boolean;
  governmentFeeWaived: boolean;
  governmentFeeLabel: string;
  processing: string;
  activityLabel: string;
  shareCapital: boolean;
  entityLabel: string;
  packages: PackageDefinition[];
  addOns: AddOn[];
  steps: ServiceStep[];
  includes: string[];
  faqs: ServiceFaq[];
}

const PACKAGE_NAMES: Record<PackageTier, string> = {
  starter: "Starter",
  standard: "Standard",
  premium: "Premium",
};

interface PackageCopyOptions {
  taxIdLabel: string;
  registeredAgentFirstYear: boolean;
}

function buildPackages(
  prices: [number, number, number],
  costs: [number, number, number],
  options: PackageCopyOptions,
): PackageDefinition[] {
  const starter = [
    "Filing prepared and submitted by the Udalla filing team",
    "Certificate and registration documents",
    "Dashboard tracking for every stage",
    "Compliance alerts before deadlines",
  ];

  const standard = [
    ...starter,
    `Tax ID help (${options.taxIdLabel})`,
    "Company documents pack",
    "Banking resolution",
    ...(options.registeredAgentFirstYear
      ? ["Registered agent for the first year"]
      : []),
  ];

  const premium = [
    ...standard,
    "Priority processing",
    "Registered office or agent for year one",
    "One 30 minute compliance consultation with a partner lawyer",
  ];

  const features: Record<PackageTier, string[]> = { starter, standard, premium };

  return packageOrder.map((tier, index) => ({
    tier,
    name: PACKAGE_NAMES[tier],
    ...(tier === "standard" ? { badge: "Recommended" } : {}),
    ...(tier === "premium" ? { badge: "Fastest filing" } : {}),
    price: prices[index] ?? 0,
    partnerCost: costs[index] ?? 0,
    margin: (prices[index] ?? 0) - (costs[index] ?? 0),
    features: features[tier],
  }));
}

export const services: ServiceDefinition[] = [
  {
    slug: "business-name",
    country: "nigeria",
    name: "Business Name Registration",
    navLabel: "Business name",
    shortDescription:
      "Register a business name with the Corporate Affairs Commission and trade under a name you own.",
    description:
      "Built for sole traders and partnerships. We run the name search, prepare the registration particulars and file with the CAC, then hand you the certificate and status report in your dashboard.",
    currency: "NGN",
    governmentFee: 10000,
    governmentFeeFrom: false,
    governmentFeeWaived: false,
    governmentFeeLabel: "CAC filing fee",
    processing: "Timing depends on the registry.",
    activityLabel: "Nature of business",
    shareCapital: false,
    entityLabel: "Business name",
    packages: buildPackages(
      [35000, 60000, 95000],
      [22000, 38000, 60000],
      { taxIdLabel: "TIN", registeredAgentFirstYear: false },
    ),
    addOns: [
      {
        slug: "ng-tin",
        name: "TIN registration",
        price: 15000,
        billing: "one-off",
        description: "Tax identification number filed alongside your registration.",
      },
    ],
    steps: [
      {
        title: "Name search",
        body: "We check your three proposed names against the CAC register and file the first one available.",
      },
      {
        title: "Preparation",
        body: "The filing team prepares your registration particulars from the details you submit.",
      },
      {
        title: "Filing",
        body: "We submit to the CAC and settle the government fee at cost.",
      },
      {
        title: "Certificate",
        body: "Your certificate and status report appear in your dashboard with downloads.",
      },
    ],
    includes: [
      "Name availability search",
      "Registration particulars prepared and filed",
      "Certificate and status report",
      "Compliance alerts for annual returns",
    ],
    faqs: [
      {
        question: "Can I register a business name as a single owner?",
        answer:
          "Yes. A business name can be owned by one person or by a partnership. You can add owners in the people step.",
      },
      {
        question: "What if all three proposed names are rejected?",
        answer:
          "We come back to you in the dashboard with the registry response and ask for new names. There is no extra service fee for a resubmission.",
      },
      {
        question: "Does a business name include a tax ID?",
        answer:
          "No. Add TIN registration as an add-on, or choose Standard or Premium, which include tax ID help.",
      },
    ],
  },
  {
    slug: "limited-company",
    country: "nigeria",
    name: "Limited Company Registration",
    navLabel: "Limited company",
    shortDescription:
      "Incorporate a private limited company with directors, shareholders and share capital recorded correctly.",
    description:
      "The full CAC incorporation: memorandum and articles, directors, shareholders, share capital and the first-year filings that keep the company in good standing.",
    currency: "NGN",
    governmentFee: 20000,
    governmentFeeFrom: true,
    governmentFeeWaived: false,
    governmentFeeLabel: "CAC fee and stamp duty",
    processing: "Timing depends on the registry.",
    activityLabel: "Principal business activity",
    shareCapital: true,
    entityLabel: "Limited company",
    packages: buildPackages(
      [60000, 90000, 130000],
      [40000, 60000, 90000],
      { taxIdLabel: "TIN", registeredAgentFirstYear: false },
    ),
    addOns: [
      {
        slug: "ng-tin",
        name: "TIN registration",
        price: 15000,
        billing: "one-off",
        description: "Tax identification number for the new company.",
      },
      {
        slug: "ng-psc",
        name: "Beneficial ownership (PSC) filing",
        price: 25000,
        billing: "one-off",
        description: "Persons with significant control register filed with the CAC.",
      },
      {
        slug: "ng-annual-returns-company",
        name: "First annual returns",
        price: 30000,
        billing: "yearly",
        description: "Annual returns prepared and filed for a limited company.",
      },
    ],
    steps: [
      {
        title: "Name search",
        body: "Three names are checked and the first available one is reserved with the CAC.",
      },
      {
        title: "Incorporation documents",
        body: "We prepare the memorandum and articles, share structure and director particulars.",
      },
      {
        title: "Filing and stamp duty",
        body: "The filing team submits to the CAC and pays the government fee, including stamp duty where it applies.",
      },
      {
        title: "Post incorporation",
        body: "Certificate, status report and company documents pack are issued to your dashboard.",
      },
    ],
    includes: [
      "Name search and reservation",
      "Memorandum and articles of association",
      "Director and shareholder filings",
      "Certificate, status report and documents pack",
    ],
    faqs: [
      {
        question: "How is the government fee calculated?",
        answer:
          "The CAC fee moves with share capital, and stamp duty depends on the share structure. Your exact fee is confirmed by the filing team before submission and shown in your order.",
      },
      {
        question: "What is the minimum number of directors?",
        answer:
          "A private limited company needs at least two directors and at least one shareholder. Ownership across shareholders must total 100 percent.",
      },
      {
        question: "Do I need a company address in Nigeria?",
        answer:
          "Yes. You need a registered address in Nigeria. Premium includes a registered office for year one.",
      },
    ],
  },
  {
    slug: "ngo",
    country: "nigeria",
    name: "NGO and Incorporated Trustees",
    navLabel: "NGO / trustees",
    shortDescription:
      "Register an incorporated trustees entity for a foundation, association, church or social enterprise.",
    description:
      "Incorporated trustees registration with the CAC, including the constitution, trustee particulars and the publication step that catches most first-time applicants.",
    currency: "NGN",
    governmentFee: 35000,
    governmentFeeFrom: false,
    governmentFeeWaived: false,
    governmentFeeLabel: "CAC filing fee",
    processing: "Timing depends on the registry.",
    activityLabel: "Purpose of the organisation",
    shareCapital: false,
    entityLabel: "Incorporated trustees",
    packages: buildPackages(
      [120000, 150000, 190000],
      [85000, 110000, 140000],
      { taxIdLabel: "TIN", registeredAgentFirstYear: false },
    ),
    addOns: [
      {
        slug: "ng-tin",
        name: "TIN registration",
        price: 15000,
        billing: "one-off",
        description: "Tax identification number for the organisation.",
      },
    ],
    steps: [
      {
        title: "Name and objects",
        body: "We check the proposed name and help you describe the objects in the form the CAC expects.",
      },
      {
        title: "Constitution",
        body: "Your constitution and trustee particulars are prepared for signature.",
      },
      {
        title: "Publication",
        body: "The required newspaper notice is arranged, then the application is filed.",
      },
      {
        title: "Certificate",
        body: "The certificate of incorporation and trustee register are added to your dashboard.",
      },
    ],
    includes: [
      "Name search",
      "Constitution preparation support",
      "Newspaper publication arranged",
      "Certificate and trustee register",
    ],
    faqs: [
      {
        question: "How many trustees do I need?",
        answer:
          "At least two trustees are required. You can add each trustee, their role and their address in the people step.",
      },
      {
        question: "Is a newspaper publication included?",
        answer:
          "Yes. The publication is arranged as part of the filing and is included in the government fee shown on this page.",
      },
      {
        question: "Can a company own an NGO?",
        answer:
          "Incorporated trustees are held by individuals, not companies. We ask for the trustees and their identification in the people step.",
      },
    ],
  },
  {
    slug: "private-limited-company",
    country: "united-kingdom",
    name: "UK Private Limited Company",
    navLabel: "Private limited company",
    shortDescription:
      "Incorporate with Companies House, with directors, shareholders and people with significant control filed.",
    description:
      "A complete Companies House incorporation. We prepare the IN01 particulars, file the share structure and deliver the certificate, articles and register entries.",
    currency: "GBP",
    governmentFee: 100,
    governmentFeeFrom: false,
    governmentFeeWaived: false,
    governmentFeeLabel: "Companies House fee",
    processing: "Timing depends on the registry.",
    activityLabel: "Nature of business (SIC code)",
    shareCapital: true,
    entityLabel: "Private limited company",
    packages: buildPackages([49, 99, 169], [20, 45, 80], {
      taxIdLabel: "UTR",
      registeredAgentFirstYear: false,
    }),
    addOns: [
      {
        slug: "uk-registered-office",
        name: "Registered office, year one",
        price: 59,
        billing: "yearly",
        description: "A registered office address for Companies House and HMRC mail.",
      },
    ],
    steps: [
      {
        title: "Company details",
        body: "We confirm the name, registered office, SIC code and share structure.",
      },
      {
        title: "Officers and PSC",
        body: "Director, shareholder and person with significant control details are prepared for filing.",
      },
      {
        title: "Companies House",
        body: "The filing team submits the incorporation and pays the government fee at cost.",
      },
      {
        title: "Incorporation",
        body: "Certificate of incorporation, articles and register entries are delivered to your dashboard.",
      },
    ],
    includes: [
      "Name and SIC code check",
      "IN01 incorporation filing",
      "Director, shareholder and PSC particulars",
      "Certificate and articles",
    ],
    faqs: [
      {
        question: "Do I need to live in the UK to incorporate?",
        answer:
          "No. You need a UK registered office address, which can be a service address. You do not need to be a UK resident.",
      },
      {
        question: "What is a person with significant control?",
        answer:
          "Anyone who owns more than 25 percent of shares or voting rights, or otherwise controls the company. We collect this in the people step.",
      },
      {
        question: "When is the confirmation statement due?",
        answer: "Timing depends on the registry.",
      },
    ],
  },
  {
    slug: "delaware-llc",
    country: "united-states",
    name: "Delaware LLC",
    navLabel: "Delaware LLC",
    shortDescription:
      "Form a Delaware limited liability company with a registered agent and a clean operating agreement.",
    description:
      "Delaware is the default for startups raising money. We prepare the certificate of formation, file it with the Division of Corporations and set up your registered agent.",
    currency: "USD",
    governmentFee: 110,
    governmentFeeFrom: false,
    governmentFeeWaived: false,
    governmentFeeLabel: "Delaware filing fee",
    processing: "Timing depends on the registry.",
    activityLabel: "Business activity",
    shareCapital: false,
    entityLabel: "LLC",
    packages: buildPackages([49, 179, 269], [0, 90, 150], {
      taxIdLabel: "EIN",
      registeredAgentFirstYear: true,
    }),
    addOns: [
      {
        slug: "us-registered-agent",
        name: "Registered agent, year one",
        price: 99,
        billing: "yearly",
        description: "A Delaware registered agent for service of process.",
      },
    ],
    steps: [
      {
        title: "Company details",
        body: "We confirm the company name, principal address and the member who will sign.",
      },
      {
        title: "Formation documents",
        body: "Certificate of formation and operating agreement are prepared for review.",
      },
      {
        title: "State filing",
        body: "The filing team submits to the Delaware Division of Corporations and pays the state fee.",
      },
      {
        title: "EIN and handover",
        body: "Your documents, EIN help and annual report dates are added to the dashboard.",
      },
    ],
    includes: [
      "Name availability check",
      "Certificate of formation",
      "Operating agreement",
      "Registered agent setup",
    ],
    faqs: [
      {
        question: "Do I need a US address to form an LLC?",
        answer:
          "You need a registered agent with a Delaware address. We provide one, and the principal address can be outside the US.",
      },
      {
        question: "What is the annual cost in Delaware?",
        answer:
          "Delaware charges a yearly franchise tax for an LLC. We add the date to your calendar and can file it for you.",
      },
      {
        question: "Can one person own the whole LLC?",
        answer:
          "Yes. A single-member LLC is standard. Add the member with 100 percent ownership in the people step.",
      },
    ],
  },
  {
    slug: "wyoming-llc",
    country: "united-states",
    name: "Wyoming LLC",
    navLabel: "Wyoming LLC",
    shortDescription:
      "Form a Wyoming limited liability company with low state fees and strong privacy defaults.",
    description:
      "Wyoming keeps annual costs low and does not require a member list in the public filing. We prepare the articles of organisation and handle the state filing.",
    currency: "USD",
    governmentFee: 100,
    governmentFeeFrom: false,
    governmentFeeWaived: false,
    governmentFeeLabel: "Wyoming filing fee",
    processing: "Timing depends on the registry.",
    activityLabel: "Business activity",
    shareCapital: false,
    entityLabel: "LLC",
    packages: buildPackages([49, 179, 269], [0, 90, 150], {
      taxIdLabel: "EIN",
      registeredAgentFirstYear: true,
    }),
    addOns: [
      {
        slug: "us-registered-agent",
        name: "Registered agent, year one",
        price: 99,
        billing: "yearly",
        description: "A Wyoming registered agent for service of process.",
      },
    ],
    steps: [
      {
        title: "Company details",
        body: "We confirm the name, principal office and the member who will sign.",
      },
      {
        title: "Articles and agreement",
        body: "Articles of organisation and the operating agreement are prepared for review.",
      },
      {
        title: "State filing",
        body: "The filing team submits to the Wyoming Secretary of State and pays the state fee.",
      },
      {
        title: "EIN and handover",
        body: "Documents, EIN help and the annual report date are added to your dashboard.",
      },
    ],
    includes: [
      "Name availability check",
      "Articles of organisation",
      "Operating agreement",
      "Registered agent setup",
    ],
    faqs: [
      {
        question: "Why choose Wyoming over Delaware?",
        answer:
          "Wyoming has lower annual costs and no state corporate income tax. Delaware is often preferred by companies planning to raise institutional money.",
      },
      {
        question: "What is the annual report fee?",
        answer:
          "Wyoming charges a minimum annual report fee. Timing depends on the registry.",
      },
      {
        question: "Is a registered agent required?",
        answer:
          "Yes. Every Wyoming LLC needs a registered agent with a physical Wyoming address.",
      },
    ],
  },
];

export interface ComplianceService {
  slug: string;
  name: string;
  navLabel: string;
  country: CountrySlug;
  currency: CurrencyCode;
  price: number | null;
  from: boolean;
  quote: boolean;
  billing: "one-off" | "yearly";
  summary: string;
  details: string;
  includes: string[];
  faqs: ServiceFaq[];
}

export const complianceServices: ComplianceService[] = [
  {
    slug: "annual-returns",
    name: "Nigeria annual returns",
    navLabel: "Annual returns",
    country: "nigeria",
    currency: "NGN",
    price: 15000,
    from: false,
    quote: false,
    billing: "one-off",
    summary:
      "Annual returns prepared and filed with the CAC, 15,000 for a business name and 30,000 for a limited company.",
    details:
      "Every registered entity files annual returns with the CAC. We prepare the return from your current particulars, file it and send you the acknowledgement.",
    includes: ["Return prepared and filed", "CAC acknowledgement", "Calendar reminder for next year"],
    faqs: [
      {
        question: "When are annual returns due?",
        answer: "Timing depends on the registry. We track the date for you.",
      },
      {
        question: "What happens if returns are late?",
        answer:
          "The CAC applies penalties. We tell you the amount before filing so you can approve it.",
      },
    ],
  },
  {
    slug: "beneficial-ownership",
    name: "Beneficial ownership (PSC) filing",
    navLabel: "Beneficial ownership",
    country: "nigeria",
    currency: "NGN",
    price: 25000,
    from: false,
    quote: false,
    billing: "one-off",
    summary:
      "Persons with significant control register prepared and filed with the CAC.",
    details:
      "The CAC requires companies to disclose anyone holding more than 5 percent of shares or exercising control. We prepare the register and file it.",
    includes: ["PSC register prepared", "Filing with the CAC", "Copy filed to your dashboard"],
    faqs: [
      {
        question: "Who counts as a person with significant control?",
        answer:
          "Anyone holding more than 5 percent of shares, directly or indirectly, or who exercises significant influence over the company.",
      },
      {
        question: "Is this a one-off filing?",
        answer:
          "It is filed with incorporation and updated whenever ownership changes. We can refile after a change.",
      },
    ],
  },
  {
    slug: "tax-id",
    name: "Tax identification number",
    navLabel: "Tax ID",
    country: "nigeria",
    currency: "NGN",
    price: 15000,
    from: false,
    quote: false,
    billing: "one-off",
    summary: "TIN registration for a new or existing Nigerian business.",
    details:
      "We register your business for a tax identification number and send you the certificate for banking and contracts.",
    includes: ["TIN application", "Certificate to your dashboard", "Confirmation of registration"],
    faqs: [
      {
        question: "Do I need a TIN to open a bank account?",
        answer:
          "Yes. Nigerian banks ask for a TIN before opening a corporate account.",
      },
      {
        question: "Can you register a TIN without a CAC number?",
        answer:
          "A CAC registration number is required for a business TIN. If you are not registered yet, start with a registration package.",
      },
    ],
  },
  {
    slug: "scuml",
    name: "SCUML and sector registrations",
    navLabel: "SCUML",
    country: "nigeria",
    currency: "NGN",
    price: null,
    from: false,
    quote: true,
    billing: "one-off",
    summary:
      "SCUML, DPR and other sector registrations, quoted after a short review.",
    details:
      "Regulated sectors need additional registrations before they can open accounts or take contracts. We review your activity and quote the work.",
    includes: ["Eligibility review", "Application preparation", "Filing and follow up"],
    faqs: [
      {
        question: "Who needs SCUML?",
        answer:
          "Designated non financial businesses, including real estate, dealers in precious metals, and some professional services.",
      },
      {
        question: "How is the quote calculated?",
        answer:
          "It depends on the sector and the number of locations. We send a fixed quote after a short review.",
      },
    ],
  },
  {
    slug: "confirmation-statement",
    name: "UK confirmation statement",
    navLabel: "Confirmation statement",
    country: "united-kingdom",
    currency: "GBP",
    price: null,
    from: false,
    quote: true,
    billing: "one-off",
    summary:
      "Yearly Companies House confirmation statement, prepared and filed for you.",
    details:
      "The confirmation statement confirms your officers, shareholders and registered office are current. We check the record, update what changed and file it.",
    includes: ["Record review", "Statement prepared and filed", "Filing confirmation"],
    faqs: [
      {
        question: "How often is it due?",
        answer: "Timing depends on the registry.",
      },
      {
        question: "Is the government fee included?",
        answer:
          "The Companies House fee is shown separately at cost before you confirm the request.",
      },
    ],
  },
  {
    slug: "us-annual-report",
    name: "US annual report",
    navLabel: "US annual report",
    country: "united-states",
    currency: "USD",
    price: null,
    from: false,
    quote: true,
    billing: "one-off",
    summary:
      "Delaware and Wyoming annual reports and franchise tax, filed on time.",
    details:
      "We prepare the state annual report, confirm the fee for your state and file before the deadline.",
    includes: ["State fee check", "Report prepared and filed", "Filing receipt"],
    faqs: [
      {
        question: "When is the Delaware LLC tax due?",
        answer: "Timing depends on the registry.",
      },
      {
        question: "What if I miss the deadline?",
        answer:
          "The state adds penalties and can dissolve the company. Tell us early and we will file as soon as possible.",
      },
    ],
  },
  {
    slug: "us-registered-agent",
    name: "US registered agent",
    navLabel: "US registered agent",
    country: "united-states",
    currency: "USD",
    price: 99,
    from: false,
    quote: false,
    billing: "yearly",
    summary: "A registered agent in Delaware or Wyoming, 99 dollars a year.",
    details:
      "A registered agent receives official state mail on your behalf. Required in both states for as long as the company exists.",
    includes: ["Registered agent service", "Mail forwarding", "Renewal reminder"],
    faqs: [
      {
        question: "Is this charged automatically?",
        answer:
          "No. Yearly services are invoiced and reminded. Nothing is charged without your approval.",
      },
      {
        question: "Can I switch agents?",
        answer:
          "Yes. We file the change of registered agent with the state.",
      },
    ],
  },
  {
    slug: "uk-registered-office",
    name: "UK registered office",
    navLabel: "UK registered office",
    country: "united-kingdom",
    currency: "GBP",
    price: 59,
    from: false,
    quote: false,
    billing: "yearly",
    summary: "A registered office address in the UK, 59 pounds a year.",
    details:
      "Your registered office appears on the public register. We provide a business address and forward statutory mail.",
    includes: ["Registered office address", "Statutory mail forwarding", "Renewal reminder"],
    faqs: [
      {
        question: "Can I use it as a trading address?",
        answer:
          "It is a registered office, not a trading address. Use it for statutory mail only.",
      },
      {
        question: "Is this charged automatically?",
        answer:
          "No. It is invoiced yearly and you approve each renewal.",
      },
    ],
  },
];

export interface WebsiteTier {
  slug: string;
  name: string;
  currency: CurrencyCode;
  from: number;
  to: number | null;
  quoteOnly: boolean;
  summary: string;
  includes: string[];
}

export const websiteTiers: WebsiteTier[] = [
  {
    slug: "starter-site",
    name: "Starter site",
    currency: "NGN",
    from: 70000,
    to: 250000,
    quoteOnly: false,
    summary:
      "A clean five to eight page site with your services, contact details and WhatsApp button.",
    includes: ["Five to eight pages", "Mobile first build", "Contact and WhatsApp", "Two rounds of changes"],
  },
  {
    slug: "online-store",
    name: "Online store",
    currency: "NGN",
    from: 250000,
    to: 1000000,
    quoteOnly: false,
    summary:
      "A storefront with product catalogue, cart, checkout and payment collection.",
    includes: ["Product catalogue", "Cart and checkout", "Paystack payments", "Order notifications"],
  },
  {
    slug: "custom-platform",
    name: "Custom platform",
    currency: "NGN",
    from: 1000000,
    to: null,
    quoteOnly: true,
    summary:
      "Custom software with accounts, dashboards, bookings or internal tools, quoted after a scoping call.",
    includes: ["Discovery and scope", "Design and build", "Testing and handover", "Support plan"],
  },
  {
    slug: "marketing-and-apps",
    name: "Marketing and apps",
    currency: "NGN",
    from: 0,
    to: null,
    quoteOnly: true,
    summary:
      "Campaigns, landing pages, SEO and mobile apps, quoted per project.",
    includes: ["Campaign planning", "Landing pages", "SEO foundations", "Mobile app builds"],
  },
];

export const priceNote =
  "Government fees are set by the registries and can change. Your total is shown before you pay.";


export function getService(slug: string | undefined): ServiceDefinition | undefined {
  return services.find((service) => service.slug === slug);
}

export function getServicesByCountry(country: CountrySlug): ServiceDefinition[] {
  return services.filter((service) => service.country === country);
}

export function getComplianceService(
  slug: string | undefined,
): ComplianceService | undefined {
  return complianceServices.find((service) => service.slug === slug);
}

export function getComplianceByCountry(
  country: CountrySlug,
): ComplianceService[] {
  return complianceServices.filter((service) => service.country === country);
}

export function startingPrice(service: ServiceDefinition): number {
  return service.packages[0]?.price ?? 0;
}
