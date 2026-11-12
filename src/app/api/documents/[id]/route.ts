import { NextResponse } from "next/server";

import { canAccessDocument } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { noStoreHeaders } from "@/lib/security";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { signStoredDownload } from "@/lib/storage";

/**
 * Private download. Authorisation is checked here, then the browser is sent to
 * a provider signed URL that expires after 60 seconds. No public URLs exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to download this document." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const store = getStore();
  const document = await store.getDocument(id);
  if (!document) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: noStoreHeaders() });
  }

  const order = await store.getOrder(document.orderId);
  if (!canAccessDocument(user, document, order)) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: noStoreHeaders() });
  }

  const signed = await signStoredDownload(document.storageKey);
  if ("error" in signed) {
    return NextResponse.json(
      { error: signed.error },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  await recordAudit({
    actorId: user.id,
    action: "document.downloaded",
    target: document.id,
    meta: { orderId: document.orderId },
  });

  return NextResponse.redirect(signed.url, { headers: noStoreHeaders() });
}
