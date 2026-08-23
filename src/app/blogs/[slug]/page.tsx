import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Comments from "@/components/blog/comments";
import ShareLinks from "@/components/blog/share-links";
import { mdxComponents } from "@/mdx-components";
import { getPost, listPostSlugs, listPosts, listRelatedPosts } from "@/lib/blog";
import { profile } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  // Backed by the committed snapshot, so a Hashnode outage at build time cannot
  // silently drop the ranking URLs. See src/lib/blog/snapshot.ts.
  const slugs = await listPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getPost(slug);
  if (!post) return {};

  const title = post.seo.title ?? post.title;
  const description = post.seo.description ?? post.brief;
  const image =
    post.seo.ogImage ?? `${profile.siteUrl}/blogs/${slug}/opengraph-image`;

  return {
    title,
    description,
    // Always this domain, never the Hashnode-hosted copy.
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${profile.siteUrl}/blogs/${slug}`,
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      images: [image],
      tags: post.tags.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post } = await getPost(slug);
  if (!post) notFound();

  const [{ data: allPosts }, related] = await Promise.all([
    listPosts(),
    listRelatedPosts(post),
  ]);

  const index = allPosts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? allPosts[index - 1] : null;
  const older =
    index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.brief,
    datePublished: post.publishedAt,
    // Correct, unlike the template which reused publishedAt for both.
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Person", name: profile.name },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${profile.siteUrl}/blogs/${post.slug}`,
    },
    ...(post.coverImage ? { image: post.coverImage } : {}),
    keywords: post.tags.map((t) => t.name).join(", "),
  };

  return (
    <section id="post">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/blogs"
        className="group mb-6 inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-px" />
        Back to Writing
      </Link>

      <header className="flex flex-col gap-4">
        <h1 className="title text-3xl font-semibold leading-tight tracking-tighter md:text-4xl">
          {post.title}
        </h1>
        {post.subtitle ? (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.subtitle}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blogs/tag/${tag.slug}`}
                className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="my-6 flex w-full items-center">
        <div
          className="h-px flex-1 bg-border"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        />
      </div>

      <article className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
        <Markdown remarkPlugins={[remarkGfm]} components={mdxComponents}>
          {post.markdown}
        </Markdown>
      </article>

      <ShareLinks
        url={`${profile.siteUrl}/blogs/${post.slug}`}
        title={post.title}
      />

      {related.length > 0 ? (
        <section className="mt-12 flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
            Related
          </h2>
          <ul className="flex flex-col gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/blogs/${item.slug}`}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="mt-12 max-w-2xl pt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          {newer ? (
            <Link
              href={`/blogs/${newer.slug}`}
              className="group flex flex-1 flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="size-3" />
                Newer
              </span>
              <span className="wrap-break-word whitespace-normal text-sm font-medium transition-colors group-hover:text-foreground">
                {newer.title}
              </span>
            </Link>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}

          {older ? (
            <Link
              href={`/blogs/${older.slug}`}
              className="group flex flex-1 flex-col gap-1 rounded-lg border border-border p-4 text-right transition-colors hover:bg-accent/50"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Older
                <ChevronRight className="size-3" />
              </span>
              <span className="wrap-break-word whitespace-normal text-sm font-medium transition-colors group-hover:text-foreground">
                {older.title}
              </span>
            </Link>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}
        </div>
      </nav>

      <Comments />
    </section>
  );
}
