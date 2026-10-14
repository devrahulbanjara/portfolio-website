import { TrackPayload } from "@/lib/schemas/analytics";
import { run, get } from "@/lib/db";
import { clientIp, clientCountry, visitorHash, parseUA } from "@/lib/request";
import { logError } from "@/lib/audit";
import { hit } from "@/lib/agent/guardrails";

/**
 * First-party analytics beacon (short path on purpose — fewer blocklist hits).
 * No cookies; visitor ids are daily-rotating salted hashes.
 */
export async function POST(req: Request) {
  const text = await req.text().catch(() => "");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = TrackPayload.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });
  const p = parsed.data;

  const h = req.headers;
  const ua = h.get("user-agent") ?? "";
  const ip = clientIp(h);
  const now = Date.now();

  // Skip the owner's own browsing when they're logged into admin.
  const isAdmin = (h.get("cookie") ?? "").includes("rdb_admin=");

  switch (p.k) {
    case "pv": {
      if (p.path.startsWith("/admin") || isAdmin) return Response.json({ id: 0 });
      const u = parseUA(ua);
      let refHost: string | null = null;
      let utm = { source: null as string | null, medium: null as string | null, campaign: null as string | null };
      try {
        const url = new URL(p.path, "http://x");
        utm = { source: url.searchParams.get("utm_source"), medium: url.searchParams.get("utm_medium"), campaign: url.searchParams.get("utm_campaign") };
      } catch {}
      if (p.ref) {
        try {
          const r = new URL(p.ref);
          if (r.host !== h.get("host")) refHost = r.hostname.replace(/^www\./, "");
        } catch {}
      }
      const cleanPath = p.path.split("?")[0].split("#")[0] || "/";
      const res = await run(
        `INSERT INTO page_views (ts, path, title, referrer, ref_host, utm_source, utm_medium, utm_campaign, visitor_id, session_id, country, timezone, lang, browser, os, device, screen, is_bot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        now,
        cleanPath,
        p.title ?? null,
        refHost ? p.ref!.slice(0, 500) : null,
        refHost,
        utm.source,
        utm.medium,
        utm.campaign,
        visitorHash(ip, ua),
        p.sid,
        clientCountry(h),
        p.tz ?? null,
        p.lang ?? null,
        u.browser,
        u.os,
        u.device,
        p.screen ?? null,
        u.isBot ? 1 : 0,
      );
      return Response.json({ id: Number(res.lastInsertRowid) });
    }
    case "ping": {
      // Only the session that created the view may update it.
      const row = await get<{ session_id: string }>("SELECT session_id FROM page_views WHERE id = ?", p.id);
      if (row?.session_id === p.sid) await run("UPDATE page_views SET duration_ms = ?, scroll_depth = MAX(COALESCE(scroll_depth, 0), ?) WHERE id = ?", p.ms, p.scroll, p.id);
      break;
    }
    case "ev": {
      if (isAdmin) break;
      await run(
        "INSERT INTO events (ts, name, path, session_id, visitor_id, props) VALUES (?, ?, ?, ?, ?, ?)",
        now,
        p.name,
        p.path,
        p.sid,
        visitorHash(ip, ua),
        p.props ? JSON.stringify(p.props).slice(0, 2000) : null,
      );
      break;
    }
    case "vital":
      if (!isAdmin) await run("INSERT INTO vitals (ts, path, name, value, rating) VALUES (?, ?, ?, ?, ?)", now, p.path, p.name, p.value, p.rating ?? null);
      break;
    case "err":
      if (await hit(`err:${visitorHash(ip, ua)}`, 20, 3600_000)) await logError("client", p.message, { stack: p.stack, path: p.path, ua });
      break;
  }
  return new Response(null, { status: 204 });
}
