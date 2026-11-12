import "server-only";

import { getStore } from "@/lib/store";

export async function recordAudit(input: {
  actorId: string;
  action: string;
  target: string;
  meta?: Record<string, string>;
}): Promise<void> {
  const store = getStore();
  await store.appendAudit({
    id: crypto.randomUUID(),
    actorId: input.actorId,
    action: input.action,
    target: input.target,
    at: new Date().toISOString(),
    meta: input.meta ?? {},
  });
}
