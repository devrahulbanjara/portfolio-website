import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import Navbar from "@/components/navbar";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { DraftModeBanner } from "@/components/blog/draft-mode-banner";

/**
 * The public site frame. Everything except /studio renders inside this.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <>
      <div className="absolute inset-0 top-0 left-0 right-0 h-[100px] overflow-hidden z-0">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto py-12 pb-24 sm:py-24 px-6">
        {children}
      </div>
      <Navbar />
      {isDraftMode ? (
        <>
          <DraftModeBanner />
          {/* Draws the click-to-edit overlays when this page is inside the
              Presentation tool's iframe. A no-op anywhere else. */}
          <VisualEditing />
        </>
      ) : null}
    </>
  );
}
