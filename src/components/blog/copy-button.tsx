"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The only interactive part of a code block, so it is the only part that ships
 * as client JavaScript. Highlighting happens on the server.
 */
export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-3 size-8 cursor-pointer rounded-md border border-border text-primary shadow-none opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100",
        className,
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}
