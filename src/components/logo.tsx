/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Organization logo on a neutral chip.
 *
 * Two problems this solves, both verified by rendering the real assets:
 *
 * 1. CONTRAST. AWS and NVIDIA ship black wordmarks; on the dark theme they
 *    disappear into the background entirely. Rather than sourcing per-theme
 *    variants for every organization, every logo sits on a constant light
 *    surface in both themes.
 *
 * 2. ASPECT RATIO. The real logos range from 1:1 (TekBay, Herald) to 6.2:1
 *    (Fusemachines). A square avatar squashes wordmarks, so the chip is
 *    fixed-height with auto width and `object-contain`.
 *
 *      square avatar              fixed-height chip
 *      ┌────────┐                 ┌──────────────────┐
 *      │ squash │                 │  fuse|machines   │
 *      │  -ed   │        ->       └──────────────────┘
 *      └────────┘                 ┌──────┐
 *                                 │ ▣    │  (square marks stay square)
 *                                 └──────┘
 *
 * Falls back to initials when the image is missing or fails to load, so an
 * absent logo never renders as a broken image.
 */
export function Logo({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt: string;
  /** Shown when the image is absent or fails. Usually organization initials. */
  fallback: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "inline-flex h-10 min-w-10 flex-none items-center justify-center rounded-xl px-1.5",
        // Light: just a thin ring on the page background, so the mark floats
        // instead of sitting in a grey box. Matches the airier feel of the
        // upstream template's ringed avatars.
        "bg-background ring-1 ring-border",
        // Dark: a light surface is unavoidable. AWS and NVIDIA ship black
        // wordmarks that disappear on a dark ground - verified by rendering.
        "dark:bg-zinc-50 dark:ring-0",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-6 w-auto max-w-24 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground dark:text-zinc-500">
          {fallback}
        </span>
      )}
    </span>
  );
}
