import { describe, expect, it } from "vitest";
import {
  canAccessDocument,
  canAccessMatter,
  canAccessOrder,
} from "./access";
import type { DocumentRecord, Matter, Order, User } from "./store/types";

const customerA: User = {
  id: "user-a",
  email: "a@example.com",
  name: "Customer A",
  role: "customer",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const customerB: User = {
  id: "user-b",
  email: "b@example.com",
  name: "Customer B",
  role: "customer",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const admin: User = {
  id: "admin",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const lawyer: User = {
  id: "lawyer-1",
  email: "lawyer@example.com",
  name: "Lawyer",
  role: "lawyer",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function buildOrder(userId: string): Order {
  return {
    id: "order-1",
    reference: "UD-TEST0001",
    userId,
    guestEmail: "",
    country: "nigeria",
    service: "business-name",
    packageTier: "starter",
    addOns: [],
    currency: "NGN",
    packagePrice: 35000,
    addOnsTotal: 0,
    governmentFee: 10000,
    total: 45000,
    status: "received",
    timeline: [{ status: "received", at: "2026-01-01T00:00:00.000Z" }],
    business: {
      proposedNames: ["Test"],
      activity: "Testing",
      address: "Lagos",
      shareCapital: "",
      entityKind: "business-name",
    },
    people: [],
    documents: [],
    consentAt: "2026-01-01T00:00:00.000Z",
    payment: { provider: "test", reference: "x", paidAt: "2026-01-01T00:00:00.000Z" },
    assignedLawyerId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function buildDocument(userId: string): DocumentRecord {
  return {
    id: "doc-1",
    orderId: "order-1",
    userId,
    filename: "id.pdf",
    mime: "application/pdf",
    size: 1200,
    storageKey: `${userId}/doc.pdf`,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function buildMatter(): Matter {
  return {
    id: "matter-1",
    reference: "UD-M-TEST01",
    userId: customerA.id,
    serviceSlug: "annual-returns",
    serviceName: "Nigeria annual returns",
    price: 15000,
    currency: "NGN",
    detail: "File annual returns for the test company.",
    status: "assigned",
    assignedLawyerId: lawyer.id,
    deadline: null,
    timeline: [{ status: "received", at: "2026-01-01T00:00:00.000Z" }],
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("document access", () => {
  it("lets the owner read their own document", () => {
    expect(canAccessDocument(customerA, buildDocument("user-a"), buildOrder("user-a"))).toBe(true);
  });

  it("stops user A from reading user B's file", () => {
    expect(canAccessDocument(customerA, buildDocument("user-b"), buildOrder("user-b"))).toBe(false);
  });

  it("stops a document from being read against the wrong order", () => {
    const document = buildDocument("user-a");
    document.orderId = "another-order";
    expect(canAccessDocument(customerA, document, buildOrder("user-a"))).toBe(false);
  });

  it("lets an admin read any document", () => {
    expect(canAccessDocument(admin, buildDocument("user-b"), buildOrder("user-b"))).toBe(true);
  });

  it("denies signed out visitors", () => {
    expect(canAccessDocument(null, buildDocument("user-a"), buildOrder("user-a"))).toBe(false);
  });
});

describe("order and matter access", () => {
  it("limits orders to their owner", () => {
    expect(canAccessOrder(customerA, buildOrder("user-a"))).toBe(true);
    expect(canAccessOrder(customerB, buildOrder("user-a"))).toBe(false);
  });

  it("limits a lawyer to matters assigned to them", () => {
    const matter = buildMatter();
    expect(canAccessMatter(lawyer, matter)).toBe(true);
    const otherLawyer = { ...lawyer, id: "lawyer-2" };
    expect(canAccessMatter(otherLawyer, matter)).toBe(false);
  });

  it("keeps another customer out of a matter", () => {
    expect(canAccessMatter(customerB, buildMatter())).toBe(false);
  });
});
