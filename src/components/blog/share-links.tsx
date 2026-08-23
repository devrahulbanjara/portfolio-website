"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/**
 * Sharing needs no backend. On devices that support it we hand off to the native
 * share sheet; elsewhere we fall back to per-network share URLs plus copy-link.
 */
export default function ShareLinks({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions; the share links still work.
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, url });
    } catch {
      // User dismissed the sheet. Not an error.
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
      <span className="mr-1 text-xs text-muted-foreground">Share</span>

      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent sm:hidden"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      ) : null}

      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
        >
          {target.name}
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
      >
        {copied ? (
          <>
            <Check className="size-3.5" /> Copied
          </>
        ) : (
          <>
            <Link2 className="size-3.5" /> Copy link
          </>
        )}
      </button>
    </div>
  );
}
