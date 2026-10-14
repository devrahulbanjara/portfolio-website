import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { all, get, run, readOnly } from "@/lib/db";
import { overview, analytics, series, messages, chatSessions, chatSession, errors, auditLog, satisfaction } from "@/lib/admin-data";
import { adminGetPost, safeTags } from "@/lib/posts";
import { slugify } from "@/lib/markdown";
import { upsertPost, removePost } from "@/lib/services/posts";
import { setting, setSettingTyped, EditableSettings } from "@/lib/settings";
import { resetBreaker, providerStatus } from "@/lib/agent/router";
import { audit } from "@/lib/audit";
import { secretKey } from "@/lib/session";
import { RANGE_MS } from "@/lib/schemas/analytics";
import type { ToolSpec } from "@/lib/agent/providers/types";
import { person, experience, education, certifications, teaching, projects, services } from "@/content/profile";

/* ─────────────────────────────────────────────────────────────
   The admin assistant's capabilities. Three kinds:
   - read:    runs immediately, returns data
   - safe:    small reversible writes that run immediately
   - confirm: returns a signed proposal; nothing changes until Rahul clicks Confirm
   ───────────────────────────────────────────────────────────── */

const invalidate = (tag: string) => revalidateTag(tag, { expire: 0 });
const Range = z.enum(["24h", "7d", "30d", "90d"]).catch("7d");
const Id = z.string().min(1).max(40);

const PostFields = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(400_000),
  excerpt: z.string().max(400).optional(),
  tags: z.array(z.string().max(32)).max(12).optional(),
  slug: z.string().max(100).optional(),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(200).optional(),
});

type Kind = "read" | "safe" | "confirm";
type ToolDef<A extends z.ZodType> = {
  kind: Kind;
  spec: Omit<ToolSpec, "name">;
  args: A;
  /** for confirm tools: a human summary of the proposal */
  describe?: (a: z.infer<A>) => Promise<{ title: string; detail: string; danger?: boolean }>;
  run: (a: z.infer<A>) => Promise<unknown>;
};
const def = <A extends z.ZodType>(d: ToolDef<A>) => d;

/* ── read-only SQL inside a read transaction (the database rejects any write) ── */
async function readOnlyQuery(sql: string) {
  const q = sql.trim().replace(/;+\s*$/, "");
  if (!/^(select|with)\b/i.test(q) || /;/.test(q) || /\b(attach|detach|pragma|vacuum|insert|update|delete|drop|alter|create|replace)\b/i.test(q))
    throw new Error("Only a single SELECT query is allowed.");
  const rows = await readOnly((query) => query(`SELECT * FROM (${q}) LIMIT 200`));
  return { rows, count: rows.length, note: rows.length === 200 ? "Truncated to 200 rows." : undefined };
}

const SCHEMA = `posts(id, slug, title, excerpt, content, tags JSON, status draft|published|scheduled, featured, reading_minutes, word_count, published_at ms, created_at, updated_at)
page_views(ts ms, path, title, referrer, ref_host, utm_source, utm_medium, utm_campaign, visitor_id, session_id, country, timezone, lang, browser, os, device, screen, duration_ms, scroll_depth, is_bot)
events(ts, name, path, session_id, visitor_id, props JSON)
vitals(ts, path, name LCP|INP|CLS|FCP|TTFB, value, rating)
chat_sessions(id, visitor_id, country, user_agent, path, created_at, last_at, turns, flagged)
chat_turns(id, session_id, ts, user_message, answer, model, verdict ok|declined|blocked|error|aborted, verdict_reason, steps JSON, latency_ms, ttft_ms, input_tokens, output_tokens, feedback 1|-1|null)
contact_messages(id, ts, name, email, topic, message, read, archived)
error_log(ts, source, level, message, stack, path)
audit_log(ts, action, target, ip, meta)`;

