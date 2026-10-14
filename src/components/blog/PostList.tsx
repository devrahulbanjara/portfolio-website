import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { fmtDate } from "@/lib/format";

export function PostList({ posts, empty = "Nothing here yet — the first posts are on their way." }: { posts: PostSummary[]; empty?: string }) {
  if (!posts.length) return <p className="page-lede">{empty}</p>;
  return (
    <ul className="rows-list">
      {posts.map((p) => (
        <li key={p.slug} data-reveal>
          <Link href={`/blog/${p.slug}`} className="post-row" data-ev="post_click" data-ev-slug={p.slug}>
            <span className="row-meta">{fmtDate(p.publishedAt)}</span>
            <span>
              <span className="row-title" style={{ display: "block" }}>
                {p.title}
              </span>
              <span className="row-sub" style={{ display: "block" }}>
                {p.excerpt}
              </span>
            </span>
            <span className="row-meta">{p.readingMinutes} min read</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
