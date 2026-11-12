import { brand } from "@/config/brand";
import { complianceServices, services } from "@/config/pricing";
import { guides as seedGuides } from "@/content/guides";
import type {
  AuditEntry,
  Draft,
  DocumentRecord,
  EmailLog,
  Faq,
  Guide,
  Lawyer,
  Lead,
  Matter,
  Message,
  Order,
  PriceChange,
  RenewalReminder,
  Review,
  SiteSettings,
  Store,
  User,
} from "./types";

interface Db {
  users: User[];
  drafts: Draft[];
  orders: Order[];
  documents: DocumentRecord[];
  matters: Matter[];
  messages: Message[];
  lawyers: Lawyer[];
  guides: Guide[];
  faqs: Faq[];
  leads: Lead[];
  reviews: Review[];
  settings: SiteSettings;
  priceChanges: PriceChange[];
  audit: AuditEntry[];
  emails: EmailLog[];
}

export const DEMO_IDS = {
  customer: "usr_demo_customer",
  lawyer: "usr_demo_lawyer",
  admin: "usr_demo_admin",
  lawyerProfile: "law_demo_ng",
  orderOpen: "ord_demo_open",
  orderComplete: "ord_demo_complete",
  matter: "mat_demo_1",
} as const;

function iso(daysFromNow = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString();
}

function dateOnly(daysFromNow = 0): string {
  return iso(daysFromNow).slice(0, 10);
}

export function referenceNumber(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `UD-${random}`;
}

function defaultSettings(): SiteSettings {
  return {
    contactEmail: brand.contactEmail,
    contactPhone: brand.contactPhone,
    whatsappNumber: brand.whatsappNumber,
    lawyerNote: brand.lawyerNote,
    packagePrices: {},
    governmentFees: {},
    governmentFeeWaived: [],
    compliancePrices: {},
    websiteRanges: {},
  };
}

const homeFaqs: Faq[] = [
  {
    id: "faq_1",
    question: "How long does a registration take?",
    answer:
      "It depends on the registry. Nigerian business names usually clear in 3 to 7 working days after the name is approved, UK incorporations in 24 to 72 hours, and US state filings in 2 to 5 business days. Your dashboard shows the current stage at every point.",
    sortOrder: 1,
  },
  {
    id: "faq_2",
    question: "What do the packages include?",
    answer:
      "Every package includes the filing prepared and submitted by our filing team, your certificate and registration documents, dashboard tracking and compliance alerts. Standard adds tax ID help and a company documents pack. Premium adds priority processing, a registered office or agent for year one and a compliance consultation.",
    sortOrder: 2,
  },
  {
    id: "faq_3",
    question: "Are government fees included in the price?",
    answer:
      "No. Government fees are shown separately at cost, before you pay, so you can see exactly what goes to the registry. If a fee is waived, the waiver is shown in your total.",
    sortOrder: 3,
  },
  {
    id: "faq_4",
    question: "Can I register a business from outside the country?",
    answer:
      "Yes for the UK and the US. For Nigeria you need a Nigerian address and the required identification for every owner. You can complete the whole order online and upload documents from anywhere.",
    sortOrder: 4,
  },
  {
    id: "faq_5",
    question: "Who prepares and files my registration?",
    answer:
      "Your filing is prepared and submitted by Udalla's filing team. Licensed partner lawyers handle regulatory compliance, and they do not prepare or file registrations.",
    sortOrder: 5,
  },
  {
    id: "faq_6",
    question: "Can I change my order after I pay?",
    answer:
      "Before the filing is submitted, yes. Send a message from your dashboard and the team will update the order. After submission, changes depend on the registry and may attract a new government fee.",
    sortOrder: 6,
  },
];

function seedLawyers(): Lawyer[] {
  return [
    {
      id: DEMO_IDS.lawyerProfile,
      displayName: "Partner lawyer, Nigeria",
      jurisdiction: "Nigeria",
      practiceAreas: ["Corporate compliance", "Annual returns", "Beneficial ownership"],
      years: 12,
      photoUrl: "",
      showName: false,
      showPhoto: false,
      approved: true,
    },
    {
      id: "law_demo_uk",
      displayName: "Partner lawyer, United Kingdom",
      jurisdiction: "United Kingdom",
      practiceAreas: ["Confirmation statements", "Company secretarial", "Regulatory filings"],
      years: 9,
      photoUrl: "",
      showName: false,
      showPhoto: false,
      approved: true,
    },
    {
      id: "law_demo_us",
      displayName: "Partner lawyer, United States",
      jurisdiction: "United States",
      practiceAreas: ["Annual reports", "State compliance", "Registered agent matters"],
      years: 11,
      photoUrl: "",
      showName: false,
      showPhoto: false,
      approved: true,
    },
  ];
}

