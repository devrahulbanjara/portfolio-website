/**
 * Application-owned blog domain types.
 *
 * Components import from here and ONLY from here. No Hashnode response shape,
 * GraphQL fragment, or SDK type may appear above src/lib/blog.
 *
 * The boundary is not indecision about the CMS - Hashnode is committed. It
 * exists because Hashnode Pro is a paid external dependency and a single point
 * of failure, so there has to be one place where caching, mapping, and
 * fallback live.
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

export interface Series {
  name: string;
  slug: string;
}

export interface PostSeo {
  title: string | null;
  description: string | null;
  /** Absolute URL. This site is always canonical, never the Hashnode copy. */
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
  /** Post body as Markdown. */
  markdown: string;
  /** ISO 8601. */
  publishedAt: string;
  /** ISO 8601, or null when never edited. */
  updatedAt: string | null;
  readingTimeMinutes: number;
  /** Absolute URL, or null. Hashnode returns absolute URLs on its own CDN. */
  coverImage: string | null;
  author: Author;
  tags: readonly Tag[];
  series: Series | null;
  seo: PostSeo;
}

/** A post without its body, for list views. Avoids shipping every body to /blogs. */
export type BlogPostSummary = Omit<BlogPost, "markdown">;

/** Where a given result came from, for logging and degraded-state UI. */
export type BlogSource = "hashnode" | "snapshot";

export interface BlogResult<T> {
  data: T;
  source: BlogSource;
  /** Set when Hashnode was attempted and failed. */
  error?: string;
}
