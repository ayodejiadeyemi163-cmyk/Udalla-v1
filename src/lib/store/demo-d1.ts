import "server-only";

import type { Store } from "./types";
import { demoStore, exportDemoState, importDemoState } from "./demo";

/**
 * Durable wrapper for the demo store.
 *
 * The plain demo adapter keeps everything in module memory. A hosted server may
 * answer two steps of the same order from two instances, which loses the draft.
 * When the deployment provides a D1 binding named DB, the demo database is read
 * before every call and written back after every change. Local development and
 * tests have no binding and keep using memory only.
 */

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

const STATE_ID = "main";

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS demo_state (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

const WRITE_STATE = `INSERT INTO demo_state (id, data, updated_at)
VALUES (?, ?, ?)
ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`;

let bindingPromise: Promise<D1Database | null> | null = null;

async function resolveBinding(): Promise<D1Database | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = mod.getCloudflareContext();
    const db = (context.env as { DB?: D1Database }).DB;
    return db ?? null;
  } catch {
    return null;
  }
}

function binding(): Promise<D1Database | null> {
  if (!bindingPromise) bindingPromise = resolveBinding();
  return bindingPromise;
}

let schemaReady = false;

async function readState(): Promise<void> {
  const db = await binding();
  if (!db) return;

  if (!schemaReady) {
    await db.prepare(CREATE_TABLE).run();
    schemaReady = true;
  }

  const row = await db
    .prepare("SELECT data FROM demo_state WHERE id = ?")
    .bind(STATE_ID)
    .first<{ data: string }>();

  if (row?.data) {
    try {
      importDemoState(row.data);
    } catch {
      await writeState(db);
    }
  } else {
    await writeState(db);
  }
}

async function writeState(db?: D1Database): Promise<void> {
  const database = db ?? (await binding());
  if (!database) return;
  await database
    .prepare(WRITE_STATE)
    .bind(STATE_ID, exportDemoState(), new Date().toISOString())
    .run();
}

const MUTATORS = new Set<string>([
  "upsertUser",
  "saveDraft",
  "createOrder",
  "updateOrder",
  "addDocument",
  "createMatter",
  "updateMatter",
  "addMessage",
  "upsertLawyer",
  "createLead",
  "upsertGuide",
  "upsertFaq",
  "deleteFaq",
  "updateSettings",
  "addPriceChange",
  "appendAudit",
  "logEmail",
]);

export const persistentDemoStore: Store = new Proxy(demoStore, {
  get(target, property, receiver) {
    const original = Reflect.get(target, property, receiver);
    if (typeof original !== "function") return original;

    return async (...args: unknown[]) => {
      await readState();
      const result = await (original as (...params: unknown[]) => Promise<unknown>).apply(
        target,
        args,
      );
      if (MUTATORS.has(String(property))) await writeState();
      return result;
    };
  },
});
