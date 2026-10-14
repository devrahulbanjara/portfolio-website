import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { PostList } from "@/components/blog/PostList";
import { getAllTags, getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing — AI agents, RAG, evals and teaching",
  description: "Articles by Rahul Dev Banjara on building LLM agents, search, evals, ML on AWS, and teaching engineers.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } },
};

export default async function BlogIndex() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);
  return (
    <>
      <PageIntro title="Things I've written">
        {tags.length > 0 && (
          <nav className="filters" aria-label="Topics">
            <Link href="/blog" className="is-on">
              All <sup>{posts.length}</sup>
            </Link>
            {tags.map((t) => (
              <Link key={t.tag} href={`/blog/tag/${encodeURIComponent(t.tag)}`}>
                {t.tag} <sup>{t.count}</sup>
              </Link>
            ))}
          </nav>
        )}
      </PageIntro>
      <section className="wrap" style={{ paddingBlock: "3rem clamp(6rem, 12vw, 10rem)" }}>
        <PostList posts={posts} />
      </section>
    </>
  );
}
