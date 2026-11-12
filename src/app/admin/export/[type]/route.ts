import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const { type } = await params;
  const store = getStore();
  let headers: string[] = [];
  let rows: string[][] = [];
  let filename = "export.csv";

  if (type === "orders") {
    const orders = await store.listAllOrders();
    headers = [
      "reference",
      "created_at",
      "country",
      "service",
      "package",
      "currency",
      "package_price",
      "addons_total",
      "government_fee",
      "total",
      "status",
      "customer_email",
      "lawyer_id",
    ];
    rows = orders.map((order) => [
      order.reference,
      order.createdAt,
      order.country,
      order.service,
      order.packageTier,
      order.currency,
      String(order.packagePrice),
      String(order.addOnsTotal),
      String(order.governmentFee),
      String(order.total),
      order.status,
      order.guestEmail,
      order.assignedLawyerId ?? "",
    ]);
    filename = "udalla-orders.csv";
  } else if (type === "leads") {
    const leads = await store.listLeads();
    headers = [
      "created_at",
      "name",
      "email",
      "whatsapp",
      "business",
      "project_type",
      "budget",
      "timeline",
      "consent",
    ];
    rows = leads.map((lead) => [
      lead.createdAt,
      lead.name,
      lead.email,
      lead.whatsapp,
      lead.business,
      lead.projectType,
      lead.budget,
      lead.timeline,
      lead.consent ? "yes" : "no",
    ]);
    filename = "udalla-leads.csv";
  } else {
    return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  }

  const body = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
