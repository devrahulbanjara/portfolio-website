import { profile } from "@/lib/content";
import type { BlogPost, BlogPostSummary } from "../types";

/**
 * Shapes returned by the GraphQL documents in ./queries. These types stop here
 * - nothing above src/lib/blog sees them.
 */
export interface HashnodePostNode {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  brief: string;
  readTimeInMinutes: number;
  publishedAt: string;
  updatedAt: string | null;
  canonicalUrl: string | null;
  coverImage: { url: string } | null;
  author: {
    name: string;
    username: string;
    profilePicture: string | null;
  };
  tags: { name: string; slug: string }[] | null;
  series: { name: string; slug: string } | null;
  seo: { title: string | null; description: string | null } | null;
  ogMetaData: { image: string | null } | null;
  content?: { markdown: string };
}

/**
 * Maps a Hashnode node onto the domain model.
 *
 * Canonical URL policy: this site is always canonical. Hashnode also hosts a
 * copy of every post, and letting that copy win would split ranking signal
 * between two URLs. We therefore ignore whatever `canonicalUrl` Hashnode
 * reports unless it already points at this domain.
 */
export function toSummary(node: HashnodePostNode): BlogPostSummary {
  const ownCanonical = `${profile.siteUrl}/blogs/${node.slug}`;

  return {
    id: node.id,
    slug: node.slug,
    title: node.title,
    subtitle: node.subtitle,
    brief: node.brief,
    publishedAt: node.publishedAt,
    updatedAt: node.updatedAt,
    readingTimeMinutes: node.readTimeInMinutes,
    coverImage: node.coverImage?.url ?? null,
    author: {
      name: node.author.name,
      username: node.author.username,
      profilePicture: node.author.profilePicture,
    },
    tags: node.tags?.map((t) => ({ name: t.name, slug: t.slug })) ?? [],
    series: node.series
      ? { name: node.series.name, slug: node.series.slug }
      : null,
    seo: {
      title: node.seo?.title ?? null,
      description: node.seo?.description ?? null,
      canonicalUrl:
        node.canonicalUrl && node.canonicalUrl.startsWith(profile.siteUrl)
          ? node.canonicalUrl
          : ownCanonical,
      ogImage: node.ogMetaData?.image ?? node.coverImage?.url ?? null,
    },
  };
}

export function toPost(node: HashnodePostNode): BlogPost {
  return {
    ...toSummary(node),
    markdown: node.content?.markdown ?? "",
  };
}
