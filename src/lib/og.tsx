/* eslint-disable @next/next/no-img-element -- Satori renders these inside
   ImageResponse, where next/image does not apply. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { profile } from "@/lib/content";

/**
 * Shared Open Graph card rendering.
 *
 * Replaces ~240 lines of styles duplicated verbatim across three
 * opengraph-image.tsx routes.
 *
 * Two constraints worth knowing before editing:
 *
 *   1. Assets are read from the filesystem, not fetched. These routes run on
 *      Node (not edge, because edge disables static generation), and at build
 *      time there is no server to fetch `/profile.webp` from - the previous
 *      code tried to fetch the production URL and got whatever was deployed.
 *
 *   2. The avatar must be PNG or JPEG. Satori, which renders ImageResponse,
 *      cannot decode WebP - it fails with "Unsupported image type: unknown".
 *      Hence profile-og.png alongside the WebP used by the site itself.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

function assetPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

/** Reads a public/ asset as a data URI, or null when unavailable. */
async function readAsDataUri(
  relativePath: string,
  mime: string,
): Promise<string | null> {
  try {
    const buffer = await readFile(assetPath("public", relativePath));
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadOgFonts() {
  try {
    const [display, body] = await Promise.all([
      readFile(assetPath("public", "fonts", "ClashDisplay-Semibold.ttf")),
      readFile(assetPath("public", "fonts", "CabinetGrotesk-Medium.ttf")),
    ]);
    return [
      { name: "Display", data: display, weight: 600 as const, style: "normal" as const },
      { name: "Body", data: body, weight: 500 as const, style: "normal" as const },
    ];
  } catch {
    // Fall back to the built-in font rather than failing the whole build.
    return [];
  }
}

export async function loadOgAvatar(): Promise<string | null> {
  return readAsDataUri("profile-og.png", "image/png");
}

/**
 * The card itself. Kept deliberately plain: a card that renders reliably beats
 * one that looks better and intermittently fails the build.
 */
export function OgCard({
  eyebrow,
  title,
  description,
  avatar,
  hasFonts,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  avatar: string | null;
  hasFonts: boolean;
}) {
  const displayFont = hasFonts ? "Display" : "sans-serif";
  const bodyFont = hasFonts ? "Body" : "sans-serif";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 64,
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(circle at 88% 12%, #ede9fe 0%, transparent 45%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {avatar ? (
          <img
            src={avatar}
            width={72}
            height={72}
            style={{ borderRadius: 999, border: "3px solid #e4e4e7" }}
            alt=""
          />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{ fontSize: 28, fontFamily: displayFont, color: "#18181b" }}
          >
            {profile.name}
          </div>
          <div
            style={{ fontSize: 20, fontFamily: bodyFont, color: "#71717a" }}
          >
            {profile.headline}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          gap: 20,
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontSize: 20,
              fontFamily: bodyFont,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#8b5cf6",
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            fontSize: title.length > 70 ? 52 : 64,
            lineHeight: 1.1,
            fontFamily: displayFont,
            color: "#09090b",
          }}
        >
          {title}
        </div>

        {description ? (
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              fontFamily: bodyFont,
              color: "#52525b",
            }}
          >
            {description.length > 160
              ? `${description.slice(0, 157)}...`
              : description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 22,
          fontFamily: bodyFont,
          color: "#a1a1aa",
        }}
      >
        {profile.siteUrl.replace(/^https?:\/\//, "")}
      </div>
    </div>
  );
}
