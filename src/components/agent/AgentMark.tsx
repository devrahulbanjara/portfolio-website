"use client";

import { useId } from "react";

/** Four-point sparkle with concave sides, centred on (cx, cy) with radius r. */
const star = (cx: number, cy: number, r: number) => {
  const k = r * 0.18; // how far the curves bow inward
  return `M${cx} ${cy - r} C${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + r} ${cy} C${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + r} C${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - r} ${cy} C${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
};

/**
 * The assistant's mark: a cluster of gradient sparkles. While the assistant is
 * working, the stars twinkle and the gradient drifts.
 */
export function AgentMark({ active, size = 18, mono = false }: { active: boolean; size?: number; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`spark ${active ? "is-active" : ""}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb">
            {active && <animate attributeName="stop-color" values="#2563eb;#7c3aed;#06b6d4;#2563eb" dur="3s" repeatCount="indefinite" />}
          </stop>
          <stop offset="0.55" stopColor="#7c3aed">
            {active && <animate attributeName="stop-color" values="#7c3aed;#06b6d4;#2563eb;#7c3aed" dur="3s" repeatCount="indefinite" />}
          </stop>
          <stop offset="1" stopColor="#22d3ee">
            {active && <animate attributeName="stop-color" values="#22d3ee;#2563eb;#7c3aed;#22d3ee" dur="3s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>
      </defs>
      <g fill={mono ? "currentColor" : `url(#g${id})`}>
        <path className="spark-big" d={star(19, 29, 17)} />
        <path className="spark-small" d={star(38, 11, 8)} />
        <path className="spark-tiny" d={star(40, 33, 4.5)} />
      </g>
    </svg>
  );
}
