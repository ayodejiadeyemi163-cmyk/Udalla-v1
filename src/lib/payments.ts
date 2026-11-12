/**
 * Payment provider abstraction.
 * Paystack handles naira. A second gateway slot is defined so another provider
 * can be added without touching checkout.
 */

export interface PaymentInitInput {
  email: string;
  amount: number;
  currency: "NGN" | "GBP" | "USD";
  reference: string;
  callbackUrl: string;
}

export type PaymentInitResult =
  | { ok: true; redirectUrl: string; reference: string; provider: "paystack" }
  | { ok: false; message: string };

export function paystackEnabled(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export async function initialisePaystack(
  input: PaymentInitInput,
): Promise<PaymentInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { ok: false, message: "Paystack keys are not configured." };
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: Math.round(input.amount * 100),
        currency: input.currency,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { source: "udalla", reference: input.reference },
      }),
    });

    if (!response.ok) {
      return { ok: false, message: "The payment provider rejected the request." };
    }

    const data = (await response.json()) as {
      status?: boolean;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!data.status || !data.data?.authorization_url) {
      return { ok: false, message: "The payment provider did not return a checkout link." };
    }

    return {
      ok: true,
      redirectUrl: data.data.authorization_url,
      reference: data.data.reference ?? input.reference,
      provider: "paystack",
    };
  } catch {
    return { ok: false, message: "The payment provider could not be reached." };
  }
}

/** Paystack signs the raw body with HMAC SHA512 using the secret key. */
export async function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return expected === signature.toLowerCase();
}
