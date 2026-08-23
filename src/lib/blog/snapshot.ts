import snapshotJson from "../../../content/posts-snapshot.json";
import type { BlogPost, BlogPostSummary } from "./types";

/**
 * Build-time fallback for blog content.
 *
 * WHY THIS EXISTS
 *
 * Hashnode Pro is a paid external dependency. `publication` returns FORBIDDEN
 * without an active plan, and the API can have incidents. ISR protects a
 * RUNNING deployment - it serves stale content when revalidation fails - but it
 * does nothing for a COLD BUILD, which has no previous render to fall back on.
 *
 *   Hashnode down + running deploy   -> ISR serves stale.        Fine.
 *   Hashnode down + fresh Vercel build -> generateStaticParams
 *                                        returns nothing, every
 *                                        post 404s.              NOT fine.
 *
 * Seven articles currently rank at /blogs/<slug>. Returning an empty array on
 * failure would silently de-index them while the build goes green. So the
 * fallback has to be committed to the repo, where it is available with zero
 * network and no prior deployment.
 *
 * The snapshot is refreshed by `pnpm blog:snapshot` (see scripts/) and by the
 * revalidation webhook. It is intentionally checked in - do not gitignore it.
 * It doubles as a plain-Markdown backup independent of Hashnode's own GitHub
 * backup.
 */

interface Snapshot {
  /** ISO timestamp of the last refresh. */
  capturedAt: string | null;
  posts: BlogPost[];
}

const snapshot = snapshotJson as Snapshot;

export function snapshotPosts(): BlogPost[] {
  return snapshot.posts ?? [];
}

export function snapshotSummaries(): BlogPostSummary[] {
  return snapshotPosts().map(({ markdown: _markdown, ...rest }) => rest);
}

export function snapshotPost(slug: string): BlogPost | null {
  return snapshotPosts().find((p) => p.slug === slug) ?? null;
}

export function snapshotCapturedAt(): string | null {
  return snapshot.capturedAt ?? null;
}

export function snapshotIsEmpty(): boolean {
  return snapshotPosts().length === 0;
}
