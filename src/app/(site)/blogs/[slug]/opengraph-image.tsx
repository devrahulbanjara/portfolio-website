import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgCard,
  loadOgAvatar,
  loadOgFonts,
} from "@/lib/og";
import { getPost } from "@/lib/blog";

export const alt = "Blog post";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [fonts, avatar, post] = await Promise.all([
    loadOgFonts(),
    loadOgAvatar(),
    getPost(slug),
  ]);

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Blogs"
        title={post?.title ?? "Blogs"}
        description={post?.brief}
        avatar={avatar}
        hasFonts={fonts.length > 0}
      />
    ),
    { ...OG_SIZE, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
