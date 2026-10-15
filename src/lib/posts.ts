import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { all, get, safely } from "./db";
import { renderMarkdown, type TocItem } from "./markdown";

export type PostStatus = "draft" | "published" | "scheduled";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  highlights: string;
  cover_url: string | null;
  cover_alt: string | null;
  tags: string;
  status: PostStatus;
  featured: number;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  reading_minutes: number;
  word_count: number;
  published_at: number | null;
  created_at: number;
  updated_at: number;
};

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  tags: string[];
  featured: boolean;
  readingMinutes: number;
  publishedAt: number;
  updatedAt: number;
};

export type Post = PostSummary & {
  html: string;
  highlights: string[];
  toc: TocItem[];
  wordCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
};

export const POSTS_TAG = "posts";
export const postTag = (slug: string) => `post:${slug}`;

/** "Live" = published, or scheduled with a publish time in the past. */
const LIVE = "(status = 'published' OR status = 'scheduled') AND published_at IS NOT NULL AND published_at <= ?";

function toSummary(r: PostRow): PostSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    coverUrl: r.cover_url,
    coverAlt: r.cover_alt,
    tags: safeTags(r.tags),
    featured: !!r.featured,
    readingMinutes: r.reading_minutes,
    publishedAt: r.published_at ?? r.created_at,
    updatedAt: r.updated_at,
  };
}

/** One highlight per line; leading list markers ("- ", "* ", "• ", "1. ") are optional. */
export function parseHighlights(s: string | null | undefined): string[] {
  return (s ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

export function safeTags(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("minutes"); // lets scheduled posts appear without a manual publish
  const rows = await safely(() => all<PostRow>(`SELECT * FROM posts WHERE ${LIVE} ORDER BY published_at DESC`, Date.now()), [], "posts");
  return rows.map(toSummary);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag(POSTS_TAG, postTag(slug));
  cacheLife("minutes");
  const r = await safely(() => get<PostRow>(`SELECT * FROM posts WHERE slug = ? AND ${LIVE}`, slug, Date.now()), undefined, "posts");
  if (!r) return null;
  const { html, toc } = await renderMarkdown(r.content);
  return {
    ...toSummary(r),
    html,
    toc,
    highlights: parseHighlights(r.highlights),
    wordCount: r.word_count,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    canonicalUrl: r.canonical_url,
  };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const m = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

/** Related posts by shared tags, falling back to most recent. */
export async function getRelatedPosts(slug: string, tags: string[], n = 3) {
  const posts = (await getPublishedPosts()).filter((p) => p.slug !== slug);
  return posts
    .map((p) => ({ p, score: p.tags.filter((t) => tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.publishedAt - a.p.publishedAt)
    .slice(0, n)
    .map((x) => x.p);
}

/* ── Admin (uncached) ───────────────────────────────────────────── */

export async function adminListPosts() {
  return all<PostRow & { views: number }>(
    `SELECT p.*, (SELECT COUNT(*) FROM page_views v WHERE v.path = '/blog/' || p.slug AND v.is_bot = 0) AS views
     FROM posts p ORDER BY COALESCE(p.published_at, p.updated_at) DESC`,
  );
}

export async function adminGetPost(id: string) {
  return (await get<PostRow>("SELECT * FROM posts WHERE id = ?", id)) ?? null;
}