export const TOOLS = {
  /* ── read ─────────────────────────────────────────── */
  get_profile: def({
    kind: "read",
    spec: { description: "Rahul's real background from the site: bio, current and past roles with highlights, education, certifications, teaching, projects (projects are placeholders until he replaces them). Use before writing anything about him.", parameters: { type: "object", properties: {} } },
    args: z.object({}),
    run: async () => ({
      person: { name: person.name, role: person.role, secondaryRole: person.secondaryRole, location: person.location, intro: person.intro, about: person.about },
      experience: experience.map((e) => ({ company: e.company, role: e.role, start: e.start, end: e.end, summary: e.summary, highlights: e.highlights, stack: e.stack })),
      education,
      certifications: certifications.map((c) => ({ name: c.name, issuer: c.issuer, issued: c.issued })),
      teaching: teaching.courses.map((c) => ({ title: c.title, description: c.description })),
      projects: { note: "PLACEHOLDER data — do not cite these as real work", items: projects.map((p) => ({ title: p.title, tagline: p.tagline })) },
      services: services.map((s) => s.title),
    }),
  }),
  get_overview: def({
    kind: "read",
    spec: { description: "Headline numbers for a period: visitors, pageviews, assistant questions, unread messages, errors, avg time on page, helpful rating.", parameters: { type: "object", properties: { range: { type: "string", enum: ["24h", "7d", "30d", "90d"] } } } },
    args: z.object({ range: Range.optional() }),
    run: async ({ range = "7d" }) => ({ range, ...(await overview(RANGE_MS[range])), satisfaction: await satisfaction(RANGE_MS[range]), models: await providerStatus() }),
  }),
  get_analytics: def({
    kind: "read",
    spec: { description: "Traffic breakdowns for a period: top pages (views, avg time, scroll), referrers, countries, time zones, devices, browsers, OS, button/link events, Core Web Vitals p75, bot count.", parameters: { type: "object", properties: { range: { type: "string", enum: ["24h", "7d", "30d", "90d"] } } } },
    args: z.object({ range: Range.optional() }),
    run: async ({ range = "7d" }) => ({ range, ...(await analytics(RANGE_MS[range])) }),
  }),
  get_traffic_series: def({
    kind: "read",
    spec: { description: "Pageviews, visitors and chats over time, in buckets.", parameters: { type: "object", properties: { range: { type: "string", enum: ["24h", "7d", "30d", "90d"] } } } },
    args: z.object({ range: Range.optional() }),
    run: async ({ range = "7d" }) => (await series(RANGE_MS[range], range === "24h" ? 24 : 30)).map((b) => ({ ...b, at: new Date(b.t).toISOString() })),
  }),
  list_messages: def({
    kind: "read",
    spec: { description: "Contact messages (inbox or archived), newest first.", parameters: { type: "object", properties: { view: { type: "string", enum: ["inbox", "archived"] } } } },
    args: z.object({ view: z.enum(["inbox", "archived"]).catch("inbox").optional() }),
    run: async ({ view = "inbox" }) => (await messages(view)).map((m) => ({ ...m, at: new Date(m.ts).toISOString() })),
  }),
  list_conversations: def({
    kind: "read",
    spec: { description: "Visitor conversations with the public assistant: first question, turns, feedback counts, country.", parameters: { type: "object", properties: { filter: { type: "string", enum: ["all", "flagged", "helpful", "unhelpful"] } } } },
    args: z.object({ filter: z.enum(["all", "flagged", "helpful", "unhelpful"]).catch("all").optional() }),
    run: async ({ filter = "all" }) => (await chatSessions(filter)).slice(0, 60),
  }),
  read_conversation: def({
    kind: "read",
    spec: { description: "One conversation in full: every question, answer, verdict, model, latency, tokens, feedback and trace steps.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    args: z.object({ id: Id }),
    run: async ({ id }) => (await chatSession(id)) ?? { error: "Not found" },
  }),
  list_posts: def({
    kind: "read",
    spec: { description: "All blog posts with id, slug, title, status, tags, views and dates.", parameters: { type: "object", properties: {} } },
    args: z.object({}),
    run: async () => {
      const rows = await all<{ id: string; slug: string; title: string; status: string; tags: string; published_at: number | null; updated_at: number; word_count: number; views: number }>(
        `SELECT p.id, p.slug, p.title, p.status, p.tags, p.published_at, p.updated_at, p.word_count,
                (SELECT COUNT(*) FROM page_views v WHERE v.path = '/blog/' || p.slug AND v.is_bot = 0) views
         FROM posts p ORDER BY COALESCE(p.published_at, p.updated_at) DESC`,
      );
      return rows.map((p) => ({ ...p, tags: safeTags(p.tags) }));
    },
  }),
  read_post: def({
    kind: "read",
    spec: { description: "Read one post in full (markdown body and all fields).", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    args: z.object({ id: Id }),
    run: async ({ id }) => {
      const p = await adminGetPost(id);
      return p ? { ...p, tags: safeTags(p.tags) } : { error: "Not found" };
    },
  }),
  get_logs: def({
    kind: "read",
    spec: { description: "Recent errors (grouped, with counts) and the admin audit log.", parameters: { type: "object", properties: {} } },
    args: z.object({}),
    run: async () => ({ errors: await errors(40), audit: await auditLog(40) }),
  }),
  get_settings: def({
    kind: "read",
    spec: { description: "Current site settings for the public assistant.", parameters: { type: "object", properties: {} } },
    args: z.object({}),
    run: async () => ({
      chat_enabled: await setting("chat_enabled"),
      chat_limit_burst: await setting("chat_limit_burst"),
      chat_limit_daily_visitor: await setting("chat_limit_daily_visitor"),
      chat_limit_daily_global: await setting("chat_limit_daily_global"),
      llm_force_provider: await setting("llm_force_provider"),
      agent_extra_instructions: await setting("agent_extra_instructions"),
      availability_open: await setting("availability_open"),
    }),
  }),
  query_database: def({
    kind: "read",
    spec: {
      description: `Run ONE read-only SQL SELECT on the site's SQLite database for any custom analysis (max 200 rows). Times are epoch milliseconds; use datetime(ts/1000,'unixepoch'). Tables:\n${SCHEMA}`,
      parameters: { type: "object", properties: { sql: { type: "string" } }, required: ["sql"] },
    },
    args: z.object({ sql: z.string().min(6).max(4000) }),
    run: async ({ sql }) => readOnlyQuery(sql),
  }),

  /* ── safe writes (run immediately) ────────────────── */
  create_draft_post: def({
    kind: "safe",
    spec: {
      description: "Create a NEW blog post as a DRAFT (never published by this tool). Write the full body in markdown. Returns its id.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string", description: "Full markdown body" },
          excerpt: { type: "string", description: "1–2 sentence summary" },
          tags: { type: "array", items: { type: "string" } },
          seoTitle: { type: "string" },
          seoDescription: { type: "string" },
        },
        required: ["title", "content"],
      },
    },
    args: PostFields,
    run: async (a) => {
      // The page renders the title itself; drop a duplicated "# Title" first line.
      const content = a.content.replace(/^\s*#\s+(.+)\n+/, (m, h: string) => (h.trim().toLowerCase() === a.title.trim().toLowerCase() ? "" : m));
      // A new draft never fails on a taken URL: use the next free "-2", "-3", … slug.
      const base = a.slug || slugify(a.title);
      let slug = base;
      for (let n = 2; await get("SELECT 1 FROM posts WHERE slug = ?", slug); n++) slug = `${base}-${n}`;
      const res = await upsertPost({ ...a, slug, content, status: "draft", tags: a.tags ?? [] }, invalidate);
      if (res.ok) await audit("agent.action", res.id, { action: "create_draft_post", title: a.title });
      return res.ok ? { created: true, id: res.id, slug: res.slug, editUrl: `/admin/posts/${res.id}` } : res;
    },
  }),
  mark_message: def({
    kind: "safe",
    spec: { description: "Mark a contact message read/unread or archived/unarchived.", parameters: { type: "object", properties: { id: { type: "string" }, read: { type: "boolean" }, archived: { type: "boolean" } }, required: ["id"] } },
    args: z.object({ id: Id, read: z.boolean().optional(), archived: z.boolean().optional() }),
    run: async ({ id, read, archived }) => {
      if (read !== undefined) await run("UPDATE contact_messages SET read = ? WHERE id = ?", read ? 1 : 0, id);
      if (archived !== undefined) await run("UPDATE contact_messages SET archived = ? WHERE id = ?", archived ? 1 : 0, id);
      return { ok: true };
    },
  }),
  reset_model_cooldowns: def({
    kind: "safe",
    spec: { description: "Clear rate-limit cooldowns on the public assistant's models.", parameters: { type: "object", properties: {} } },
    args: z.object({}),
    run: async () => {
      await resetBreaker();
      await audit("llm.breaker.reset", null, { by: "assistant" });
      return { ok: true };
    },
  }),

  /* ── confirm-first writes ─────────────────────────── */
  update_post: def({
    kind: "confirm",
    spec: {
      description: "Propose edits to an existing post (only the fields given change). Rahul must confirm. Read the post first.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" }, title: { type: "string" }, content: { type: "string" }, excerpt: { type: "string" }, tags: { type: "array", items: { type: "string" } }, slug: { type: "string" }, seoTitle: { type: "string" }, seoDescription: { type: "string" } },
        required: ["id"],
      },
    },
    args: PostFields.partial().extend({ id: Id }),
    describe: async (a) => {
      const changed = Object.keys(a).filter((k) => k !== "id");
      return { title: `Edit post “${(await adminGetPost(a.id))?.title ?? a.id}”`, detail: `Changes: ${changed.join(", ") || "nothing"}` };
    },
    run: async (a) => {
      const cur = await adminGetPost(a.id);
      if (!cur) return { error: "Not found" };
      const res = await upsertPost(
        {
          id: cur.id,
          title: a.title ?? cur.title,
          slug: a.slug ?? cur.slug,
          excerpt: a.excerpt ?? cur.excerpt,
          content: a.content ?? cur.content,
          coverUrl: cur.cover_url,
          coverAlt: cur.cover_alt,
          tags: a.tags ?? safeTags(cur.tags),
          status: cur.status,
          featured: !!cur.featured,
          publishedAt: cur.published_at,
          seoTitle: a.seoTitle ?? cur.seo_title,
          seoDescription: a.seoDescription ?? cur.seo_description,
          canonicalUrl: cur.canonical_url,
        },
        invalidate,
      );
      return res.ok ? { updated: true, slug: res.slug } : res;
    },
  }),
  set_post_status: def({
    kind: "confirm",
    spec: {
      description: "Propose publishing, scheduling or unpublishing (back to draft) a post. For scheduling, give publishAt as an ISO date-time. Rahul must confirm.",
      parameters: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["published", "scheduled", "draft"] }, publishAt: { type: "string" } }, required: ["id", "status"] },
    },
    args: z.object({ id: Id, status: z.enum(["published", "scheduled", "draft"]), publishAt: z.string().max(40).optional() }),
    describe: async (a) => {
      const t = (await adminGetPost(a.id))?.title ?? a.id;
      return {
        title: a.status === "published" ? `Publish “${t}”` : a.status === "scheduled" ? `Schedule “${t}”` : `Unpublish “${t}”`,
        detail: a.status === "scheduled" ? `Goes live ${a.publishAt ? new Date(a.publishAt).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" }) : "(no date given)"} (Kathmandu time)` : a.status === "published" ? "It will be visible on the site and in search right away." : "It will disappear from the site.",
      };
    },
    run: async (a) => {
      const cur = await adminGetPost(a.id);
      if (!cur) return { error: "Not found" };
      const at = a.status === "scheduled" ? Date.parse(a.publishAt ?? "") : a.status === "published" ? (cur.published_at && cur.status !== "draft" ? cur.published_at : Date.now()) : cur.published_at;
      const res = await upsertPost(
        {
          id: cur.id, title: cur.title, slug: cur.slug, excerpt: cur.excerpt, content: cur.content, coverUrl: cur.cover_url, coverAlt: cur.cover_alt,
          tags: safeTags(cur.tags), status: a.status, featured: !!cur.featured, publishedAt: Number.isFinite(at) ? at : null,
          seoTitle: cur.seo_title, seoDescription: cur.seo_description, canonicalUrl: cur.canonical_url,
        },
        invalidate,
      );
      return res.ok ? { ok: true, status: a.status, url: `/blog/${res.slug}` } : res;
    },
  }),
  delete_post: def({
    kind: "confirm",
    spec: { description: "Propose permanently deleting a post. Rahul must confirm.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    args: z.object({ id: Id }),
    describe: async (a) => ({ title: `Delete “${(await adminGetPost(a.id))?.title ?? a.id}”`, detail: "This can't be undone.", danger: true }),
    run: async ({ id }) => ({ deleted: !!(await removePost(id, invalidate)) }),
  }),
  delete_message: def({
    kind: "confirm",
    spec: { description: "Propose permanently deleting a contact message. Rahul must confirm.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    args: z.object({ id: Id }),
    describe: async (a) => {
      const m = await get<{ name: string }>("SELECT name FROM contact_messages WHERE id = ?", a.id);
      return { title: `Delete message from ${m?.name ?? "unknown"}`, detail: "This can't be undone.", danger: true };
    },
    run: async ({ id }) => ({ deleted: (await run("DELETE FROM contact_messages WHERE id = ?", id)).changes > 0 }),
  }),
  update_settings: def({
    kind: "confirm",
    spec: {
      description: "Propose changing public-assistant settings. Rahul must confirm.",
      parameters: {
        type: "object",
        properties: {
          chat_enabled: { type: "boolean" },
          chat_limit_burst: { type: "number" },
          chat_limit_daily_visitor: { type: "number" },
          chat_limit_daily_global: { type: "number" },
          llm_force_provider: { type: "string", enum: ["auto", "gemini", "groq"] },
          agent_extra_instructions: { type: "string" },
          availability_open: { type: "boolean" },
        },
      },
    },
    args: EditableSettings.partial(),
    describe: async (a) => ({ title: "Change settings", detail: Object.entries(a).map(([k, v]) => `${k} → ${JSON.stringify(v)}`).join(", ") }),
    run: async (a) => {
      for (const [k, v] of Object.entries(a)) if (v !== undefined) await setSettingTyped(k as keyof typeof a, v as never);
      return { ok: true };
    },
  }),
} as const;

export type AdminToolName = keyof typeof TOOLS;
export const TOOL_SPECS: ToolSpec[] = Object.entries(TOOLS).map(([name, t]) => ({ name, ...t.spec }));

/* ── signed, single-use proposals for confirm-first tools ── */
const usedTokens = new Map<string, number>();
const sign = (body: string) => crypto.createHmac("sha256", Buffer.from(secretKey())).update(`admin-action:${body}`).digest("base64url");

export function proposal(name: AdminToolName, args: unknown) {
  const body = Buffer.from(JSON.stringify({ name, args, exp: Date.now() + 15 * 60_000, n: crypto.randomUUID() })).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify a proposal token and run it. Each token works once and expires after 15 minutes. */
export async function executeProposal(token: string) {
  const [body, mac] = token.split(".");
  if (!body || !mac) throw new Error("Invalid action");
  const expected = sign(body);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) throw new Error("Invalid action");
  const { name, args, exp, n } = JSON.parse(Buffer.from(body, "base64url").toString()) as { name: AdminToolName; args: unknown; exp: number; n: string };
  if (Date.now() > exp) throw new Error("This proposal expired — ask again.");
  if (usedTokens.has(n)) throw new Error("This action was already done.");
  for (const [k, t] of usedTokens) if (t < Date.now()) usedTokens.delete(k);
  usedTokens.set(n, exp);
  const tool = TOOLS[name];
  if (!tool || tool.kind !== "confirm") throw new Error("Unknown action");
  const parsed = (tool.args as z.ZodType).parse(args);
  const result = await (tool.run as (a: unknown) => Promise<unknown>)(parsed);
  await audit("agent.action", null, { action: name, args: JSON.stringify(parsed).slice(0, 500) });
  return result;
}
