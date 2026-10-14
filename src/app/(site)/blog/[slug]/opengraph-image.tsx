import { ImageResponse } from "next/og";
import { person } from "@/content/profile";
import { getPostBySlug } from "@/lib/posts";
import { OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Article by Rahul Dev Banjara";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Per-article share image: the title, big. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return new ImageResponse(
    <OgFrame eyebrow={`${person.name} · Writing`} title={post?.title ?? "Writing"} footer={post ? `${post.readingMinutes} min read` : person.role} />,
    size,
  );
}