function seedOrders(): Order[] {
  const ngCompany = services.find((service) => service.slug === "limited-company");
  const uk = services.find((service) => service.slug === "private-limited-company");
  if (!ngCompany || !uk) return [];

  const standard = ngCompany.packages[1];
  const ukStarter = uk.packages[0];
  if (!standard || !ukStarter) return [];

  const open: Order = {
    id: DEMO_IDS.orderOpen,
    reference: "UD-4F2A91C7",
    userId: DEMO_IDS.customer,
    guestEmail: "",
    country: "nigeria",
    service: "limited-company",
    packageTier: "standard",
    addOns: [],
    currency: "NGN",
    packagePrice: standard.price,
    addOnsTotal: 0,
    governmentFee: ngCompany.governmentFee,
    total: standard.price + ngCompany.governmentFee,
    status: "in-review",
    timeline: [
      { status: "received", at: iso(-6), note: "Payment received" },
      { status: "in-review", at: iso(-4), note: "Documents checked by the filing team" },
    ],
    business: {
      proposedNames: ["Lagos Field Studio Ltd", "Field Studio Lagos Ltd", "Fieldwork Studio Ltd"],
      activity: "Brand and product design services",
      address: "12 Adeola Odeku Street, Victoria Island, Lagos",
      shareCapital: "1000000",
      entityKind: "private-limited",
    },
    people: [
      {
        id: "person_1",
        name: "Demo Customer",
        email: "demo.customer@udalla.org",
        role: "director",
        ownership: 60,
        address: "Lagos",
      },
      {
        id: "person_2",
        name: "Demo Partner",
        email: "demo.partner@udalla.org",
        role: "shareholder",
        ownership: 40,
        address: "Abuja",
      },
    ],
    documents: [],
    consentAt: iso(-6),
    payment: { provider: "test", reference: "TEST-4F2A91C7", paidAt: iso(-6) },
    assignedLawyerId: DEMO_IDS.lawyer,
    createdAt: iso(-6),
    updatedAt: iso(-4),
  };

  const completed: Order = {
    id: DEMO_IDS.orderComplete,
    reference: "UD-8B31D0E4",
    userId: DEMO_IDS.customer,
    guestEmail: "",
    country: "united-kingdom",
    service: "private-limited-company",
    packageTier: "starter",
    addOns: [],
    currency: "GBP",
    packagePrice: ukStarter.price,
    addOnsTotal: 0,
    governmentFee: uk.governmentFee,
    total: ukStarter.price + uk.governmentFee,
    status: "completed",
    timeline: [
      { status: "received", at: iso(-120), note: "Payment received" },
      { status: "in-review", at: iso(-119) },
      { status: "name-check", at: iso(-118) },
      { status: "filed", at: iso(-117) },
      { status: "awaiting-registry", at: iso(-116) },
      { status: "completed", at: iso(-114), note: "Certificate issued" },
    ],
    business: {
      proposedNames: ["Northline Studio Ltd", "Northline Works Ltd", "Northline Creative Ltd"],
      activity: "62012 Business and domestic software development",
      address: "71 to 75 Shelton Street, London",
      shareCapital: "100",
      entityKind: "private-limited",
    },
    people: [
      {
        id: "person_3",
        name: "Demo Customer",
        email: "demo.customer@udalla.org",
        role: "director",
        ownership: 100,
        address: "London",
      },
    ],
    documents: [],
    consentAt: iso(-120),
    payment: { provider: "test", reference: "TEST-8B31D0E4", paidAt: iso(-120) },
    assignedLawyerId: null,
    createdAt: iso(-120),
    updatedAt: iso(-114),
  };

  return [open, completed];
}

function seedMatters(): Matter[] {
  return [
    {
      id: DEMO_IDS.matter,
      reference: "UD-M-2C77A1",
      userId: DEMO_IDS.customer,
      serviceSlug: "annual-returns",
      serviceName: "Nigeria annual returns",
      price: 30000,
      currency: "NGN",
      detail:
        "Annual returns for Field Studio Ltd, financial year ending 31 December. All particulars unchanged.",
      status: "assigned",
      assignedLawyerId: DEMO_IDS.lawyer,
      deadline: dateOnly(23),
      timeline: [
        { status: "received", at: iso(-2), note: "Request received" },
        { status: "assigned", at: iso(-1), note: "Assigned to a partner lawyer" },
      ],
      createdAt: iso(-2),
    },
  ];
}

