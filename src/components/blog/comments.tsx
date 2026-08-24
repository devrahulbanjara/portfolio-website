"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO;
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
/**
 * Fixed rather than configurable, because there is no second correct answer.
 * Pathname is the only mapping stable across the origins this site is served
 * from - localhost in development, www in production, with the apex
 * redirecting - and unlike title mapping it survives editing a headline.
 *
 * Must match the mapping selected in the giscus.app configurator; if the two
 * disagree, comments silently attach to the wrong threads.
 */
const MAPPING = "pathname";

/**
 * Comments and reactions via Giscus (GitHub Discussions).
 *
 * The CMS deliberately does not own discussion. Sanity models authored content,
 * not visitor submissions - accepting comments into the dataset would mean
 * exposing a write token to the browser and building moderation. GitHub
 * Discussions already has accounts, moderation, and spam handling.
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
