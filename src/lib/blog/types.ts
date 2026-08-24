import type { PortableTextBlock } from "@portabletext/types";

/**
 * Application-owned blog domain types.
 *
 * Components import from here and ONLY from here. No GROQ result shape or
 * Sanity SDK type may appear above src/lib/blog.
 *
 * The boundary is not indecision about the CMS - Sanity is committed. It exists
 * because the CMS is an external dependency, so there has to be one place where
 * querying, caching, and mapping live. It has already earned itself twice: the
 * read path moved from a Pro-gated GraphQL API to a public RSS feed, and then
 * off that provider entirely, without a single change above it.
 */

export interface Author {
  name: string;
  username: string;
  profilePicture: string | null;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface PostImage {
  /** Absolute cdn.sanity.io URL. */
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** Tiny base64 preview Sanity ships with every asset, for next/image blur. */
  lqip: string | null;
}

export interface PostSeo {
  title: string | null;
  description: string | null;
  /** Absolute URL. This site is always canonical. */
  canonicalUrl: string | null;
  ogImage: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  /** Short summary used for cards, meta description, and OG cards. */
  brief: string;
  /** Post body as Portable Text. Rendered by src/components/blog/portable-text. */
  body: PortableTextBlock[];
  /** ISO 8601. */
  publishedAt: string;
  /** ISO 8601. Sanity's _updatedAt, so it is always set. */
  updatedAt: string | null;
  readingTimeMinutes: number;
  coverImage: PostImage | null;
  author: Author;
  tags: readonly Tag[];
  seo: PostSeo;
}

/** A post without its body, for list views. Avoids shipping every body to /blogs. */
export type BlogPostSummary = Omit<BlogPost, "body">;
