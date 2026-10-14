import "server-only";
import { nanoid } from "nanoid";
import { get, run, batch, type Value } from "@/lib/db";
import { PostInput } from "@/lib/schemas/content";
import { readingStats, slugify, plainExcerpt } from "@/lib/markdown";
import { POSTS_TAG, postTag } from "@/lib/posts";

/**
 * The one place posts are written. Used by the admin editor (server action)
 * and by the admin assistant (route handler) — same validation, same rules.
 * `invalidate` is updateTag in actions, revalidateTag(…, { expire: 0 }) elsewhere.
 */
export type Invalidate = (tag: string) => void;

export type UpsertResult = { ok: true; id: string; slug: string; created: boolean; status: string } | { ok: false; message: string; errors: Record<string, string> };

export async function upsertPost(raw: unknown, invalidate: Invalidate): Promise<UpsertResult> {
  const parsed = PostInput.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const p = parsed.data;
  const slug = p.slug || slugify(p.title);
  const clash = await get<{ id: string }>("SELECT id FROM posts WHERE slug = ? AND id != ?", slug, p.id ?? "");
  if (clash) return { ok: false, message: "Another post already uses that URL slug.", errors: { slug: "Slug already in use" } };

  const { minutes, words } = readingStats(p.content);
  const now = Date.now();
  const excerpt = p.excerpt || plainExcerpt(p.content);
  const publishedAt = p.status === "draft" ? (p.publishedAt ?? null) : (p.publishedAt ?? now);
  const existing = p.id ? await get<{ slug: string; title: string; content: string }>("SELECT slug, title, content FROM posts WHERE id = ?", p.id) : undefined;
  if (p.id && !existing) return { ok: false, message: "That post no longer exists.", errors: {} };
  const id = p.id ?? nanoid(12);

  const fields: Value[] = [
    slug, p.title, excerpt, p.content, p.coverUrl ?? null, p.coverAlt ?? null, JSON.stringify(p.tags), p.status, p.featured ? 1 : 0,
    p.seoTitle ?? null, p.seoDescription ?? null, p.canonicalUrl ?? null, minutes, words, publishedAt,
  ];
  if (existing) {
    // Keep a revision whenever the body or title changes; both writes commit together.
    const statements: { sql: string; args: Value[] }[] = [];
    if (existing.content !== p.content || existing.title !== p.title)
      statements.push({ sql: "INSERT INTO post_revisions (post_id, title, content, created_at) VALUES (?, ?, ?, ?)", args: [id, existing.title, existing.content, now] });
    statements.push({
      sql: `UPDATE posts SET slug=?, title=?, excerpt=?, content=?, cover_url=?, cover_alt=?, tags=?, status=?, featured=?, seo_title=?, seo_description=?, canonical_url=?,
            reading_minutes=?, word_count=?, published_at=?, updated_at=? WHERE id=?`,
      args: [...fields, now, id],
    });
    await batch(statements);
  } else {
    await run(
      `INSERT INTO posts (slug, title, excerpt, content, cover_url, cover_alt, tags, status, featured, seo_title, seo_description, canonical_url,
        reading_minutes, word_count, published_at, id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ...fields,
      id,
      now,
      now,
    );
  }

  invalidate(POSTS_TAG);
  invalidate(postTag(slug));
  if (existing && existing.slug !== slug) invalidate(postTag(existing.slug));
  return { ok: true, id, slug, created: !existing, status: p.status };
}

export async function removePost(id: string, invalidate: Invalidate) {
  const row = await get<{ slug: string }>("SELECT slug FROM posts WHERE id = ?", id);
  if (!row) return null;
  await run("DELETE FROM posts WHERE id = ?", id);
  invalidate(POSTS_TAG);
  invalidate(postTag(row.slug));
  return row.slug;
}
