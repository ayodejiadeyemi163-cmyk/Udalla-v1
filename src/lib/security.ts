import "server-only";

/** Same-origin guard for API routes and form posts. */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) {
    // Server actions and same origin form posts may omit Origin.
    return request.method === "GET" || request.method === "HEAD";
  }
  try {
    const originHost = new URL(origin).host;
    return Boolean(host) && originHost === host;
  } catch {
    return false;
  }
}

export function noStoreHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    ...extra,
  };
}

export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
