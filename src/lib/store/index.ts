import "server-only";

import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { persistentDemoStore } from "./demo-d1";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

export function getStore(): Store {
  if (hasSupabaseConfig()) return supabaseStore;
  if (isDemoMode()) return persistentDemoStore;
  throw new Error(
    "No data store configured. Set Supabase keys or DEMO_MODE=true. See .env.example.",
  );
}

export { DEMO_IDS, resetDemoStore } from "./demo";
export type * from "./types";
