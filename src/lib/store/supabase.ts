import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/config/brand";
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

/**
 * Supabase adapter. Enabled only when NEXT_PUBLIC_SUPABASE_URL and a key exist.
 * All privileged work happens on the server with the service role key.
 * Row level security policies live in supabase/migrations.
 */

type Row = Record<string, unknown>;

let cached: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set the URL and a server key first.");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

const str = (row: Row, key: string, fallback = ""): string =>
  typeof row[key] === "string" ? (row[key] as string) : fallback;
const num = (row: Row, key: string, fallback = 0): number =>
  typeof row[key] === "number" ? (row[key] as number) : fallback;
const bool = (row: Row, key: string, fallback = false): boolean =>
  typeof row[key] === "boolean" ? (row[key] as boolean) : fallback;
const list = <T>(row: Row, key: string): T[] =>
  Array.isArray(row[key]) ? (row[key] as T[]) : [];
const record = <T>(row: Row, key: string, fallback: T): T =>
  row[key] && typeof row[key] === "object" ? (row[key] as T) : fallback;
const nullableStr = (row: Row, key: string): string | null =>
  typeof row[key] === "string" ? (row[key] as string) : null;

function toUser(row: Row): User {
  return {
    id: str(row, "id"),
    email: str(row, "email"),
    name: str(row, "name"),
    role: (str(row, "role", "customer") as User["role"]) ?? "customer",
    createdAt: str(row, "created_at"),
  };
}

function toOrder(row: Row): Order {
  return {
    id: str(row, "id"),
    reference: str(row, "reference"),
    userId: nullableStr(row, "user_id"),
    guestEmail: str(row, "guest_email"),
    country: str(row, "country") as Order["country"],
    service: str(row, "service"),
    packageTier: str(row, "package_tier") as Order["packageTier"],
    addOns: list<string>(row, "add_ons"),
    currency: str(row, "currency", "NGN") as Order["currency"],
    packagePrice: num(row, "package_price"),
    addOnsTotal: num(row, "add_ons_total"),
    governmentFee: num(row, "government_fee"),
    total: num(row, "total"),
    status: str(row, "status", "received") as Order["status"],
    timeline: list<Order["timeline"][number]>(row, "timeline"),
    business: record(row, "business", {
      proposedNames: [],
      activity: "",
      address: "",
      shareCapital: "",
      entityKind: "",
    }),
    people: list<Order["people"][number]>(row, "people"),
    documents: [],
    consentAt: str(row, "consent_at"),
    payment: record(row, "payment", {
      provider: "test",
      reference: "",
      paidAt: "",
    }),
    assignedLawyerId: nullableStr(row, "assigned_lawyer_id"),
    createdAt: str(row, "created_at"),
    updatedAt: str(row, "updated_at"),
  };
}

