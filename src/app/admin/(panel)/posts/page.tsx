import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { adminListPosts, safeTags } from "@/lib/posts";
import { PageHead, Loading, when } from "@/components/admin/ui";

export const metadata = { title: "Posts" };

export default function PostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Posts />
    </Suspense>
  );
}

async function Posts() {
  await requireAdmin();
  const posts = await adminListPosts();
  // eslint-disable-next-line react-hooks/purity -- request-time server render: "now" is the point
  const now = Date.now();
  return (
    <>
      <PageHead title="Posts" sub="Write, schedule and publish articles. Published posts appear on the site and in the sitemap straight away.">
        <Link href="/admin/posts/new" className="abtn abtn-primary">
          + New post
        </Link>
      </PageHead>
      <section className="adm-card adm-scroll">
        {posts.length === 0 ? (
          <p className="empty">No posts yet — write your first one.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th className="num">Views</th>
                <th className="num">Published</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const live = (p.status === "published" || p.status === "scheduled") && p.published_at && p.published_at <= now;
                const status = p.status === "draft" ? { l: "Draft", c: "" } : live ? { l: "Live", c: "ok" } : { l: "Scheduled", c: "info" };
                return (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 460 }}>
                      <Link href={`/admin/posts/${p.id}`}>
                        <strong style={{ fontWeight: 500 }}>{p.title}</strong>
                      </Link>
                      <div className="muted" style={{ fontSize: 13 }}>
                        /blog/{p.slug} · {p.reading_minutes} min read
                        {live && (
                          <>
                            {" · "}
                            <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                              view ↗
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${status.c}`}>{status.l}</span>
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {safeTags(p.tags).join(", ") || "—"}
                    </td>
                    <td className="num">{p.views}</td>
                    <td className="num muted">{p.published_at ? when(p.published_at) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
