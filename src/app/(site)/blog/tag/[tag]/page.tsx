import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";
import { PostList } from "@/components/blog/PostList";
import { getAllTags, getPublishedPosts } from "@/lib/posts";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.length ? tags.map((t) => ({ tag: t.tag })) : [{ tag: "ai" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/tag/[tag]">): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag);
  return { title: `Articles about ${tag}`, description: `Articles by Rahul Dev Banjara about ${tag}.`, alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` } };
}

export default function TagPage({ params }: PageProps<"/blog/tag/[tag]">) {
  // Params are read inside Suspense so navigations can show the shell instantly.
  return (
    <Suspense fallback={<div className="page-intro wrap" style={{ minHeight: "60vh" }} />}>
      <TagBody params={params} />
    </Suspense>
  );
}

async function TagBody({ params }: Pick<PageProps<"/blog/tag/[tag]">, "params">) {
  const tag = decodeURIComponent((await params).tag);
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);
  const tagged = posts.filter((p) => p.tags.includes(tag));
  if (!tagged.length) notFound();
  return (
    <>
      <PageIntro title={`Articles about ${tag}`}>
        <nav className="filters" aria-label="Topics">
          <Link href="/blog">
            All <sup>{posts.length}</sup>
          </Link>
          {tags.map((t) => (
            <Link key={t.tag} href={`/blog/tag/${encodeURIComponent(t.tag)}`} className={t.tag === tag ? "is-on" : ""} aria-current={t.tag === tag ? "page" : undefined}>
              {t.tag} <sup>{t.count}</sup>
            </Link>
          ))}
        </nav>
      </PageIntro>
      <section className="wrap" style={{ paddingBlock: "3rem clamp(6rem, 12vw, 10rem)" }}>
        <PostList posts={tagged} />
      </section>
    </>
  );
}
