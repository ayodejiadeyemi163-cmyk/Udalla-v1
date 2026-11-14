import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseConfig, supabasePublicKey } from "./env";

/**
 * Supabase auth client used only on the server, with cookies so the PKCE
 * verifier survives the OAuth and magic link round trip.
 */
export async function supabaseAuth() {
  if (!hasSupabaseConfig()) return null;
  const cookieStore = await cookies();
  const key = supabasePublicKey();
  if (!key) return null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a server component: the middleware refresh handles it.
          }
        },
      },
    },
  );
}
