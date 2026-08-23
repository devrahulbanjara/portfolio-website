import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { listPosts } from "@/lib/blog";
import { normalizePage, paginate } from "@/lib/pagination";
import { formatDate } from "@/lib/utils";

const DESCRIPTION =
  "Thoughts on AI engineering, machine learning, and building production systems.";

export const metadata: Metadata = {
  title: "Writing",
  description: DESCRIPTION,
  alternates: { canonical: "/blogs" },
  openGraph: { title: "Writing", description: DESCRIPTION },
  twitter: {
    card: "summary_large_image",
    title: "Writing",
    description: DESCRIPTION,
  },
};

const PAGE_SIZE = 5;
const DELAY = 0.04;

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const { data: posts, error } = await listPosts();

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = normalizePage(pageParam, totalPages);
  const { items, pagination } = paginate(posts, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="blog">
      <BlurFade delay={DELAY}>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Writing
          {posts.length > 0 ? (
            <span className="ml-2 rounded-md border border-border bg-card px-2 py-1 align-middle text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          ) : null}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{DESCRIPTION}</p>
      </BlurFade>

      {items.length > 0 ? (
        <>
          <div className="flex flex-col gap-5">
            {items.map((post, index) => {
              const number = (pagination.page - 1) * PAGE_SIZE + index + 1;
              return (
                <BlurFade delay={DELAY * 3 + index * 0.05} key={post.slug}>
                  <Link
                    className="group flex cursor-pointer items-start gap-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    href={`/blogs/${post.slug}`}
                  >
                    <span className="mt-[5px] font-mono text-xs font-medium tabular-nums">
                      {String(number).padStart(2, "0")}.
                    </span>
                    <div className="flex flex-1 flex-col gap-y-1.5">
                      <p className="text-lg font-medium tracking-tight">
                        <span className="transition-colors group-hover:text-foreground">
                          {post.title}
                          <ChevronRight
                            className="ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                            aria-hidden
                          />
                        </span>
                      </p>
                      {post.brief ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {post.brief}
                        </p>
                      ) : null}
                      <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt)}
                        </time>
                        <span aria-hidden>·</span>
                        <span>{post.readingTimeMinutes} min read</span>
                      </p>
                    </div>
                  </Link>
                </BlurFade>
              );
            })}
          </div>

          {pagination.totalPages > 1 ? (
            <BlurFade delay={DELAY * 4}>
              <div className="mt-8 flex flex-row items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <Link
                      href={`/blogs?page=${pagination.page - 1}`}
                      className="flex h-8 w-fit items-center justify-center rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="flex h-8 w-fit cursor-not-allowed items-center justify-center rounded-lg border border-border px-2 text-sm opacity-50">
                      Previous
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <Link
                      href={`/blogs?page=${pagination.page + 1}`}
                      className="flex h-8 w-fit items-center justify-center rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="flex h-8 w-fit cursor-not-allowed items-center justify-center rounded-lg border border-border px-2 text-sm opacity-50">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </BlurFade>
          ) : null}
        </>
      ) : (
        <BlurFade delay={DELAY * 2}>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border px-4 py-12">
            <p className="text-center text-muted-foreground">
              {/* `error` is set only when a configured feed was reached for
                  and failed. No feed configured yet, or a feed with no posts,
                  is not a degraded state - it just has nothing to show. */}
              {error
                ? "Posts are temporarily unavailable. Please check back shortly."
                : "No posts yet. Check back soon."}
            </p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
