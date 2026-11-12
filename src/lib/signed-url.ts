/**
 * Stateless signed links for private documents.
 * A link is valid for 60 seconds and is bound to one document and one user.
 * The storage adapter also issues a Supabase signed URL, so both layers agree.
 */

const encoder = new TextEncoder();
export const SIGNED_URL_TTL_SECONDS = 60;

function base64url(input: string): string {
  return btoa(input).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64url(input: string): string {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
}

export interface DocumentSignaturePayload {
  documentId: string;
  userId: string;
  expiresAt: number;
}

export async function createDocumentSignature(
  payload: DocumentSignaturePayload,
  secret: string,
): Promise<string> {
  const body = base64url(JSON.stringify(payload));
  const signature = await sign(body, secret);
  return `${body}.${signature}`;
}

export type SignatureResult =
  | { ok: true; payload: DocumentSignaturePayload }
  | { ok: false; reason: "expired" | "invalid" };

export async function verifyDocumentSignature(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): Promise<SignatureResult> {
  if (!token) return { ok: false, reason: "invalid" };
  const index = token.lastIndexOf(".");
  if (index <= 0) return { ok: false, reason: "invalid" };
  const body = token.slice(0, index);
  const signature = token.slice(index + 1);
  const expected = await sign(body, secret);
  if (expected !== signature) return { ok: false, reason: "invalid" };

  try {
    const payload = JSON.parse(fromBase64url(body)) as DocumentSignaturePayload;
    if (
      typeof payload.documentId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return { ok: false, reason: "invalid" };
    }
    if (payload.expiresAt < now) return { ok: false, reason: "expired" };
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
