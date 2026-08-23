#!/usr/bin/env tsx
/**
 * Refreshes content/posts-snapshot.json from the Hashnode RSS feed.
 *
 * The snapshot is the build-time fallback that stops a Hashnode outage from
 * 404ing live /blogs/<slug> URLs. See src/lib/blog/snapshot.ts for the full
 * reasoning.
 *
 * It is also load-bearing for a second reason now: the free RSS feed carries
 * only the 20 most recent posts, so once there are more than 20, the older ones
 * exist ONLY here. That is why this script MERGES - it must never drop a post
 * just because the feed no longer lists it.
 *
 * Run it after publishing, or on a schedule in CI:
 *   pnpm blog:snapshot
 *
 * Reads HASHNODE_PUBLICATION_HOST (required) and NEXT_PUBLIC_SITE_URL from the
 * environment. No access token: the feed is public.
 *
 * Imports the app's own parser by relative path rather than reimplementing the
 * mapping, so the snapshot can never drift from what the site renders.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchFeed } from "../src/lib/blog/hashnode/rss";
import type { BlogPost } from "../src/lib/blog/types";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../content/posts-snapshot.json");

const host = process.env.HASHNODE_PUBLICATION_HOST?.trim();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://www.rahuldevbanjara.com.np";

if (!host) {
  console.error(
    "HASHNODE_PUBLICATION_HOST is not set. Copy .env.example to .env.local and fill it in.",
  );
  process.exit(1);
}

const live = await fetchFeed({
  host,
  siteUrl,
  author: {
    name: "Rahul Dev Banjara",
    username: "devrahulbanjara",
    profilePicture: "/profile.webp",
  },
});

let existing: BlogPost[] = [];
try {
  existing = JSON.parse(readFileSync(OUT, "utf8")).posts ?? [];
} catch {
  // No usable snapshot yet; writing the first one is fine.
}

// Merge, live winning on slug collision so edits propagate. Never drop a post
// that has aged out of the feed's 20-item window.
const bySlug = new Map<string, BlogPost>();
for (const post of existing) bySlug.set(post.slug, post);
for (const post of live) bySlug.set(post.slug, post);

const posts = [...bySlug.values()].sort(
  (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
);

if (live.length === 0 && existing.length > 0) {
  console.error(
    `Feed returned 0 posts but the snapshot holds ${existing.length}. ` +
      "Refusing to touch it - check the publication host and that the feed is reachable.",
  );
  process.exit(1);
}

writeFileSync(
  OUT,
  `${JSON.stringify({ capturedAt: new Date().toISOString(), posts }, null, 2)}\n`,
);

const added = posts.length - existing.length;
console.log(
  `Wrote ${posts.length} posts to content/posts-snapshot.json ` +
    `(${live.length} live in feed, ${added >= 0 ? "+" : ""}${added} vs previous snapshot)`,
);
