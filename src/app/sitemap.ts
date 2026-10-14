import type { MetadataRoute } from "next";
import { site, projects } from "@/content/profile";
import { getPublishedPosts, getAllTags } from "@/lib/posts";

/** Every public page, every project, every published article and tag page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);
  const u = (path: string) => `${site.url}${path}`;
  const latest = posts[0] ? new Date(posts[0].updatedAt) : undefined;
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    { url: u("/about"), changeFrequency: "monthly", priority: 0.9 },
    { url: u("/work"), changeFrequency: "monthly", priority: 0.9 },
    { url: u("/teaching"), changeFrequency: "monthly", priority: 0.8 },
    { url: u("/services"), changeFrequency: "monthly", priority: 0.8 },
    { url: u("/resume"), changeFrequency: "monthly", priority: 0.7 },
    { url: u("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: u("/blog"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({ url: u(`/work/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...tags.map((t) => ({ url: u(`/blog/tag/${encodeURIComponent(t.tag)}`), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
