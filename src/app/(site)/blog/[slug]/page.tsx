import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/posts";
import { site, person } from "@/content/profile";
import { fmtDate } from "@/lib/format";
import { PostList } from "@/components/blog/PostList";
import { JsonLd } from "@/components/site/JsonLd";
import { ReadingProgress, Toc, ShareRow, CodeCopy } from "@/components/blog/ArticleChrome";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  // Cache Components needs at least one param; unknown slugs still render on demand.
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "hello" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  return {
    title,
    description,
    keywords: post.tags,
    alternates: { canonical: post.canonicalUrl ?? `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [person.name],
      tags: post.tags,
      ...(post.coverUrl ? { images: [{ url: post.coverUrl, alt: post.coverAlt ?? title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  // Params are read inside Suspense so navigations can show the shell instantly.
  return (
    <Suspense fallback={<div className="page-intro wrap" style={{ minHeight: "60vh" }} />}>
      <PostBody params={params} />
    </Suspense>
  );
}

async function PostBody({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.slug, post.tags);
  const url = `${site.url}/blog/${post.slug}`;

  return (
    <article data-article>
      <ReadingProgress />
      <CodeCopy />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.seoDescription ?? post.excerpt,
            datePublished: new Date(post.publishedAt).toISOString(),
            dateModified: new Date(post.updatedAt).toISOString(),
            wordCount: post.wordCount,
            timeRequired: `PT${post.readingMinutes}M`,
            keywords: post.tags.join(", "),
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
            image: post.coverUrl ? new URL(post.coverUrl, site.url).toString() : `${url}/opengraph-image`,
            author: { "@type": "Person", "@id": `${site.url}/#person`, name: person.name, url: site.url },
            publisher: { "@type": "Person", "@id": `${site.url}/#person`, name: person.name },
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "Writing", item: `${site.url}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />

      <header className="wrap">
        <div className="article-head">
          <Link href="/blog" className="label" data-reveal>
            ← All articles
          </Link>
          <h1 className="article-title" style={{ marginTop: "1.5rem" }} data-reveal>
            {post.title}
          </h1>
          <div className="article-meta" data-reveal style={{ ["--d" as string]: 1 }}>
            <span>
              <time dateTime={new Date(post.publishedAt).toISOString()}>{fmtDate(post.publishedAt)}</time> · {post.readingMinutes} min read
            </span>
            <ShareRow url={url} title={post.title} />
          </div>
        </div>
        {post.coverUrl && (
          <figure className="article-cover">
            {/* eslint-disable-next-line @next/next/no-img-element -- local upload */}
            <img src={post.coverUrl} alt={post.coverAlt ?? ""} fetchPriority="high" />
          </figure>
        )}
      </header>

      <div className="wrap article-layout">
        <Toc items={post.toc} />
        <div className="article-main">
          {post.highlights.length > 0 && (
            <aside className="key-highlights" aria-labelledby="key-highlights-title">
              <div className="kh-body">
                <h2 id="key-highlights-title">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  Key highlights
                </h2>
                <ul>
                  {post.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </div>

      <footer className="wrap" style={{ paddingBottom: "4rem" }}>
        <div style={{ maxWidth: "60rem", display: "grid", gap: "1.5rem" }}>
          {post.tags.length > 0 && (
            <nav className="filters" aria-label="Topics">
              {post.tags.map((t) => (
                <Link key={t} href={`/blog/tag/${encodeURIComponent(t)}`}>
                  {t}
                </Link>
              ))}
            </nav>
          )}
          <div className="cta-panel">
            <p>Building something like this? I help teams ship AI agents and search systems that work in production.</p>
            <Link href="/contact?topic=project" className="pill-btn pill-btn-dark" data-ev="cta_click" data-ev-where="post_footer">
              <span>Work with me</span>
            </Link>
          </div>
        </div>
      </footer>

      {related.length > 0 && (
        <section className="section wrap">
          <p className="label" style={{ marginBottom: "1.5rem" }}>
            Keep reading
          </p>
          <PostList posts={related} />
        </section>
      )}
    </article>
  );
}
