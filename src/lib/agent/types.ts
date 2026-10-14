/** Wire protocol between /api/chat (SSE) and the agent console. Shared by server & client. */

import type { CardKind } from "@/lib/schemas/chat";
export type { CardKind };

export type AgentEvent =
  | { type: "turn"; turnId: string }
  | { type: "step"; id: string; tool: string; label: string; status: "running" | "done" | "error"; detail?: string; ms?: number }
  | { type: "card"; kind: CardKind; id?: string; data?: Record<string, string> }
  | { type: "navigate"; path: string }
  | { type: "delta"; text: string }
  | { type: "replace"; text: string }
  | { type: "done"; turnId: string; model?: string; ms: number; tokens?: { input: number; output: number } }
  | { type: "error"; message: string };
