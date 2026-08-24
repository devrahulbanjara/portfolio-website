import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgCard,
  loadOgAvatar,
  loadOgFonts,
} from "@/lib/og";

export const alt = "Blogs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const [fonts, avatar] = await Promise.all([loadOgFonts(), loadOgAvatar()]);
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Blogs"
        title="Notes on building AI systems"
        description="Thoughts on AI engineering, machine learning, and building production systems."
        avatar={avatar}
        hasFonts={fonts.length > 0}
      />
    ),
    { ...OG_SIZE, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