function fromOrder(order: Order): Row {
  return {
    id: order.id,
    reference: order.reference,
    user_id: order.userId,
    guest_email: order.guestEmail,
    country: order.country,
    service: order.service,
    package_tier: order.packageTier,
    add_ons: order.addOns,
    currency: order.currency,
    package_price: order.packagePrice,
    add_ons_total: order.addOnsTotal,
    government_fee: order.governmentFee,
    total: order.total,
    status: order.status,
    timeline: order.timeline,
    business: order.business,
    people: order.people,
    consent_at: order.consentAt,
    payment: order.payment,
    assigned_lawyer_id: order.assignedLawyerId,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function toMatter(row: Row): Matter {
  return {
    id: str(row, "id"),
    reference: str(row, "reference"),
    userId: str(row, "user_id"),
    serviceSlug: str(row, "service_slug"),
    serviceName: str(row, "service_name"),
    price: typeof row.price === "number" ? (row.price as number) : null,
    currency: str(row, "currency", "NGN") as Matter["currency"],
    detail: str(row, "detail"),
    status: str(row, "status", "received") as Matter["status"],
    assignedLawyerId: nullableStr(row, "assigned_lawyer_id"),
    deadline: nullableStr(row, "deadline"),
    timeline: list<Matter["timeline"][number]>(row, "timeline"),
    createdAt: str(row, "created_at"),
  };
}

function toDocument(row: Row): DocumentRecord {
  return {
    id: str(row, "id"),
    orderId: str(row, "order_id"),
    userId: str(row, "user_id"),
    filename: str(row, "filename"),
    mime: str(row, "mime"),
    size: num(row, "size"),
    storageKey: str(row, "storage_key"),
    createdAt: str(row, "created_at"),
  };
}

function toMessage(row: Row): Message {
  return {
    id: str(row, "id"),
    threadId: str(row, "thread_id"),
    authorId: str(row, "author_id"),
    authorName: str(row, "author_name"),
    authorRole: str(row, "author_role", "customer") as Message["authorRole"],
    body: str(row, "body"),
    at: str(row, "at"),
  };
}

function toLawyer(row: Row): Lawyer {
  return {
    id: str(row, "id"),
    displayName: str(row, "display_name"),
    jurisdiction: str(row, "jurisdiction"),
    practiceAreas: list<string>(row, "practice_areas"),
    years: num(row, "years"),
    photoUrl: str(row, "photo_url"),
    showName: bool(row, "show_name"),
    showPhoto: bool(row, "show_photo"),
    approved: bool(row, "approved"),
  };
}

function toGuide(row: Row): Guide {
  return {
    slug: str(row, "slug"),
    title: str(row, "title"),
    excerpt: str(row, "excerpt"),
    country: str(row, "country", "all") as Guide["country"],
    readingMinutes: num(row, "reading_minutes", 4),
    publishedAt: str(row, "published_at"),
    body: list<string>(row, "body"),
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  contactEmail: brand.contactEmail,
  contactPhone: brand.contactPhone,
  whatsappNumber: brand.whatsappNumber,
  lawyerNote: brand.lawyerNote,
  packagePrices: {},
  governmentFees: {},
  governmentFeeWaived: [],
  compliancePrices: {},
  websiteRanges: {},
  serviceCopy: {},
};

class SupabaseStore implements Store {
  readonly kind = "supabase" as const;

  async getUser(id: string) {
    const { data } = await client().from("profiles").select("*").eq("id", id).maybeSingle();
    return data ? toUser(data as Row) : null;
  }

  async getUserByEmail(email: string) {
    const { data } = await client()
      .from("profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    return data ? toUser(data as Row) : null;
  }

  async upsertUser(user: User) {
    const { data, error } = await client()
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toUser(data as Row);
  }

  async getDraft(id: string) {
    const { data } = await client().from("drafts").select("*").eq("id", id).maybeSingle();
    if (!data) return null;
    const row = data as Row;
    return record<Draft | null>(row, "payload", null);
  }

  async saveDraft(draft: Draft) {
    const { error } = await client()
      .from("drafts")
      .upsert({
        id: draft.id,
        visitor_id: draft.visitorId,
        user_id: draft.userId,
        payload: draft,
        updated_at: draft.updatedAt,
      });
    if (error) throw new Error(error.message);
    return draft;
  }

  async createOrder(order: Order) {
    const { data, error } = await client()
      .from("orders")
      .insert(fromOrder(order))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toOrder(data as Row);
  }

  async getOrder(id: string) {
    const { data } = await client().from("orders").select("*").eq("id", id).maybeSingle();
    if (!data) return null;
    const order = toOrder(data as Row);
    order.documents = await this.listDocumentsByOrder(order.id);
    return order;
  }

  async getOrderByReference(reference: string) {
    const { data } = await client()
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();
    if (!data) return null;
    const order = toOrder(data as Row);
    order.documents = await this.listDocumentsByOrder(order.id);
    return order;
  }

  async listOrdersByUser(userId: string) {
    const { data } = await client()
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toOrder(row as Row));
  }

  async listAllOrders() {
    const { data } = await client()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toOrder(row as Row));
  }

  async updateOrder(id: string, patch: Partial<Order>) {
    const payload: Row = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.timeline !== undefined) payload.timeline = patch.timeline;
    if (patch.assignedLawyerId !== undefined)
      payload.assigned_lawyer_id = patch.assignedLawyerId;
    if (patch.business !== undefined) payload.business = patch.business;
    if (patch.people !== undefined) payload.people = patch.people;
    if (patch.total !== undefined) payload.total = patch.total;
    if (patch.governmentFee !== undefined) payload.government_fee = patch.governmentFee;
    const { data, error } = await client()
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toOrder(data as Row) : null;
  }

  async addDocument(document: DocumentRecord) {
    const { data, error } = await client()
      .from("documents")
      .insert({
        id: document.id,
        order_id: document.orderId,
        user_id: document.userId,
        filename: document.filename,
        mime: document.mime,
        size: document.size,
        storage_key: document.storageKey,
        created_at: document.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toDocument(data as Row);
  }

  async getDocument(id: string) {
    const { data } = await client().from("documents").select("*").eq("id", id).maybeSingle();
    return data ? toDocument(data as Row) : null;
  }

  async listDocumentsByOrder(orderId: string) {
    const { data } = await client()
      .from("documents")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    return (data ?? []).map((row) => toDocument(row as Row));
  }

  async listDocumentsByUser(userId: string) {
    const { data } = await client()
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toDocument(row as Row));
  }

  async createMatter(matter: Matter) {
    const { data, error } = await client()
      .from("matters")
      .insert({
        id: matter.id,
        reference: matter.reference,
        user_id: matter.userId,
        service_slug: matter.serviceSlug,
        service_name: matter.serviceName,
        price: matter.price,
        currency: matter.currency,
        detail: matter.detail,
        status: matter.status,
        assigned_lawyer_id: matter.assignedLawyerId,
        deadline: matter.deadline,
        timeline: matter.timeline,
        created_at: matter.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toMatter(data as Row);
  }

  async getMatter(id: string) {
    const { data } = await client().from("matters").select("*").eq("id", id).maybeSingle();
    return data ? toMatter(data as Row) : null;
  }

  async listMattersByUser(userId: string) {
    const { data } = await client()
      .from("matters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toMatter(row as Row));
  }

  async listMattersByLawyer(lawyerId: string) {
    const { data } = await client()
      .from("matters")
      .select("*")
      .eq("assigned_lawyer_id", lawyerId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toMatter(row as Row));
  }

  async listAllMatters() {
    const { data } = await client()
      .from("matters")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => toMatter(row as Row));
  }

  async updateMatter(id: string, patch: Partial<Matter>) {
    const payload: Row = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.timeline !== undefined) payload.timeline = patch.timeline;
    if (patch.assignedLawyerId !== undefined)
      payload.assigned_lawyer_id = patch.assignedLawyerId;
    if (patch.detail !== undefined) payload.detail = patch.detail;
    const { data, error } = await client()
      .from("matters")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toMatter(data as Row) : null;
  }

  async addMessage(message: Message) {
    const { data, error } = await client()
      .from("messages")
      .insert({
        id: message.id,
        thread_id: message.threadId,
        author_id: message.authorId,
        author_name: message.authorName,
        author_role: message.authorRole,
        body: message.body,
        at: message.at,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toMessage(data as Row);
  }

  async listMessages(threadId: string) {
    const { data } = await client()
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("at", { ascending: true });
    return (data ?? []).map((row) => toMessage(row as Row));
  }

  async listLawyers(approvedOnly = false) {
    let query = client().from("lawyers").select("*").order("jurisdiction");
    if (approvedOnly) query = query.eq("approved", true);
    const { data } = await query;
    return (data ?? []).map((row) => toLawyer(row as Row));
  }

  async upsertLawyer(lawyer: Lawyer) {
    const { data, error } = await client()
      .from("lawyers")
      .upsert({
        id: lawyer.id,
        display_name: lawyer.displayName,
        jurisdiction: lawyer.jurisdiction,
        practice_areas: lawyer.practiceAreas,
        years: lawyer.years,
        photo_url: lawyer.photoUrl,
        show_name: lawyer.showName,
        show_photo: lawyer.showPhoto,
        approved: lawyer.approved,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toLawyer(data as Row);
  }

  async createLead(lead: Lead) {
    const { data, error } = await client()
      .from("leads")
      .insert({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        business: lead.business,
        project_type: lead.projectType,
        budget: lead.budget,
        timeline: lead.timeline,
        consent: lead.consent,
        created_at: lead.createdAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const row = data as Row;
    return {
      ...lead,
      id: str(row, "id", lead.id),
    };
  }

  async listLeads() {
    const { data } = await client()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        name: str(source, "name"),
        email: str(source, "email"),
        whatsapp: str(source, "whatsapp"),
        business: str(source, "business"),
        projectType: str(source, "project_type"),
        budget: str(source, "budget"),
        timeline: str(source, "timeline"),
        consent: bool(source, "consent"),
        createdAt: str(source, "created_at"),
      };
    });
  }

  async listReviews(approvedOnly = false) {
    let query = client().from("reviews").select("*").order("created_at", {
      ascending: false,
    });
    if (approvedOnly) query = query.eq("approved", true);
    const { data } = await query;
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        name: str(source, "name"),
        country: str(source, "country"),
        body: str(source, "body"),
        approved: bool(source, "approved"),
        createdAt: str(source, "created_at"),
      } satisfies Review;
    });
  }

  async listGuides() {
    const { data } = await client()
      .from("guides")
      .select("*")
      .order("published_at", { ascending: false });
    return (data ?? []).map((row) => toGuide(row as Row));
  }

  async getGuide(slug: string) {
    const { data } = await client().from("guides").select("*").eq("slug", slug).maybeSingle();
    return data ? toGuide(data as Row) : null;
  }

  async upsertGuide(guide: Guide) {
    const { data, error } = await client()
      .from("guides")
      .upsert({
        slug: guide.slug,
        title: guide.title,
        excerpt: guide.excerpt,
        country: guide.country,
        reading_minutes: guide.readingMinutes,
        published_at: guide.publishedAt,
        body: guide.body,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toGuide(data as Row);
  }

  async listFaqs() {
    const { data } = await client().from("faqs").select("*").order("sort_order");
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        question: str(source, "question"),
        answer: str(source, "answer"),
        sortOrder: num(source, "sort_order"),
      } satisfies Faq;
    });
  }

  async upsertFaq(faq: Faq) {
    const { error } = await client()
      .from("faqs")
      .upsert({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
      });
    if (error) throw new Error(error.message);
    return faq;
  }

  async deleteFaq(id: string) {
    const { error } = await client().from("faqs").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getSettings() {
    const { data } = await client()
      .from("settings")
      .select("*")
      .eq("id", "site")
      .maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return record<SiteSettings>(data as Row, "payload", DEFAULT_SETTINGS);
  }

  async updateSettings(patch: Partial<SiteSettings>) {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    const { error } = await client()
      .from("settings")
      .upsert({ id: "site", payload: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return next;
  }

  async listPriceChanges() {
    const { data } = await client()
      .from("price_changes")
      .select("*")
      .order("at", { ascending: false });
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        scope: str(source, "scope", "package") as PriceChange["scope"],
        key: str(source, "key"),
        label: str(source, "label"),
        previous: str(source, "previous"),
        next: str(source, "next"),
        changedBy: str(source, "changed_by"),
        at: str(source, "at"),
      } satisfies PriceChange;
    });
  }

  async addPriceChange(change: PriceChange) {
    const { error } = await client().from("price_changes").insert({
      id: change.id,
      scope: change.scope,
      key: change.key,
      label: change.label,
      previous: change.previous,
      next: change.next,
      changed_by: change.changedBy,
      at: change.at,
    });
    if (error) throw new Error(error.message);
  }

  async appendAudit(entry: AuditEntry) {
    const { error } = await client().from("audit_log").insert({
      id: entry.id,
      actor_id: entry.actorId,
      action: entry.action,
      target: entry.target,
      at: entry.at,
      meta: entry.meta,
    });
    if (error) throw new Error(error.message);
  }

  async listAudit() {
    const { data } = await client()
      .from("audit_log")
      .select("*")
      .order("at", { ascending: false })
      .limit(200);
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        actorId: str(source, "actor_id"),
        action: str(source, "action"),
        target: str(source, "target"),
        at: str(source, "at"),
        meta: record<Record<string, string>>(source, "meta", {}),
      } satisfies AuditEntry;
    });
  }

  async logEmail(email: EmailLog) {
    const { error } = await client().from("emails").insert({
      id: email.id,
      to: email.to,
      subject: email.subject,
      body: email.body,
      template: email.template,
      at: email.at,
    });
    if (error) throw new Error(error.message);
    return email;
  }

  async listEmails() {
    const { data } = await client()
      .from("emails")
      .select("*")
      .order("at", { ascending: false })
      .limit(100);
    return (data ?? []).map((row) => {
      const source = row as Row;
      return {
        id: str(source, "id"),
        to: str(source, "to"),
        subject: str(source, "subject"),
        body: str(source, "body"),
        template: str(source, "template"),
        at: str(source, "at"),
      } satisfies EmailLog;
    });
  }

  async listRenewals(withinDays: number) {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() + withinDays);
    const { data } = await client()
      .from("matters")
      .select("*")
      .not("deadline", "is", null)
      .lte("deadline", cutoff.toISOString().slice(0, 10));
    return (data ?? []).map((row) => {
      const matter = toMatter(row as Row);
      return {
        id: `matter-${matter.id}`,
        label: `${matter.serviceName} for ${matter.reference}`,
        dueAt: matter.deadline ?? "",
        email: "",
        channel: "email",
      } satisfies RenewalReminder;
    });
  }
}

export const supabaseStore = new SupabaseStore();
