import "server-only";

import { profile } from "@/lib/content";
import { BlogFeedError, type FeedOptions, fetchFeed } from "./hashnode/rss";
import { snapshotIsEmpty, snapshotPost, snapshotSummaries } from "./snapshot";
import type { BlogPost, BlogPostSummary, BlogResult, Tag } from "./types";

export type { BlogPost, BlogPostSummary, BlogResult, Tag } from "./types";

/**
 * Blog data access.
 *
 * Every function returns a BlogResult carrying which source answered, so pages
 * can render a degraded-state notice and logs can distinguish "no posts" from
 * "the feed is unreachable". See ./snapshot for why the fallback is committed.
 *
 * The feed is one request that returns full post bodies, so there is no
 * separate per-post fetch: getPost filters the same cached response listPosts
 * uses. Next dedupes it within a render pass and caches it across requests.
 */

/**
 * Ten minutes. The GraphQL path could rely on a publish webhook for instant
 * freshness; the free RSS path has no webhook, so the timer IS the freshness
 * mechanism and an hour would be too long to wait for a new post.
 */
const REVALIDATE_SECONDS = 600;

function feedOptions(): FeedOptions | null {
  const host = process.env.HASHNODE_PUBLICATION_HOST?.trim();
  if (!host) return null;

  return {
    host,
    siteUrl: profile.siteUrl,
    author: {
      name: profile.name,
      username: "devrahulbanjara",
      profilePicture: profile.avatarUrl,
    },
  };
}

function logFallback(scope: string, error: unknown) {
  const message =
    error instanceof BlogFeedError
      ? `${error.kind}: ${error.message}`
      : String(error);
  // Loud on purpose. Serving stale content silently is how a broken feed goes
  // unnoticed for weeks.
  console.warn(`[blog] ${scope} falling back to snapshot -> ${message}`);
}

async function loadPosts(): Promise<BlogResult<BlogPost[]>> {
  const options = feedOptions();

  if (!options) {
    // Not an error worth shouting about: this is the state before the blog is
    // configured at all.
    return { data: [], source: "snapshot" };
  }

  try {
    return {
      data: await fetchFeed(options, REVALIDATE_SECONDS),
      source: "feed",
    };
  } catch (error) {
    logFallback("loadPosts", error);
    return {
      data: [],
      source: "snapshot",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Merges the live feed over the snapshot.
 *
 * The feed holds only the 20 most recent posts. Once there are more than that,
 * the older ones exist ONLY in the committed snapshot - so the two must be
 * unioned, not chosen between. Live wins on slug collision, since it reflects
 * any edit made since the snapshot was taken.
 */
function mergeWithSnapshot(live: BlogPost[]): BlogPostSummary[] {
  const bySlug = new Map<string, BlogPostSummary>();
  for (const post of snapshotSummaries()) bySlug.set(post.slug, post);
  for (const post of live) {
    const { markdown: _markdown, ...summary } = post;
    bySlug.set(post.slug, summary);
  }
  return [...bySlug.values()].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

/** All known posts, newest first, without bodies. */
export async function listPosts(): Promise<BlogResult<BlogPostSummary[]>> {
  const { data, source, error } = await loadPosts();
  return { data: mergeWithSnapshot(data), source, error };
}

/** One post with its body, or null when the slug does not exist anywhere. */
export async function getPost(
  slug: string,
): Promise<BlogResult<BlogPost | null>> {
  const { data, source, error } = await loadPosts();
  const live = data.find((post) => post.slug === slug);
  if (live) return { data: live, source };

  // Either the feed is unreachable, or the post has aged out of its 20 items.
  // Both are exactly what the snapshot is for.
  return { data: snapshotPost(slug), source: "snapshot", error };
}

/**
 * Slugs for generateStaticParams.
 *
 * Never returns an empty array while the snapshot has content - that is exactly
 * the cold-build 404 this layer exists to prevent.
 */
export async function listPostSlugs(): Promise<string[]> {
  const { data, source } = await listPosts();
  if (data.length === 0 && !snapshotIsEmpty()) {
    console.warn(
      "[blog] listPostSlugs got zero posts; using snapshot to avoid 404ing live URLs",
    );
    return snapshotSummaries().map((p) => p.slug);
  }
  if (source === "snapshot") {
    console.warn("[blog] listPostSlugs served from snapshot");
  }
  return data.map((p) => p.slug);
}

/** Distinct tags across all posts, with counts, most used first. */
export async function listTags(): Promise<
  BlogResult<{ tag: Tag; count: number }[]>
> {
  const { data, source, error } = await listPosts();
  const counts = new Map<string, { tag: Tag; count: number }>();

  for (const post of data) {
    for (const tag of post.tags) {
      const existing = counts.get(tag.slug);
      if (existing) existing.count += 1;
      else counts.set(tag.slug, { tag, count: 1 });
    }
  }

  return {
    data: [...counts.values()].sort((a, b) => b.count - a.count),
    source,
    error,
  };
}

/** Posts carrying a given tag. */
export async function listPostsByTag(
  tagSlug: string,
): Promise<BlogResult<BlogPostSummary[]>> {
  const { data, source, error } = await listPosts();
  return {
    data: data.filter((p) => p.tags.some((t) => t.slug === tagSlug)),
    source,
    error,
  };
}

/**
 * Related posts, scored by tag and series overlap.
 *
 * Ported from the previous site's blog-utils, which used shared tag x2 and same
 * category +5. Series is the closest analogue to category - though the RSS feed
 * never sets it, so in practice only the tag score fires today.
 */
export async function listRelatedPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const { data } = await listPosts();
  const tagSlugs = new Set(post.tags.map((t) => t.slug));

  return data
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = candidate.tags.reduce(
        (acc, tag) => acc + (tagSlugs.has(tag.slug) ? 2 : 0),
        0,
      );
      if (post.series && candidate.series?.slug === post.series.slug)
        score += 5;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
