import { describe, expect, it } from "vitest";
import {
  SIGNED_URL_TTL_SECONDS,
  createDocumentSignature,
  verifyDocumentSignature,
} from "./signed-url";

const secret = "test-secret-for-signed-urls";

describe("signed document links", () => {
  it("accepts a fresh link for the right document", async () => {
    const now = Date.now();
    const token = await createDocumentSignature(
      { documentId: "doc-1", userId: "user-a", expiresAt: now + SIGNED_URL_TTL_SECONDS * 1000 },
      secret,
    );
    const result = await verifyDocumentSignature(token, secret, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.documentId).toBe("doc-1");
      expect(result.payload.userId).toBe("user-a");
    }
  });

  it("rejects an expired link", async () => {
    const issuedAt = Date.now() - 120_000;
    const token = await createDocumentSignature(
      { documentId: "doc-1", userId: "user-a", expiresAt: issuedAt + 60_000 },
      secret,
    );
    const result = await verifyDocumentSignature(token, secret, Date.now());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });

  it("rejects a link signed with a different secret", async () => {
    const token = await createDocumentSignature(
      { documentId: "doc-1", userId: "user-a", expiresAt: Date.now() + 60_000 },
      "another-secret",
    );
    const result = await verifyDocumentSignature(token, secret);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });

  it("rejects a tampered payload", async () => {
    const token = await createDocumentSignature(
      { documentId: "doc-1", userId: "user-a", expiresAt: Date.now() + 60_000 },
      secret,
    );
    const [body, signature] = token.split(".");
    const tampered = `${body}.x${signature?.slice(1)}`;
    const result = await verifyDocumentSignature(tampered, secret);
    expect(result.ok).toBe(false);
  });
});
