import "server-only";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { all, get, run } from "./db";
import { setting, setSettingTyped } from "./settings";
import { SESSION_COOKIE, SESSION_TTL_S, newSessionToken, hashSessionToken, looksLikeSessionToken } from "./session";
import { requestMeta } from "./request";
import { audit } from "./audit";

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/** Password hash lives in the DB (set via `npm run admin:password`), or ADMIN_PASSWORD_HASH env. */
async function passwordHash(): Promise<string | null> {
  return (await setting("admin_password_hash")) ?? process.env.ADMIN_PASSWORD_HASH ?? null;
}

export async function adminConfigured() {
  return (await passwordHash()) !== null;
}

export async function setAdminPassword(plain: string) {
  await setSettingTyped("admin_password_hash", await bcrypt.hash(plain, 12));
  // Changing the password ends every existing session.
  await run("DELETE FROM admin_sessions");
}

export type LoginResult = { ok: true } | { ok: false; error: string };

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rdbanjara07@gmail.com").toLowerCase();

export async function login(email: string, password: string): Promise<LoginResult> {
  const { ip, ua } = await requestMeta();
  const since = Date.now() - WINDOW_MS;
  const fails = (await get<{ n: number }>(
    "SELECT COUNT(*) n FROM login_attempts WHERE ip = ? AND ts > ? AND success = 0",
    ip,
    since,
  ))!.n;
  if (fails >= MAX_FAILS) {
    await audit("login.blocked", null, { ip, ua });
    return { ok: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  const hash = await passwordHash();
  // Always run bcrypt so response time doesn't reveal whether a password is configured.
  const pwOk = await bcrypt.compare(password, hash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  const emailOk = crypto.timingSafeEqual(Buffer.from(crypto.createHash("sha256").update(email.trim().toLowerCase()).digest()), Buffer.from(crypto.createHash("sha256").update(ADMIN_EMAIL).digest()));
  const valid = pwOk && emailOk;
  await run("INSERT INTO login_attempts (ts, ip, success) VALUES (?, ?, ?)", Date.now(), ip, valid && hash ? 1 : 0);

  if (!valid || !hash) {
    await audit("login.failed", null, { ip, ua });
    return { ok: false, error: "That email or password isn't right." };
  }

  const token = newSessionToken();
  const now = Date.now();
  await run("DELETE FROM admin_sessions WHERE expires_at <= ?", now); // housekeeping
  await run(
    "INSERT INTO admin_sessions (id, created_at, expires_at, last_seen_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
    hashSessionToken(token),
    now,
    now + SESSION_TTL_S * 1000,
    now,
    ip,
    ua?.slice(0, 300) ?? null,
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  await audit("login.success", null, { ip, ua });
  return { ok: true };
}

export type AdminSession = { id: string; createdAt: number; expiresAt: number; lastSeenAt: number; ip: string | null; userAgent: string | null };

/** The signed-in admin's session, looked up in the database. Null if missing, expired or revoked. */
export async function currentAdmin(): Promise<AdminSession | null> {
  await connection(); // always a per-request check, never prerendered
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!looksLikeSessionToken(token)) return null;
  const id = hashSessionToken(token);
  const now = Date.now();
  const row = await get<{ created_at: number; expires_at: number; last_seen_at: number; ip: string | null; user_agent: string | null }>(
    "SELECT created_at, expires_at, last_seen_at, ip, user_agent FROM admin_sessions WHERE id = ? AND expires_at > ?",
    id,
    now,
  );
  if (!row) return null;
  // Keep "last active" fresh without a write on every request.
  if (now - row.last_seen_at > 5 * 60_000) await run("UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?", now, id).catch(() => {});
  return { id, createdAt: row.created_at, expiresAt: row.expires_at, lastSeenAt: row.last_seen_at, ip: row.ip, userAgent: row.user_agent };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (looksLikeSessionToken(token)) await run("DELETE FROM admin_sessions WHERE id = ?", hashSessionToken(token));
  jar.delete(SESSION_COOKIE);
  await audit("logout", null, {});
}

export async function listSessions() {
  return all<{ id: string; created_at: number; expires_at: number; last_seen_at: number; ip: string | null; user_agent: string | null }>(
    "SELECT id, created_at, expires_at, last_seen_at, ip, user_agent FROM admin_sessions WHERE expires_at > ? ORDER BY last_seen_at DESC",
    Date.now(),
  );
}

/** Sign out one session (by id), or every session except the current one. */
export async function revokeSessions(target: { id: string } | { allExcept: string }) {
  if ("id" in target) await run("DELETE FROM admin_sessions WHERE id = ?", target.id);
  else await run("DELETE FROM admin_sessions WHERE id != ?", target.allExcept);
  await audit("sessions.revoke", "id" in target ? target.id.slice(0, 12) : "others", {});
}

/** Defense in depth: every admin page and action calls this, not just proxy.ts. */
export async function requireAdmin() {
  const s = await currentAdmin();
  if (!s) redirect("/admin/login");
  return s;
}
