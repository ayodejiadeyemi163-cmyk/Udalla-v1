/**
 * Upload validation. File type is verified from the bytes, not from the name
 * or the browser supplied MIME type.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const;

export type UploadCheck =
  | { ok: true; mime: keyof typeof ALLOWED_MIME | "image/webp"; extension: string }
  | { ok: false; reason: string };

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const riff = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0);
  const webp = String.fromCharCode(
    bytes[8] ?? 0,
    bytes[9] ?? 0,
    bytes[10] ?? 0,
    bytes[11] ?? 0,
  );
  return riff === "RIFF" && webp === "WEBP";
}

export function checkUpload(input: {
  bytes: Uint8Array;
  declaredMime: string;
  size: number;
}): UploadCheck {
  if (input.size <= 0) return { ok: false, reason: "The file is empty." };
  if (input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "Files must be 10 MB or smaller." };
  }
  if (input.bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "Files must be 10 MB or smaller." };
  }

  if (startsWith(input.bytes, ALLOWED_MIME["application/pdf"])) {
    return { ok: true, mime: "application/pdf", extension: "pdf" };
  }
  if (startsWith(input.bytes, ALLOWED_MIME["image/png"])) {
    return { ok: true, mime: "image/png", extension: "png" };
  }
  if (startsWith(input.bytes, ALLOWED_MIME["image/jpeg"])) {
    return { ok: true, mime: "image/jpeg", extension: "jpg" };
  }
  if (isWebp(input.bytes)) {
    return { ok: true, mime: "image/webp", extension: "webp" };
  }

  return {
    ok: false,
    reason: "Only PDF, JPG, PNG and WEBP files are accepted.",
  };
}

export function safeStorageKey(userId: string, extension: string): string {
  const id = crypto.randomUUID();
  return `${userId}/${id}.${extension}`;
}
