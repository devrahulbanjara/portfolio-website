import type { Project } from "@/content/profile";

/** "2025-03" → "Mar 2025"; null → "Present". */
export const fmtMonth = (ym: string | null) =>
  ym ? new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "Present";

/** epoch ms → "Oct 13, 2026" */
export const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Human duration between two "YYYY-MM" values (end defaults to a fixed reference so output is deterministic). */
export function duration(start: string, end: string | null, ref = "2026-10") {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = (end ?? ref).split("-").map(Number);
  const months = (ey - sy) * 12 + (em - sm) + 1;
  const y = Math.floor(months / 12),
    m = months % 12;
  return [y ? `${y} yr` : "", m ? `${m} mo` : ""].filter(Boolean).join(" ");
}

/** Plain-language project type, e.g. "AI agent". Shared by server and client components. */
export const kindOf = (p: Pick<Project, "category">) =>
  ({ Platform: "Full-stack platform", Agents: "AI agent", Retrieval: "Search & RAG", MLOps: "ML on AWS", Speech: "Speech AI", Education: "Education", Tools: "Tool" })[p.category];
