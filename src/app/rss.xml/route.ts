import { listPosts } from "@/lib/blog";
import { profile } from "@/lib/content";

/** Escapes the five XML predefined entities. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await listPosts();
  const base = profile.siteUrl;

  const items = posts
    .map((post) => {
      const url = `${base}/blogs/${post.slug}`;
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(post.brief)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
${post.tags.map((t) => `      <category>${xml(t.name)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(profile.name)} — Blogs</title>
    <link>${xml(`${base}/blogs`)}</link>
    <description>Thoughts on AI engineering, machine learning, and building production systems.</description>
    <language>en</language>
    <atom:link href="${xml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
