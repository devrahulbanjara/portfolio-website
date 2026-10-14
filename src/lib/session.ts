// Session primitives. No `server-only` import: proxy.ts uses this too.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rdb_admin" : "rdb_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days, fixed from sign-in

let cachedKey: Uint8Array | null = null;

/** AUTH_SECRET from env (signs admin-assistant proposals, salts visitor hashes); in development falls back to a generated secret persisted in DATA_DIR. */
export function secretKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  let secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production (openssl rand -base64 48)");
    }
    const dir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "data"));
    const file = path.join(dir, ".auth-secret");
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString("base64"), { mode: 0o600 });
    secret = fs.readFileSync(file, "utf8").trim();
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

/**
 * Admin sessions live in the database (table admin_sessions). The cookie holds
 * only a random 256-bit token; the database stores its SHA-256, so a leaked
 * database can't be replayed as a login. Each session expires 7 days after
 * sign-in, can be revoked at any time, and all end when the password changes.
 */
export const newSessionToken = () => crypto.randomBytes(32).toString("base64url");
export const hashSessionToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
/** Cheap shape check for the proxy; the real lookup happens in currentAdmin(). */
export const looksLikeSessionToken = (token: string | undefined): token is string => !!token && /^[\w-]{43}$/.test(token);
