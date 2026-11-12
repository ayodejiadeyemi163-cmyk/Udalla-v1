/**
 * Session token helpers. Web Crypto only, so the same code runs in Node,
 * in the Next.js server and in the Workers runtime used for deployment.
 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export interface SessionPayload {
  userId: string;
  expiresAt: number;
}

export async function signSession(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  const body = `${payload.userId}.${payload.expiresAt}`;
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${toHex(signature)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresRaw, signature] = parts;
  if (!userId || !expiresRaw || !signature) return null;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return null;

  const key = await importKey(secret);
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${userId}.${expiresAt}`),
  );
  if (toHex(expected) !== signature) return null;
  return { userId, expiresAt };
}

export const SESSION_COOKIE = "udalla_session";
export const VISITOR_COOKIE = "udalla_visitor";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
