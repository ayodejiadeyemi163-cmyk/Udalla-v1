import "server-only";

import type { CountrySlug } from "@/config/countries";
import type { ServiceDefinition } from "@/config/pricing";
import { getSessionUser, getVisitorId } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { Draft } from "@/lib/store/types";

/**
 * Drafts belong to the browser visitor cookie, so a refresh or a return visit
 * resumes at the saved step without an account. Logged in users also get the
 * draft linked to their user id.
 */
export async function resolveDraft(
  country: CountrySlug,
  service: ServiceDefinition,
): Promise<Draft> {
  const store = getStore();
  const visitorId = await getVisitorId();
  const user = await getSessionUser();

  if (!visitorId) {
    throw new Error("The visitor cookie is missing. Reload the page and try again.");
  }

  const id = `draft_${service.slug}_${visitorId}`;
  const existing = await store.getDraft(id);

  if (existing) {
    if (user && existing.userId !== user.id) {
      return store.saveDraft({ ...existing, userId: user.id, updatedAt: new Date().toISOString() });
    }
    return existing;
  }

  const draft: Draft = {
    id,
    visitorId,
    userId: user?.id ?? null,
    country,
    service: service.slug,
    contactEmail: user?.email ?? "",
    step: 1,
    packageTier: "standard",
    addOns: [],
    business: {
      proposedNames: ["", "", ""],
      activity: "",
      address: "",
      shareCapital: "",
      entityKind: "",
    },
    people: [],
    documents: [],
    documentsSkipped: false,
    consent: false,
    updatedAt: new Date().toISOString(),
  };

  return store.saveDraft(draft);
}

export async function loadDraftForVisitor(id: string): Promise<Draft | null> {
  const store = getStore();
  const visitorId = await getVisitorId();
  const draft = await store.getDraft(id);
  if (!draft) return null;
  if (draft.visitorId !== visitorId) return null;
  return draft;
}
