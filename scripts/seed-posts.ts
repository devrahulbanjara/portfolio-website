/**
 * Load markdown files into the database (existing slugs are skipped).
 *   npm run seed:posts                       content/seed-posts/ → drafts
 *   npm run seed:posts -- content/posts      your published posts
 * Front matter: title, slug, excerpt, tags (comma-separated), and optionally
 * `status: published` with `date: YYYY-MM-DD` (the original publish date).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import readingTime from "reading-time";
import "./env";
import { client } from "../src/lib/db-core";

function parse(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(
    m[1].split("\n").map((l) => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
  return { meta, body: m[2].trim() + "\n" };
}

async function main() {
  const db = await client();
  const dir = path.resolve(process.argv[2] ?? path.join("content", "seed-posts"));
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const { meta, body } = parse(path.join(dir, f));
    const exists = await db.execute({ sql: "SELECT 1 FROM posts WHERE slug = ?", args: [meta.slug] });
    if (exists.rows.length) {
      console.log("· skip (exists):", meta.slug);
      continue;
    }
    const rt = readingTime(body);
    const status = meta.status === "published" ? "published" : "draft";
    const published = status === "published" ? (meta.date ? Date.parse(`${meta.date}T09:00:00+05:45`) : Date.now()) : null;
    if (published !== null && Number.isNaN(published)) throw new Error(`${f}: bad date "${meta.date}" (use YYYY-MM-DD)`);
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO posts (id, slug, title, excerpt, content, tags, status, reading_minutes, word_count, published_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [crypto.randomBytes(9).toString("base64url"), meta.slug, meta.title, meta.excerpt ?? "", body, JSON.stringify((meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean)), status, Math.max(1, Math.round(rt.minutes)), rt.words, published, published ?? now, now],
    });
    console.log(`✓ ${status}:`, meta.title);
  }
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
