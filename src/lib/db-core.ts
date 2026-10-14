import { createClient, type Client, type InArgs, type InStatement, type Transaction } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

/**
 * Persistence through libSQL:
 *  - production (Vercel): Turso, via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *  - development: the same client on a local file (data/site.db) — no account needed
 * Every helper is async.
 */
export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const MIGRATIONS: string[] = [
  /* 001 — core schema */ `
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    cover_alt TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
    featured INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    reading_minutes INTEGER NOT NULL DEFAULT 1,
    word_count INTEGER NOT NULL DEFAULT 0,
    published_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS posts_status_pub ON posts(status, published_at DESC);

  CREATE TABLE IF NOT EXISTS post_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS post_revisions_post ON post_revisions(post_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    ref_host TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    country TEXT,
    timezone TEXT,
    lang TEXT,
    browser TEXT,
    os TEXT,
    device TEXT,
    screen TEXT,
    duration_ms INTEGER,
    scroll_depth INTEGER,
    is_bot INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS pv_ts ON page_views(ts);
  CREATE INDEX IF NOT EXISTS pv_path ON page_views(path, ts);
  CREATE INDEX IF NOT EXISTS pv_session ON page_views(session_id);

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    name TEXT NOT NULL,
    path TEXT,
    session_id TEXT,
    visitor_id TEXT,
    props TEXT
  );
  CREATE INDEX IF NOT EXISTS events_ts ON events(ts);
  CREATE INDEX IF NOT EXISTS events_name ON events(name, ts);

  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    rating TEXT
  );
  CREATE INDEX IF NOT EXISTS vitals_ts ON vitals(ts);

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    visitor_id TEXT,
    ip_hash TEXT,
    country TEXT,
    user_agent TEXT,
    path TEXT,
    created_at INTEGER NOT NULL,
    last_at INTEGER NOT NULL,
    turns INTEGER NOT NULL DEFAULT 0,
    flagged INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS chat_sessions_last ON chat_sessions(last_at DESC);

  CREATE TABLE IF NOT EXISTS chat_turns (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    ts INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    answer TEXT,
    model TEXT,
    verdict TEXT NOT NULL DEFAULT 'ok',
    verdict_reason TEXT,
    steps TEXT NOT NULL DEFAULT '[]',
    latency_ms INTEGER,
    ttft_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    thought_tokens INTEGER,
    error TEXT,
    feedback INTEGER
  );
  CREATE INDEX IF NOT EXISTS chat_turns_session ON chat_turns(session_id, ts);
  CREATE INDEX IF NOT EXISTS chat_turns_ts ON chat_turns(ts);

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    ts INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT,
    message TEXT NOT NULL,
    ip_hash TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS error_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    source TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'error',
    message TEXT NOT NULL,
    stack TEXT,
    path TEXT,
    user_agent TEXT,
    meta TEXT
  );
  CREATE INDEX IF NOT EXISTS error_ts ON error_log(ts);

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    ip TEXT,
    user_agent TEXT,
    meta TEXT
  );
  CREATE INDEX IF NOT EXISTS audit_ts ON audit_log(ts);

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    ip TEXT NOT NULL,
    success INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts(ip, ts);

  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
];

/** Bump when MIGRATIONS changes; every statement above is idempotent. */
const SCHEMA_VERSION = 3;

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  if (process.env.VERCEL) throw new Error("TURSO_DATABASE_URL is not set — Vercel has no persistent disk for a local database.");
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return createClient({ url: `file:${path.join(DATA_DIR, "site.db")}` });
}

const g = globalThis as unknown as { __libsql?: Client; __libsqlReady?: Promise<void> };

async function migrate(client: Client) {
  await client.execute("CREATE TABLE IF NOT EXISTS _schema (version INTEGER NOT NULL)");
  const row = (await client.execute("SELECT version FROM _schema LIMIT 1")).rows[0];
  const current = row ? Number(row[0]) : 0;
  if (current >= SCHEMA_VERSION) return;
  for (const script of MIGRATIONS) await client.executeMultiple(script);
  await client.batch([{ sql: "DELETE FROM _schema", args: [] }, { sql: "INSERT INTO _schema (version) VALUES (?)", args: [SCHEMA_VERSION] }], "write");
}

/** The shared client, migrated on first use (once per server instance). */
export async function client(): Promise<Client> {
  if (!g.__libsql) {
    g.__libsql = makeClient();
    // Local file only: use the rollback journal, not WAL. libSQL opens several
    // connections per process, and with WAL another process (a CLI script) can
    // decide the database is idle and delete the live -wal file underneath us.
    if (!process.env.TURSO_DATABASE_URL) {
      await g.__libsql.execute("PRAGMA busy_timeout = 5000").catch(() => {});
      await g.__libsql.execute("PRAGMA journal_mode = DELETE").catch(() => {});
    }
  }
  g.__libsqlReady ??= migrate(g.__libsql).catch((e) => {
    g.__libsqlReady = undefined;
    throw e;
  });
  await g.__libsqlReady;
  return g.__libsql;
}

export type Value = string | number | bigint | null | boolean | Uint8Array;
type Exec = Pick<Client, "execute"> | Transaction;

const toObjects = <T>(rs: { columns: string[]; rows: ArrayLike<unknown>[] }) =>
  rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, typeof r[i] === "bigint" ? Number(r[i]) : r[i]]))) as T[];

async function exec(sql: string, args: Value[], on?: Exec) {
  return (on ?? (await client())).execute({ sql, args: args as InArgs });
}

export async function all<T>(sql: string, ...args: Value[]): Promise<T[]> {
  return toObjects<T>(await exec(sql, args));
}

export async function get<T>(sql: string, ...args: Value[]): Promise<T | undefined> {
  return toObjects<T>(await exec(sql, args))[0];
}

export async function run(sql: string, ...args: Value[]) {
  const rs = await exec(sql, args);
  return { changes: rs.rowsAffected, lastInsertRowid: rs.lastInsertRowid === undefined ? undefined : Number(rs.lastInsertRowid) };
}

/** Several writes that must all succeed or all fail. */
export async function batch(statements: { sql: string; args?: Value[] }[]) {
  const c = await client();
  await c.batch(statements.map((s) => ({ sql: s.sql, args: (s.args ?? []) as InArgs }) as InStatement), "write");
}

/** Run a read-only transaction (writes inside it are rejected by the database). */
export async function readOnly<T>(fn: (q: (sql: string) => Promise<Record<string, unknown>[]>) => Promise<T>): Promise<T> {
  const c = await client();
  const t = await c.transaction("read");
  try {
    return await fn(async (sql) => toObjects<Record<string, unknown>>(await t.execute(sql)));
  } finally {
    t.close();
  }
}

/**
 * For non-critical reads/writes (analytics, listings): never let a database
 * problem take the page down — log it and return the fallback.
 */
export async function safely<T>(fn: () => Promise<T>, fallback: T, label = "db"): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[${label}] failed, using fallback:`, (err as Error).message);
    return fallback;
  }
}
