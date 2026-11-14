"use client";

import { useId } from "react";

/** A clean four-point sparkle that identifies the assistant across the site. */
export function AgentMark({ active, size = 18, mono = false }: { active: boolean; size?: number; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`st-assistant-mark st-sparkle-icon ${active ? "is-active" : ""} ${mono ? "is-mono" : ""}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={`assistantGold${id}`} x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b68a2d" />
          <stop offset="0.48" stopColor="#d5ad55" />
          <stop offset="1" stopColor="#f3d891" />
        </linearGradient>
      </defs>
      <path className="st-sparkle-main" d="M24 3.5C25.7 13.7 29.8 20.1 44.5 24C29.8 27.9 25.7 34.3 24 44.5C22.3 34.3 18.2 27.9 3.5 24C18.2 20.1 22.3 13.7 24 3.5Z" fill={mono ? "currentColor" : `url(#assistantGold${id})`} />
      <circle className="st-sparkle-core" cx="24" cy="24" r="2.2" fill={mono ? "currentColor" : "#fff8dc"} fillOpacity="0.9" />
    </svg>
  );
}