export function seedDb(): Db {
  const orders = seedOrders();
  return {
    users: [
      {
        id: DEMO_IDS.customer,
        email: "demo.customer@udalla.org",
        name: "Demo Customer",
        role: "customer",
        createdAt: iso(-140),
      },
      {
        id: DEMO_IDS.lawyer,
        email: "demo.lawyer@udalla.org",
        name: "Demo Lawyer",
        role: "lawyer",
        createdAt: iso(-140),
      },
      {
        id: DEMO_IDS.admin,
        email: "demo.admin@udalla.org",
        name: "Demo Admin",
        role: "admin",
        createdAt: iso(-140),
      },
    ],
    drafts: [],
    orders,
    documents: [],
    matters: seedMatters(),
    messages: [
      {
        id: "msg_1",
        threadId: DEMO_IDS.orderOpen,
        authorId: DEMO_IDS.customer,
        authorName: "Demo Customer",
        authorRole: "customer",
        body: "The second shareholder address is a PO box. Is that acceptable for the CAC filing?",
        at: iso(-3),
      },
      {
        id: "msg_2",
        threadId: DEMO_IDS.orderOpen,
        authorId: DEMO_IDS.admin,
        authorName: "Udalla filing team",
        authorRole: "admin",
        body: "A street address is required. You can update it in the order details and we will resubmit the particulars.",
        at: iso(-2),
      },
    ],
    lawyers: seedLawyers(),
    guides: seedGuides,
    faqs: homeFaqs,
    leads: [],
    reviews: [],
    settings: defaultSettings(),
    priceChanges: [],
    audit: [
      {
        id: "audit_seed",
        actorId: "system",
        action: "store.seeded",
        target: "demo",
        at: iso(),
        meta: { mode: "demo" },
      },
    ],
    emails: [
      {
        id: "email_seed",
        to: "demo.customer@udalla.org",
        subject: "Your Udalla order is in review",
        body: "Your filing is being checked by the Udalla filing team. You can follow every stage in your dashboard.",
        template: "order-status",
        at: iso(-4),
      },
    ],
  };
}

const globalStore = globalThis as unknown as { __udallaDemoDb?: Db };

function db(): Db {
  if (!globalStore.__udallaDemoDb) {
    globalStore.__udallaDemoDb = seedDb();
  }
  return globalStore.__udallaDemoDb;
}

