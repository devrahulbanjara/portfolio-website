import "server-only";
import { all, get } from "./db";
import { TraceSteps, type TraceStep } from "./schemas/chat";

/* Read models for the admin panel. Every query is scoped by a time window. */

export const DAY = 86_400_000;
export const since = (ms: number) => Date.now() - ms;

/* ── overview ─────────────────────────────────────────────── */
export async function overview(rangeMs: number) {
  const from = since(rangeMs);
  const prevFrom = from - rangeMs;
  const now = Date.now() + 1;
  const n = async (sql: string, ...p: (number | string)[]) => (await get<{ n: number }>(sql, ...p))?.n ?? 0;
  const pv = (a: number, b: number) => n("SELECT COUNT(*) n FROM page_views WHERE is_bot = 0 AND ts >= ? AND ts < ?", a, b);
  const vis = (a: number, b: number) => n("SELECT COUNT(DISTINCT visitor_id) n FROM page_views WHERE is_bot = 0 AND ts >= ? AND ts < ?", a, b);
  const [pvNow, pvPrev, visNow, visPrev, chatsNow, chatsPrev, unread, errs, eng, lat] = await Promise.all([
    pv(from, now),
    pv(prevFrom, from),
    vis(from, now),
    vis(prevFrom, from),
    n("SELECT COUNT(*) n FROM chat_turns WHERE ts >= ?", from),
    n("SELECT COUNT(*) n FROM chat_turns WHERE ts >= ? AND ts < ?", prevFrom, from),
    n("SELECT COUNT(*) n FROM contact_messages WHERE read = 0 AND archived = 0"),
    n("SELECT COUNT(*) n FROM error_log WHERE ts >= ? AND level = 'error'", from),
    get<{ v: number | null }>("SELECT AVG(duration_ms) v FROM page_views WHERE is_bot = 0 AND ts >= ? AND duration_ms > 0", from),
    get<{ v: number | null }>("SELECT AVG(latency_ms) v FROM chat_turns WHERE ts >= ? AND verdict = 'ok'", from),
  ]);
  return {
    pageviews: { now: pvNow, prev: pvPrev },
    visitors: { now: visNow, prev: visPrev },
    chats: { now: chatsNow, prev: chatsPrev },
    unread,
    errors: errs,
    avgEngagedSec: Math.round((eng?.v ?? 0) / 1000),
    chatLatency: Math.round(lat?.v ?? 0),
  };
}

/** Bucketed counts for a simple bar chart. */
export async function series(rangeMs: number, buckets = 24) {
  const from = since(rangeMs);
  const size = rangeMs / buckets;
  const rows = await all<{ b: number; pv: number; v: number }>(
    `SELECT CAST((ts - ?) / ? AS INTEGER) b, COUNT(*) pv, COUNT(DISTINCT visitor_id) v
     FROM page_views WHERE is_bot = 0 AND ts >= ? GROUP BY b`,
    from,
    size,
    from,
  );
  const chats = await all<{ b: number; c: number }>(`SELECT CAST((ts - ?) / ? AS INTEGER) b, COUNT(*) c FROM chat_turns WHERE ts >= ? GROUP BY b`, from, size, from);
  return Array.from({ length: buckets }, (_, i) => ({
    t: from + i * size,
    pageviews: rows.find((r) => r.b === i)?.pv ?? 0,
    visitors: rows.find((r) => r.b === i)?.v ?? 0,
    chats: chats.find((r) => r.b === i)?.c ?? 0,
  }));
}

/* ── analytics breakdowns ─────────────────────────────────── */
type Count = { key: string; n: number };
const breakdown = (col: string, rangeMs: number, limit = 8) =>
  all<Count>(
    `SELECT COALESCE(${col}, 'Unknown') key, COUNT(*) n FROM page_views WHERE is_bot = 0 AND ts >= ? GROUP BY key ORDER BY n DESC LIMIT ?`,
    since(rangeMs),
    limit,
  );

