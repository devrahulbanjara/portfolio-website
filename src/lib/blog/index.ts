import "server-only";

import { HashnodeError, getPublicationHost, hashnodeRequest } from "./hashnode/client";
import { POSTS_QUERY, POST_QUERY } from "./hashnode/queries";
import { type HashnodePostNode, toPost, toSummary } from "./hashnode/map";
import {
  snapshotIsEmpty,
  snapshotPost,
  snapshotSummaries,
} from "./snapshot";
import type { BlogPost, BlogPostSummary, BlogResult, Tag } from "./types";

export type { BlogPost, BlogPostSummary, BlogResult, Tag } from "./types";

/**
 * Blog data access.
 *
 * Every function returns a BlogResult carrying which source answered, so pages
 * can render a degraded-state notice and logs can distinguish "no posts" from
 * "Hashnode unavailable". See ./snapshot for why the fallback is committed.
 */

/** Posts change rarely; the webhook handles freshness. */
const REVALIDATE_SECONDS = 3600;
const PAGE_SIZE = 20;
/** Guards against an unbounded loop if pageInfo ever misbehaves. */
const MAX_PAGES = 25;

function logFallback(scope: string, error: unknown) {
  const message =
    error instanceof HashnodeError
      ? `${error.kind}: ${error.message}`
      : String(error);
  // Loud on purpose. Serving stale content silently is how a lapsed
  // subscription goes unnoticed for weeks.
  console.warn(`[blog] ${scope} falling back to snapshot -> ${message}`);
}

interface PostsResponse {
  publication: {
    posts: {
      edges: { node: HashnodePostNode }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
}

async function fetchAllFromHashnode(): Promise<HashnodePostNode[]> {
  const host = getPublicationHost();
  if (!host) throw new HashnodeError("Publication host not set", "unconfigured");

  const nodes: HashnodePostNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data: PostsResponse = await hashnodeRequest<PostsResponse>(
      POSTS_QUERY,
      { host, first: PAGE_SIZE, after },
      REVALIDATE_SECONDS,
    );

    if (!data.publication) {
      throw new HashnodeError(
        `No publication found for host "${host}"`,
        "graphql",
      );
    }

    nodes.push(...data.publication.posts.edges.map((e) => e.node));

    const { hasNextPage, endCursor } = data.publication.posts.pageInfo;
    if (!hasNextPage || !endCursor) break;
    after = endCursor;
  }

  return nodes;
}

/**
 * All posts, newest first, without bodies.
 *
 * Fetch-all rather than cursor-paging the UI: at current volume it is one or
 * two requests, it makes local pagination and tag filtering trivial, and it is
 * what lets the snapshot be a complete mirror. Revisit past ~100 posts.
 */
export async function listPosts(): Promise<BlogResult<BlogPostSummary[]>> {
  try {
    const nodes = await fetchAllFromHashnode();
    const data = nodes
      .map(toSummary)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    return { data, source: "hashnode" };
  } catch (error) {
    logFallback("listPosts", error);
    return {
      data: snapshotSummaries().sort(
        (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
      ),
      source: "snapshot",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

interface PostResponse {
  publication: { post: HashnodePostNode | null } | null;
}

/** One post with its body, or null when the slug does not exist anywhere. */
export async function getPost(
  slug: string,
): Promise<BlogResult<BlogPost | null>> {
  const host = getPublicationHost();

  if (host) {
    try {
      const data = await hashnodeRequest<PostResponse>(
        POST_QUERY,
        { host, slug },
        REVALIDATE_SECONDS,
      );
      const node = data.publication?.post ?? null;
      if (node) return { data: toPost(node), source: "hashnode" };
      // Reached Hashnode successfully and it genuinely has no such post. Still
      // check the snapshot: a post could have been unpublished by accident.
    } catch (error) {
      logFallback(`getPost(${slug})`, error);
    }
  }

  return { data: snapshotPost(slug), source: "snapshot" };
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
 * category +5. Series is the closest analogue to category here.
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
      if (post.series && candidate.series?.slug === post.series.slug) score += 5;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