export function resetDemoStore(): void {
  globalStore.__udallaDemoDb = seedDb();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

class DemoStore implements Store {
  readonly kind = "demo" as const;

  private get data(): Db {
    return db();
  }

  async getUser(id: string) {
    return clone(this.data.users.find((user) => user.id === id) ?? null);
  }

  async getUserByEmail(email: string) {
    const normalised = email.trim().toLowerCase();
    return clone(
      this.data.users.find((user) => user.email.toLowerCase() === normalised) ?? null,
    );
  }

  async upsertUser(user: User) {
    const index = this.data.users.findIndex(
      (entry) => entry.id === user.id || entry.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (index >= 0) {
      this.data.users[index] = clone(user);
    } else {
      this.data.users.push(clone(user));
    }
    return clone(user);
  }

  async getDraft(id: string) {
    return clone(this.data.drafts.find((draft) => draft.id === id) ?? null);
  }

  async saveDraft(draft: Draft) {
    const index = this.data.drafts.findIndex((entry) => entry.id === draft.id);
    if (index >= 0) this.data.drafts[index] = clone(draft);
    else this.data.drafts.push(clone(draft));
    return clone(draft);
  }

  async createOrder(order: Order) {
    this.data.orders.unshift(clone(order));
    return clone(order);
  }

  async getOrder(id: string) {
    return clone(this.data.orders.find((order) => order.id === id) ?? null);
  }

  async listOrdersByUser(userId: string) {
    return clone(
      this.data.orders
        .filter((order) => order.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  async listAllOrders() {
    return clone(
      [...this.data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  async updateOrder(id: string, patch: Partial<Order>) {
    const index = this.data.orders.findIndex((order) => order.id === id);
    const existing = this.data.orders[index];
    if (index < 0 || !existing) return null;
    const updated: Order = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.data.orders[index] = updated;
    return clone(updated);
  }

  async addDocument(document: DocumentRecord) {
    this.data.documents.push(clone(document));
    const order = this.data.orders.find((entry) => entry.id === document.orderId);
    if (order) order.documents.push(clone(document));
    return clone(document);
  }

  async getDocument(id: string) {
    return clone(this.data.documents.find((document) => document.id === id) ?? null);
  }

  async listDocumentsByOrder(orderId: string) {
    return clone(this.data.documents.filter((document) => document.orderId === orderId));
  }

  async listDocumentsByUser(userId: string) {
    return clone(this.data.documents.filter((document) => document.userId === userId));
  }

  async createMatter(matter: Matter) {
    this.data.matters.unshift(clone(matter));
    return clone(matter);
  }

  async getMatter(id: string) {
    return clone(this.data.matters.find((matter) => matter.id === id) ?? null);
  }

  async listMattersByUser(userId: string) {
    return clone(this.data.matters.filter((matter) => matter.userId === userId));
  }

  async listMattersByLawyer(lawyerId: string) {
    return clone(
      this.data.matters.filter((matter) => matter.assignedLawyerId === lawyerId),
    );
  }

  async listAllMatters() {
    return clone([...this.data.matters]);
  }

  async updateMatter(id: string, patch: Partial<Matter>) {
    const index = this.data.matters.findIndex((matter) => matter.id === id);
    const existing = this.data.matters[index];
    if (index < 0 || !existing) return null;
    const updated: Matter = { ...existing, ...patch };
    this.data.matters[index] = updated;
    return clone(updated);
  }

  async addMessage(message: Message) {
    this.data.messages.push(clone(message));
    return clone(message);
  }

  async listMessages(threadId: string) {
    return clone(
      this.data.messages
        .filter((message) => message.threadId === threadId)
        .sort((a, b) => a.at.localeCompare(b.at)),
    );
  }

  async listLawyers(approvedOnly = false) {
    const list = approvedOnly
      ? this.data.lawyers.filter((lawyer) => lawyer.approved)
      : this.data.lawyers;
    return clone(list);
  }

  async upsertLawyer(lawyer: Lawyer) {
    const index = this.data.lawyers.findIndex((entry) => entry.id === lawyer.id);
    if (index >= 0) this.data.lawyers[index] = clone(lawyer);
    else this.data.lawyers.push(clone(lawyer));
    return clone(lawyer);
  }

  async createLead(lead: Lead) {
    this.data.leads.unshift(clone(lead));
    return clone(lead);
  }

  async listLeads() {
    return clone(this.data.leads);
  }

  async listReviews(approvedOnly = false) {
    const list = approvedOnly
      ? this.data.reviews.filter((review) => review.approved)
      : this.data.reviews;
    return clone(list);
  }

  async listGuides() {
    return clone([...this.data.guides].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
  }

  async getGuide(slug: string) {
    return clone(this.data.guides.find((guide) => guide.slug === slug) ?? null);
  }

  async upsertGuide(guide: Guide) {
    const index = this.data.guides.findIndex((entry) => entry.slug === guide.slug);
    if (index >= 0) this.data.guides[index] = clone(guide);
    else this.data.guides.push(clone(guide));
    return clone(guide);
  }

  async listFaqs() {
    return clone([...this.data.faqs].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  async upsertFaq(faq: Faq) {
    const index = this.data.faqs.findIndex((entry) => entry.id === faq.id);
    if (index >= 0) this.data.faqs[index] = clone(faq);
    else this.data.faqs.push(clone(faq));
    return clone(faq);
  }

  async deleteFaq(id: string) {
    this.data.faqs = this.data.faqs.filter((faq) => faq.id !== id);
  }

  async getSettings() {
    return clone(this.data.settings);
  }

  async updateSettings(patch: Partial<SiteSettings>) {
    this.data.settings = { ...this.data.settings, ...patch };
    return clone(this.data.settings);
  }

  async listPriceChanges() {
    return clone(
      [...this.data.priceChanges].sort((a, b) => b.at.localeCompare(a.at)),
    );
  }

  async addPriceChange(change: PriceChange) {
    this.data.priceChanges.push(clone(change));
  }

  async appendAudit(entry: AuditEntry) {
    this.data.audit.push(clone(entry));
  }

  async listAudit() {
    return clone([...this.data.audit].reverse());
  }

  async logEmail(email: EmailLog) {
    this.data.emails.push(clone(email));
    return clone(email);
  }

  async listEmails() {
    return clone([...this.data.emails].reverse());
  }

  async listRenewals(withinDays: number) {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() + withinDays);
    const reminders: RenewalReminder[] = [];

    for (const matter of this.data.matters) {
      if (!matter.deadline) continue;
      if (new Date(matter.deadline) > cutoff) continue;
      const user = this.data.users.find((entry) => entry.id === matter.userId);
      reminders.push({
        id: `matter-${matter.id}`,
        label: `${matter.serviceName} for ${matter.reference}`,
        dueAt: matter.deadline,
        email: user?.email ?? "",
        channel: "email",
      });
    }

    const yearlyCompliance = new Set(
      complianceServices.filter((service) => service.billing === "yearly").map((s) => s.slug),
    );

    for (const order of this.data.orders) {
      if (order.status !== "completed") continue;
      if (!order.addOns.some((addOn) => yearlyCompliance.has(addOn))) continue;
      const due = new Date(order.createdAt);
      due.setUTCFullYear(due.getUTCFullYear() + 1);
      if (due > cutoff) continue;
      const user = this.data.users.find((entry) => entry.id === order.userId);
      reminders.push({
        id: `order-${order.id}`,
        label: `Renewal for ${order.reference}`,
        dueAt: due.toISOString().slice(0, 10),
        email: user?.email ?? order.guestEmail,
        channel: "email",
      });
    }

    return reminders;
  }
}

export const demoStore = new DemoStore();
