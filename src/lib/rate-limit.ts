/**
 * Rate limiting.
 *
 * The demo adapter keeps buckets in memory, which is correct for a single
 * process. For a shared deployment the same interface is backed by the
 * rate_limits table in supabase/migrations/0001_init.sql, using an atomic
 * upsert per key so every server instance sees the same counter.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = options.limit ?? Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 20);
  const windowMs =
    options.windowMs ?? Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60) * 1000;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: Math.max(0, limit - existing.count), retryAfterSeconds: 0 };
}

export function resetRateLimits(): void {
  buckets.clear();
}

export function clientKey(headers: Headers, prefix: string): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}
