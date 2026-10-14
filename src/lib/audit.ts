import "server-only";
import { run } from "./db";

export async function audit(action: string, target: string | null, meta: { ip?: string; ua?: string; [k: string]: unknown }) {
  const { ip, ua, ...rest } = meta;
  try {
    await run(
      "INSERT INTO audit_log (ts, action, target, ip, user_agent, meta) VALUES (?, ?, ?, ?, ?, ?)",
      Date.now(),
      action,
      target,
      ip ?? null,
      ua ?? null,
      Object.keys(rest).length ? JSON.stringify(rest) : null,
    );
  } catch (err) {
    console.error("[audit] failed:", (err as Error).message);
  }
}

/** Never throws — logging must not take the app down. */
export async function logError(source: "server" | "client" | "chat", message: string, extra: { stack?: string; path?: string; ua?: string; meta?: unknown; level?: string } = {}) {
  try {
    await run(
      "INSERT INTO error_log (ts, source, level, message, stack, path, user_agent, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      Date.now(),
      source,
      extra.level ?? "error",
      message.slice(0, 2000),
      extra.stack?.slice(0, 8000) ?? null,
      extra.path ?? null,
      extra.ua ?? null,
      extra.meta ? JSON.stringify(extra.meta).slice(0, 8000) : null,
    );
  } catch {}
}
