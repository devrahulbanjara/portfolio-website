import "server-only";

/**
 * Per-session conversational memory, in RAM only.
 * Keeps the last MAX_EXCHANGES question/answer pairs; anything older is dropped.
 * Sessions expire after IDLE_MS without activity; the map is LRU-capped so a
 * flood of sessions can't grow memory unbounded.
 * (Full transcripts still go to SQLite for the admin trace view — but they are
 * never fed back to the model, so one visitor can't influence another.)
 */
const MAX_EXCHANGES = 3;
const IDLE_MS = 30 * 60_000;
const MAX_SESSIONS = 2000;
const MAX_ANSWER_CHARS = 1500;

type Exchange = { user: string; assistant: string };
type Entry = { exchanges: Exchange[]; touched: number };

const g = globalThis as unknown as { __chatMemory?: Map<string, Entry> };
const store = (g.__chatMemory ??= new Map());

function sweep() {
  const now = Date.now();
  for (const [k, v] of store) if (now - v.touched > IDLE_MS) store.delete(k);
  while (store.size > MAX_SESSIONS) store.delete(store.keys().next().value!);
}

export function recall(sessionId: string): Exchange[] {
  const e = store.get(sessionId);
  if (!e) return [];
  if (Date.now() - e.touched > IDLE_MS) {
    store.delete(sessionId);
    return [];
  }
  // LRU bump
  store.delete(sessionId);
  e.touched = Date.now();
  store.set(sessionId, e);
  return e.exchanges;
}

export function remember(sessionId: string, user: string, assistant: string) {
  const e = store.get(sessionId) ?? { exchanges: [], touched: Date.now() };
  e.exchanges.push({ user, assistant: assistant.slice(0, MAX_ANSWER_CHARS) });
  if (e.exchanges.length > MAX_EXCHANGES) e.exchanges.splice(0, e.exchanges.length - MAX_EXCHANGES);
  e.touched = Date.now();
  store.delete(sessionId);
  store.set(sessionId, e);
  sweep();
}

export function forget(sessionId: string) {
  store.delete(sessionId);
}

export function memoryStats() {
  sweep();
  return { sessions: store.size, maxExchanges: MAX_EXCHANGES, idleMinutes: IDLE_MS / 60_000 };
}
