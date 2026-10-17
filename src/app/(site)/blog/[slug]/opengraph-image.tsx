import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { person } from "@/content/profile";
import { getPostBySlug } from "@/lib/posts";
import { OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Article by Rahul Dev Banjara";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Per-article share image. A hand-designed 1200×630 PNG at public/og/<slug>.png wins;
 * otherwise the title, big.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (/^[a-z0-9-]+$/.test(slug)) {
    const custom = await readFile(join(process.cwd(), "public", "og", `${slug}.png`)).catch(() => null);
    if (custom) return new Response(new Uint8Array(custom), { headers: { "Content-Type": "image/png" } });
  }
  const post = await getPostBySlug(slug);
  return new ImageResponse(
    <OgFrame eyebrow={`${person.name} · Blog`} title={post?.title ?? "Blog"} footer={post ? `${post.readingMinutes} min read` : person.role} />,
    size,
  );
}
