import "server-only";

import type { PortableTextBlock } from "@portabletext/types";

import { profile } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  postBySlugQuery,
  postSlugsQuery,
  postsQuery,
  tagsWithCountsQuery,
} from "@/sanity/lib/queries";
import { readingTimeFromWordCount } from "./reading-time";
import type { BlogPost, BlogPostSummary, PostImage, Tag } from "./types";

export type { BlogPost, BlogPostSummary, PostImage, Tag } from "./types";

/**
 * Blog data access.
 *
 * The only module allowed to talk to Sanity about posts. Everything above it
 * sees plain domain types from ./types, so a CMS change stays inside this
 * directory.
 *
 * Reads are cached by src/sanity/lib/fetch, and Next dedupes identical queries
 * within a single render pass — so a page calling both getPost and listPosts
 * costs one round trip each, not one per component.
 */

/** Shape returned by the GROQ projections in src/sanity/lib/queries. */
interface RawPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  brief: string | null;
  publishedAt: string;
  updatedAt: string | null;
  coverImage: {
    url: string | null;
    alt: string | null;
    width: number | null;
    height: number | null;
    lqip: string | null;
  } | null;
  tags: { name: string; slug: string }[] | null;
  seo: {
    title: string | null;
    description: string | null;
    ogImage: string | null;
  } | null;
  wordCount: number | null;
  body?: PortableTextBlock[] | null;
}

const author = {
  name: profile.name,
  username: "devrahulbanjara",
  profilePicture: profile.avatarUrl,
};

function toImage(raw: RawPost["coverImage"]): PostImage | null {
  if (!raw?.url) return null;
  return {
    url: raw.url,
    alt: raw.alt ?? "",
    width: raw.width,
    height: raw.height,
    lqip: raw.lqip,
  };
}

function toSummary(raw: RawPost): BlogPostSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    brief: raw.brief ?? "",
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt ?? null,
    readingTimeMinutes: readingTimeFromWordCount(raw.wordCount),
    coverImage: toImage(raw.coverImage),
    author,
    tags: raw.tags ?? [],
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
      // Always this domain. The canonical URL is derived, never authored, so it
      // cannot drift from the slug.
      canonicalUrl: `${profile.siteUrl}/blogs/${raw.slug}`,
      ogImage: raw.seo?.ogImage ?? raw.coverImage?.url ?? null,
    },
  };
}

/** All visible posts, newest first, without bodies. */
export async function listPosts(): Promise<BlogPostSummary[]> {
  const raw = await sanityFetch<RawPost[]>({
    query: postsQuery,
    fallback: [],
  });
  return raw.map(toSummary);
}

/** One post with its body, or null when the slug does not resolve. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const raw = await sanityFetch<RawPost | null>({
    query: postBySlugQuery,
    params: { slug },
    fallback: null,
  });
  if (!raw) return null;

  return { ...toSummary(raw), body: raw.body ?? [] };
}

/** Slugs for generateStaticParams. */
export async function listPostSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({ query: postSlugsQuery, fallback: [] });
}

/** Tags carrying at least one visible post, most used first. */
export async function listTags(): Promise<{ tag: Tag; count: number }[]> {
  const raw = await sanityFetch<
    { name: string; slug: string; count: number }[]
  >({ query: tagsWithCountsQuery, fallback: [] });

  return raw.map(({ name, slug, count }) => ({ tag: { name, slug }, count }));
}

/**
 * Posts carrying a given tag.
 *
 * Filtered in memory off the same cached list rather than as its own query:
 * with a personal blog's volume this is free, and it keeps every tag page
 * sharing one cache entry with /blogs.
 */
export async function listPostsByTag(
  tagSlug: string,
): Promise<BlogPostSummary[]> {
  const posts = await listPosts();
  return posts.filter((post) => post.tags.some((t) => t.slug === tagSlug));
}

/**
 * Related posts, scored by tag overlap.
 *
 * Ported from the previous site's blog-utils, which used shared tag x2. Returns
 * fewer than `limit`, or nothing at all, rather than padding with unrelated
 * posts - a wrong recommendation is worse than no recommendation.
 */
export async function listRelatedPosts(
  post: Pick<BlogPost, "slug" | "tags">,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const posts = await listPosts();
  const tagSlugs = new Set(post.tags.map((t) => t.slug));
  if (tagSlugs.size === 0) return [];

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.reduce(
        (acc, tag) => acc + (tagSlugs.has(tag.slug) ? 2 : 0),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
