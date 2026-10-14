import "server-only";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get, run } from "./db";
import { setting, setSettingTyped } from "./settings";
import { SESSION_COOKIE, SESSION_TTL_S, signSession, verifySession } from "./session";
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
  // Rotating the password invalidates every existing session.
  await setSettingTyped("admin_session_epoch", crypto.randomUUID());
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

  const sid = `${await setting("admin_session_epoch")}.${crypto.randomUUID()}`;
  const token = await signSession(sid);
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

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  await audit("logout", null, {});
}

/** Returns the session if valid and not revoked by a password rotation. */
export async function currentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  const epoch = await setting("admin_session_epoch");
  if (!session.sid.startsWith(`${epoch}.`)) return null;
  return session;
}

/** Defense in depth: every admin page and action calls this, not just proxy.ts. */
export async function requireAdmin() {
  const s = await currentAdmin();
  if (!s) redirect("/admin/login");
  return s;
}
