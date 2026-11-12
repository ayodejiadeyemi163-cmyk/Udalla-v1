import type { CountrySlug } from "@/config/countries";
import type { CurrencyCode, PackageTier } from "@/config/pricing";

export type Role = "customer" | "lawyer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export const ORDER_STATUS_FLOW = [
  { value: "received", label: "Received" },
  { value: "in-review", label: "In review" },
  { value: "name-check", label: "Name check" },
  { value: "filed", label: "Filed" },
  { value: "awaiting-registry", label: "Awaiting registry" },
  { value: "completed", label: "Completed" },
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number]["value"];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_FLOW.find((entry) => entry.value === status)?.label ?? status;
}

export interface TimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface BusinessDetails {
  proposedNames: string[];
  activity: string;
  address: string;
  shareCapital: string;
  entityKind: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: "director" | "shareholder" | "member" | "trustee";
  ownership: number;
  address: string;
}

export interface DraftDocument {
  name: string;
  size: number;
  mime: string;
}

export interface Draft {
  id: string;
  visitorId: string;
  userId: string | null;
  country: CountrySlug;
  service: string;
  step: number;
  packageTier: PackageTier;
  addOns: string[];
  business: BusinessDetails;
  people: Person[];
  documents: DraftDocument[];
  documentsSkipped: boolean;
  consent: boolean;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  orderId: string;
  userId: string;
  filename: string;
  mime: string;
  size: number;
  storageKey: string;
  createdAt: string;
}

export interface Payment {
  provider: "test" | "paystack" | "second-gateway";
  reference: string;
  paidAt: string;
}

export interface Order {
  id: string;
  reference: string;
  userId: string | null;
  guestEmail: string;
  country: CountrySlug;
  service: string;
  packageTier: PackageTier;
  addOns: string[];
  currency: CurrencyCode;
  packagePrice: number;
  addOnsTotal: number;
  governmentFee: number;
  total: number;
  status: OrderStatus;
  timeline: TimelineEntry[];
  business: BusinessDetails;
  people: Person[];
  documents: DocumentRecord[];
  consentAt: string;
  payment: Payment;
  assignedLawyerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MatterStatus =
  | "received"
  | "assigned"
  | "in-progress"
  | "filed"
  | "completed";

export interface Matter {
  id: string;
  reference: string;
  userId: string;
  serviceSlug: string;
  serviceName: string;
  price: number | null;
  currency: CurrencyCode;
  detail: string;
  status: MatterStatus;
  assignedLawyerId: string | null;
  deadline: string | null;
  timeline: { status: MatterStatus; at: string; note?: string }[];
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  at: string;
}

export interface Lawyer {
  id: string;
  displayName: string;
  jurisdiction: string;
  practiceAreas: string[];
  years: number;
  photoUrl: string;
  showName: boolean;
  showPhoto: boolean;
  approved: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  business: string;
  projectType: string;
  budget: string;
  timeline: string;
  consent: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  country: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  country: CountrySlug | "all";
  readingMinutes: number;
  publishedAt: string;
  body: string[];
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  lawyerNote: string;
  packagePrices: Record<string, number>;
  governmentFees: Record<string, number>;
  governmentFeeWaived: string[];
  compliancePrices: Record<string, number>;
  websiteRanges: Record<string, { from: number; to: number | null }>;
}

export interface PriceChange {
  id: string;
  scope: "package" | "government" | "compliance" | "website";
  key: string;
  label: string;
  previous: string;
  next: string;
  changedBy: string;
  at: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  target: string;
  at: string;
  meta: Record<string, string>;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  template: string;
  at: string;
}

export interface RenewalReminder {
  id: string;
  label: string;
  dueAt: string;
  email: string;
  channel: "email";
}

export interface Store {
  readonly kind: "demo" | "supabase";

  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  upsertUser(user: User): Promise<User>;

  getDraft(id: string): Promise<Draft | null>;
  saveDraft(draft: Draft): Promise<Draft>;

  createOrder(order: Order): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  listOrdersByUser(userId: string): Promise<Order[]>;
  listAllOrders(): Promise<Order[]>;
  updateOrder(id: string, patch: Partial<Order>): Promise<Order | null>;

  addDocument(document: DocumentRecord): Promise<DocumentRecord>;
  getDocument(id: string): Promise<DocumentRecord | null>;
  listDocumentsByOrder(orderId: string): Promise<DocumentRecord[]>;
  listDocumentsByUser(userId: string): Promise<DocumentRecord[]>;

  createMatter(matter: Matter): Promise<Matter>;
  getMatter(id: string): Promise<Matter | null>;
  listMattersByUser(userId: string): Promise<Matter[]>;
  listMattersByLawyer(lawyerId: string): Promise<Matter[]>;
  listAllMatters(): Promise<Matter[]>;
  updateMatter(id: string, patch: Partial<Matter>): Promise<Matter | null>;

  addMessage(message: Message): Promise<Message>;
  listMessages(threadId: string): Promise<Message[]>;

  listLawyers(approvedOnly?: boolean): Promise<Lawyer[]>;
  upsertLawyer(lawyer: Lawyer): Promise<Lawyer>;

  createLead(lead: Lead): Promise<Lead>;
  listLeads(): Promise<Lead[]>;

  listReviews(approvedOnly?: boolean): Promise<Review[]>;

  listGuides(): Promise<Guide[]>;
  getGuide(slug: string): Promise<Guide | null>;
  upsertGuide(guide: Guide): Promise<Guide>;

  listFaqs(): Promise<Faq[]>;
  upsertFaq(faq: Faq): Promise<Faq>;
  deleteFaq(id: string): Promise<void>;

  getSettings(): Promise<SiteSettings>;
  updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>;
  listPriceChanges(): Promise<PriceChange[]>;
  addPriceChange(change: PriceChange): Promise<void>;

  appendAudit(entry: AuditEntry): Promise<void>;
  listAudit(): Promise<AuditEntry[]>;

  logEmail(email: EmailLog): Promise<EmailLog>;
  listEmails(): Promise<EmailLog[]>;

  listRenewals(withinDays: number): Promise<RenewalReminder[]>;
}
