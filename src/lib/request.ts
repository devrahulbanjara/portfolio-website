import "server-only";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export function clientIp(h: Headers): string {
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "0.0.0.0"
  );
}

/** Country from whichever edge sits in front of us (Cloudflare, Vercel, or a reverse proxy header). */
export function clientCountry(h: Headers): string | null {
  const c = h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? h.get("x-country-code");
  return c && c !== "XX" && c !== "T1" ? c.toUpperCase() : null;
}

/**
 * Privacy-friendly visitor id: a salted hash of IP + UA that rotates daily
 * (same approach as Plausible). No cookies, no stored IPs.
 */
export function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.AUTH_SECRET ?? "dev-salt";
  return crypto.createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);
}

export function ipHash(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? "dev-salt";
  return crypto.createHash("sha256").update(`${salt}|ip|${ip}`).digest("hex").slice(0, 16);
}

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function parseUA(ua: string) {
  const r = new UAParser(ua).getResult();
  const device = r.device.type === "mobile" ? "mobile" : r.device.type === "tablet" ? "tablet" : "desktop";
  return {
    browser: r.browser.name ?? "Unknown",
    os: r.os.name ?? "Unknown",
    device,
    isBot: BOT_RE.test(ua),
  };
}

export async function requestMeta() {
  const h = await headers();
  const ip = clientIp(h);
  const ua = h.get("user-agent") ?? "";
  return { ip, ua, country: clientCountry(h), headers: h };
}
