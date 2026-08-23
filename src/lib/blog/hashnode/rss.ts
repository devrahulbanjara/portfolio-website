import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import type { Author, BlogPost } from "../types";

/**
 * Reads a Hashnode publication through its public RSS feed.
 *
 * WHY RSS AND NOT THE GraphQL API
 *
 * Hashnode's GraphQL API is Pro-only. On a free publication every
 * `publication(host:)` query returns:
 *
 *   "Publication does not have an active Pro plan. Upgrade in your dashboard
 *    to access this via the API."  (extensions.code = FORBIDDEN)
 *
 * Verified against a live free publication on 2026-08-23. The RSS feed at
 * https://<host>/rss.xml is free and unauthenticated, and carries everything
 * this site renders: the full post body in <content:encoded>, publish date,
 * tags as <category>, and the cover image as <enclosure>. So the editor and
 * dashboard stay exactly as chosen - only the read path changes.
 *
 * WHAT RSS COSTS US, honestly:
 *   - 20 most recent posts only, with no pagination. The committed snapshot
 *     accumulates rather than replaces, so older posts never disappear once
 *     captured (see ../snapshot.ts and scripts/snapshot-posts.ts).
 *   - no drafts, no scheduled posts, no preview mode. Those needed a write
 *     token, which this path does not use at all - one less secret to leak.
 *   - no subtitle or series field in the feed; both are always null here.
 *   - `updatedAt` is absent, so an edited post looks unedited.
 *
 * This module is deliberately free of Next.js and `@/` path aliases: the
 * snapshot script imports it directly by relative path, so the parsing and
 * mapping logic exists exactly once.
 */

export class BlogFeedError extends Error {
  constructor(
    message: string,
    readonly kind: "unconfigured" | "forbidden" | "network" | "parse",
  ) {
    super(message);
    this.name = "BlogFeedError";
  }
}

export interface FeedOptions {
  /** Publication host as Hashnode knows it, e.g. "you.hashnode.dev". */
  host: string;
  /** Canonical origin for this site, no trailing slash. */
  siteUrl: string;
  /** Feed items carry no author object, so it is supplied from site content. */
  author: Author;
}

/** Words per minute for the reading estimate. Hashnode's own figure. */
const WORDS_PER_MINUTE = 200;

/** RSS `description` is already a truncated summary; cap it anyway. */
const BRIEF_MAX_CHARS = 320;

function turndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    // Fenced, not indented: an indented block loses its language hint, and the
    // renderer's syntax highlighting keys off the fence info string.
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  // Tables, strikethrough, and task lists. Hashnode's editor emits all three.
  service.use(gfm);

  // Hashnode wraps code as <pre><code class="lang-ts">. Turndown's default rule
  // reads `language-*`, so without this every fence comes out untagged.
  service.addRule("hashnodeCodeBlock", {
    filter: (node) =>
      node.nodeName === "PRE" &&
      node.firstChild != null &&
      node.firstChild.nodeName === "CODE",
    replacement: (_content, node) => {
      const code = (node as HTMLElement).firstChild as HTMLElement;
      const className = code.getAttribute?.("class") ?? "";
      const language = /(?:lang|language)-(\S+)/.exec(className)?.[1] ?? "";
      const body = code.textContent ?? "";
      return `\n\n\`\`\`${language}\n${body.replace(/\n$/, "")}\n\`\`\`\n\n`;
    },
  });

  return service;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/** Hashnode post URLs end in the slug: https://host/some-post-slug */
function slugFromLink(link: string): string {
  const path = link.replace(/[?#].*$/, "").replace(/\/+$/, "");
  return path.slice(path.lastIndexOf("/") + 1);
}

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** fast-xml-parser gives a bare value for one child and an array for many. */
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

interface RawItem {
  title?: string;
  link?: string;
  guid?: string | { "#text"?: string };
  pubDate?: string;
  description?: string;
  "content:encoded"?: string;
  category?: string | string[];
  enclosure?: { "@_url"?: string } | { "@_url"?: string }[];
}

/**
 * Parses feed XML into domain posts. Pure - no network, no environment reads -
 * so the snapshot script and the app share exactly this behaviour.
 */
export function parseFeed(xml: string, options: FeedOptions): BlogPost[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    // Hashnode wraps every text node in CDATA; without this the parser can hand
    // back numbers for numeric-looking titles and dates.
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
  });

  let parsed: { rss?: { channel?: { item?: RawItem | RawItem[] } } };
  try {
    parsed = parser.parse(xml);
  } catch (cause) {
    throw new BlogFeedError(
      `Feed is not valid XML: ${(cause as Error).message}`,
      "parse",
    );
  }

  const channel = parsed.rss?.channel;
  if (!channel) {
    throw new BlogFeedError(
      "Feed has no <channel>; the host is probably wrong or the publication does not exist",
      "parse",
    );
  }

  const service = turndown();

  return asArray(channel.item)
    .map((item): BlogPost | null => {
      const link = item.link;
      const title = item.title;
      if (!link || !title) return null;

      const slug = slugFromLink(link);
      if (!slug) return null;

      const html = item["content:encoded"] ?? item.description ?? "";
      const markdown = service.turndown(html).trim();
      const cover =
        asArray(item.enclosure)
          .map((e) => e["@_url"])
          .find(Boolean) ?? null;

      const guid =
        typeof item.guid === "string" ? item.guid : item.guid?.["#text"];
      const published = item.pubDate ? new Date(item.pubDate) : null;

      return {
        // The feed has no numeric id. The permalink is stable and unique, which
        // is all any consumer of `id` here needs.
        id: guid ?? link,
        slug,
        title,
        subtitle: null,
        brief: truncate(
          stripHtml(item.description ?? html) || title,
          BRIEF_MAX_CHARS,
        ),
        markdown,
        publishedAt: (published && !Number.isNaN(+published)
          ? published
          : new Date(0)
        ).toISOString(),
        updatedAt: null,
        readingTimeMinutes: readingMinutes(markdown),
        coverImage: cover,
        author: options.author,
        tags: asArray(item.category)
          .filter(Boolean)
          .map((name) => ({ name, slug: slugifyTag(name) }))
          .filter((tag) => tag.slug.length > 0),
        series: null,
        seo: {
          title: null,
          description: null,
          // This site is always canonical. Hashnode hosts a copy of every post,
          // and letting that copy win would split ranking signal across two URLs.
          canonicalUrl: `${options.siteUrl}/blogs/${slug}`,
          ogImage: cover,
        },
      };
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function feedUrl(host: string): string {
  return `https://${host.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/rss.xml`;
}

/**
 * Fetches and parses the feed.
 *
 * `revalidateSeconds` is passed through to Next's fetch cache when running
 * inside Next; plain Node ignores the extra option, which is what lets the
 * snapshot script reuse this function.
 */
export async function fetchFeed(
  options: FeedOptions,
  revalidateSeconds?: number,
): Promise<BlogPost[]> {
  const url = feedUrl(options.host);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      ...(revalidateSeconds !== undefined
        ? { next: { revalidate: revalidateSeconds, tags: ["blog"] } }
        : {}),
    } as RequestInit);
  } catch (cause) {
    throw new BlogFeedError(
      `Network error reaching ${url}: ${(cause as Error).message}`,
      "network",
    );
  }

  if (!response.ok) {
    throw new BlogFeedError(
      `${url} returned HTTP ${response.status}`,
      response.status === 404 ? "unconfigured" : "network",
    );
  }

  return parseFeed(await response.text(), options);
}