export async function analytics(rangeMs: number) {
  const from = since(rangeMs);
  const [pages, referrers, countries, timezones, devices, browsers, os, events, vitals, bots] = await Promise.all([
    /* pages */ all<Count & { avg: number | null; scroll: number | null }>(
      `SELECT path key, COUNT(*) n, AVG(NULLIF(duration_ms, 0)) avg, AVG(scroll_depth) scroll
       FROM page_views WHERE is_bot = 0 AND ts >= ? GROUP BY path ORDER BY n DESC LIMIT 12`,
      from,
    ),
    /* referrers */ all<Count>(`SELECT COALESCE(ref_host, 'Direct') key, COUNT(*) n FROM page_views WHERE is_bot = 0 AND ts >= ? GROUP BY key ORDER BY n DESC LIMIT 8`, from),
    /* countries */ breakdown("country", rangeMs),
    /* timezones */ breakdown("timezone", rangeMs),
    /* devices */ breakdown("device", rangeMs, 4),
    /* browsers */ breakdown("browser", rangeMs, 6),
    /* os */ breakdown("os", rangeMs, 6),
    /* events */ all<Count>(`SELECT name key, COUNT(*) n FROM events WHERE ts >= ? GROUP BY name ORDER BY n DESC LIMIT 14`, from),
    /* vitals */ all<{ name: string; p75: number; n: number }>(
      `SELECT name, value p75, cnt n FROM (
         SELECT name, value, COUNT(*) OVER (PARTITION BY name) cnt,
                ROW_NUMBER() OVER (PARTITION BY name ORDER BY value) rn
         FROM vitals WHERE ts >= ?)
       WHERE rn = CAST(cnt * 0.75 AS INTEGER) + 1`,
      from,
    ),
    /* bots */ get<{ n: number }>("SELECT COUNT(*) n FROM page_views WHERE is_bot = 1 AND ts >= ?", from).then((r) => r?.n ?? 0),
  ]);
  return { pages, referrers, countries, timezones, devices, browsers, os, events, vitals, bots };
}

/** Visitors active in the last 5 minutes. */
export async function liveNow() {
  return all<{ path: string; country: string | null; device: string | null; ts: number }>(
    `SELECT path, country, device, MAX(ts) ts FROM page_views WHERE is_bot = 0 AND ts >= ? GROUP BY session_id ORDER BY ts DESC LIMIT 12`,
    since(5 * 60_000),
  );
}

/* ── messages ─────────────────────────────────────────────── */
export type Message = { id: string; ts: number; name: string; email: string; topic: string | null; message: string; read: number; archived: number };
export async function messages(view: "inbox" | "archived") {
  return all<Message>(`SELECT id, ts, name, email, topic, message, read, archived FROM contact_messages WHERE archived = ? ORDER BY ts DESC LIMIT 200`, view === "archived" ? 1 : 0);
}

/* ── conversations ────────────────────────────────────────── */
export type ChatSessionRow = { id: string; created_at: number; last_at: number; turns: number; flagged: number; country: string | null; user_agent: string | null; first_q: string | null; up: number; down: number };
export type SessionFilter = "all" | "flagged" | "helpful" | "unhelpful";
export async function chatSessions(filter: SessionFilter) {
  const where = {
    all: "",
    flagged: "AND s.flagged = 1",
    helpful: "AND EXISTS (SELECT 1 FROM chat_turns t WHERE t.session_id = s.id AND t.feedback = 1)",
    unhelpful: "AND EXISTS (SELECT 1 FROM chat_turns t WHERE t.session_id = s.id AND t.feedback = -1)",
  }[filter];
  return all<ChatSessionRow>(
    `SELECT s.id, s.created_at, s.last_at, s.turns, s.flagged, s.country, s.user_agent,
            (SELECT user_message FROM chat_turns t WHERE t.session_id = s.id ORDER BY ts LIMIT 1) first_q,
            (SELECT COUNT(*) FROM chat_turns t WHERE t.session_id = s.id AND t.feedback = 1) up,
            (SELECT COUNT(*) FROM chat_turns t WHERE t.session_id = s.id AND t.feedback = -1) down
     FROM chat_sessions s WHERE s.turns > 0 ${where}
     ORDER BY s.last_at DESC LIMIT 150`,
  );
}

