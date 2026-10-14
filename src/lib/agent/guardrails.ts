import "server-only";
import crypto from "node:crypto";
import { get } from "@/lib/db";
import { setting } from "@/lib/settings";

export const MAX_INPUT_CHARS = 600;

/** Random per-process canary. If it ever shows up in output, the system prompt is leaking. */
export const CANARY = `cnry-${crypto.randomBytes(6).toString("hex")}`;

const INJECTION_PATTERNS: [RegExp, string][] = [
  [/ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|prompts?|rules)/i, "ignore-previous"],
  [/(reveal|show|print|repeat|output|leak).{0,30}(system|hidden|initial) (prompt|instructions|message)/i, "prompt-extraction"],
  [/\b(you are now|act as|pretend (to be|you are)|roleplay as|from now on you)\b/i, "persona-override"],
  [/\b(DAN|developer mode|jailbreak|do anything now)\b/i, "jailbreak"],
  [/<\/?(system|instructions?)>|\[\/?INST\]|<\|im_start\|>/i, "fake-delimiters"],
  [/[A-Za-z0-9+/]{120,}={0,2}/, "encoded-payload"],
];

export type InputVerdict =
  | { ok: true; flags: string[] }
  | { ok: false; reason: string; message: string };

export function screenInput(text: string): InputVerdict {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty", message: "Ask me something about Rahul — his work, teaching, or how to hire him." };
  if (t.length > MAX_INPUT_CHARS)
    return { ok: false, reason: "too-long", message: `That's a long one — please keep questions under ${MAX_INPUT_CHARS} characters.` };
  const flags = INJECTION_PATTERNS.filter(([re]) => re.test(t)).map(([, name]) => name);
  return { ok: true, flags };
}

/** Fixed-window counter in the database (works across serverless instances). Returns true if allowed. */
export async function hit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  // One atomic upsert: reset the window if it expired, otherwise increment.
  const row = await get<{ count: number }>(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
     RETURNING count`,
    key,
    now + windowMs,
    now,
    now,
  );
  return (row?.count ?? 1) <= limit;
}

export async function checkRateLimits(ipHash: string): Promise<{ ok: true } | { ok: false; message: string; reason: string }> {
  const [perBurst, perDay, globalDay] = await Promise.all([setting("chat_limit_burst"), setting("chat_limit_daily_visitor"), setting("chat_limit_daily_global")]);
  if (!(await hit(`chat:burst:${ipHash}`, perBurst, 5 * 60_000)))
    return { ok: false, reason: "rate-burst", message: "You're asking faster than I can think. Give it a minute and try again." };
  if (!(await hit(`chat:day:${ipHash}`, perDay, 24 * 3600_000)))
    return { ok: false, reason: "rate-daily", message: "You've hit today's question limit. For anything else, email Rahul directly — he answers." };
  if (!(await hit(`chat:global:${new Date().toISOString().slice(0, 10)}`, globalDay, 24 * 3600_000)))
    return { ok: false, reason: "rate-global", message: "The assistant is resting for today. Rahul's contact form is always open." };
  return { ok: true };
}

export const REFUSALS: Record<string, string> = {
  off_topic:
    "I'm Rahul's portfolio agent, so I only answer questions about him — his work, projects, teaching, writing and how to hire him. Want me to show you his projects instead?",
  harmful: "I can't help with that. I'm here to answer questions about Rahul and his work.",
  private_info:
    "That's personal information I don't share. For anything beyond what's on this site, reach out to Rahul directly via the contact page.",
  prompt_injection:
    "Nice try — my instructions stay put. Ask me anything about Rahul's work, though.",
  leak: "Let's keep this about Rahul. What would you like to know about his work?",
};

/** Links in answers must point to this site or Rahul's known profiles. */
export function sanitizeLinks(md: string, allowedHosts: string[]): string {
  return md.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text: string, href: string) => {
    if (href.startsWith("/") || href.startsWith("mailto:")) return m;
    try {
      const u = new URL(href);
      return allowedHosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`)) ? m : text;
    } catch {
      return text;
    }
  });
}
