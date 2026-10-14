import { site, person } from "@/content/profile";
import { getPublishedPosts } from "@/lib/posts";

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** RSS 2.0 feed of published articles. */
export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(person.name)} — Writing</title>
    <link>${site.url}/blog</link>
    <description>${esc(`Articles by ${person.name} on AI, machine learning on AWS and teaching.`)}</description>
    <language>en</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" } });
}
