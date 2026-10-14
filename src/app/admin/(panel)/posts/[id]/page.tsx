import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { adminGetPost, safeTags } from "@/lib/posts";
import { Loading } from "@/components/admin/ui";
import { PostEditor, type EditorPost } from "../PostEditor";

export const metadata = { title: "Edit post" };

export default function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: Pick<PageProps<"/admin/posts/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const p = await adminGetPost(id);
  if (!p) notFound();
  const post: EditorPost = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverUrl: p.cover_url ?? "",
    coverAlt: p.cover_alt ?? "",
    tags: safeTags(p.tags).join(", "),
    status: p.status,
    featured: !!p.featured,
    publishedAt: p.published_at,
    seoTitle: p.seo_title ?? "",
    seoDescription: p.seo_description ?? "",
    canonicalUrl: p.canonical_url ?? "",
  };
  return <PostEditor post={post} />;
}