/** Share of rated answers that visitors marked helpful. */
export async function satisfaction(rangeMs: number) {
  const r = await get<{ up: number | null; down: number | null }>("SELECT SUM(feedback = 1) up, SUM(feedback = -1) down FROM chat_turns WHERE ts >= ?", since(rangeMs));
  const up = r?.up ?? 0,
    down = r?.down ?? 0;
  return { up, down, rated: up + down, pct: up + down ? Math.round((up / (up + down)) * 100) : null };
}

export type ChatTurn = {
  id: string;
  ts: number;
  user_message: string;
  answer: string | null;
  model: string | null;
  verdict: string;
  verdict_reason: string | null;
  steps: TraceStep[];
  latency_ms: number | null;
  ttft_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  error: string | null;
  feedback: number | null;
};
export async function chatSession(id: string) {
  const session = await get<ChatSessionRow & { path: string | null; visitor_id: string | null }>("SELECT * FROM chat_sessions WHERE id = ?", id);
  if (!session) return null;
  const rows = await all<Omit<ChatTurn, "steps"> & { steps: string }>("SELECT * FROM chat_turns WHERE session_id = ? ORDER BY ts", id);
  const turns = rows.map((t) => {
    let steps: TraceStep[] = [];
    try {
      steps = TraceSteps.parse(JSON.parse(t.steps));
    } catch {}
    return { ...t, steps };
  });
  return { session, turns };
}

export async function chatStats(rangeMs: number) {
  const from = since(rangeMs);
  const [byVerdict, byModel, tokens, feedback, p50] = await Promise.all([
    all<Count>("SELECT verdict key, COUNT(*) n FROM chat_turns WHERE ts >= ? GROUP BY verdict ORDER BY n DESC", from),
    all<Count>("SELECT COALESCE(model, 'none') key, COUNT(*) n FROM chat_turns WHERE ts >= ? GROUP BY key ORDER BY n DESC", from),
    get<{ i: number | null; o: number | null }>("SELECT SUM(input_tokens) i, SUM(output_tokens) o FROM chat_turns WHERE ts >= ?", from),
    get<{ up: number; down: number }>("SELECT SUM(feedback = 1) up, SUM(feedback = -1) down FROM chat_turns WHERE ts >= ?", from),
    get<{ v: number | null }>(
      `SELECT latency_ms v FROM chat_turns WHERE ts >= ? AND verdict = 'ok' ORDER BY latency_ms LIMIT 1 OFFSET (SELECT COUNT(*) / 2 FROM chat_turns WHERE ts >= ? AND verdict = 'ok')`,
      from,
      from,
    ).then((r) => r?.v),
  ]);
  return { byVerdict, byModel, tokens, feedback, p50 };
}

/* ── logs ─────────────────────────────────────────────────── */
/** Errors grouped by message, newest first, with a count — one noisy bug shows as one row. */
export async function errors(limit = 100) {
  return all<{ message: string; source: string; level: string; n: number; last: number; first: number; stack: string | null; path: string | null }>(
    `SELECT message, source, level, COUNT(*) n, MAX(ts) last, MIN(ts) first,
            (SELECT stack FROM error_log e2 WHERE e2.message = e.message ORDER BY ts DESC LIMIT 1) stack,
            (SELECT path FROM error_log e2 WHERE e2.message = e.message ORDER BY ts DESC LIMIT 1) path
     FROM error_log e GROUP BY message, source, level ORDER BY last DESC LIMIT ?`,
    limit,
  );
}
export async function auditLog(limit = 150) {
  return all<{ id: number; ts: number; action: string; target: string | null; ip: string | null; user_agent: string | null; meta: string | null }>(
    "SELECT * FROM audit_log ORDER BY ts DESC LIMIT ?",
    limit,
  );
}
