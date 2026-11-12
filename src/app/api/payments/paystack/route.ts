import { NextResponse } from "next/server";

import { recordAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/mail";
import { verifyPaystackSignature } from "@/lib/payments";
import { getStore } from "@/lib/store";

/**
 * Paystack webhook. Signature verified on the raw body. Idempotent: a paid
 * order is never processed twice.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const valid = await verifyPaystackSignature(raw, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ received: true });
  }

  const store = getStore();
  const order = await store.getOrderByReference(event.data.reference);

  if (order && !order.payment.paidAt) {
    const now = new Date().toISOString();
    await store.updateOrder(order.id, {
      payment: { ...order.payment, paidAt: now },
      timeline: [
        ...order.timeline,
        { status: "received", at: now, note: "Payment confirmed by Paystack" },
      ],
    });

    await recordAudit({
      actorId: "paystack",
      action: "payment.confirmed",
      target: order.id,
      meta: { reference: order.reference },
    });

    if (order.guestEmail) {
      await sendEmail({
        to: order.guestEmail,
        subject: `Payment confirmed for ${order.reference}`,
        template: "payment-confirmed",
        body: [
          `Payment for order ${order.reference} is confirmed.`,
          "",
          "Your filing is prepared and submitted by Udalla's filing team.",
        ].join("\n"),
      });
    }
  }

  return NextResponse.json({ received: true });
}
