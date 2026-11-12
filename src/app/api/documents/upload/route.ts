import { NextResponse } from "next/server";

import { recordAudit } from "@/lib/audit";
import { loadDraftForVisitor } from "@/lib/draft";
import { hasSupabaseConfig } from "@/lib/env";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { isSameOriginRequest, noStoreHeaders } from "@/lib/security";
import { getSessionUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { storeUpload } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "This request did not come from Udalla." },
      { status: 403, headers: noStoreHeaders() },
    );
  }

  const limit = checkRateLimit(clientKey(request.headers, "upload"), {
    limit: 12,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads. Try again in a minute." },
      { status: 429, headers: noStoreHeaders() },
    );
  }

  const form = await request.formData();
  const draftId = String(form.get("draftId") ?? "");
  const draft = await loadDraftForVisitor(draftId);
  if (!draft) {
    return NextResponse.json(
      { ok: false, error: "This order draft is not available in this browser." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This preview with demo data accepts no real documents. Start a live deployment to upload.",
      },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Choose a file to upload." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const user = await getSessionUser();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const stored = await storeUpload({
    userId: user?.id ?? draft.visitorId,
    bytes,
    size: file.size,
    declaredMime: file.type,
  });

  if (!stored.ok) {
    return NextResponse.json(
      { ok: false, error: stored.reason },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const store = getStore();
  await store.saveDraft({
    ...draft,
    documents: [...draft.documents, { name: file.name, size: stored.size, mime: stored.mime }],
    updatedAt: new Date().toISOString(),
  });

  await recordAudit({
    actorId: user?.id ?? draft.visitorId,
    action: "document.uploaded",
    target: stored.storageKey,
    meta: { draftId: draft.id, mime: stored.mime },
  });

  return NextResponse.json(
    { ok: true, name: file.name },
    { headers: noStoreHeaders() },
  );
}
