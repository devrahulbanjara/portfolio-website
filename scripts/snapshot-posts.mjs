#!/usr/bin/env node
/**
 * Refreshes content/posts-snapshot.json from Hashnode.
 *
 * The snapshot is the build-time fallback that stops a Hashnode outage or a
 * lapsed Pro plan from 404ing the ranking /blogs/<slug> URLs. See
 * src/lib/blog/snapshot.ts for the full reasoning.
 *
 * Run it after publishing, or in CI on a schedule:
 *   pnpm blog:snapshot
 *
 * Reads HASHNODE_PUBLICATION_HOST (required), HASHNODE_API_ENDPOINT and
 * HASHNODE_ACCESS_TOKEN (both optional) from the environment.
 *
 * Refuses to overwrite a non-empty snapshot with zero posts - that would remove
 * the very safety net it exists to maintain.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../content/posts-snapshot.json");
const ENDPOINT =
  process.env.HASHNODE_API_ENDPOINT?.trim() || "https://gql-beta.hashnode.com/";
const HOST = process.env.HASHNODE_PUBLICATION_HOST?.trim();
const TOKEN = process.env.HASHNODE_ACCESS_TOKEN?.trim();
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://www.rahuldevbanjara.com.np";

if (!HOST) {
  console.error(
    "HASHNODE_PUBLICATION_HOST is not set. Copy .env.example to .env.local and fill it in.",
  );
  process.exit(1);
}

const QUERY = `
  query Snapshot($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      posts(first: $first, after: $after) {
        edges { node {
          id title subtitle slug brief readTimeInMinutes
          publishedAt updatedAt canonicalUrl
          coverImage { url }
          author { name username profilePicture }
          tags { name slug }
          series { name slug }
          seo { title description }
          ogMetaData { image }
          content { markdown }
        } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

async function request(after) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: TOKEN } : {}),
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { host: HOST, first: 20, after },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${ENDPOINT}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (!body.data?.publication) {
    throw new Error(`No publication found for host "${HOST}"`);
  }
  return body.data.publication.posts;
}

function toPost(node) {
  const ownCanonical = `${SITE_URL}/blogs/${node.slug}`;
  return {
    id: node.id,
    slug: node.slug,
    title: node.title,
    subtitle: node.subtitle ?? null,
    brief: node.brief,
    markdown: node.content?.markdown ?? "",
    publishedAt: node.publishedAt,
    updatedAt: node.updatedAt ?? null,
    readingTimeMinutes: node.readTimeInMinutes,
    coverImage: node.coverImage?.url ?? null,
    author: {
      name: node.author.name,
      username: node.author.username,
      profilePicture: node.author.profilePicture ?? null,
    },
    tags: (node.tags ?? []).map((t) => ({ name: t.name, slug: t.slug })),
    series: node.series
      ? { name: node.series.name, slug: node.series.slug }
      : null,
    seo: {
      title: node.seo?.title ?? null,
      description: node.seo?.description ?? null,
      canonicalUrl:
        node.canonicalUrl && node.canonicalUrl.startsWith(SITE_URL)
          ? node.canonicalUrl
          : ownCanonical,
      ogImage: node.ogMetaData?.image ?? node.coverImage?.url ?? null,
    },
  };
}

const posts = [];
let after = null;

for (let page = 0; page < 25; page += 1) {
  const connection = await request(after);
  posts.push(...connection.edges.map((edge) => toPost(edge.node)));
  if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) break;
  after = connection.pageInfo.endCursor;
}

posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

let existingCount = 0;
try {
  existingCount = JSON.parse(readFileSync(OUT, "utf8")).posts?.length ?? 0;
} catch {
  // No usable snapshot yet; writing the first one is fine.
}

if (posts.length === 0 && existingCount > 0) {
  console.error(
    `Refusing to overwrite ${existingCount} snapshotted posts with 0. ` +
      "Fetch returned nothing - check the plan status and token before retrying.",
  );
  process.exit(1);
}

writeFileSync(
  OUT,
  `${JSON.stringify({ capturedAt: new Date().toISOString(), posts }, null, 2)}\n`,
);

console.log(`Wrote ${posts.length} posts to content/posts-snapshot.json`);
