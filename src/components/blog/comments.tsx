"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO;
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
const MAPPING = process.env.NEXT_PUBLIC_GISCUS_MAPPING ?? "pathname";

/**
 * Comments and reactions via Giscus (GitHub Discussions).
 *
 * WHY NOT HASHNODE: its GraphQL API exposes exactly nine mutations, all
 * author-side publishing operations. There is no addComment and no reaction
 * mutation, so a visitor cannot comment or react from a custom frontend - only
 * on Hashnode's own hosted pages. Verified by schema introspection, 2026-08-23.
 *
 * Giscus also resolves a conflict the alternative created: sending readers to
 * the Hashnode-hosted copy to comment would require that copy to be indexable,
 * which competes with this site for ranking.
 *
 * Renders nothing when unconfigured, so a missing env var degrades to "no
 * comments" rather than a broken iframe.
 */
export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  const configured = Boolean(REPO && REPO_ID && CATEGORY && CATEGORY_ID);

  // Mount the script once.
  useEffect(() => {
    if (!configured || !ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", REPO!);
    script.setAttribute("data-repo-id", REPO_ID!);
    script.setAttribute("data-category", CATEGORY!);
    script.setAttribute("data-category-id", CATEGORY_ID!);
    script.setAttribute("data-mapping", MAPPING);
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("data-theme", giscusTheme);
    ref.current.appendChild(script);
    // giscusTheme is deliberately not a dependency: re-running would inject a
    // second script. Theme changes are handled by the postMessage effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  /**
   * Theme sync. Setting data-theme only works at mount, so an already-rendered
   * iframe has to be told about theme changes over postMessage. Without this the
   * comment box stays light while the rest of the site goes dark.
   */
  useEffect(() => {
    const frame = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      "https://giscus.app",
    );
  }, [giscusTheme]);

  if (!configured) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-muted-foreground">
        Discussion
      </h2>
      <div ref={ref} />
    </section>
  );
}
