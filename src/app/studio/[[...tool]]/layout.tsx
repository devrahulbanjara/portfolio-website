import type { Metadata, Viewport } from "next";

/**
 * The Studio takes the whole viewport, so it opts out of the site frame by
 * living outside app/(site). It also opts out of search entirely — an indexed
 * /studio is just a login wall in the results.
 */
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // The Studio has its own zoom-sensitive controls; letting the browser
  // auto-zoom on focus makes editing on a phone unusable.
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
