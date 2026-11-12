/** Environment helpers. Nothing here reads a secret value twice. */

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (isProduction()) {
    throw new Error(
      "SESSION_SECRET is missing. Set a 32 byte secret before running in production.",
    );
  }
  return "udalla-development-only-secret-do-not-use-in-production";
}

/**
 * A production deployment without Supabase and without DEMO_MODE must show a
 * configuration error. It must never fall back to demo data.
 */
export function configurationError(): string | null {
  if (hasSupabaseConfig()) return null;
  if (isDemoMode()) return null;
  return "Udalla is not connected to a data store yet. Set the Supabase keys or DEMO_MODE.";
}

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://udalla.org";
}
