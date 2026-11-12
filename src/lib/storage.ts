import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "@/lib/env";
import { checkUpload, safeStorageKey } from "@/lib/upload";

/**
 * Private document storage. No public URLs exist. A download is a signed URL
 * that expires after 60 seconds and is recorded in the audit log.
 */

function bucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "documents";
}

function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type StoredUpload =
  | { ok: true; storageKey: string; mime: string; size: number }
  | { ok: false; reason: string };

export async function storeUpload(input: {
  userId: string;
  bytes: Uint8Array;
  size: number;
  declaredMime: string;
}): Promise<StoredUpload> {
  const check = checkUpload({
    bytes: input.bytes,
    declaredMime: input.declaredMime,
    size: input.size,
  });
  if (!check.ok) return { ok: false, reason: check.reason };

  const client = storageClient();
  if (!client) {
    return { ok: false, reason: "Private storage is not configured." };
  }

  const key = safeStorageKey(input.userId, check.extension);
  const { error } = await client.storage.from(bucket()).upload(key, input.bytes, {
    contentType: check.mime,
    upsert: false,
  });

  if (error) return { ok: false, reason: "The file could not be stored." };

  return { ok: true, storageKey: key, mime: check.mime, size: input.size };
}

export async function signStoredDownload(
  storageKey: string,
): Promise<{ url: string } | { error: string }> {
  const client = storageClient();
  if (!client) return { error: "Private storage is not configured." };

  const { data, error } = await client.storage
    .from(bucket())
    .createSignedUrl(storageKey, 60);

  if (error || !data?.signedUrl) return { error: "The download link could not be created." };
  return { url: data.signedUrl };
}

export function demoStorageEnabled(): boolean {
  return !hasSupabaseConfig();
}
