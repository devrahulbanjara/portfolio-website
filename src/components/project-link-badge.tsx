"use client";

import type { ComponentType } from "react";
import { ExternalLink, FileText, Globe } from "lucide-react";
import { GitHubMark, HuggingFaceLogo } from "@/components/brand-marks";
import type { ProjectLink } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Each destination gets its own brand treatment rather than one generic pill.
 * A GitHub badge and a Hugging Face badge are instantly recognizable by colour
 * alone, which is the whole point of using a badge instead of a text link.
 *
 * Colours are the platforms' own brand values, so they stay fixed across light
 * and dark themes - a GitHub badge that changes colour with the site theme stops
 * reading as GitHub. Contrast is checked against each background, not inherited.
 */
type Style = {
  mark: ComponentType<{ className?: string }>;
  /** Fixed brand colours; deliberately not theme-reactive. */
  className: string;
};

const STYLES: Record<ProjectLink["kind"], Style> = {
  repository: {
    mark: GitHubMark,
    // GitHub's near-black. White ink.
    className: "bg-[#181717] text-white hover:bg-[#2b2a2a]",
  },
  model: {
    mark: HuggingFaceLogo,
    // HF's own dark navy (#32343D), not their yellow: the logo IS yellow, so a
    // yellow pill would put yellow on yellow. Dark lets the mark carry the brand.
    className: "bg-[#32343D] text-white hover:bg-[#41444f]",
  },
  live: {
    mark: Globe,
    // No third-party brand to honour, so this one follows the site's accent.
    className: "bg-brand text-white hover:opacity-90",
  },
  article: {
    mark: FileText,
    className:
      "border border-border bg-background text-foreground hover:bg-accent",
  },
};

export default function ProjectLinkBadge({
  link,
  variant = "brand",
}: {
  link: ProjectLink;
  /**
   * "overlay" is for badges sitting ON a project screenshot. There they all go
   * solid black, as upstream does: over arbitrary imagery, per-platform brand
   * colours stop being a legibility win and start fighting the picture. The
   * mark still identifies the destination.
   */
  variant?: "brand" | "overlay";
}) {
  const style = STYLES[link.kind] ?? STYLES.article;
  const Mark = style.mark;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.label} (opens in a new tab)`}
      // Stop the click bubbling to the card's own link underneath.
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "overlay"
          ? "bg-black text-white hover:bg-black/90"
          : style.className,
      )}
    >
      <Mark className="size-3.5" />
      {link.label}
      {variant === "brand" ? (
        <ExternalLink className="size-3 opacity-60" aria-hidden />
      ) : null}
    </a>
  );
}
