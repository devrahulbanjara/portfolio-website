import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { listPostsByTag, listTags } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const { data } = await listTags();
  return data.map(({ tag }) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: tags } = await listTags();
  const match = tags.find((t) => t.tag.slug === slug);
  if (!match) return {};

  const title = `${match.tag.name}`;
  const description = `Posts tagged ${match.tag.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/blogs/tag/${slug}` },
    openGraph: { title, description },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ data: posts }, { data: tags }] = await Promise.all([
    listPostsByTag(slug),
    listTags(),
  ]);

  const tag = tags.find((t) => t.tag.slug === slug)?.tag;
  if (!tag) notFound();

  return (
    <section>
      <BlurFade delay={0.04}>
        <Link
          href="/blogs"
          className="group mb-6 inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-px" />
          All writing
        </Link>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">
          {tag.name}
          <span className="ml-2 rounded-md border border-border bg-card px-2 py-1 align-middle text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </h1>
      </BlurFade>

      <ul className="flex flex-col gap-4">
        {posts.map((post, index) => (
          <BlurFade key={post.slug} delay={0.08 + index * 0.05}>
            <li className="flex flex-col gap-1">
              <Link
                href={`/blogs/${post.slug}`}
                className="text-lg font-medium tracking-tight underline-offset-4 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                {" · "}
                {post.readingTimeMinutes} min read
              </p>
            </li>
          </BlurFade>
        ))}
      </ul>
    </section>
  );
}
