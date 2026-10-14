// Edge-of-request session primitives. No `server-only` import: proxy.ts uses this too.
import { SignJWT, jwtVerify } from "jose";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rdb_admin" : "rdb_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

let cachedKey: Uint8Array | null = null;

/** AUTH_SECRET from env; in development falls back to a generated secret persisted in DATA_DIR. */
export function secretKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  let secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production (openssl rand -base64 48)");
    }
    const dir = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));
    const file = path.join(dir, ".auth-secret");
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString("base64"), { mode: 0o600 });
    secret = fs.readFileSync(file, "utf8").trim();
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export type AdminSession = { sub: "admin"; sid: string; iat: number; exp: number };

export async function signSession(sid: string) {
  return new SignJWT({ sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_S}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.sub !== "admin" || typeof payload.sid !== "string") return null;
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}
