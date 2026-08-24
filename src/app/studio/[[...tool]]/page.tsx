import { isSanityConfigured } from "@/sanity/env";
import { StudioNotConfigured } from "@/components/studio/not-configured";
import { StudioClient } from "@/components/studio/studio-client";

/**
 * The Studio is a single-page client app that talks to Sanity directly from the
 * browser, so there is nothing per-request to render on the server.
 */
export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) return <StudioNotConfigured />;

  return <StudioClient />;
}
