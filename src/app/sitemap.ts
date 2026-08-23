import type { MetadataRoute } from "next";
import { listPosts, listTags } from "@/lib/blog";
import { caseStudyProjects, profile } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = profile.siteUrl;
  const [{ data: posts }, { data: tags }] = await Promise.all([
    listPosts(),
    listTags(),
  ]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blogs`, changeFrequency: "daily", priority: 0.9 },
    ...caseStudyProjects.map((project) => ({
      url: `${base}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${base}/blogs/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tags.map(({ tag }) => ({
      url: `${base}/blogs/tag/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
