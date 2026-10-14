import "server-only";
import crypto from "node:crypto";
import { secretKey } from "@/lib/session";

/**
 * Anonymous chat sessions are server-issued and HMAC-signed, carried in an
 * httpOnly cookie. Clients never choose their session id, so one visitor can't
 * address (or read the memory of) another visitor's session.
 */
export const CHAT_COOKIE = "rdb_chat";
const TTL_S = 60 * 60 * 6;

const sign = (id: string) => crypto.createHmac("sha256", Buffer.from(secretKey())).update(`chat:${id}`).digest("base64url").slice(0, 22);

export function readChatSession(cookieHeader: string | null): string | null {
  const raw = cookieHeader?.split(/;\s*/).find((c) => c.startsWith(`${CHAT_COOKIE}=`))?.slice(CHAT_COOKIE.length + 1);
  if (!raw) return null;
  const [id, mac] = decodeURIComponent(raw).split(".");
  if (!id || !mac || !/^[A-Za-z0-9_-]{22}$/.test(id)) return null;
  const expected = sign(id);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return id;
}

export function newChatSession() {
  const id = crypto.randomBytes(16).toString("base64url"); // 22 chars, 128 bits
  const value = `${id}.${sign(id)}`;
  const cookie = `${CHAT_COOKIE}=${value}; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=${TTL_S}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  return { id, cookie };
}

export function clearChatCookie() {
  return `${CHAT_COOKIE}=; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=0`;
}
